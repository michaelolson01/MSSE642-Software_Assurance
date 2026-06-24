import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { challengeAPI } from '../api';

function Dashboard({ user, token }) {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const response = await challengeAPI.getAll();
      setChallenges(response.data);
    } catch (err) {
      setError('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const filteredChallenges = challenges.filter((c) => {
    if (filter === 'all') return true;
    return c.difficulty === parseInt(filter);
  });

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

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome, {user?.username}!</h1>
          <p className="text-gray-600">Explore challenges and learn about data integrity failures</p>
        </div>

        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            All Challenges
          </button>
          <button
            onClick={() => setFilter('1')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              filter === '1'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Easy
          </button>
          <button
            onClick={() => setFilter('2')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              filter === '2'
                ? 'bg-yellow-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Medium
          </button>
          <button
            onClick={() => setFilter('3')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              filter === '3'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Hard
          </button>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading challenges...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChallenges.map((challenge) => (
              <Link
                key={challenge.id}
                to={`/challenge/${challenge.id}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-gray-800 flex-1">{challenge.title}</h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(
                      challenge.difficulty
                    )}`}
                  >
                    {getDifficultyLabel(challenge.difficulty)}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{challenge.description}</p>
                <div className="text-sm text-gray-500">
                  Type: <span className="font-semibold">{challenge.type}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
