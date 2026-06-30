// API Configuration
// In Docker: backend service is accessible at http://backend:3000
// In local dev: backend is at http://localhost:3000

const API_BASE_URL = (() => {
  // If running in Docker (hostname is not localhost/127.0.0.1)
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'http://backend:3000/api';
  }
  // Local development
  return 'http://localhost:3000/api';
})();

console.log('API Base URL:', API_BASE_URL);
