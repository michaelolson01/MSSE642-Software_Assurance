const pool = require('./config/database');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const connection = await pool.getConnection();
    console.log('✓ Connected to database successfully');
    
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✓ Query executed successfully');
    console.log('Test result:', rows);
    
    connection.release();
    console.log('✓ Connection released');
    process.exit(0);
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    console.error('\nMake sure:');
    console.error('1. MySQL server is running');
    console.error('2. Database "trip_app" exists');
    console.error('3. User "app_user" exists with password "password"');
    console.error('4. .env file is configured correctly');
    process.exit(1);
  }
}

testConnection();
