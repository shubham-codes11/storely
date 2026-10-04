import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import {
  validateUserPayload,
  validateStorePayload
} from '../validators.js';

const router = express.Router();

// Enforce System Administrator authorization
router.use(authenticateToken, requireRole('admin'));

// 1. Dashboard metrics: Total users, Total stores, Total submitted ratings, and sparklines
router.get('/dashboard', (req, res) => {
  try {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const totalStores = db.prepare('SELECT COUNT(*) as count FROM stores').get().count;
    const totalRatings = db.prepare('SELECT COUNT(*) as count FROM ratings').get().count;

    // Additional breakdown metrics for modern dashboard
    const userRoleCounts = db.prepare(`
      SELECT role, COUNT(*) as count FROM users GROUP BY role
    `).all();

    const recentRatings = db.prepare(`
      SELECT 
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        u.name AS user_name,
        s.name AS store_name
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      JOIN stores s ON r.store_id = s.id
      ORDER BY r.created_at DESC
      LIMIT 5
    `).all();

    return res.json({
      metrics: {
        totalUsers,
        totalStores,
        totalRatings,
        roleBreakdown: userRoleCounts
      },
      recentRatings
    });
  } catch (err) {
    console.error('Error fetching admin dashboard:', err);
    return res.status(500).json({ error: 'Server error retrieving dashboard statistics.' });
  }
});

