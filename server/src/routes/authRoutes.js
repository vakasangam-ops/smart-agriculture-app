import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/index.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, phone, email, password, role = 'FARMER', village, district, state = 'Andhra Pradesh', language = 'en' } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ error: 'Name, phone number, and password are required.' });
    }

    // Check existing phone
    const existing = await db.findOne('users', u => u.phone === phone);
    if (existing) {
      return res.status(400).json({ error: 'A user with this phone number already exists.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const validRoles = ['FARMER', 'SERVICE_CENTER_STAFF', 'AGRI_EXPERT', 'ADMIN'];
    const assignedRole = validRoles.includes(role) ? role : 'FARMER';

    const newUser = await db.insert('users', {
      name,
      phone,
      email: email || null,
      password_hash,
      role: assignedRole,
      village: village || 'Tenali',
      district: district || 'Guntur',
      state,
      language: ['en', 'te', 'hi'].includes(language) ? language : 'en'
    });

    const token = generateToken(newUser);
    const { password_hash: _, ...safeUser } = newUser;

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register user.' });
  }
});

// Login with phone or email and password
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Identifier (phone/email) and password are required.' });
    }

    const user = await db.findOne('users', u => u.phone === identifier || u.email === identifier);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. User not found.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid password.' });
    }

    const token = generateToken(user);
    const { password_hash: _, ...safeUser } = user;

    res.json({
      message: 'Login successful',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed.' });
  }
});

// Demo Login for rapid testing of all 4 roles
router.post('/demo-login', async (req, res) => {
  try {
    const { role = 'FARMER' } = req.body;
    const user = await db.findOne('users', u => u.role === role);

    if (!user) {
      return res.status(404).json({ error: `Demo user for role ${role} not found.` });
    }

    const token = generateToken(user);
    const { password_hash: _, ...safeUser } = user;

    res.json({
      message: `Logged in as demo ${role}`,
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({ error: 'Demo login failed.' });
  }
});

// Get current profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.findById('users', req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const { password_hash: _, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
});

// Update preferred language
router.put('/language', authenticateToken, async (req, res) => {
  try {
    const { language } = req.body;
    if (!['en', 'te', 'hi'].includes(language)) {
      return res.status(400).json({ error: 'Supported languages are en, te, hi.' });
    }

    const updated = await db.update('users', req.user.id, { language });
    const { password_hash: _, ...safeUser } = updated;
    const token = generateToken(updated);

    res.json({ message: 'Language updated', user: safeUser, token });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update language.' });
  }
});

export default router;
