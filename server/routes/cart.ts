import { Router, Request, Response } from 'express';
import db from '../db';

const router = Router();

function getCart(sessionId: string) {
  const rows = db.prepare(`
    SELECT ci.quantity, mi.*
    FROM cart_items ci
    JOIN menu_items mi ON ci.menu_item_id = mi.id
    WHERE ci.session_id = ?
  `).all(sessionId) as any[];

  return rows.map(row => ({
    menuItem: {
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      image: row.image,
      category: row.category,
      rating: row.rating,
      dietary: row.dietary,
      spiceLevel: row.spice_level,
      isSpecial: !!row.is_special,
    },
    quantity: row.quantity,
  }));
}

// GET /api/cart
router.get('/', (req: Request, res: Response) => {
  const sessionId = req.cookies.session_id;
  if (!sessionId) {
    res.json([]);
    return;
  }
  res.json(getCart(sessionId));
});

// POST /api/cart — add item
router.post('/', (req: Request, res: Response) => {
  const sessionId = req.cookies.session_id;
  const { menuItemId, quantity = 1 } = req.body;

  if (!menuItemId) {
    res.status(400).json({ error: 'menuItemId is required' });
    return;
  }

  // Check menu item exists
  const item = db.prepare('SELECT id FROM menu_items WHERE id = ?').get(menuItemId);
  if (!item) {
    res.status(404).json({ error: 'Menu item not found' });
    return;
  }

  // Upsert: insert or increment quantity
  db.prepare(`
    INSERT INTO cart_items (session_id, menu_item_id, quantity)
    VALUES (?, ?, ?)
    ON CONFLICT(session_id, menu_item_id)
    DO UPDATE SET quantity = quantity + excluded.quantity
  `).run(sessionId, menuItemId, quantity);

  res.json(getCart(sessionId));
});

// PUT /api/cart/:menuItemId — update quantity
router.put('/:menuItemId', (req: Request, res: Response) => {
  const sessionId = req.cookies.session_id;
  const { quantity } = req.body;

  if (quantity < 1) {
    db.prepare('DELETE FROM cart_items WHERE session_id = ? AND menu_item_id = ?')
      .run(sessionId, req.params.menuItemId);
  } else {
    db.prepare('UPDATE cart_items SET quantity = ? WHERE session_id = ? AND menu_item_id = ?')
      .run(quantity, sessionId, req.params.menuItemId);
  }

  res.json(getCart(sessionId));
});

// DELETE /api/cart/:menuItemId — remove item
router.delete('/:menuItemId', (req: Request, res: Response) => {
  const sessionId = req.cookies.session_id;
  db.prepare('DELETE FROM cart_items WHERE session_id = ? AND menu_item_id = ?')
    .run(sessionId, req.params.menuItemId);

  res.json(getCart(sessionId));
});

export default router;
