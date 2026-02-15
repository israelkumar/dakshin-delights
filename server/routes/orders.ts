import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import db from '../db';
import { OrderRow, OrderItemRow, CartItemRow } from '../types';

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

  const orders = db.prepare('SELECT * FROM orders WHERE session_id = ? ORDER BY created_at DESC')
    .all(sessionId) as OrderRow[];

  const result = orders.map(order => {
    const items = db.prepare(`
      SELECT oi.*, mi.name, mi.description, mi.price as item_price, mi.image, mi.category, mi.rating, mi.dietary, mi.spice_level, mi.is_special
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE oi.order_id = ?
    `).all(order.id) as OrderItemRow[];
    return formatOrder(order, items);
  });

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
