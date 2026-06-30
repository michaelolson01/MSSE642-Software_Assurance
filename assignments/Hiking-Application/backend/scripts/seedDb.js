const DatabaseManager = require('../db/DatabaseManager');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    console.log('Seeding database with test users...');

    // Test users with different roles
    const testUsers = [
      { email: 'guest@example.com', password: 'password123', role: 'guest', firstName: 'Guest', lastName: 'User' },
      { email: 'member@example.com', password: 'password123', role: 'member', firstName: 'John', lastName: 'Member' },
      { email: 'leader@example.com', password: 'password123', role: 'trip_leader', firstName: 'Jane', lastName: 'Leader' },
      { email: 'admin@example.com', password: 'password123', role: 'system_admin', firstName: 'Admin', lastName: 'User' },
    ];

    for (const user of testUsers) {
      try {
        // Check if user already exists
        const existing = await DatabaseManager.getUserByEmail(user.email);
        if (existing) {
          console.log(`✓ User ${user.email} already exists`);
          continue;
        }

        // Hash password
        const passwordHash = await bcrypt.hash(user.password, 10);

        // Create user
        const userId = await DatabaseManager.createUser(user.email, passwordHash, user.role);

        // Create member profile if not guest
        if (user.role !== 'guest') {
          await DatabaseManager.createMemberProfile(userId, user.firstName, user.lastName);
        }

        console.log(`✓ Created user: ${user.email} (${user.role})`);
      } catch (error) {
        console.error(`✗ Error creating user ${user.email}:`, error.message);
      }
    }

    console.log('\nTest users created successfully!');
    console.log('\nYou can now log in with:');
    console.log('  Guest:       guest@example.com / password123');
    console.log('  Member:      member@example.com / password123');
    console.log('  Trip Leader: leader@example.com / password123');
    console.log('  Admin:       admin@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Failed to seed database:', error);
    process.exit(1);
  }
}

seedDatabase();
