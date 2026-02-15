import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import db from '../db';
import { OrderRow, OrderItemRow, CartItemRow } from '../types';
import { validateOrderRequest, ValidationException } from '../validation';

const router = Router();

function generateOrderId(): string {
  // Use cryptographically secure UUID to prevent collisions
  return `DK-${randomUUID().substring(0, 8).toUpperCase()}`;
}

function formatOrder(order: OrderRow, items: OrderItemRow[]) {
  return {
    id: order.id,
    date: order.created_at,
    items: items.map(item => ({
      menuItem: {
        id: item.menu_item_id,
        name: item.name,
        description: item.description,
        price: item.item_price,
        image: item.image,
        category: item.category,
        rating: item.rating,
        dietary: item.dietary,
        spiceLevel: item.spice_level,
        isSpecial: !!item.is_special,
      },
      quantity: item.quantity,
    })),
    total: order.total,
    status: order.status,
    eta: order.eta,
    customerName: order.customer_name,
    phone: order.phone,
    address: order.address,
    paymentMethod: order.payment_method,
  };
}

// GET /api/orders
router.get('/', (req: Request, res: Response) => {
  const sessionId = req.cookies.session_id;
  if (!sessionId) {
    res.json([]);
    return;
  }

  // FIX: Single JOIN query instead of N+1 queries
  // Fetches all orders with their items in one query, then groups in JavaScript
  const rows = db.prepare(`
    SELECT
      o.*,
      oi.id as item_id, oi.menu_item_id, oi.quantity, oi.price,
      mi.name, mi.description, mi.price as item_price, mi.image,
      mi.category, mi.rating, mi.dietary, mi.spice_level, mi.is_special
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
    WHERE o.session_id = ?
    ORDER BY o.created_at DESC, oi.id ASC
  `).all(sessionId) as any[];

  // Group rows by order_id
  const ordersMap = new Map<string, { order: OrderRow; items: OrderItemRow[] }>();

  for (const row of rows) {
    const orderId = row.id;

    if (!ordersMap.has(orderId)) {
      // Create order object
      const order: OrderRow = {
        id: row.id,
        session_id: row.session_id,
        customer_name: row.customer_name,
        phone: row.phone,
        address: row.address,
        payment_method: row.payment_method,
        total: row.total,
        status: row.status,
        created_at: row.created_at,
        eta: row.eta,
      };
      ordersMap.set(orderId, { order, items: [] });
    }

    // Add item if it exists (LEFT JOIN may have null items for empty orders)
    if (row.item_id) {
      const item: OrderItemRow = {
        id: row.item_id,
        order_id: row.id,
        menu_item_id: row.menu_item_id,
        quantity: row.quantity,
        price: row.price,
        name: row.name,
        description: row.description,
        item_price: row.item_price,
        image: row.image,
        category: row.category,
        rating: row.rating,
        dietary: row.dietary,
        spice_level: row.spice_level,
        is_special: row.is_special,
      };
      ordersMap.get(orderId)!.items.push(item);
    }
  }

  // Format and return
  const result = Array.from(ordersMap.values()).map(({ order, items }) =>
    formatOrder(order, items)
  );

  res.json(result);
});

// GET /api/orders/:id
router.get('/:id', (req: Request, res: Response) => {
  const sessionId = req.cookies.session_id;
  // SECURITY FIX: Check session ownership to prevent IDOR
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND session_id = ?')
    .get(req.params.id, sessionId) as OrderRow | undefined;
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  const items = db.prepare(`
    SELECT oi.*, mi.name, mi.description, mi.price as item_price, mi.image, mi.category, mi.rating, mi.dietary, mi.spice_level, mi.is_special
    FROM order_items oi
    JOIN menu_items mi ON oi.menu_item_id = mi.id
    WHERE oi.order_id = ?
  `).all(order.id) as OrderItemRow[];

  res.json(formatOrder(order, items));
});

// POST /api/orders — place order from cart
router.post('/', (req: Request, res: Response) => {
  const sessionId = req.cookies.session_id;
  const { customerName, phone, address, paymentMethod } = req.body;

  // Server-side validation (cannot be bypassed like client-side)
  try {
    validateOrderRequest(req.body);
  } catch (err) {
    if (err instanceof ValidationException) {
      res.status(400).json({ error: 'Validation failed', errors: err.errors });
      return;
    }
    throw err;
  }

  // Get cart items
  const cartItems = db.prepare(`
    SELECT ci.quantity, mi.*
    FROM cart_items ci
    JOIN menu_items mi ON ci.menu_item_id = mi.id
    WHERE ci.session_id = ?
  `).all(sessionId) as CartItemRow[];

  if (cartItems.length === 0) {
    res.status(400).json({ error: 'Cart is empty' });
    return;
  }

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const orderId = generateOrderId();

  const placeOrder = db.transaction(() => {
    // Create order
    db.prepare(`
      INSERT INTO orders (id, session_id, customer_name, phone, address, payment_method, total, status, eta)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'PREPARING', '25-30 mins')
    `).run(orderId, sessionId, customerName, phone, address, paymentMethod, total);

    // Create order items
    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, menu_item_id, quantity, price)
      VALUES (?, ?, ?, ?)
    `);
    for (const item of cartItems) {
      insertItem.run(orderId, item.id, item.quantity, item.price);
    }

    // Clear cart
    db.prepare('DELETE FROM cart_items WHERE session_id = ?').run(sessionId);
  });

  placeOrder();

  // Return the created order
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as OrderRow;
  const items = db.prepare(`
    SELECT oi.*, mi.name, mi.description, mi.price as item_price, mi.image, mi.category, mi.rating, mi.dietary, mi.spice_level, mi.is_special
    FROM order_items oi
    JOIN menu_items mi ON oi.menu_item_id = mi.id
    WHERE oi.order_id = ?
  `).all(orderId) as OrderItemRow[];

  res.status(201).json(formatOrder(order, items));
});

export default router;
