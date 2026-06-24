import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { challengeAPI, submissionAPI } from '../api';

function ChallengeDetail({ user, token }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    fetchChallenge();
  }, [id]);

  const fetchChallenge = async () => {
    try {
      setLoading(true);
      const response = await challengeAPI.getById(id);
      setChallenge(response.data);
    } catch (err) {
      setError('Failed to load challenge');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim()) {
      setError('Please enter an answer');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await submissionAPI.submit(parseInt(id), answer);
      setResult(response.data);
      setAnswer('');
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 1:
        return 'bg-green-100 text-green-800';
      case 2:
        return 'bg-yellow-100 text-yellow-800';
      case 3:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case 1:
        return 'Easy';
      case 2:
        return 'Medium';
      case 3:
        return 'Hard';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-gray-600">Loading challenge...</p>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-red-600">Challenge not found</p>
        </div>
      </div>
    );
  }

  const challengeData = JSON.parse(challenge.data);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 text-blue-600 hover:text-blue-800 font-semibold"
        >
          ← Back to Challenges
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{challenge.title}</h1>
              <p className="text-gray-600">{challenge.description}</p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${getDifficultyColor(
                challenge.difficulty
              )}`}
            >
              {getDifficultyLabel(challenge.difficulty)}
            </span>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Challenge Data</h2>
            <div className="space-y-4">
              {Object.entries(challengeData).map(([key, value]) => (
                <div key={key}>
                  <p className="text-sm font-semibold text-gray-600 uppercase">{key}</p>
                  <pre className="bg-white p-4 rounded border border-gray-300 overflow-x-auto text-sm">
                    {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>

          {result && (
            <div
              className={`rounded-lg p-6 mb-6 ${
                result.correct
                  ? 'bg-green-100 border border-green-400'
                  : 'bg-yellow-100 border border-yellow-400'
              }`}
            >
              <h3 className={`text-lg font-bold mb-2 ${result.correct ? 'text-green-800' : 'text-yellow-800'}`}>
                {result.correct ? '✓ Correct!' : '⚠ Partial Match'}
              </h3>
              <p className={`mb-3 ${result.correct ? 'text-green-700' : 'text-yellow-700'}`}>
                {result.feedback}
              </p>
              {result.score !== undefined && (
                <div className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-semibold">Concept Match:</span>
                    <span className="text-sm font-semibold">{result.score}%</span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${result.correct ? 'bg-green-600' : 'bg-yellow-600'}`}
                      style={{ width: `${result.score}%` }}
                    ></div>
                  </div>
                </div>
              )}
              {!result.correct && (
                <p className="text-yellow-700 text-sm">
                  <strong>Expected answer includes:</strong> {result.solution}
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Your Answer</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Describe what integrity issue you found or provide the fixed code..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              rows="6"
            />
            {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
            <button
              type="submit"
              disabled={submitting}
              className="mt-4 bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Answer'}
            </button>
          </form>

          <button
            onClick={() => setShowHint(!showHint)}
            className="text-blue-600 hover:text-blue-800 font-semibold mb-4 flex items-center gap-2"
          >
            <span className={`transition-transform duration-300 ${showHint ? 'rotate-180' : ''}`}>
              ▶
            </span>
            {showHint ? 'Hide Hint' : 'Show Hint'}
          </button>

          {challengeData.hint && (
            <div
              className={`bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-6 transition-all duration-300 overflow-hidden ${
                showHint ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <p className="text-yellow-800">
                <strong>Hint:</strong> {challengeData.hint}
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-300 rounded-lg p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-2">Explanation</h3>
            <p className="text-blue-800">{challenge.explanation}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChallengeDetail;
