
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  dietary: 'VEG' | 'NON-VEG';
  spiceLevel: 'Mild' | 'Medium' | 'Spicy';
  isSpecial?: boolean;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  customization?: string;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'DELIVERED' | 'CANCELLED' | 'PREPARING' | 'ON THE WAY';
  eta?: string;
}

export type Page = 'home' | 'menu' | 'checkout' | 'orders' | 'tracking' | 'studio';
