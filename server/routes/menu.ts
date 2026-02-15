import { Router, Request, Response } from 'express';
import db from '../db';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { category, dietary, spiceLevel } = req.query;

  let sql = 'SELECT * FROM menu_items WHERE 1=1';
  const params: string[] = [];

  if (category && category !== 'All') {
    sql += ' AND category = ?';
    params.push(category as string);
  }
  if (dietary) {
    sql += ' AND dietary = ?';
    params.push(dietary as string);
  }
  if (spiceLevel) {
    sql += ' AND spice_level = ?';
    params.push(spiceLevel as string);
  }

  const rows = db.prepare(sql).all(...params) as any[];

  const items = rows.map(row => ({
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
  }));

  res.json(items);
});

router.get('/:id', (req: Request, res: Response) => {
  const row = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id) as any;
  if (!row) {
    res.status(404).json({ error: 'Menu item not found' });
    return;
  }

  res.json({
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
  });
});

export default router;
