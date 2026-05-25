from flask import Flask, jsonify, request
from flask_cors import CORS
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Sample vulnerable packages database
VULNERABLE_PACKAGES = {
    "log4j": {
        "name": "log4j",
        "versions": ["2.0-2.14.1"],
        "cve": "CVE-2021-44228",
        "severity": "CRITICAL",
        "description": "Remote Code Execution in Apache Log4j",
        "impact": "Allows unauthenticated remote code execution",
        "date": "2021-12-10"
    },
    "xz": {
        "name": "xz",
        "versions": ["5.6.0", "5.6.1"],
        "cve": "CVE-2024-3156",
        "severity": "CRITICAL",
        "description": "Malicious code in XZ Utils",
        "impact": "Backdoor in compression library affecting SSH",
        "date": "2024-03-29"
    },
    "solarwinds": {
        "name": "SolarWinds Orion",
        "versions": ["2020.2.1"],
        "cve": "CVE-2020-14687",
        "severity": "CRITICAL",
        "description": "Supply chain compromise via software update",
        "impact": "Trojanized software update affected thousands of organizations",
        "date": "2020-12-08"
    },
    "ua-parser-js": {
        "name": "ua-parser-js",
        "versions": ["0.7.28"],
        "cve": "CVE-2021-21315",
        "severity": "HIGH",
        "description": "Malicious code injection in npm package",
        "impact": "Cryptocurrency mining and data exfiltration",
        "date": "2021-02-09"
    },
    "event-stream": {
        "name": "event-stream",
        "versions": ["3.3.4"],
        "cve": "CVE-2018-16469",
        "severity": "HIGH",
        "description": "Malicious dependency injection",
        "impact": "Cryptocurrency stealing from Bitcoin wallet users",
        "date": "2018-11-26"
    }
}

@app.route('/api/vulnerabilities', methods=['GET'])
def get_all_vulnerabilities():
    """Get all known vulnerabilities"""
    return jsonify(list(VULNERABLE_PACKAGES.values()))

@app.route('/api/vulnerability/<package_name>', methods=['GET'])
def get_vulnerability(package_name):
    """Get specific vulnerability details"""
    vuln = VULNERABLE_PACKAGES.get(package_name.lower())
    if vuln:
        return jsonify(vuln)
    return jsonify({"error": "Vulnerability not found"}), 404

@app.route('/api/analyze', methods=['POST'])
def analyze_project():
    """Analyze a project's dependencies for vulnerabilities"""
    data = request.json
    dependencies = data.get('dependencies', {})
    
    results = {
        "total_packages": len(dependencies),
        "vulnerable_packages": [],
        "risk_score": 0,
        "recommendations": []
    }
    
    for package, version in dependencies.items():
        pkg_lower = package.lower()
        if pkg_lower in VULNERABLE_PACKAGES:
            vuln = VULNERABLE_PACKAGES[pkg_lower]
            results["vulnerable_packages"].append({
                "package": package,
                "version": version,
                "vulnerability": vuln["cve"],
                "severity": vuln["severity"],
                "description": vuln["description"]
            })
    
    # Calculate risk score
    critical_count = len([p for p in results["vulnerable_packages"] if p["severity"] == "CRITICAL"])
    high_count = len([p for p in results["vulnerable_packages"] if p["severity"] == "HIGH"])
    results["risk_score"] = min(100, (critical_count * 30) + (high_count * 15))
    
    # Generate recommendations
    if results["vulnerable_packages"]:
        results["recommendations"].append("Update vulnerable packages immediately")
        results["recommendations"].append("Review package changelogs before updating")
        results["recommendations"].append("Implement dependency pinning in lock files")
    
    results["recommendations"].extend([
        "Use SBOM (Software Bill of Materials) to track all dependencies",
        "Implement automated vulnerability scanning in CI/CD",
        "Verify package signatures and checksums",
        "Monitor for suspicious package behavior"
    ])
    
    return jsonify(results)

@app.route('/api/sbom', methods=['POST'])
def generate_project_sbom():
    """Generate SBOM for a project"""
    data = request.json
    dependencies = data.get('dependencies', {})
    project_name = data.get('project_name', 'Unknown Project')
    
    sbom = {
        "bomFormat": "CycloneDX",
        "specVersion": "1.4",
        "version": 1,
        "metadata": {
            "timestamp": datetime.now().isoformat(),
            "component": {
                "name": project_name,
                "type": "application"
            }
        },
        "components": []
    }
    
    for package, version in dependencies.items():
        sbom["components"].append({
            "type": "library",
            "name": package,
            "version": version,
            "purl": f"pkg:npm/{package}@{version}"
        })
    
    return jsonify(sbom)

@app.route('/api/best-practices', methods=['GET'])
def get_best_practices():
    """Get supply chain security best practices"""
    practices = {
        "verification": [
            "Always verify package signatures using GPG keys",
            "Check package checksums against official sources",
            "Use package managers with built-in verification (npm audit, pip audit)",
            "Maintain a list of trusted package maintainers"
        ],
        "dependency_management": [
            "Use lock files (package-lock.json, requirements.txt) to pin versions",
            "Regularly update dependencies but test thoroughly",
            "Remove unused dependencies to reduce attack surface",
            "Use dependency pinning for critical production systems"
        ],
        "monitoring": [
            "Implement automated vulnerability scanning in CI/CD pipelines",
            "Monitor for suspicious package updates or behavior changes",
            "Subscribe to security advisories for your dependencies",
            "Use tools like Snyk, Dependabot, or WhiteSource"
        ],
        "vendor_assessment": [
            "Evaluate package maintainer reputation and activity",
            "Check for single points of failure (one maintainer)",
            "Review package download statistics and community size",
            "Assess maintainer security practices"
        ],
        "code_review": [
            "Review dependency updates before merging",
            "Audit critical dependencies for suspicious code",
            "Use static analysis tools to detect malicious patterns",
            "Maintain a software bill of materials (SBOM)"
        ]
    }
    return jsonify(practices)

