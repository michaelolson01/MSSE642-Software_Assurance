# Supply Chain Security Educational Application

An interactive educational tool for learning about software supply chain vulnerabilities, attacks, and defense strategies.

## Overview

This application teaches about **Software Supply Chain Failures** - one of the most critical security vulnerabilities in modern software development. It covers real-world attacks, prevention strategies, and best practices.

## Features

### 1. **Interactive Dashboard**
- Overview of supply chain security concepts
- Real-world impact statistics
- Common attack vectors
- Key defense strategies

### 2. **Dependency Vulnerability Analyzer**
- Analyze your project's dependencies for known vulnerabilities
- Risk scoring system
- Detailed vulnerability information
- Actionable recommendations
- SBOM (Software Bill of Materials) generation

### 3. **Supply Chain Attack Simulator**
- Learn about different attack types:
  - **Typosquatting**: Similar package names
  - **Dependency Confusion**: Version confusion attacks
  - **Compromised Maintainer**: Account takeover scenarios
  - **Transitive Dependency**: Indirect vulnerability chains
- Interactive demonstrations
- Prevention strategies for each attack type

### 4. **Real-World Case Studies**
- SolarWinds Orion (2020)
- Log4j RCE (2021)
- XZ Utils Backdoor (2024)
- ua-parser-js Compromise (2021)
- Lessons learned from each incident

### 5. **Best Practices Guide**
- Package verification and signing
- Dependency management strategies
- Monitoring and detection
- Vendor assessment
- Code review processes

## Architecture

```
supply-chain-security/
├── backend/
│   ├── app.py                 # Flask API server
│   ├── requirements.txt       # Python dependencies
└── frontend/
    ├── index.html             # Main HTML
    ├── styles.css             # Styling
    └── script.js              # JavaScript logic
```

## Installation & Setup

### Prerequisites
- Python 3.8+
- pip (Python package manager)
- Modern web browser

### Backend Setup

1. **Create a Python virtual environment:**
```bash
python -m venv venv
```

2. **Activate the virtual environment:**

On Linux/macOS:
```bash
source venv/bin/activate
```

On Windows:
```bash
venv\Scripts\activate
```

3. **Install Python dependencies:**
```bash
pip install -r backend/requirements.txt
```

4. **Run the Flask server:**
```bash
python backend/app.py
```

The API will be available at `http://localhost:5000`

### Frontend Setup

1. **Open a new terminal (keep the backend running)**

2. **Start a simple HTTP server for the frontend:**
```bash
cd frontend
python -m http.server 8000
```

3. **Open your browser:**
Navigate to `http://localhost:8000`

## Usage

### Analyzing Dependencies

1. Go to the **Analyzer** section
2. Enter your project's dependencies in the format:
   ```
   package_name:version
   log4j:2.14.1
   xz:5.6.0
   ```
3. Click **Analyze**
4. Review the risk score and vulnerable packages
5. Generate SBOM for documentation

### Learning Attack Scenarios

1. Go to the **Simulator** section
2. Select an attack type
3. Read the description and example
4. Review prevention strategies
5. Interact with the demo

### Exploring Case Studies

1. Go to the **Case Studies** section
2. Read about real-world supply chain attacks
3. Understand the attack vectors
4. Learn key lessons from each incident

### Best Practices

1. Go to the **Best Practices** section
2. Review security practices organized by category:
   - Verification
   - Dependency Management
   - Monitoring
   - Vendor Assessment
   - Code Review

## Vulnerable Packages Database

The application includes information about these known vulnerabilities:

| Package | CVE | Severity | Year |
|---------|-----|----------|------|
| log4j | CVE-2021-44228 | CRITICAL | 2021 |
| xz | CVE-2024-3156 | CRITICAL | 2024 |
| SolarWinds Orion | CVE-2020-14687 | CRITICAL | 2020 |
| ua-parser-js | CVE-2021-21315 | HIGH | 2021 |
| event-stream | CVE-2018-16469 | HIGH | 2018 |

## Key Concepts

### Supply Chain Attacks
Attacks that compromise software at the source, affecting all downstream users.

### Attack Vectors
1. **Typosquatting**: Creating packages with similar names
2. **Dependency Confusion**: Exploiting version resolution
3. **Compromised Accounts**: Taking over maintainer accounts
4. **Malicious Dependencies**: Injecting code into legitimate packages
5. **Build System Compromise**: Modifying build processes

### Defense Strategies
1. **Verification**: Check signatures and checksums
2. **Monitoring**: Track dependency changes
3. **SBOM**: Maintain software bill of materials
4. **Code Review**: Review all dependency updates
5. **Vendor Assessment**: Evaluate maintainer trustworthiness

## Learning Outcomes

After using this application, students will understand:

- ✓ What supply chain vulnerabilities are
- ✓ How real-world attacks occur
- ✓ Common attack patterns and vectors
- ✓ How to identify vulnerable dependencies
- ✓ Best practices for supply chain security
- ✓ How to implement defense strategies
- ✓ The importance of SBOM and tracking

## API Endpoints

### GET /api/vulnerabilities
Get all known vulnerabilities

### GET /api/vulnerability/<package_name>
Get specific vulnerability details

### POST /api/analyze
Analyze dependencies for vulnerabilities
```json
{
  "dependencies": {
    "log4j": "2.14.1",
    "xz": "5.6.0"
  }
}
```

### POST /api/sbom
Generate SBOM for a project
```json
{
  "project_name": "My Project",
  "dependencies": {
    "package": "version"
  }
}
```

### GET /api/best-practices
Get security best practices

### GET /api/case-studies
Get real-world case studies

### POST /api/simulator/scenario
Get attack scenario details
```json
{
  "type": "typosquatting"
}
```

## Technologies Used

### Backend
- **Flask**: Python web framework
- **Flask-CORS**: Cross-origin resource sharing
- **Python 3.8+**: Programming language

### Frontend
- **HTML5**: Markup
- **CSS3**: Styling with responsive design
- **Vanilla JavaScript**: Interactivity (no frameworks)

## Educational Value

This application is designed for:
- **Software Assurance courses**
- **Cybersecurity training**
- **DevSecOps education**
- **Software engineering students**
- **Development teams**

## Future Enhancements

- [ ] Integration with real vulnerability databases (NVD, CVE)
- [ ] Real-time package monitoring
- [ ] Integration with package managers (npm, pip, Maven)
- [ ] Advanced risk scoring algorithms
- [ ] Machine learning for anomaly detection
- [ ] Multi-language support
- [ ] User authentication and project tracking
- [ ] Automated remediation suggestions

## References

- [OWASP Supply Chain Security](https://owasp.org/www-community/attacks/Supply_chain_attack)
- [NIST Software Supply Chain Security](https://csrc.nist.gov/projects/supply-chain-risk-management)
- [CWE-1104: Use of Unmaintained Third Party Components](https://cwe.mitre.org/data/definitions/1104.html)
- [Log4j Vulnerability (CVE-2021-44228)](https://nvd.nist.gov/vuln/detail/CVE-2021-44228)
- [SolarWinds Supply Chain Attack](https://www.cisa.gov/news-events/alerts/2020/12/13/cisa-issues-emergency-directive-regarding-solarwinds-orion-software)

## License

Educational use only

## Author

Created for Software Assurance Course

---

**Note**: This is an educational tool. The vulnerability database is simplified for learning purposes. For production use, integrate with real vulnerability databases like NVD, CVE, or commercial services.
