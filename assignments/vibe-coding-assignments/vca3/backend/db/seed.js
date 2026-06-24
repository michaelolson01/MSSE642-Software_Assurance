const db = require('./database');

const challenges = [
  {
    title: 'Missing Checksum',
    description: 'A file was transmitted but the checksum doesn\'t match. Identify which data was corrupted.',
    type: 'spot_corruption',
    difficulty: 1,
    data: JSON.stringify({
      original: 'User: john_doe, Balance: $1000, Checksum: a3f9e2c1',
      received: 'User: john_doe, Balance: $5000, Checksum: a3f9e2c1'
    }),
    solution: 'Balance was changed from $1000 to $5000 but checksum remained the same',
    explanation: 'Checksums verify data integrity. If data changes, the checksum must also change. A matching checksum with different data indicates tampering.'
  },
  {
    title: 'Tampered Timestamp',
    description: 'A transaction record has been modified. Find the integrity violation.',
    type: 'spot_corruption',
    difficulty: 1,
    data: JSON.stringify({
      transaction: 'ID: 12345, Amount: $500, Timestamp: 2024-01-15 10:30:00, Hash: 7f8a9b2c',
      modified: 'ID: 12345, Amount: $5000, Timestamp: 2024-01-15 10:30:00, Hash: 7f8a9b2c'
    }),
    solution: 'Amount was changed from $500 to $5000 but hash remained the same',
    explanation: 'Hash values should change when any data changes. A static hash with modified data is a red flag for tampering.'
  },
  {
    title: 'Corrupted JSON',
    description: 'This JSON data has been corrupted during transmission. Identify the integrity issue.',
    type: 'spot_corruption',
    difficulty: 1,
    data: JSON.stringify({
      valid: '{"user": "alice", "role": "user", "admin": false}',
      corrupted: '{"user": "alice", "role": "admin", "admin": true}'
    }),
    solution: 'Role changed from "user" to "admin" and admin flag changed from false to true',
    explanation: 'Without integrity checks, serialized data can be modified in transit. Always validate and sign critical data structures.'
  },
  {
    title: 'Missing Input Validation',
    description: 'Review this code. What integrity check is missing?',
    type: 'fix_code',
    difficulty: 2,
    data: JSON.stringify({
      vulnerable: 'function processAge(age) {\n  return age * 2;\n}',
      hint: 'What if age is negative or not a number?'
    }),
    solution: 'function processAge(age) {\n  if (typeof age !== "number" || age < 0 || age > 150) {\n    throw new Error("Invalid age");\n  }\n  return age * 2;\n}',
    explanation: 'Input validation is critical for data integrity. Always verify that inputs are of the correct type, within expected ranges, and meet business logic requirements.'
  },
  {
    title: 'Hash Mismatch Detection',
    description: 'A file was downloaded with a provided hash. Determine if the file is intact.',
    type: 'spot_corruption',
    difficulty: 2,
    data: JSON.stringify({
      file_content: 'Important document version 2.0',
      provided_hash: 'sha256:abc123def456',
      calculated_hash: 'sha256:xyz789uvw012'
    }),
    solution: 'The hashes do not match, indicating the file was corrupted or tampered with during transmission',
    explanation: 'Always verify file integrity by comparing calculated hashes with provided hashes. Mismatches indicate data corruption or tampering.'
  },
  {
    title: 'Buffer Overflow Detection',
    description: 'This code is vulnerable to buffer overflow. Identify the integrity risk.',
    type: 'fix_code',
    difficulty: 2,
    data: JSON.stringify({
      vulnerable: 'char buffer[10];\nstrcpy(buffer, user_input);',
      hint: 'What happens if user_input is longer than 10 characters?'
    }),
    solution: 'char buffer[10];\nstrncpy(buffer, user_input, sizeof(buffer) - 1);\nbuffer[sizeof(buffer) - 1] = "\\0";',
    explanation: 'Buffer overflows can corrupt memory and program state. Always use bounds-checking functions and validate input length.'
  },
  {
    title: 'Unencrypted Sensitive Data',
    description: 'This code stores sensitive data unsafely. What integrity/security issue exists?',
    type: 'spot_corruption',
    difficulty: 2,
    data: JSON.stringify({
      vulnerable: 'password = "user123"\ndb.save("passwords", password)',
      issue: 'Password stored in plain text'
    }),
    solution: 'Passwords should be hashed with bcrypt or similar, not stored in plain text',
    explanation: 'Storing sensitive data without encryption or hashing violates data integrity and security. Use proper cryptographic functions.'
  },
  {
    title: 'SQL Injection Vulnerability',
    description: 'This code is vulnerable to SQL injection. Fix the integrity issue.',
    type: 'fix_code',
    difficulty: 3,
    data: JSON.stringify({
      vulnerable: 'query = "SELECT * FROM users WHERE id = " + user_id;',
      hint: 'Use parameterized queries'
    }),
    solution: 'query = "SELECT * FROM users WHERE id = ?"; db.run(query, [user_id]);',
    explanation: 'SQL injection allows attackers to modify queries and corrupt data. Always use parameterized queries or prepared statements.'
  },
  {
    title: 'Race Condition State Corruption',
    description: 'Two concurrent operations access the same data. What integrity issue occurs?',
    type: 'spot_corruption',
    difficulty: 3,
    data: JSON.stringify({
      scenario: 'Thread 1 reads balance: $100, Thread 2 reads balance: $100, Thread 1 adds $50 (writes $150), Thread 2 adds $50 (writes $150)',
      expected: '$200',
      actual: '$150'
    }),
    solution: 'Race condition: both threads read the same initial value before either writes, causing lost updates',
    explanation: 'Without proper synchronization, concurrent access can corrupt data. Use locks, transactions, or atomic operations.'
  },
  {
    title: 'Unsafe Deserialization',
    description: 'This code deserializes untrusted data. What integrity vulnerability exists?',
    type: 'spot_corruption',
    difficulty: 3,
    data: JSON.stringify({
      vulnerable: 'obj = pickle.loads(untrusted_data)',
      risk: 'Arbitrary code execution possible'
    }),
    solution: 'Untrusted serialized data can contain malicious code that executes during deserialization',
    explanation: 'Never deserialize untrusted data with unsafe methods. Use JSON or validate/sign serialized data before deserialization.'
  }
];

function seedDatabase() {
  db.serialize(() => {
    // Clear existing challenges
    db.run('DELETE FROM challenges', (err) => {
      if (err) console.error('Error clearing challenges:', err);
    });

    // Insert challenges
    const stmt = db.prepare(`
      INSERT INTO challenges (title, description, type, difficulty, data, solution, explanation)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    challenges.forEach((challenge) => {
      stmt.run(
        challenge.title,
        challenge.description,
        challenge.type,
        challenge.difficulty,
        challenge.data,
        challenge.solution,
        challenge.explanation,
        (err) => {
          if (err) console.error('Error inserting challenge:', err);
        }
      );
    });

    stmt.finalize(() => {
      console.log('Database seeded with 10 challenges');
      db.close();
    });
  });
}

seedDatabase();
