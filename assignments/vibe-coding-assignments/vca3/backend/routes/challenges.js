const express = require('express');
const db = require('../db/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get all challenges
router.get('/', verifyToken, (req, res) => {
  db.all('SELECT id, title, description, type, difficulty FROM challenges', (err, challenges) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(challenges);
  });
});

// Get single challenge
router.get('/:id', verifyToken, (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM challenges WHERE id = ?', [id], (err, challenge) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    res.json(challenge);
  });
});

module.exports = router;
