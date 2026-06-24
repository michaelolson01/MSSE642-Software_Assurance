import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navigation({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/dashboard" className="text-2xl font-bold">
          🔍 Data Corruption Detective
        </Link>
        <div className="flex gap-6 items-center">
          <Link to="/dashboard" className="hover:text-blue-200">
            Challenges
          </Link>
          <Link to="/leaderboard" className="hover:text-blue-200">
            Leaderboard
          </Link>
          <span className="text-sm">{user?.username}</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
