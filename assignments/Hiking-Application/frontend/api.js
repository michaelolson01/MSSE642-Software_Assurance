// Use relative API path - Nginx will proxy to backend
const API_BASE_URL = '/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async request(method, endpoint, data = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (this.token) {
      options.headers.Authorization = `Bearer ${this.token}`;
    }

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      console.log(`[API] ${method} ${API_BASE_URL}${endpoint}`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`[API Error] ${method} ${endpoint}:`, error.message);
      throw new Error(`Failed to connect to server at ${API_BASE_URL}. Make sure the backend is running.`);
    }
  }

  // Auth endpoints
  async register(email, password, firstName, lastName) {
    return this.request('POST', '/auth/register', {
      email,
      password,
      firstName,
      lastName,
    });
  }

  async login(email, password) {
    return this.request('POST', '/auth/login', { email, password });
  }

  async logout() {
    return this.request('POST', '/auth/logout');
  }

  // Events endpoints
  async getAllEvents() {
    return this.request('GET', '/events');
  }

  async getEventById(eventId) {
    return this.request('GET', `/events/${eventId}`);
  }

  async createEvent(title, description, event_date, capacity) {
    return this.request('POST', '/events', {
      title,
      description,
      event_date,
      capacity,
    });
  }

  async updateEvent(eventId, title, description, event_date, capacity) {
    return this.request('PUT', `/events/${eventId}`, {
      title,
      description,
      event_date,
      capacity,
    });
  }

  async deleteEvent(eventId) {
    return this.request('DELETE', `/events/${eventId}`);
  }

  async registerForEvent(eventId, member_id) {
    return this.request('POST', `/events/${eventId}/register`, { member_id });
  }

  async removeFromEvent(eventId, member_id) {
    return this.request('DELETE', `/events/${eventId}/register/${member_id}`);
  }

  async getEventMembers(eventId) {
    return this.request('GET', `/events/${eventId}/members`);
  }

  async getEventWaitlist(eventId) {
    return this.request('GET', `/events/${eventId}/waitlist`);
  }

  // Members endpoints
  async getMemberProfile(memberId) {
    return this.request('GET', `/members/${memberId}`);
  }

  async updateMemberProfile(memberId, home_address, medical_info, fitness_notes) {
    return this.request('PUT', `/members/${memberId}`, {
      home_address,
      medical_info,
      fitness_notes,
    });
  }

  // Admin endpoints
  async getAllUsers() {
    return this.request('GET', '/admin/users');
  }

  async updateUserRole(userId, role) {
    return this.request('PUT', `/admin/users/${userId}`, { role });
  }

  async deleteUser(userId) {
    return this.request('DELETE', `/admin/users/${userId}`);
  }
}

const api = new ApiClient();
