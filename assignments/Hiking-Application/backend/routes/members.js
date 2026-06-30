const express = require('express');
const DatabaseManager = require('../db/DatabaseManager');
const { authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/members/:id
 * Get member profile
 * 
 * VULNERABILITY: Horizontal Privilege Escalation
 * - Members can view any other member's profile
 * - No ownership check
 * - Confidential info exposed to authenticated users
 */
router.get('/:id', async (req, res, next) => {
  try {
    const member = await DatabaseManager.getMemberProfile(req.params.id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // VULNERABILITY: All authenticated users can see confidential info
    // Should only show to: self, trip leaders of their events, or admins
    if (req.user) {
      return res.json(member);
    }

    // Non-confidential info available to all
    const publicProfile = {
      user_id: member.user_id,
      first_name: member.first_name,
      last_name: member.last_name,
      email: member.email
    };

    res.json(publicProfile);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/members/:id
 * Update member profile (own profile only)
 */
router.put('/:id', authorize(['member', 'trip_leader', 'system_admin']), async (req, res, next) => {
  try {
    // Users can only update their own profile
    if (req.user.user_id !== parseInt(req.params.id) && req.user.role !== 'system_admin') {
      return res.status(403).json({ error: 'Cannot update other users\' profiles' });
    }

    const { home_address, medical_info, fitness_notes } = req.body;
    await DatabaseManager.updateMemberConfidentialInfo(
      req.params.id,
      home_address,
      medical_info,
      fitness_notes
    );

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
