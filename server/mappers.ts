import type { MenuItem } from '../types';
import type { MenuItemRow } from './types';

/**
 * Maps a database MenuItemRow to the API MenuItem shape.
 * Uses explicit field picking (allowlist) -- never spread the row object.
 * This prevents accidental leakage of internal/sensitive DB fields.
 */
export function toMenuItemDTO(row: MenuItemRow): MenuItem {
  return {
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
  };
}
