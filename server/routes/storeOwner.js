import express from 'express';
import db from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Enforce Store Owner authorization
router.use(authenticateToken, requireRole('store_owner'));

// 1. Store Owner Dashboard
// PDF: "View a list of users who have submitted ratings for their store."
// PDF: "See the average rating of their store."
router.get('/dashboard', (req, res) => {
  try {
    const ownerId = req.user.id;

    // Find store owned by this user
    const store = db.prepare(`
      SELECT 
        s.*,
        ROUND(COALESCE(AVG(r.rating), 0), 1) AS overall_rating,
        COUNT(r.id) AS total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.owner_id = ?
      GROUP BY s.id
    `).get(ownerId);

    if (!store) {
      return res.status(404).json({
        error: 'No store found associated with this store owner account. Please contact an administrator.'
      });
    }

    // Rating distribution for chart / breakdown (5-star, 4-star, etc.)
    const breakdownRows = db.prepare(`
      SELECT rating, COUNT(*) as count
      FROM ratings
      WHERE store_id = ?
      GROUP BY rating
    `).all(store.id);

    const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    breakdownRows.forEach(row => {
      ratingBreakdown[row.rating] = row.count;
    });

    // List of users who have submitted ratings for this store
    const userRatings = db.prepare(`
      SELECT 
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        r.updated_at,
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email,
        u.address AS user_address
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.updated_at DESC
    `).all(store.id);

    return res.json({
      store,
      overallRating: store.overall_rating,
      totalRatings: store.total_ratings,
      ratingBreakdown,
      userRatings
    });
  } catch (err) {
    console.error('Error fetching store owner dashboard:', err);
    return res.status(500).json({ error: 'Server error retrieving store owner dashboard.' });
  }
});

export default router;
