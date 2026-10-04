import express from 'express';
import db from '../db.js';
import { optionalAuth, authenticateToken } from '../middleware/auth.js';
import { validateRating } from '../validators.js';

const router = express.Router();

// 1. Get all registered stores with overall rating and user submitted rating
router.get('/', optionalAuth, (req, res) => {
  try {
    const { search = '', category = '', sortBy = 'name', sortOrder = 'asc' } = req.query;
    const currentUserId = req.user ? req.user.id : null;

    let query = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.category,
        s.description,
        s.image_url,
        s.created_at,
        ROUND(COALESCE(AVG(r.rating), 0), 1) AS overall_rating,
        COUNT(r.id) AS total_ratings,
        (SELECT rating FROM ratings WHERE store_id = s.id AND user_id = ?) AS user_rating,
        (SELECT comment FROM ratings WHERE store_id = s.id AND user_id = ?) AS user_comment
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;

    const params = [currentUserId, currentUserId];

    if (search.trim()) {
      query += ` AND (LOWER(s.name) LIKE ? OR LOWER(s.address) LIKE ?)`;
      const searchParam = `%${search.trim().toLowerCase()}%`;
      params.push(searchParam, searchParam);
    }

    if (category && category !== 'All') {
      query += ` AND s.category = ?`;
      params.push(category);
    }

    query += ` GROUP BY s.id`;

    // Sorting
    const validSortCols = {
      name: 's.name',
      address: 's.address',
      rating: 'overall_rating',
      total_ratings: 'total_ratings'
    };

    const sortColumn = validSortCols[sortBy] || 's.name';
    const direction = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    query += ` ORDER BY ${sortColumn} ${direction}`;

    const stores = db.prepare(query).all(...params);

    return res.json({ stores });
  } catch (err) {
    console.error('Error fetching stores:', err);
    return res.status(500).json({ error: 'Server error retrieving stores.' });
  }
});

// 2. Get single store details
router.get('/:id', optionalAuth, (req, res) => {
  try {
    const storeId = req.params.id;
    const currentUserId = req.user ? req.user.id : null;

    const store = db.prepare(`
      SELECT 
        s.*,
        ROUND(COALESCE(AVG(r.rating), 0), 1) AS overall_rating,
        COUNT(r.id) AS total_ratings,
        (SELECT rating FROM ratings WHERE store_id = s.id AND user_id = ?) AS user_rating,
        (SELECT comment FROM ratings WHERE store_id = s.id AND user_id = ?) AS user_comment
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.id = ?
      GROUP BY s.id
    `).get(currentUserId, currentUserId, storeId);

    if (!store) {
      return res.status(404).json({ error: 'Store not found.' });
    }

    // Also get recent public ratings for this store
    const ratings = db.prepare(`
      SELECT 
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        r.updated_at,
        u.name AS user_name,
        u.email AS user_email
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.updated_at DESC
      LIMIT 10
    `).all(storeId);

    return res.json({ store, ratings });
  } catch (err) {
    console.error('Error fetching store details:', err);
    return res.status(500).json({ error: 'Server error retrieving store details.' });
  }
});

// 3. Submit or modify rating for a store (Normal user & other authenticated users)
router.post('/:id/rating', authenticateToken, (req, res) => {
  try {
    const storeId = req.params.id;
    const userId = req.user.id;
    const { rating, comment } = req.body;

    const ratingError = validateRating(rating);
    if (ratingError) {
      return res.status(400).json({ error: ratingError });
    }

    const store = db.prepare('SELECT id, name FROM stores WHERE id = ?').get(storeId);
    if (!store) {
      return res.status(404).json({ error: 'Store not found.' });
    }

    // Upsert rating (submit or modify)
    const existing = db.prepare('SELECT id, rating FROM ratings WHERE user_id = ? AND store_id = ?').get(userId, storeId);

    if (existing) {
      db.prepare(`
        UPDATE ratings 
        SET rating = ?, comment = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(Number(rating), comment ? comment.trim() : null, existing.id);

      return res.json({
        message: 'Your rating has been modified successfully!',
        action: 'modified',
        rating: Number(rating)
      });
    } else {
      db.prepare(`
        INSERT INTO ratings (user_id, store_id, rating, comment)
        VALUES (?, ?, ?, ?)
      `).run(userId, storeId, Number(rating), comment ? comment.trim() : null);

      return res.status(201).json({
        message: 'Your rating has been submitted successfully!',
        action: 'submitted',
        rating: Number(rating)
      });
    }
  } catch (err) {
    console.error('Error submitting rating:', err);
    return res.status(500).json({ error: 'Server error submitting rating.' });
  }
});

export default router;