@app.route('/api/case-studies', methods=['GET'])
def get_case_studies():
    """Get real-world supply chain attack case studies"""
    studies = [
        {
            "name": "SolarWinds Orion (2020)",
            "date": "December 2020",
            "severity": "CRITICAL",
            "description": "Trojanized software update affected 18,000+ organizations including US government agencies",
            "attack_vector": "Compromised build system injected backdoor into legitimate updates",
            "impact": "Widespread espionage, data theft, lateral movement",
            "lessons": [
                "Implement strict code review processes",
                "Use code signing and verification",
                "Monitor for unusual network behavior",
                "Implement zero-trust architecture"
            ]
        },
        {
            "name": "Log4j RCE (2021)",
            "date": "December 2021",
            "severity": "CRITICAL",
            "description": "Critical remote code execution vulnerability in widely-used logging library",
            "attack_vector": "Unvalidated user input in log messages",
            "impact": "Millions of systems vulnerable, widespread exploitation",
            "lessons": [
                "Patch critical vulnerabilities immediately",
                "Implement input validation and sanitization",
                "Use dependency scanning tools",
                "Have incident response plans ready"
            ]
        },
        {
            "name": "XZ Utils Backdoor (2024)",
            "date": "March 2024",
            "severity": "CRITICAL",
            "description": "Malicious code discovered in XZ compression library affecting SSH",
            "attack_vector": "Compromised maintainer account or social engineering",
            "impact": "Potential SSH compromise in Linux systems",
            "lessons": [
                "Verify maintainer identity and activity patterns",
                "Use code review for all contributions",
                "Monitor for unusual commits or behavior changes",
                "Implement multi-factor authentication for critical projects"
            ]
        },
        {
            "name": "ua-parser-js Compromise (2021)",
            "date": "February 2021",
            "severity": "HIGH",
            "description": "Popular npm package compromised to mine cryptocurrency and steal data",
            "attack_vector": "Compromised npm account credentials",
            "impact": "Cryptocurrency mining, data exfiltration from millions of users",
            "lessons": [
                "Enforce strong authentication on package accounts",
                "Use npm 2FA for all maintainers",
                "Monitor package behavior and resource usage",
                "Implement rate limiting on package updates"
            ]
        },
        {
            "name": "event-stream Compromise (2018)",
            "date": "November 2018",
            "severity": "HIGH",
            "description": "Popular npm package compromised through dependency injection to steal Bitcoin",
            "attack_vector": "Malicious dependency added to package, compromised maintainer account",
            "impact": "Cryptocurrency stealing from Bitcoin wallet users, affected millions of downloads",
            "lessons": [
                "Audit all new dependencies carefully",
                "Monitor for suspicious new dependencies in updates",
                "Implement dependency pinning to control updates",
                "Review package.json changes in code review",
                "Use tools to detect unusual package behavior"
            ]
        }
    ]
    return jsonify(studies)

@app.route('/api/simulator/scenario', methods=['POST'])
def get_simulator_scenario():
    """Get a supply chain attack scenario for the simulator"""
    data = request.json
    scenario_type = data.get('type', 'typosquatting')
    
    scenarios = {
        "typosquatting": {
            "name": "Typosquatting Attack",
            "description": "Attacker creates package with similar name to popular library",
            "example": "lodash vs lodash-es vs lodash_es",
            "risk": "Developers accidentally install malicious package",
            "prevention": [
                "Carefully review package names before installing",
                "Use exact version pinning",
                "Implement package whitelist",
                "Use private package registry"
            ]
        },
        "dependency_confusion": {
            "name": "Dependency Confusion",
            "description": "Attacker publishes higher version of internal package to public registry",
            "example": "Internal package 'acme-utils' v1.0 vs public 'acme-utils' v2.0",
            "risk": "Package manager installs malicious public version",
            "prevention": [
                "Use private package registries for internal packages",
                "Configure package manager to prefer private registry",
                "Use namespace prefixes for internal packages",
                "Implement strict version pinning"
            ]
        },
        "compromised_maintainer": {
            "name": "Compromised Maintainer Account",
            "description": "Attacker gains access to legitimate package maintainer account",
            "example": "Legitimate update contains hidden malicious code",
            "risk": "Malicious code in trusted package reaches millions",
            "prevention": [
                "Require 2FA for all maintainers",
                "Monitor for unusual commit patterns",
                "Implement code review for all changes",
                "Use signed commits and tags"
            ]
        },
        "transitive_dependency": {
            "name": "Transitive Dependency Attack",
            "description": "Attacker compromises a dependency of your dependency",
            "example": "Your app -> package-a -> package-b (compromised)",
            "risk": "Malicious code indirectly included in your project",
            "prevention": [
                "Audit transitive dependencies",
                "Use dependency scanning tools",
                "Implement SBOM tracking",
                "Monitor all dependency updates"
            ]
        }
    }
    
    return jsonify(scenarios.get(scenario_type, scenarios["typosquatting"]))

if __name__ == '__main__':
    app.run(debug=True, port=5000)
