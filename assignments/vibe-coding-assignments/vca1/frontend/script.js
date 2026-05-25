const API_BASE = 'http://localhost:5000/api';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadDashboard();
});

// Section Navigation
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Load section-specific data
    if (sectionId === 'dashboard') {
        loadDashboard();
    } else if (sectionId === 'case-studies') {
        loadCaseStudies();
    } else if (sectionId === 'best-practices') {
        loadBestPractices();
    }
}

// Dashboard
function loadDashboard() {
    fetch(`${API_BASE}/vulnerabilities`)
        .then(response => response.json())
        .then(data => {
            displayVulnerabilityStats(data);
        })
        .catch(error => console.error('Error loading vulnerabilities:', error));
}

function displayVulnerabilityStats(vulnerabilities) {
    const statsContainer = document.getElementById('vuln-stats');
    statsContainer.innerHTML = '';
    
    const stats = {
        'Total Vulnerabilities': vulnerabilities.length,
        'Critical': vulnerabilities.filter(v => v.severity === 'CRITICAL').length,
        'High': vulnerabilities.filter(v => v.severity === 'HIGH').length,
        'Affected Organizations': '18,000+'
    };
    
    Object.entries(stats).forEach(([label, value]) => {
        const statCard = document.createElement('div');
        statCard.className = 'stat-card';
        statCard.innerHTML = `
            <div class="stat-number">${value}</div>
            <div class="stat-label">${label}</div>
        `;
        statsContainer.appendChild(statCard);
    });
}

// Analyzer
function analyzeDependencies() {
    const input = document.getElementById('dependencies-input').value;
    const dependencies = {};
    
    input.split('\n').forEach(line => {
        const [pkg, version] = line.trim().split(':');
        if (pkg && version) {
            dependencies[pkg.trim()] = version.trim();
        }
    });
    
    if (Object.keys(dependencies).length === 0) {
        alert('Please enter dependencies in the format: package:version');
        return;
    }
    
    fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dependencies })
    })
    .then(response => response.json())
    .then(data => {
        displayAnalysisResults(data);
    })
    .catch(error => console.error('Error analyzing dependencies:', error));
}

function displayAnalysisResults(results) {
    const resultsSection = document.getElementById('analysis-results');
    resultsSection.style.display = 'block';
    
    // Update risk score
    document.getElementById('risk-score').textContent = results.risk_score;
    document.getElementById('risk-fill').style.width = results.risk_score + '%';
    
    // Display vulnerable packages
    const vulnContainer = document.getElementById('vulnerable-packages');
    vulnContainer.innerHTML = '';
    
    if (results.vulnerable_packages.length === 0) {
        vulnContainer.innerHTML = '<p style="color: var(--success-color); font-weight: bold;">✓ No known vulnerabilities found!</p>';
    } else {
        results.vulnerable_packages.forEach(vuln => {
            const vulnItem = document.createElement('div');
            vulnItem.className = `vulnerability-item ${vuln.severity.toLowerCase()}`;
            vulnItem.innerHTML = `
                <div><span class="vuln-package">${vuln.package}</span> v${vuln.version}</div>
                <div><span class="vuln-cve">${vuln.vulnerability}</span> - ${vuln.severity}</div>
                <div style="font-size: 0.9rem; margin-top: 0.5rem;">${vuln.description}</div>
            `;
            vulnContainer.appendChild(vulnItem);
        });
    }
    
    // Display recommendations
    const recList = document.getElementById('recommendations-list');
    recList.innerHTML = '';
    results.recommendations.forEach(rec => {
        const li = document.createElement('li');
        li.textContent = rec;
        recList.appendChild(li);
    });
    
    // Store current dependencies for SBOM generation
    window.currentDependencies = results;
}

function generateSBOM() {
    const input = document.getElementById('dependencies-input').value;
    const dependencies = {};
    
    input.split('\n').forEach(line => {
        const [pkg, version] = line.trim().split(':');
        if (pkg && version) {
            dependencies[pkg.trim()] = version.trim();
        }
    });
    
    fetch(`${API_BASE}/sbom`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            project_name: 'My Project',
            dependencies
        })
    })
    .then(response => response.json())
    .then(data => {
        downloadJSON(data, 'sbom.json');
        alert('SBOM generated and downloaded!');
    })
    .catch(error => console.error('Error generating SBOM:', error));
}

function downloadJSON(data, filename) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2)));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// Simulator
function loadScenario(scenarioType) {
    fetch(`${API_BASE}/simulator/scenario`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: scenarioType })
    })
    .then(response => response.json())
    .then(data => {
        displayScenario(data);
    })
    .catch(error => console.error('Error loading scenario:', error));
}