// 2. View list of normal and admin users (and store owners) with filtering and sorting
// PDF: "Can view a list of normal and admin users with: Name, Email, Address, Role"
// PDF: "Can apply filters on all listings based on Name, Email, Address, and Role."
// PDF: "All tables should support sorting (ascending/descending) for key fields like Name, Email, etc."
// PDF: "If the user is a Store Owner, their Rating should also be displayed."
router.get('/users', (req, res) => {
  try {
    const {
      search = '',
      role = '',
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    let query = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.address,
        u.role,
        u.created_at,
        s.id AS store_id,
        s.name AS store_name,
        ROUND(COALESCE(AVG(r.rating), 0), 1) AS store_rating,
        COUNT(r.id) AS store_rating_count
      FROM users u
      LEFT JOIN stores s ON s.owner_id = u.id
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE 1=1
    `;

    const params = [];

    if (search.trim()) {
      query += ` AND (LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ? OR LOWER(u.address) LIKE ?)`;
      const searchParam = `%${search.trim().toLowerCase()}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    if (role && role !== 'all') {
      query += ` AND u.role = ?`;
      params.push(role);
    }

    query += ` GROUP BY u.id`;

    // Sorting support
    const validSortCols = {
      name: 'u.name',
      email: 'u.email',
      address: 'u.address',
      role: 'u.role',
      rating: 'store_rating',
      created_at: 'u.created_at'
    };

    const sortCol = validSortCols[sortBy] || 'u.name';
    const direction = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    query += ` ORDER BY ${sortCol} ${direction}`;

    const users = db.prepare(query).all(...params);

    return res.json({ users });
  } catch (err) {
    console.error('Error fetching admin users:', err);
    return res.status(500).json({ error: 'Server error retrieving user list.' });
  }
});

// 3. View details of a specific user
// PDF: "Can view details of all users, including Name, Email, Address, and Role. If the user is a Store Owner, their Rating should also be displayed."
router.get('/users/:id', (req, res) => {
  try {
    const userId = req.params.id;

    const user = db.prepare(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.address,
        u.role,
        u.created_at,
        s.id AS store_id,
        s.name AS store_name,
        s.email AS store_email,
        s.address AS store_address,
        ROUND(COALESCE(AVG(r.rating), 0), 1) AS store_rating,
        COUNT(r.id) AS store_rating_count
      FROM users u
      LEFT JOIN stores s ON s.owner_id = u.id
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE u.id = ?
      GROUP BY u.id
    `).get(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Ratings submitted by this user
    const submittedRatings = db.prepare(`
      SELECT 
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        s.name AS store_name
      FROM ratings r
      JOIN stores s ON r.store_id = s.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `).all(userId);

    return res.json({
      user,
      submittedRatings
    });
  } catch (err) {
    console.error('Error fetching user details:', err);
    return res.status(500).json({ error: 'Server error retrieving user details.' });
  }
});

// 4. Add new user (Normal user, Admin user, or Store Owner)
// PDF: "Can add new users with the following details: Name, Email, Password, Address, Role"
// Form Validations: Name (20-60), Address (max 400), Password (8-16, 1 uppercase, 1 special), Email
router.post('/users', (req, res) => {
  try {
    const { name, email, password, address, role = 'user' } = req.body;

    const validation = validateUserPayload({ name, email, password, address, role }, false);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validation failed. Please verify all requirements.',
        errors: validation.errors
      });
    }

    const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim());
    if (existing) {
      return res.status(409).json({
        error: 'Email already exists.',
        errors: { email: 'An account with this email address is already registered.' }
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);

    const result = db.prepare(`
      INSERT INTO users (name, email, password_hash, address, role)
      VALUES (?, ?, ?, ?, ?)
    `).run(name.trim(), email.trim().toLowerCase(), password_hash, address.trim(), role);

    const createdUser = db.prepare('SELECT id, name, email, address, role, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);

    return res.status(201).json({
      message: 'User created successfully!',
      user: createdUser
    });
  } catch (err) {
    console.error('Error creating user by admin:', err);
    return res.status(500).json({ error: 'Server error creating user.' });
  }
});

// 5. Add new store
// PDF: "Can add new stores"
router.post('/stores', (req, res) => {
  try {
    const { name, email, address, category = 'Retail', description = '', owner_id = null } = req.body;

    const validation = validateStorePayload({ name, email, address });
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validation failed. Please verify store details.',
        errors: validation.errors
      });
    }

    const existing = db.prepare('SELECT id FROM stores WHERE LOWER(email) = LOWER(?)').get(email.trim());
    if (existing) {
      return res.status(409).json({
        error: 'Store email already exists.',
        errors: { email: 'A store with this email address is already registered.' }
      });
    }

    // Verify owner if provided
    let verifiedOwnerId = null;
    if (owner_id) {
      const owner = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'store_owner'").get(owner_id);
      if (owner) {
        verifiedOwnerId = owner.id;
      }
    }

    const result = db.prepare(`
      INSERT INTO stores (name, email, address, category, description, owner_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name.trim(), email.trim().toLowerCase(), address.trim(), category, description.trim(), verifiedOwnerId);

    const createdStore = db.prepare('SELECT * FROM stores WHERE id = ?').get(result.lastInsertRowid);

    return res.status(201).json({
      message: 'Store created successfully!',
      store: createdStore
    });
  } catch (err) {
    console.error('Error creating store by admin:', err);
    return res.status(500).json({ error: 'Server error creating store.' });
  }
});

// 6. View list of stores
// PDF: "Can view a list of stores with the following details: Name, Email, Address, Rating"
// PDF: "Can apply filters on all listings based on Name, Email, Address, and Role."
// PDF: "All tables should support sorting (ascending/descending) for key fields like Name, Email, etc."
router.get('/stores', (req, res) => {
  try {
    const { search = '', sortBy = 'name', sortOrder = 'asc' } = req.query;

    let query = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.category,
        s.description,
        s.created_at,
        u.id AS owner_id,
        u.name AS owner_name,
        ROUND(COALESCE(AVG(r.rating), 0), 1) AS overall_rating,
        COUNT(r.id) AS total_ratings
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;

    const params = [];
    if (search.trim()) {
      query += ` AND (LOWER(s.name) LIKE ? OR LOWER(s.email) LIKE ? OR LOWER(s.address) LIKE ?)`;
      const searchParam = `%${search.trim().toLowerCase()}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    query += ` GROUP BY s.id`;

    const validSortCols = {
      name: 's.name',
      email: 's.email',
      address: 's.address',
      rating: 'overall_rating'
    };

    const sortCol = validSortCols[sortBy] || 's.name';
    const direction = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    query += ` ORDER BY ${sortCol} ${direction}`;

    const stores = db.prepare(query).all(...params);

    return res.json({ stores });
  } catch (err) {
    console.error('Error fetching admin stores:', err);
    return res.status(500).json({ error: 'Server error retrieving stores.' });
  }
});

export default router;
