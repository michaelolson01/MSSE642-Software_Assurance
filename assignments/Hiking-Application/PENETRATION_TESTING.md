# Penetration Testing Guide - Trip Management System

## Overview
This document outlines common penetration testing techniques and vulnerabilities to test in the Trip Management System.

## Testing Environment
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **Database**: localhost:3307 (MySQL)

## Test Accounts
```
Guest:       guest@example.com / password123
Member:      member@example.com / password123
Trip Leader: leader@example.com / password123
Admin:       admin@example.com / password123
```

---

## 1. Authentication & Authorization Testing

### 1.1 SQL Injection
**Vulnerability**: Check if login endpoint is vulnerable to SQL injection
```bash
# Test with SQL injection payload
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com\" OR \"1\"=\"1","password":"anything"}'
```

### 1.2 JWT Token Manipulation
**Vulnerability**: Test if JWT tokens can be forged or modified
```bash
# Decode JWT token (use jwt.io or jwt-cli)
# Try modifying the role in the payload and re-encoding
# Test if backend validates signature properly
```

### 1.3 Weak Password Requirements
**Vulnerability**: Check if system accepts weak passwords
- Try registering with password: "1"
- Try registering with password: "123"
- Try registering with empty password

### 1.4 Brute Force Attack
**Vulnerability**: Test if login endpoint has rate limiting
```bash
# Attempt multiple failed logins
for i in {1..100}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"wrongpassword"}'
done
```

### 1.5 Token Expiration
**Vulnerability**: Test if expired tokens are properly rejected
- Wait 24+ hours (or modify token expiry in code)
- Try using expired token to access protected endpoints

---

## 2. Authorization & Access Control Testing

### 2.1 Privilege Escalation
**Vulnerability**: Test if users can escalate their privileges
```bash
# Login as member, get token
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"member@example.com","password":"password123"}' | jq -r '.token')

# Try accessing admin endpoints
curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer $TOKEN"
```

### 2.2 Horizontal Privilege Escalation
**Vulnerability**: Test if users can access other users' data
```bash
# Login as member1, try accessing member2's profile
curl -X GET http://localhost:3000/api/members/2 \
  -H "Authorization: Bearer $TOKEN"
```

### 2.3 Vertical Privilege Escalation
**Vulnerability**: Test if members can modify their own role
```bash
# Try updating own user role via admin endpoint
curl -X PUT http://localhost:3000/api/admin/users/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"system_admin"}'
```

---

## 3. Data Exposure Testing

### 3.1 Sensitive Data in Responses
**Vulnerability**: Check if confidential info is exposed to unauthorized users
```bash
# Login as guest, try accessing member profile with medical info
curl -X GET http://localhost:3000/api/members/2 \
  -H "Authorization: Bearer $GUEST_TOKEN"
```

### 3.2 Information Disclosure
**Vulnerability**: Check error messages for sensitive information
```bash
# Trigger errors and check response messages
curl -X GET http://localhost:3000/api/events/99999
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"nonexistent@example.com","password":"test"}'
```

### 3.3 Database Enumeration
**Vulnerability**: Test if you can enumerate users/events
```bash
# Try accessing sequential IDs
for i in {1..10}; do
  curl -X GET http://localhost:3000/api/members/$i
done
```

---

## 4. Input Validation Testing

### 4.1 Cross-Site Scripting (XSS)
**Vulnerability**: Test if user input is properly sanitized
```bash
# Try injecting script in event title
curl -X POST http://localhost:3000/api/events \
  -H "Authorization: Bearer $LEADER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"<script>alert(\"XSS\")</script>","description":"test","event_date":"2026-07-01T10:00:00","capacity":10}'
```

### 4.2 SQL Injection in Search/Filter
**Vulnerability**: Test if filters are vulnerable to SQL injection
```bash
# Try SQL injection in event creation
curl -X POST http://localhost:3000/api/events \
  -H "Authorization: Bearer $LEADER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test\"; DROP TABLE events; --","description":"test","event_date":"2026-07-01T10:00:00","capacity":10}'
```

### 4.3 Command Injection
**Vulnerability**: Test if system commands can be injected
```bash
# Try command injection in user input
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com; rm -rf /","password":"test123","firstName":"Test","lastName":"User"}'
```

---

## 5. API Security Testing