function displayScenario(scenario) {
    const details = document.getElementById('scenario-details');
    details.style.display = 'block';
    
    document.getElementById('scenario-name').textContent = scenario.name;
    document.getElementById('scenario-description').textContent = scenario.description;
    document.getElementById('scenario-example').textContent = scenario.example;
    document.getElementById('scenario-risk').textContent = scenario.risk;
    
    const preventionList = document.getElementById('scenario-prevention');
    preventionList.innerHTML = '';
    scenario.prevention.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        preventionList.appendChild(li);
    });
    
    // Add interactive demo
    const demoContent = document.getElementById('demo-content');
    demoContent.innerHTML = generateInteractiveDemo(scenario.name);
}

function generateInteractiveDemo(scenarioName) {
    const demos = {
        'Typosquatting Attack': `
            <p><strong>Try this:</strong> Can you spot the malicious package?</p>
            <div style="background: #f5f5f5; padding: 1rem; border-radius: 5px; margin: 1rem 0;">
                <code>npm install lodash</code> ✓ Legitimate<br>
                <code>npm install lodash-es</code> ✓ Legitimate<br>
                <code>npm install lodash_es</code> ⚠️ Suspicious (underscore instead of dash)<br>
                <code>npm install lo-dash</code> ⚠️ Suspicious (similar name)
            </div>
            <p><strong>Lesson:</strong> Always verify exact package names before installation!</p>
        `,
        'Dependency Confusion': `
            <p><strong>Scenario:</strong> Your company uses internal package "acme-utils"</p>
            <div style="background: #f5f5f5; padding: 1rem; border-radius: 5px; margin: 1rem 0;">
                <strong>Internal Registry:</strong> acme-utils v1.0<br>
                <strong>Public npm:</strong> acme-utils v2.0 (malicious)
            </div>
            <p><strong>Problem:</strong> Package manager might install v2.0 from public registry!</p>
            <p><strong>Solution:</strong> Configure package manager to prefer private registry</p>
        `,
        'Compromised Maintainer Account': `
            <p><strong>Scenario:</strong> Attacker gains access to popular package maintainer's account</p>
            <div style="background: #f5f5f5; padding: 1rem; border-radius: 5px; margin: 1rem 0;">
                <strong>Legitimate Update:</strong> v1.5.0 - Bug fixes<br>
                <strong>Malicious Update:</strong> v1.5.1 - Contains hidden backdoor
            </div>
            <p><strong>Detection:</strong> Monitor for unusual commit patterns, require code review</p>
            <p><strong>Prevention:</strong> Enforce 2FA, monitor account activity</p>
        `,
        'Transitive Dependency Attack': `
            <p><strong>Dependency Chain:</strong></p>
            <div style="background: #f5f5f5; padding: 1rem; border-radius: 5px; margin: 1rem 0;">
                Your App → package-a (v1.0) → package-b (v2.0)<br>
                <br>
                <strong>Problem:</strong> package-b v2.0 is compromised!<br>
                <strong>Impact:</strong> Your app is vulnerable even though you didn't directly use package-b
            </div>
            <p><strong>Solution:</strong> Use SBOM to track all transitive dependencies</p>
        `
    };
    
    return demos[scenarioName] || '<p>Interactive demo not available for this scenario.</p>';
}

// Case Studies
function loadCaseStudies() {
    fetch(`${API_BASE}/case-studies`)
        .then(response => response.json())
        .then(data => {
            displayCaseStudies(data);
        })
        .catch(error => console.error('Error loading case studies:', error));
}

function displayCaseStudies(studies) {
    const container = document.getElementById('case-studies-container');
    container.innerHTML = '';
    
    studies.forEach(study => {
        const card = document.createElement('div');
        card.className = 'case-study';
        card.innerHTML = `
            <div class="case-study-header">
                <div class="case-study-name">${study.name}</div>
                <div class="case-study-date">${study.date}</div>
            </div>
            <div class="case-study-body">
                <p><strong>${study.description}</strong></p>
                <h4>Attack Vector</h4>
                <p>${study.attack_vector}</p>
                <h4>Impact</h4>
                <p>${study.impact}</p>
                <h4>Key Lessons</h4>
                <ul>
                    ${study.lessons.map(lesson => `<li>${lesson}</li>`).join('')}
                </ul>
            </div>
        `;
        container.appendChild(card);
    });
}

// Best Practices
function loadBestPractices() {
    fetch(`${API_BASE}/best-practices`)
        .then(response => response.json())
        .then(data => {
            displayBestPractices(data);
        })
        .catch(error => console.error('Error loading best practices:', error));
}

function displayBestPractices(practices) {
    const container = document.getElementById('practices-container');
    container.innerHTML = '';
    
    Object.entries(practices).forEach(([category, items]) => {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'practice-category';
        
        const categoryName = category
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        
        categoryCard.innerHTML = `
            <div class="practice-header">${categoryName}</div>
            <div class="practice-items">
                <ul>
                    ${items.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        `;
        container.appendChild(categoryCard);
    });
}
