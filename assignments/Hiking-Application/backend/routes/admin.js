const express = require('express');
const DatabaseManager = require('../db/DatabaseManager');
const { authorize } = require('../middleware/auth');
const bcrypt = require('bcrypt');

const router = express.Router();

/**
 * GET /api/admin/users
 * Get all users (system_admin only)
 */
router.get('/users', authorize(['system_admin']), async (req, res, next) => {
  try {
    const users = await DatabaseManager.getAllUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/users/:id
 * Update user role (system_admin only)
 * 
 * VULNERABILITY: Privilege Escalation
 * - No validation that admin isn't removing their own admin status
 * - No audit logging of role changes
 * - No confirmation required for critical changes
 */
router.put('/users/:id', authorize(['system_admin']), async (req, res, next) => {
  try {
    const { role } = req.body;
    const validRoles = ['guest', 'member', 'trip_leader', 'system_admin'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // VULNERABILITY: No audit logging
    // Should log: who changed what, when, and why
    
    await DatabaseManager.updateUserRole(req.params.id, role);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/admin/users/:id
 * Delete user (system_admin only)
 */
router.delete('/users/:id', authorize(['system_admin']), async (req, res, next) => {
  try {
    // Prevent deleting self
    if (req.user.user_id === parseInt(req.params.id)) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await DatabaseManager.deleteUser(req.params.id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
