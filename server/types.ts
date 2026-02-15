// Row types matching the SQLite schema in server/db.ts (lines 14-55)

export interface MenuItemRow {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  dietary: 'VEG' | 'NON-VEG';
  spice_level: 'Mild' | 'Medium' | 'Spicy';  // DB column name (snake_case)
  is_special: number;                          // SQLite integer boolean
}

export interface CartItemRow extends MenuItemRow {
  // Comes from JOIN: cart_items ci JOIN menu_items mi
  // ci.quantity is added to the mi.* columns
  quantity: number;
  // cart_items also has these, but SELECT mi.* doesn't include them:
  // session_id, menu_item_id are not in the result set
}

export interface OrderRow {
  id: string;
  session_id: string;        // CRITICAL: must be visible for authorization checks
  customer_name: string;
  phone: string;
  address: string;
  payment_method: string;
  total: number;
  status: string;
  created_at: string;
  eta: string | null;
}

export interface OrderItemRow {
  id: number;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  price: number;
  // These come from the JOIN with menu_items:
  name: string;
  description: string;
  item_price: number;         // aliased as `mi.price as item_price`
  image: string;
  category: string;
  rating: number;
  dietary: 'VEG' | 'NON-VEG';
  spice_level: 'Mild' | 'Medium' | 'Spicy';
  is_special: number;
}
