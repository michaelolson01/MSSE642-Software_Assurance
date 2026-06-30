const DatabaseManager = require('../db/DatabaseManager');

async function initializeDatabase() {
  try {
    console.log('Initializing database schema...');
    await DatabaseManager.initializeSchema();
    console.log('Database initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

initializeDatabase();
