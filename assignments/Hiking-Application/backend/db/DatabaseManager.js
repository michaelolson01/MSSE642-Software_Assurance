const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

class DatabaseManager {
  /**
   * Initialize database schema
   */
  static async initializeSchema() {
    try {
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      const connection = await pool.getConnection();
      
      // Split schema by semicolon and execute each statement
      const statements = schema.split(';').filter(stmt => stmt.trim());
      for (const statement of statements) {
        await connection.execute(statement);
      }
      
      connection.release();
      console.log('Database schema initialized successfully');
    } catch (error) {
      console.error('Error initializing database schema:', error);
      throw error;
    }
  }

  /**
   * Create a new user
   */
  static async createUser(email, passwordHash, role = 'guest') {
    try {
      const [result] = await pool.execute(
        'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
        [email, passwordHash, role]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  }

  /**
   * Create member profile
   */
  static async createMemberProfile(userId, firstName, lastName) {
    try {
      await pool.execute(
        'INSERT INTO members (user_id, first_name, last_name) VALUES (?, ?, ?)',
        [userId, firstName, lastName]
      );
    } catch (error) {
      console.error('Error creating member profile:', error);
      throw error;
    }
  }

  /**
   * Get member profile with confidential info
   */
  static async getMemberProfile(memberId) {
    try {
      const [rows] = await pool.execute(
        'SELECT m.*, u.email FROM members m JOIN users u ON m.user_id = u.id WHERE m.user_id = ?',
        [memberId]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error fetching member profile:', error);
      throw error;
    }
  }

  /**
   * Update member confidential info
   */
  static async updateMemberConfidentialInfo(memberId, homeAddress, medicalInfo, fitnessNotes) {
    try {
      await pool.execute(
        'UPDATE members SET home_address = ?, medical_info = ?, fitness_notes = ? WHERE user_id = ?',
        [homeAddress, medicalInfo, fitnessNotes, memberId]
      );
    } catch (error) {
      console.error('Error updating member confidential info:', error);
      throw error;
    }
  }

  /**
   * Create event
   */
  static async createEvent(tripLeaderId, title, description, eventDate, capacity) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO events (trip_leader_id, title, description, event_date, capacity) VALUES (?, ?, ?, ?, ?)',
        [tripLeaderId, title, description, eventDate, capacity]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  /**
   * Get event by ID
   */
  static async getEventById(eventId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM events WHERE id = ?',
        [eventId]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  }

  /**
   * Get all events with registration count
   */
  static async getAllEvents() {
    try {
      const [rows] = await pool.execute(`
        SELECT e.*, 
               COUNT(CASE WHEN r.status = 'registered' THEN 1 END) as registered_count
        FROM events e
        LEFT JOIN registrations r ON e.id = r.event_id
        GROUP BY e.id
        ORDER BY e.event_date ASC
      `);
      return rows;
    } catch (error) {
      console.error('Error fetching all events:', error);
      throw error;
    }
  }

  /**
   * Get events by trip leader
   */
  static async getEventsByTripLeader(tripLeaderId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM events WHERE trip_leader_id = ? ORDER BY event_date ASC',
        [tripLeaderId]
      );
      return rows;
    } catch (error) {
      console.error('Error fetching events by trip leader:', error);
      throw error;
    }
  }

  /**
   * Update event
   */
  static async updateEvent(eventId, title, description, eventDate, capacity) {
    try {
      await pool.execute(
        'UPDATE events SET title = ?, description = ?, event_date = ?, capacity = ? WHERE id = ?',
        [title, description, eventDate, capacity, eventId]
      );
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  /**
   * Delete event
   */
  static async deleteEvent(eventId) {
    try {
      await pool.execute('DELETE FROM events WHERE id = ?', [eventId]);
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  /**
   * Register member for event
   */
  static async registerMember(eventId, memberId) {
    try {
      const event = await this.getEventById(eventId);
      const [registrations] = await pool.execute(
        'SELECT COUNT(*) as count FROM registrations WHERE event_id = ? AND status = "registered"',
        [eventId]
      );

      const registeredCount = registrations[0].count;
      const status = registeredCount >= event.capacity ? 'waitlisted' : 'registered';

      const [result] = await pool.execute(
        'INSERT INTO registrations (event_id, member_id, status) VALUES (?, ?, ?)',
        [eventId, memberId, status]
      );

      if (status === 'waitlisted') {
        const position = registeredCount - event.capacity + 1;
        await pool.execute(
          'INSERT INTO waitlist (event_id, member_id, position) VALUES (?, ?, ?)',
          [eventId, memberId, position]
        );
      }

      return { registrationId: result.insertId, status };
    } catch (error) {
      console.error('Error registering member:', error);
      throw error;
    }
  }

  /**
   * Get event members with confidential info
   */
  static async getEventMembers(eventId) {
    try {
      const [rows] = await pool.execute(`
        SELECT u.id, u.email, m.first_name, m.last_name, m.home_address, 
               m.medical_info, m.fitness_notes, r.status
        FROM registrations r
        JOIN users u ON r.member_id = u.id
        LEFT JOIN members m ON u.id = m.user_id
        WHERE r.event_id = ?
        ORDER BY r.registered_at ASC
      `, [eventId]);
      return rows;
    } catch (error) {
      console.error('Error fetching event members:', error);
      throw error;
    }
  }

  /**
   * Remove member from event
   */
  static async removeMemberFromEvent(eventId, memberId) {
    try {
      await pool.execute(
        'UPDATE registrations SET status = "removed" WHERE event_id = ? AND member_id = ?',
        [eventId, memberId]
      );
    } catch (error) {
      console.error('Error removing member from event:', error);
      throw error;
    }
  }

  /**
   * Get all users (admin only)
   */
  static async getAllUsers() {
    try {
      const [rows] = await pool.execute(
        'SELECT id, email, role, created_at FROM users ORDER BY created_at DESC'
      );
      return rows;
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  }

  /**
   * Update user role
   */
  static async updateUserRole(userId, role) {
    try {
      await pool.execute(
        'UPDATE users SET role = ? WHERE id = ?',
        [role, userId]
      );
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(userId) {
    try {
      await pool.execute('DELETE FROM users WHERE id = ?', [userId]);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Get waitlist for event
   */
  static async getEventWaitlist(eventId) {
    try {
      const [rows] = await pool.execute(`
        SELECT w.*, u.email, m.first_name, m.last_name
        FROM waitlist w
        JOIN users u ON w.member_id = u.id
        LEFT JOIN members m ON u.id = m.user_id
        WHERE w.event_id = ?
        ORDER BY w.position ASC
      `, [eventId]);
      return rows;
    } catch (error) {
      console.error('Error fetching waitlist:', error);
      throw error;
    }
  }
}

module.exports = DatabaseManager;