### 5.1 Missing Authentication
**Vulnerability**: Test if endpoints require authentication
```bash
# Try accessing protected endpoints without token
curl -X GET http://localhost:3000/api/admin/users
curl -X GET http://localhost:3000/api/members/1
```

### 5.2 CORS Misconfiguration
**Vulnerability**: Test if CORS allows unauthorized origins
```bash
# Test from different origin
curl -X GET http://localhost:3000/api/events \
  -H "Origin: http://evil.com"
```

### 5.3 HTTP Method Bypass
**Vulnerability**: Test if different HTTP methods bypass checks
```bash
# Try DELETE instead of POST
curl -X DELETE http://localhost:3000/api/events \
  -H "Authorization: Bearer $MEMBER_TOKEN"
```

---

## 6. Business Logic Testing

### 6.1 Waitlist Manipulation
**Vulnerability**: Test if waitlist can be manipulated
- Register multiple times for same event
- Try promoting yourself from waitlist
- Try removing others from event

### 6.2 Event Capacity Bypass
**Vulnerability**: Test if capacity limits can be bypassed
```bash
# Create event with capacity 1
# Register 10 members and check if all are registered
```

### 6.3 Role-Based Access Control Bypass
**Vulnerability**: Test if RBAC can be bypassed
- Member trying to create events
- Guest trying to register for events
- Trip Leader accessing other leaders' events

---

## 7. Session Management Testing

### 7.1 Session Fixation
**Vulnerability**: Test if session tokens can be fixed
- Obtain a token
- Try using same token from different browser/IP
- Check if server validates session context

### 7.2 Session Hijacking
**Vulnerability**: Test if tokens are transmitted securely
- Check if tokens are sent over HTTPS (in production)
- Check if tokens are stored securely in localStorage

### 7.3 Concurrent Session Handling
**Vulnerability**: Test if multiple sessions are allowed
- Login with same account from multiple browsers
- Check if one session invalidates others

---

## 8. Database Security Testing

### 8.1 Direct Database Access
**Vulnerability**: Test if database is exposed
```bash
# Try connecting directly to MySQL
mysql -h localhost -P 3307 -u app_user -ppassword trip_app
```

### 8.2 Unencrypted Passwords
**Vulnerability**: Check if passwords are properly hashed
```bash
# Query database for password hashes
SELECT email, password_hash FROM users;
# Try to crack hashes with hashcat or john
```

### 8.3 Sensitive Data in Database
**Vulnerability**: Check if sensitive data is encrypted
```bash
# Query for medical info, home addresses
SELECT * FROM members;
```

---

## 9. Infrastructure Testing

### 9.1 Port Scanning
**Vulnerability**: Test for open ports
```bash
nmap -p- localhost
nmap -p- <vm-ip>
```

### 9.2 Service Enumeration
**Vulnerability**: Identify running services
```bash
nmap -sV localhost
nmap -sV <vm-ip>
```

### 9.3 Firewall Rules
**Vulnerability**: Test firewall configuration
```bash
# Try accessing database from different machine
mysql -h <vm-ip> -P 3307 -u app_user -ppassword trip_app
```

---

## 10. Reporting Vulnerabilities

### Vulnerability Report Template
```
**Vulnerability**: [Name]
**Severity**: [Critical/High/Medium/Low]
**Type**: [Authentication/Authorization/Data Exposure/etc]
**Description**: [What is the vulnerability]
**Steps to Reproduce**: [How to exploit it]
**Impact**: [What damage can be done]
**Proof of Concept**: [Code/screenshots]
**Remediation**: [How to fix it]
```

---

## Tools for Penetration Testing

### Command Line Tools
- `curl` - HTTP requests
- `jq` - JSON parsing
- `nmap` - Port scanning
- `sqlmap` - SQL injection testing
- `burp suite` - Web proxy & testing
- `postman` - API testing
- `hashcat` - Password cracking

### Online Tools
- `jwt.io` - JWT decoding/encoding
- `base64decode.org` - Base64 decoding
- `codebeautify.org` - JSON/XML formatting

---

## Notes for School Assignment

This penetration testing guide is designed for educational purposes to understand:
1. Common web application vulnerabilities
2. How to identify security flaws
3. How to document findings
4. How to recommend fixes

**Remember**: Only test on systems you own or have explicit permission to test!
