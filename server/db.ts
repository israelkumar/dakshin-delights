import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'dakshin.db');
const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS menu_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    image TEXT,
    category TEXT NOT NULL,
    rating REAL DEFAULT 0,
    dietary TEXT CHECK(dietary IN ('VEG','NON-VEG')) NOT NULL,
    spice_level TEXT CHECK(spice_level IN ('Mild','Medium','Spicy')) NOT NULL,
    is_special INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    menu_item_id TEXT NOT NULL REFERENCES menu_items(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    UNIQUE(session_id, menu_item_id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    customer_name TEXT,
    phone TEXT,
    address TEXT,
    payment_method TEXT,
    total REAL NOT NULL,
    status TEXT DEFAULT 'PREPARING',
    created_at TEXT DEFAULT (datetime('now')),
    eta TEXT
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL REFERENCES orders(id),
    menu_item_id TEXT NOT NULL REFERENCES menu_items(id),
    quantity INTEGER NOT NULL,
    price REAL NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
  CREATE INDEX IF NOT EXISTS idx_menu_items_dietary ON menu_items(dietary);
  CREATE INDEX IF NOT EXISTS idx_menu_items_spice_level ON menu_items(spice_level);
  CREATE INDEX IF NOT EXISTS idx_cart_items_session ON cart_items(session_id);
  CREATE INDEX IF NOT EXISTS idx_orders_session ON orders(session_id);
  CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
`);

// Seed menu items if table is empty
const count = db.prepare('SELECT COUNT(*) as count FROM menu_items').get() as { count: number };
if (count.count === 0) {
  const insert = db.prepare(`
    INSERT INTO menu_items (id, name, description, price, image, category, rating, dietary, spice_level, is_special)
    VALUES (@id, @name, @description, @price, @image, @category, @rating, @dietary, @spiceLevel, @isSpecial)
  `);

  const seedItems = [
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
      isSpecial: 1
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
      spiceLevel: 'Mild',
      isSpecial: 0
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
      spiceLevel: 'Medium',
      isSpecial: 0
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
      spiceLevel: 'Spicy',
      isSpecial: 0
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
      spiceLevel: 'Mild',
      isSpecial: 0
    }
  ];

  const insertMany = db.transaction((items: typeof seedItems) => {
    for (const item of items) {
      insert.run(item);
    }
  });
  insertMany(seedItems);
  console.log('Seeded 5 menu items');
}

export default db;
