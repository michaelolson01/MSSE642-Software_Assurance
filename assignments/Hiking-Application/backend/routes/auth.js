const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const DatabaseManager = require('../db/DatabaseManager');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 * 
 * VULNERABILITY: Weak password validation
 * - Accepts passwords as short as 1 character
 * - No complexity requirements
 */
router.post('/register', async (req, res, next) => {
  try {
    console.log('Register request received:', { email: req.body.email });
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ error: 'Email and password required' });
    }

    // VULNERABILITY: No password strength validation
    // Should require: min 8 chars, uppercase, lowercase, number, special char

    // Check if user exists
    console.log('Checking if user exists:', email);
    const existingUser = await DatabaseManager.getUserByEmail(email);
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    console.log('Hashing password...');
    let passwordHash;
    try {
      passwordHash = await bcrypt.hash(password, 10);
      console.log('Password hashed successfully');
    } catch (hashError) {
      console.error('Bcrypt hash error:', hashError);
      return res.status(500).json({ error: 'Password hashing failed' });
    }

    // Create user
    console.log('Creating user...');
    const userId = await DatabaseManager.createUser(email, passwordHash, 'member');
    console.log('User created with ID:', userId);

    // Create member profile if names provided
    if (firstName && lastName) {
      console.log('Creating member profile...');
      await DatabaseManager.createMemberProfile(userId, firstName, lastName);
      console.log('Member profile created');
    }

    // Generate token
    console.log('Generating JWT token...');
    const token = jwt.sign(
      { user_id: userId, email, role: 'member' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log('Registration successful for:', email);
    res.status(201).json({ user_id: userId, token, role: 'member' });
  } catch (error) {
    console.error('Register error:', error.message);
    console.error('Stack:', error.stack);
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await DatabaseManager.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    let passwordMatch;
    try {
      passwordMatch = await bcrypt.compare(password, user.password_hash);
    } catch (compareError) {
      console.error('Bcrypt compare error:', compareError);
      return res.status(500).json({ error: 'Password verification failed' });
    }

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { user_id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({ user_id: user.id, token, role: user.role });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
});

/**
 * POST /api/auth/logout
 * Logout user (token invalidation handled client-side)
 */
router.post('/logout', authMiddleware, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
