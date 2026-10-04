import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { JWT_SECRET, authenticateToken } from '../middleware/auth.js';
import {
  validateUserPayload,
  validatePassword
} from '../validators.js';

const router = express.Router();

// Helper to sign JWT
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// 1. Single Registration endpoint for Normal Users
router.post('/register', (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    const validation = validateUserPayload({ name, email, password, address }, true);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validation failed. Please verify all requirements.',
        errors: validation.errors
      });
    }

    // Check email uniqueness
    const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim());
    if (existing) {
      return res.status(409).json({
        error: 'Email already exists.',
        errors: { email: 'An account with this email address is already registered.' }
      });
    }

    // Hash password & create user
    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);

    const insert = db.prepare(`
      INSERT INTO users (name, email, password_hash, address, role)
      VALUES (?, ?, ?, ?, 'user')
    `);

    const result = insert.run(name.trim(), email.trim().toLowerCase(), password_hash, address.trim());
    const newUser = db.prepare('SELECT id, name, email, address, role, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);

    const token = generateToken(newUser);

    return res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: newUser
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Server error processing registration.' });
  }
});

// 2. Single Login system for all roles: System Administrator, Normal User, Store Owner
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // If store owner, attach store details
    let store = null;
    if (user.role === 'store_owner') {
      store = db.prepare('SELECT * FROM stores WHERE owner_id = ?').get(user.id);
    }

    const { password_hash, ...safeUser } = user;
    const token = generateToken(safeUser);

    return res.json({
      message: 'Logged in successfully.',
      token,
      user: safeUser,
      store
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error processing login.' });
  }
});

// 3. Current authenticated user profile & role
router.get('/me', authenticateToken, (req, res) => {
  try {
    let store = null;
    if (req.user.role === 'store_owner') {
      store = db.prepare('SELECT * FROM stores WHERE owner_id = ?').get(req.user.id);
    }
    return res.json({
      user: req.user,
      store
    });
  } catch (err) {
    console.error('Me endpoint error:', err);
    return res.status(500).json({ error: 'Server error fetching user.' });
  }
});

// 4. Update Password (for Normal User, Store Owner, or Admin)
router.put('/update-password', authenticateToken, (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate new password rules
    const passError = validatePassword(newPassword);
    if (passError) {
      return res.status(400).json({
        error: passError,
        errors: { newPassword: passError }
      });
    }

    // Fetch user with hash
    const fullUser = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);

    // If current password provided, verify it
    if (currentPassword) {
      const match = bcrypt.compareSync(currentPassword, fullUser.password_hash);
      if (!match) {
        return res.status(400).json({
          error: 'Current password is incorrect.',
          errors: { currentPassword: 'The current password you provided is incorrect.' }
        });
      }
    }

    const salt = bcrypt.genSaltSync(10);
    const newHash = bcrypt.hashSync(newPassword, salt);

    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, req.user.id);

    return res.json({ message: 'Password updated successfully!' });
  } catch (err) {
    console.error('Password update error:', err);
    return res.status(500).json({ error: 'Server error updating password.' });
  }
});

export default router;
