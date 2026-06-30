const pool = require('../config/database');

async function waitForDatabase() {
  const maxAttempts = 30;
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const connection = await pool.getConnection();
      connection.release();
      console.log('✓ Database is ready!');
      process.exit(0);
    } catch (error) {
      attempts++;
      console.log(`Attempt ${attempts}/${maxAttempts}: Waiting for database...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.error('✗ Database connection failed after 30 attempts');
  process.exit(1);
}

waitForDatabase();
