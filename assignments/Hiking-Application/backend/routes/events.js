const express = require('express');
const DatabaseManager = require('../db/DatabaseManager');
const { authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/events
 * Get all events (all roles)
 */
router.get('/', async (req, res, next) => {
  try {
    const events = await DatabaseManager.getAllEvents();
    res.json(events);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/events
 * Create event (trip_leader, system_admin only)
 */
router.post('/', authorize(['trip_leader', 'system_admin']), async (req, res, next) => {
  try {
    const { title, description, event_date, capacity } = req.body;

    if (!title || !event_date || !capacity) {
      return res.status(400).json({ error: 'Title, date, and capacity required' });
    }

    const eventId = await DatabaseManager.createEvent(
      req.user.user_id,
      title,
      description,
      event_date,
      capacity
    );

    res.status(201).json({ event_id: eventId });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/events/:id
 * Get event details
 */
router.get('/:id', async (req, res, next) => {
  try {
    const event = await DatabaseManager.getEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/events/:id
 * Update event (trip_leader/system_admin - own events only)
 */
router.put('/:id', authorize(['trip_leader', 'system_admin']), async (req, res, next) => {
  try {
    const event = await DatabaseManager.getEventById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check ownership
    if (event.trip_leader_id !== req.user.user_id && req.user.role !== 'system_admin') {
      return res.status(403).json({ error: 'Cannot modify other users\' events' });
    }

    const { title, description, event_date, capacity } = req.body;
    await DatabaseManager.updateEvent(req.params.id, title, description, event_date, capacity);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/events/:id
 * Delete event (trip_leader/system_admin - own events only)
 */
router.delete('/:id', authorize(['trip_leader', 'system_admin']), async (req, res, next) => {
  try {
    const event = await DatabaseManager.getEventById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check ownership
    if (event.trip_leader_id !== req.user.user_id && req.user.role !== 'system_admin') {
      return res.status(403).json({ error: 'Cannot delete other users\' events' });
    }

    await DatabaseManager.deleteEvent(req.params.id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/events/:id/register
 * Register member for event
 */
router.post('/:id/register', authorize(['member', 'trip_leader', 'system_admin']), async (req, res, next) => {
  try {
    const { member_id } = req.body;
    const eventId = req.params.id;

    // Verify event exists
    const event = await DatabaseManager.getEventById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const result = await DatabaseManager.registerMember(eventId, member_id);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/events/:id/register/:member_id
 * Remove member from event (trip_leader/system_admin - own events only)
 */
router.delete('/:id/register/:member_id', authorize(['trip_leader', 'system_admin']), async (req, res, next) => {
  try {
    const event = await DatabaseManager.getEventById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check ownership
    if (event.trip_leader_id !== req.user.user_id && req.user.role !== 'system_admin') {
      return res.status(403).json({ error: 'Cannot modify other users\' events' });
    }

    await DatabaseManager.removeMemberFromEvent(req.params.id, req.params.member_id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/events/:id/members
 * Get event members with confidential info (trip_leader/system_admin - own events only)
 */
router.get('/:id/members', authorize(['trip_leader', 'system_admin']), async (req, res, next) => {
  try {
    const event = await DatabaseManager.getEventById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check ownership
    if (event.trip_leader_id !== req.user.user_id && req.user.role !== 'system_admin') {
      return res.status(403).json({ error: 'Cannot view other users\' event members' });
    }

    const members = await DatabaseManager.getEventMembers(req.params.id);
    res.json(members);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/events/:id/waitlist
 * Get event waitlist (trip_leader/system_admin - own events only)
 */
router.get('/:id/waitlist', authorize(['trip_leader', 'system_admin']), async (req, res, next) => {
  try {
    const event = await DatabaseManager.getEventById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check ownership
    if (event.trip_leader_id !== req.user.user_id && req.user.role !== 'system_admin') {
      return res.status(403).json({ error: 'Cannot view other users\' waitlist' });
    }

    const waitlist = await DatabaseManager.getEventWaitlist(req.params.id);
    res.json(waitlist);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
