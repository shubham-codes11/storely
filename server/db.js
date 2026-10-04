import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

export function initDb() {
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(60) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      address VARCHAR(400) NOT NULL,
      role VARCHAR(20) NOT NULL CHECK(role IN ('admin', 'user', 'store_owner')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS stores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(60) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      address VARCHAR(400) NOT NULL,
      owner_id INTEGER NULL,
      category VARCHAR(50) DEFAULT 'Electronics',
      description TEXT,
      image_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      store_id INTEGER NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
      UNIQUE(user_id, store_id)
    );

    CREATE INDEX IF NOT EXISTS idx_stores_name ON stores(name);
    CREATE INDEX IF NOT EXISTS idx_stores_address ON stores(address);
    CREATE INDEX IF NOT EXISTS idx_ratings_store_id ON ratings(store_id);
    CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);
  `);

  // Check if initial users exist
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    seedDatabase();
  }
}

function seedDatabase() {
  console.log('🌱 Seeding database with initial users, stores, and ratings...');
  
  const salt = bcrypt.genSaltSync(10);
  const adminPass = bcrypt.hashSync('Admin@123', salt);
  const ownerPass = bcrypt.hashSync('Owner@123', salt);
  const userPass = bcrypt.hashSync('User@123', salt);

  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password_hash, address, role)
    VALUES (?, ?, ?, ?, ?)
  `);

  const adminId = insertUser.run(
    'System Administrator Office',
    'admin@verifiedreviews.com',
    adminPass,
    '742 Evergreen Terrace, Springfield, IL 62704',
    'admin'
  ).lastInsertRowid;

  const owner1Id = insertUser.run(
    'Sarah Jenkins Electronics Ltd',
    'owner@apexelectronics.com',
    ownerPass,
    '100 Innovation Way, Suite 400, Austin, TX 78701',
    'store_owner'
  ).lastInsertRowid;

  const owner2Id = insertUser.run(
    'David Miller Technologies Corp',
    'david@techhaven.com',
    ownerPass,
    '550 Market Street, San Francisco, CA 94105',
    'store_owner'
  ).lastInsertRowid;

  const owner3Id = insertUser.run(
    'Elena Rostova Galaxy Mart LLC',
    'elena@gadgetgalaxy.com',
    ownerPass,
    '300 Michigan Avenue, Chicago, IL 60601',
    'store_owner'
  ).lastInsertRowid;

  // Normal users
  const user1Id = insertUser.run(
    'Jonathan Robert Reynolds Jr',
    'user@example.com',
    userPass,
    '452 Elm Boulevard, Seattle, WA 98101',
    'user'
  ).lastInsertRowid;

  const user2Id = insertUser.run(
    'Dorlan Shopi Henderson Jr',
    'donlan@gmail.com',
    userPass,
    '889 Peachtree Road, Atlanta, GA 30309',
    'user'
  ).lastInsertRowid;

  const user3Id = insertUser.run(
    'Rewavshons Alexander Smith',
    'rewavshons@gmail.com',
    userPass,
    '1425 Broadway, New York, NY 10018',
    'user'
  ).lastInsertRowid;

  const user4Id = insertUser.run(
    'Jostan Roame Montgomery III',
    'frontier@gmail.com',
    userPass,
    '2100 Ocean Drive, Miami, FL 33139',
    'user'
  ).lastInsertRowid;

  const user5Id = insertUser.run(
    'Mark Chenns Montgomery Sr',
    'honnsenn@gmail.com',
    userPass,
    '77 Sunset Strip, Los Angeles, CA 90069',
    'user'
  ).lastInsertRowid;

  const user6Id = insertUser.run(
    'Jypa Rianih Bartholomew',
    'pypasornrx@gmail.com',
    userPass,
    '1200 Grand Avenue, Denver, CO 80202',
    'user'
  ).lastInsertRowid;

  // Stores
  const insertStore = db.prepare(`
    INSERT INTO stores (name, email, address, owner_id, category, description, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const store1Id = insertStore.run(
    'Apex Electronics Superstore LLC',
    'store@apexelectronics.com',
    '100 Innovation Way, Suite 400, Austin, TX 78701',
    owner1Id,
    'Electronics',
    "We've got shipping review and fast deliveries that fit all budget tiers. Quality customer care 24/7.",
    'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=400&q=80'
  ).lastInsertRowid;

  const store2Id = insertStore.run(
    'TechHaven Digital Systems Ltd',
    'store@techhaven.com',
    '550 Market Street, San Francisco, CA 94105',
    owner2Id,
    'Electronics',
    'Pros: Fast shipping, excellent product quality, durable components and premium support.',
    'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=400&q=80'
  ).lastInsertRowid;

  const store3Id = insertStore.run(
    'Gadget Galaxy Mega Outlet Inc',
    'store@gadgetgalaxy.com',
    '300 Michigan Avenue, Chicago, IL 60601',
    owner3Id,
    'Electronics',
    'The ultimate hub for smart home electronics, drones, wearable devices, and accessories.',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=400&q=80'
  ).lastInsertRowid;

  const store4Id = insertStore.run(
    'FreshField Organic Gourmet Co',
    'store@freshfield.com',
    '920 Farmstead Way, Portland, OR 97201',
    null,
    'Food & Grocery',
    'Farm-to-table organic produce, artisan cheeses, artisanal pantry items, and cold-pressed juices.',
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'
  ).lastInsertRowid;

  const store5Id = insertStore.run(
    'Urban Vibe Fashion Emporium',
    'store@urbanvibe.com',
    '450 SoHo Avenue, New York, NY 10012',
    null,
    'Fashion',
    'Modern sustainable street fashion, recycled technical outerwear, and contemporary footwear.',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80'
  ).lastInsertRowid;

  // Insert ratings matching the mockup feed (Sarah J. 5 stars, Mike R. 4 stars, David L. 3 stars, Chloe W. 5 stars)
  const insertRating = db.prepare(`
    INSERT INTO ratings (user_id, store_id, rating, comment, created_at, updated_at)
    VALUES (?, ?, ?, ?, datetime('now', ?), datetime('now', ?))
  `);

  insertRating.run(user1Id, store1Id, 5, 'Excellent shipping speed and top-notch packaging!', '-2 hours', '-2 hours');
  insertRating.run(user2Id, store1Id, 4, 'Product quality is good. Arrived right on schedule.', '-5 hours', '-5 hours');
  insertRating.run(user3Id, store1Id, 3, 'Customer service response was somewhat slow, but issue resolved.', '-1 days', '-1 days');
  insertRating.run(user4Id, store1Id, 5, 'Love the new store layout and transparent warranties!', '-2 days', '-2 days');
  insertRating.run(user5Id, store1Id, 4, 'Dependable warranty process and great variety in stock.', '-3 days', '-3 days');

  // Ratings for TechHaven
  insertRating.run(user1Id, store2Id, 5, 'Absolutely fantastic gear, will order again.', '-1 days', '-1 days');
  insertRating.run(user2Id, store2Id, 4, 'Very solid performance and prompt support.', '-2 days', '-2 days');
  insertRating.run(user6Id, store2Id, 4, 'Great build quality on custom cables and keyboards.', '-4 days', '-4 days');

  // Ratings for Gadget Galaxy
  insertRating.run(user3Id, store3Id, 4, 'Great selection of smart home accessories.', '-3 days', '-3 days');
  insertRating.run(user4Id, store3Id, 3, 'Reasonable prices, average shipping speed.', '-5 days', '-5 days');

  console.log('✅ Database seeded successfully!');
}

export default db;
