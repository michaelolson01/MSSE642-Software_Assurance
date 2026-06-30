# Backend Setup Guide

## Prerequisites
- Node.js (v14+)
- MySQL Server (v5.7+)
- npm

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create MySQL database:**
   ```sql
   CREATE DATABASE trip_app;
   CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'password';
   GRANT ALL PRIVILEGES ON trip_app.* TO 'app_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Initialize database schema:**
   ```bash
   npm run init-db
   ```

5. **Start the server:**
   ```bash
   npm run dev
   ```

## Database Layer

The `DatabaseManager` class provides all database operations:
- User management (create, fetch, update, delete)
- Member profiles with confidential info
- Event CRUD operations
- Registration and waitlist management
- Admin user management

All methods are async and handle errors gracefully.

## Firewall Configuration

For production, configure your database firewall to only allow connections from the web server IP:

```bash
# Linux (iptables)
sudo iptables -A INPUT -p tcp --dport 3306 -s 192.168.1.10 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 3306 -j DROP
```

Or use MySQL user host restrictions (already configured in setup above).
