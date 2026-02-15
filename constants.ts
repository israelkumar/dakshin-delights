
import { MenuItem, Order } from './types';

// App constants
export const TAX_RATE = 0.05;

export const ROUTES = {
  HOME: '/',
  MENU: '/menu',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  TRACKING: '/tracking',
  STUDIO: '/studio',
} as const;

export const API_BASE_URL = 'http://localhost:3001/api';

export const MENU_CATEGORIES = ['All', 'Breakfast', 'Rice Dishes', 'Snacks', 'Desserts'] as const;

export const DIETARY_OPTIONS = ['VEG', 'NON-VEG'] as const;

export const SPICE_LEVELS = ['Mild', 'Medium', 'Spicy'] as const;

export const PAYMENT_METHODS = ['CARD', 'UPI', 'CASH'] as const;

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'm1',
    name: 'Ghee Roast Masala Dosa',
    description: 'Crispy, paper-thin fermented rice crepe roasted with pure desi ghee and stuffed with spiced potato mash.',
    price: 180,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDgpaJtQBhW4e7jUQHAAAFajSjEox3Sxpt0pvpyQe20a9c8be99rd8x0Hvq9K9b5NBz_BvNRdLGNCFVTHulJB53io4tTfmYSr35nKqmMmAhHBo8dC-sWYJsW4HnD6UEGZ6WYfCZQnKWq218REUlwSqt_jfKxW9levh_XgSgG4oHo5sJcY77pMQW-WueWJYPNcMGdE-3wqqpSG1hK8tENLtspckvaD3Y7y6oKiM8OJLO2mZ7m1kpu_3eMrjDmAcw7DVvprfc_AN-4g',
    category: 'Breakfast',
    rating: 4.8,
    dietary: 'VEG',
    spiceLevel: 'Medium',
    isSpecial: true
  },
  {
    id: 'm2',
    name: "Mallya's Soft Idli (4 pcs)",
    description: 'Cloud-soft steamed rice cakes served with our signature drumstick sambar and coconut chutney.',
    price: 120,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCliPv1TPyDPhZyjRpFZtdi_rjPac9lkKf5_2QQAiX3H7-LRpYe8U5_GnubtjwLh1hqU3fQ9eHs486ZTGmghlVC1beGTiKC7IqYjI5xURXwgNMV1mWkIi2uuhgBSE8zbkurL9XYRorFrftNg4gUFUoZ7E8VuxuzEy29Jq3BpPwJvE4Kcl5FS5jxns6cVz7nEW0vPs8pdLycUHl1x7GNAiydpiDYTj2TsPy9brBj-E61acAzaAiz2rrNM10ikDnKONfDyJ9dooy1T34',
    category: 'Breakfast',
    rating: 4.9,
    dietary: 'VEG',
    spiceLevel: 'Mild'
  },
  {
    id: 'm3',
    name: 'Crispy Medu Vada (3 pcs)',
    description: 'Traditional donut-shaped savory fritters, golden crispy on the outside and fluffy inside with peppercorns.',
    price: 110,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCiaZ__jiryG9yoLAw1vmN4MDli6y8fdqPF0ZG_qDa0qGRp6JcFLT58nkp0fDgkjeX3pXn3eAtMpDx9bnmf8-_r5muAXbdXmj6irGd-iJC1UH5UwXK8ZQjX8lT8T6S8r61ppF7tQQhcWBHVZ04MCyQRFTqhSPlcui8dcpuFQyI9LwcR--37zdrnTRBCOxqet5M09fUYPMQwuPWnM3TrQLNs5XmOcbOdAqmdlxUF-D8DSNVVE-9SccA4N3t7fzduq0am-sB58Oi6kos',
    category: 'Breakfast',
    rating: 4.7,
    dietary: 'VEG',
    spiceLevel: 'Medium'
  },
  {
    id: 'm4',
    name: 'Malabar Chicken Biryani',
    description: 'Short-grain Kaima rice cooked with succulent chicken and authentic Malabar spices. Served with raita.',
    price: 320,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArwJ34DsH0cQcGgXy_NfHGGsQKWRiO02SuAyfOVJVGf54_3u9WlGfg9CBbBs6pUraUz513y_2rtKIJThy1OTbyKXS_QFYyAMrS0YvUl4rZUok_zd6riRtSMUn244OM1vpOALVE4ZemZlkxbuaGBlTObLGS2dZ1-3bjIe4SgueK2CYjZyYmdfHaB9I7eaYPTCemmm2xjyt5lol5ZLAyTXd0dND9eH70AAPmpnnZnexNjQFPeg5aUObDrFNBXTI61EPpceo05F75ONs',
    category: 'Rice Dishes',
    rating: 4.9,
    dietary: 'NON-VEG',
    spiceLevel: 'Spicy'
  },
  {
    id: 'm5',
    name: 'Appam with Stew (2 pcs)',
    description: 'Lacy, bowl-shaped fermented rice pancakes with a soft center, served with creamy vegetable stew.',
    price: 140,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrhdOdBk0qZ2ShqFv66DlYA-hB9A4QKk3YWUKZDoK2QIcYUXFPMPtGwmcCQ6C8NziKu4yi3rqQIedJ8wRPp034_WgPZKmZQasmTQBSD4adrq76K-HDbgo0QuBLSuZ2KwUNB7Td55y8sIglK6aDmYb4pl4OqeXjB-ImUNh4gObRwPBAJs58zqsOxQIvKxDQLhR7QJjblxU3RDViivhbizZ81GRkLVjcyfGQVEksy19Ht369rvBVuIbKJbqKpLJzLh8tXqNe8CHB7-g',
    category: 'Breakfast',
    rating: 4.6,
    dietary: 'VEG',
    spiceLevel: 'Mild'
  }
];

export const PAST_ORDERS: Order[] = [
  {
    id: 'DK-91722',
    date: 'October 24, 2023',
    items: [
      { menuItem: MENU_ITEMS[0], quantity: 2 },
      { menuItem: MENU_ITEMS[1], quantity: 1 }
    ],
    total: 450.00,
    status: 'DELIVERED'
  },
  {
    id: 'DK-88201',
    date: 'October 10, 2023',
    items: [
      { menuItem: MENU_ITEMS[4], quantity: 1 }
    ],
    total: 210.00,
    status: 'CANCELLED'
  }
];
