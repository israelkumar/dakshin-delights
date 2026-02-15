import { Router, Request, Response } from 'express';
import db from '../db';
import { MenuItemRow } from '../types';
import { toMenuItemDTO } from '../mappers';

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

  const rows = db.prepare(sql).all(...params) as MenuItemRow[];
  res.json(rows.map(toMenuItemDTO));
});

router.get('/:id', (req: Request, res: Response) => {
  const row = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id) as MenuItemRow | undefined;
  if (!row) {
    res.status(404).json({ error: 'Menu item not found' });
    return;
  }

  res.json(toMenuItemDTO(row));
});

export default router;
