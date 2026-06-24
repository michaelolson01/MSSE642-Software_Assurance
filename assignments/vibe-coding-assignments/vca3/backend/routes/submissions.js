const express = require('express');
const db = require('../db/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Evaluate answer with keyword matching and partial credit
function evaluateAnswer(answerLower, solutionLower, challengeData) {
  if (answerLower === solutionLower) {
    return {
      correct: true,
      score: 100,
      feedback: 'Perfect! Your answer matches the solution exactly.'
    };
  }

  const commonWords = new Set(['the', 'and', 'for', 'with', 'from', 'that', 'this', 'are', 'was', 'not', 'but', 'can', 'has', 'have', 'been', 'were', 'will', 'would', 'could', 'should']);
  
  const extractKeywords = (text) => {
    return text
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.has(word))
      .map(word => word.replace(/[^a-z0-9]/g, ''))
      .filter(word => word.length > 0);
  };

  const solutionKeywords = new Set(extractKeywords(solutionLower));
  const answerKeywords = new Set(extractKeywords(answerLower));

  let matchedKeywords = 0;
  solutionKeywords.forEach(keyword => {
    if (answerKeywords.has(keyword)) {
      matchedKeywords++;
    }
  });

  const keywordScore = solutionKeywords.size > 0 
    ? Math.round((matchedKeywords / solutionKeywords.size) * 100)
    : 0;

  // Check for key concepts
  const hasKeyContent = answerLower.includes('corrupt') || 
                        answerLower.includes('tamper') || 
                        answerLower.includes('invalid') ||
                        answerLower.includes('overflow') ||
                        answerLower.includes('injection') ||
                        answerLower.includes('race') ||
                        answerLower.includes('deserial') ||
                        answerLower.includes('hash') ||
                        answerLower.includes('checksum') ||
                        answerLower.includes('validation') ||
                        answerLower.includes('encrypt') ||
                        answerLower.includes('parameterized') ||
                        answerLower.includes('synchron') ||
                        answerLower.includes('bounds') ||
                        answerLower.includes('changed') ||
                        answerLower.includes('same');

  // Lower threshold to 50% for concept-based answers
  const isCorrect = keywordScore >= 50 && hasKeyContent;

  let feedback = '';
  if (isCorrect) {
    feedback = `Great! You've identified the key concepts (${keywordScore}% match). Your understanding is solid.`;
  } else if (keywordScore >= 35) {
    feedback = `You're on the right track (${keywordScore}% match), but you're missing some key concepts. Review the explanation and try again.`;
  } else {
    feedback = `Your answer doesn't capture the main integrity issue. Expected: ${solutionLower.substring(0, 100)}...`;
  }

  return {
    correct: isCorrect,
    score: keywordScore,
    feedback
  };
}

// Submit answer
router.post('/', verifyToken, (req, res) => {
  const { challengeId, answer } = req.body;
  const userId = req.user.id;

  if (!challengeId || !answer) {
    return res.status(400).json({ error: 'Challenge ID and answer required' });
  }

  // Get the challenge to check the solution
  db.get('SELECT solution, data FROM challenges WHERE id = ?', [challengeId], (err, challenge) => {
    if (err || !challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const answerLower = answer.trim().toLowerCase();
    const solutionLower = challenge.solution.trim().toLowerCase();
    
    // Extract key concepts from the solution
    const keywordMatch = evaluateAnswer(answerLower, solutionLower, challenge.data);
    
    db.run(
      'INSERT INTO submissions (user_id, challenge_id, answer, correct) VALUES (?, ?, ?, ?)',
      [userId, challengeId, answer, keywordMatch.correct ? 1 : 0],
      function (err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json({ 
          correct: keywordMatch.correct, 
          solution: challenge.solution,
          feedback: keywordMatch.feedback,
          score: keywordMatch.score
        });
      }
    );
  });
});

// Get user stats
router.get('/stats/:userId', verifyToken, (req, res) => {
  const { userId } = req.params;

  db.all(
    `SELECT c.id, c.title, c.difficulty, s.correct, s.timestamp
     FROM submissions s
     JOIN challenges c ON s.challenge_id = c.id
     WHERE s.user_id = ?
     ORDER BY s.timestamp DESC`,
    [userId],
    (err, submissions) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const stats = {
        total: submissions.length,
        correct: submissions.filter((s) => s.correct).length,
        submissions
      };

      res.json(stats);
    }
  );
});

// Get leaderboard
router.get('/leaderboard', verifyToken, (req, res) => {
  db.all(
    `SELECT u.id, u.username, COUNT(s.id) as total_submissions, 
            SUM(CASE WHEN s.correct = 1 THEN 1 ELSE 0 END) as correct_submissions
     FROM users u
     LEFT JOIN submissions s ON u.id = s.user_id
     GROUP BY u.id
     ORDER BY correct_submissions DESC, total_submissions DESC`,
    (err, leaderboard) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(leaderboard);
    }
  );
});

module.exports = router;
