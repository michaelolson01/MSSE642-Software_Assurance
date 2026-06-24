import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (username, password) =>
    api.post('/auth/register', { username, password }),
  login: (username, password) =>
    api.post('/auth/login', { username, password }),
};

export const challengeAPI = {
  getAll: () => api.get('/challenges'),
  getById: (id) => api.get(`/challenges/${id}`),
};

export const submissionAPI = {
  submit: (challengeId, answer) =>
    api.post('/submissions', { challengeId, answer }),
  getStats: (userId) => api.get(`/submissions/stats/${userId}`),
  getLeaderboard: () => api.get('/submissions/leaderboard'),
};

export default api;
