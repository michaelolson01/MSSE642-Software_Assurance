class Game {
    constructor() {
        this.width = 40;
        this.height = 15;
        this.level = 1;
        this.playerHealth = 100;
        this.maxHealth = 100;
        this.machinesDefeated = 0;
        this.inCombat = false;
        this.currentEnemy = null;
        this.selectedVulnerability = null;
        this.messages = [];

        // Vulnerabilities database with variants
        this.vulnerabilities = [
            { 
                id: 'sql', 
                name: 'SQL Injection', 
                desc: 'Exploit database queries',
                variants: [
                    { id: 'union', name: 'UNION-based', desc: 'Use UNION SELECT' },
                    { id: 'blind', name: 'Blind SQL', desc: 'Boolean-based inference' },
                    { id: 'time', name: 'Time-based', desc: 'Delay-based detection' }
                ]
            },
            { 
                id: 'xss', 
                name: 'Cross-Site Scripting', 
                desc: 'Inject malicious scripts',
                variants: [
                    { id: 'stored', name: 'Stored XSS', desc: 'Persistent injection' },
                    { id: 'reflected', name: 'Reflected XSS', desc: 'URL parameter injection' },
                    { id: 'dom', name: 'DOM-based', desc: 'Client-side manipulation' }
                ]
            },
            { 
                id: 'buffer', 
                name: 'Buffer Overflow', 
                desc: 'Overflow memory buffers',
                variants: [
                    { id: 'stack', name: 'Stack Overflow', desc: 'Overflow stack memory' },
                    { id: 'heap', name: 'Heap Overflow', desc: 'Overflow heap memory' },
                    { id: 'format', name: 'Format String', desc: 'Format string exploit' }
                ]
            },
            { 
                id: 'csrf', 
                name: 'CSRF Attack', 
                desc: 'Forge requests',
                variants: [
                    { id: 'token', name: 'Token Bypass', desc: 'Bypass CSRF tokens' },
                    { id: 'cookie', name: 'Cookie Theft', desc: 'Steal session cookies' },
                    { id: 'referer', name: 'Referer Spoof', desc: 'Spoof HTTP referer' }
                ]
            },
            { 
                id: 'rce', 
                name: 'Remote Code Exec', 
                desc: 'Execute arbitrary code',
                variants: [
                    { id: 'command', name: 'Command Injection', desc: 'Inject OS commands' },
                    { id: 'eval', name: 'Code Eval', desc: 'Eval dangerous functions' },
                    { id: 'deserialization', name: 'Deserialization', desc: 'Unsafe object deserialization' }
                ]
            },
        ];

        this.playerVulnerabilities = [
            { 
                id: 'sql', 
                name: 'SQL Injection', 
                desc: 'Exploit database queries',
                variants: [
                    { id: 'union', name: 'UNION-based', desc: 'Use UNION SELECT' },
                    { id: 'blind', name: 'Blind SQL', desc: 'Boolean-based inference' },
                    { id: 'time', name: 'Time-based', desc: 'Delay-based detection' }
                ]
            },
        ];

        // Player position
        this.playerX = Math.floor(this.width / 2);
        this.playerY = Math.floor(this.height / 2);

        // Game entities
        this.enemies = [];
        this.items = [];

        this.generateLevel();
        this.setupEventListeners();
        this.render();
    }

    generateLevel() {
        this.enemies = [];
        this.items = [];

        // Enemy type vulnerabilities and open ports
        const enemyVulnerabilities = {
            'M': { 
                vuln: 'sql', 
                variant: 'union',
                ports: [3306, 5432, 1433],  // MySQL, PostgreSQL, MSSQL
                portNames: { 3306: 'MySQL', 5432: 'PostgreSQL', 1433: 'MSSQL' }
            },
            'B': { 
                vuln: 'xss', 
                variant: 'stored',
                ports: [80, 443, 8080],     // HTTP, HTTPS, HTTP-alt
                portNames: { 80: 'HTTP', 443: 'HTTPS', 8080: 'HTTP-alt' }
            },
            'S': { 
                vuln: 'buffer', 
                variant: 'stack',
                ports: [22, 23, 25],        // SSH, Telnet, SMTP
                portNames: { 22: 'SSH', 23: 'Telnet', 25: 'SMTP' }
            },
            'W': { 
                vuln: 'rce', 
                variant: 'command',
                ports: [445, 139, 135],     // SMB, NetBIOS, RPC
                portNames: { 445: 'SMB', 139: 'NetBIOS', 135: 'RPC' }
            }
        };

        // Spawn 3-5 enemies
        const enemyCount = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < enemyCount; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * this.width);
                y = Math.floor(Math.random() * this.height);
            } while ((Math.abs(x - this.playerX) < 5 && Math.abs(y - this.playerY) < 5) || this.getEntityAt(x, y));

            const types = ['M', 'B', 'S', 'W'];
            const type = types[Math.floor(Math.random() * types.length)];
            const names = {
                'M': 'Malware',
                'B': 'Bot',
                'S': 'Server',
                'W': 'Worm'
            };

            this.enemies.push({
                x, y,
                type,
                name: names[type],
                health: 30 + Math.floor(Math.random() * 20),
                maxHealth: 50,
                id: Math.random(),
                vulnerability: enemyVulnerabilities[type]
            });
        }

        // Spawn 2-4 vulnerability items
        const itemCount = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < itemCount; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * this.width);
                y = Math.floor(Math.random() * this.height);
            } while ((Math.abs(x - this.playerX) < 5 && Math.abs(y - this.playerY) < 5) || this.getEntityAt(x, y));

            const vuln = this.vulnerabilities[Math.floor(Math.random() * this.vulnerabilities.length)];
            this.items.push({
                x, y,
                vuln,
                id: Math.random()
            });
        }
    }

    getEntityAt(x, y) {
        if (this.playerX === x && this.playerY === y) return true;
        if (this.enemies.some(e => e.x === x && e.y === y)) return true;
        if (this.items.some(i => i.x === x && i.y === y)) return true;
        return false;
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    handleKeyPress(e) {
        if (this.inCombat) return;

        const key = e.key.toLowerCase();
        let newX = this.playerX;
        let newY = this.playerY;

        if (key === 'arrowup' || key === 'w') newY = Math.max(0, newY - 1);
        if (key === 'arrowdown' || key === 's') newY = Math.min(this.height - 1, newY + 1);
        if (key === 'arrowleft' || key === 'a') newX = Math.max(0, newX - 1);
        if (key === 'arrowright' || key === 'd') newX = Math.min(this.width - 1, newX + 1);

        if (newX !== this.playerX || newY !== this.playerY) {
            this.playerX = newX;
            this.playerY = newY;
            this.checkCollisions();
            this.render();
        }

        if (key === ' ') {
            this.interact();
        }
    }

    checkCollisions() {
        // Check for enemy collision
        const enemy = this.enemies.find(e => e.x === this.playerX && e.y === this.playerY);
        if (enemy) {
            this.startCombat(enemy);
        }

        // Check for item collision
        const item = this.items.find(i => i.x === this.playerX && i.y === this.playerY);
        if (item) {
            this.pickupVulnerability(item);
        }
    }

    pickupVulnerability(item) {
        const existing = this.playerVulnerabilities.find(v => v.id === item.vuln.id);
        if (!existing) {
            this.playerVulnerabilities.push(item.vuln);
            this.addMessage(`Acquired: ${item.vuln.name}`, 'success');
        } else {
            this.addMessage(`Already have: ${item.vuln.name}`, 'info');
        }
        this.items = this.items.filter(i => i.id !== item.id);
        this.render();
    }

    startCombat(enemy) {
        this.inCombat = true;
        this.currentEnemy = enemy;
        this.selectedVulnerability = null;
        this.selectedVariant = null;
        this.currentEnemy.scanned = false;
        this.addMessage(`Combat started with ${enemy.name}!`, 'info');
        this.addMessage(`Hint: This ${enemy.name} has a weakness...`, 'info');
        this.addMessage(`Tip: Use SCAN to probe for open ports!`, 'info');
        this.render();
    }

    selectVulnerability(vulnId) {
        this.selectedVulnerability = vulnId;
        this.selectedVariant = null;
        this.render();
    }

    selectVariant(variantId) {
        this.selectedVariant = variantId;
        this.render();
    }

    scan() {
        if (!this.inCombat || !this.currentEnemy) return;

        if (this.currentEnemy.scanned) {
            this.addMessage('Already scanned this target!', 'info');
            return;
        }

        this.currentEnemy.scanned = true;
        const enemyVulnData = this.getEnemyVulnerabilityData(this.currentEnemy.type);
        const openPorts = enemyVulnData.ports;
        const portNames = enemyVulnData.portNames;

        let scanMessage = `Open ports detected: `;
        scanMessage += openPorts.map(port => `${port} (${portNames[port]})`).join(', ');
        this.addMessage(scanMessage, 'success');

        // Give hint based on ports
        const hints = {
            'M': 'Database ports detected - likely vulnerable to SQL injection!',
            'B': 'Web server ports detected - likely vulnerable to XSS attacks!',
            'S': 'System service ports detected - likely vulnerable to buffer overflow!',
            'W': 'Network sharing ports detected - likely vulnerable to command injection!'
        };
        this.addMessage(hints[this.currentEnemy.type], 'info');

        this.render();
    }

    getEnemyVulnerabilityData(enemyType) {
        const data = {
            'M': { 
                vuln: 'sql', 
                variant: 'union',
                ports: [3306, 5432, 1433],
                portNames: { 3306: 'MySQL', 5432: 'PostgreSQL', 1433: 'MSSQL' }
            },
            'B': { 
                vuln: 'xss', 
                variant: 'stored',
                ports: [80, 443, 8080],
                portNames: { 80: 'HTTP', 443: 'HTTPS', 8080: 'HTTP-alt' }
            },
            'S': { 
                vuln: 'buffer', 
                variant: 'stack',
                ports: [22, 23, 25],
                portNames: { 22: 'SSH', 23: 'Telnet', 25: 'SMTP' }
            },
            'W': { 
                vuln: 'rce', 
                variant: 'command',
                ports: [445, 139, 135],
                portNames: { 445: 'SMB', 139: 'NetBIOS', 135: 'RPC' }
            }
        };
        return data[enemyType];
    }

    attack() {
        if (!this.selectedVulnerability || !this.selectedVariant || !this.currentEnemy) return;

        const vuln = this.playerVulnerabilities.find(v => v.id === this.selectedVulnerability);
        if (!vuln) return;

        const variant = vuln.variants.find(v => v.id === this.selectedVariant);
        if (!variant) return;

        // Check if variant matches enemy weakness
        const isWeakness = this.currentEnemy.vulnerability.vuln === this.selectedVulnerability &&
                          this.currentEnemy.vulnerability.variant === this.selectedVariant;

        if (isWeakness) {
            // Direct hit on weakness
            const damage = 25 + Math.floor(Math.random() * 25);
            this.currentEnemy.health -= damage;
            this.addMessage(`Critical hit! ${variant.name} is super effective! Dealt ${damage} damage.`, 'success');

            if (this.currentEnemy.health <= 0) {
                this.defeatEnemy();
            } else {
                this.enemyCounterAttack();
            }
        } else if (this.currentEnemy.vulnerability.vuln === this.selectedVulnerability) {
            // Right vulnerability, wrong variant
            const damage = 8 + Math.floor(Math.random() * 12);
            this.currentEnemy.health -= damage;
            this.addMessage(`Partial hit with ${variant.name}. Dealt ${damage} damage.`, 'success');
            this.enemyCounterAttack();
        } else {
            // Wrong vulnerability entirely
            this.addMessage(`${variant.name} has no effect on this ${this.currentEnemy.name}!`, 'failure');
            this.enemyCounterAttack();
        }

        this.render();
    }

    enemyCounterAttack() {
        const damage = 5 + Math.floor(Math.random() * 15);
        this.playerHealth -= damage;
        this.addMessage(`${this.currentEnemy.name} attacks! You take ${damage} damage.`, 'failure');

        if (this.playerHealth <= 0) {
            this.gameOver(false);
        }
    }

    defeatEnemy() {
        this.addMessage(`${this.currentEnemy.name} defeated!`, 'success');
        
        // Drop a random vulnerability at the enemy's location
        const randomVuln = this.vulnerabilities[Math.floor(Math.random() * this.vulnerabilities.length)];
        this.items.push({
            x: this.currentEnemy.x,
            y: this.currentEnemy.y,
            vuln: randomVuln,
            id: Math.random()
        });
        this.addMessage(`${this.currentEnemy.name} dropped ${randomVuln.name}!`, 'info');
        
        this.enemies = this.enemies.filter(e => e.id !== this.currentEnemy.id);
        this.machinesDefeated++;
        this.inCombat = false;
        this.currentEnemy = null;

        if (this.enemies.length === 0) {
            this.nextLevel();
        }
    }

    flee() {
        if (Math.random() < 0.6) {
            this.addMessage('Escaped from combat!', 'success');
            // Move player away
            this.playerX = Math.max(0, Math.min(this.width - 1, this.playerX + (Math.random() < 0.5 ? -3 : 3)));
            this.playerY = Math.max(0, Math.min(this.height - 1, this.playerY + (Math.random() < 0.5 ? -3 : 3)));
            this.inCombat = false;
            this.currentEnemy = null;
        } else {
            this.addMessage('Failed to escape!', 'failure');
            this.enemyCounterAttack();
        }
        this.render();
    }

    nextLevel() {
        this.level++;
        this.playerHealth = Math.min(this.maxHealth, this.playerHealth + 20);
        this.playerX = Math.floor(this.width / 2);
        this.playerY = Math.floor(this.height / 2);
        this.addMessage(`Advanced to Level ${this.level}!`, 'success');
        this.generateLevel();
        this.render();
    }

    gameOver(won) {
        const gameOverDiv = document.getElementById('gameOver');
        const title = document.getElementById('gameOverTitle');
        const message = document.getElementById('gameOverMessage');

        if (won) {
            title.textContent = 'VICTORY!';
            message.textContent = `You defeated all machines and reached level ${this.level}!`;
        } else {
            title.textContent = 'DEFEATED!';
            message.textContent = `You were destroyed by the machines at level ${this.level}.`;
        }

        gameOverDiv.classList.add('active');
    }

    interact() {
        // Placeholder for future interactions
    }

    addMessage(text, type = 'info') {
        this.messages.push({ text, type });
        if (this.messages.length > 10) {
            this.messages.shift();
        }
    }

    render() {
        this.renderGame();
        this.renderUI();
    }

    renderGame() {
        const grid = document.getElementById('gameGrid');
        let display = '';

        for (let y = 0; y < this.height; y++) {
            let line = '';
            for (let x = 0; x < this.width; x++) {
                if (this.playerX === x && this.playerY === y) {
                    line += '☺';
                } else {
                    const enemy = this.enemies.find(e => e.x === x && e.y === y);
                    if (enemy) {
                        line += enemy.type;
                    } else {
                        const item = this.items.find(i => i.x === x && i.y === y);
                        if (item) {
                            line += '?';
                        } else {
                            line += '.';
                        }
                    }
                }
            }
            display += line + '\n';
        }

        grid.innerHTML = display.split('\n').map(line => `<div>${line}</div>`).join('');
    }

    renderUI() {
        // Update stats
        document.getElementById('playerHealth').textContent = this.playerHealth;
        document.getElementById('exploitCount').textContent = this.playerVulnerabilities.length;
        document.getElementById('machinesDefeated').textContent = this.machinesDefeated;
        document.getElementById('levelInfo').textContent = `Level ${this.level}`;

        // Update vulnerabilities list
        const vulnList = document.getElementById('vulnerabilityList');
        vulnList.innerHTML = this.playerVulnerabilities.map(v => `
            <div class="vuln-item ${this.selectedVulnerability === v.id ? 'selected' : ''}" onclick="game.selectVulnerability('${v.id}')">
                <div class="vuln-name">${v.name}</div>
                <div class="vuln-desc">${v.desc}</div>
            </div>
        `).join('');

        // Update combat panel
        const combatPanel = document.getElementById('combatPanel');
        if (this.inCombat) {
            combatPanel.classList.add('active');
            document.getElementById('enemyName').textContent = this.currentEnemy.name;
            document.getElementById('enemyHealth').textContent = this.currentEnemy.health;

            const combatVulns = document.getElementById('combatVulnerabilities');
            combatVulns.innerHTML = this.playerVulnerabilities.map(v => `
                <div class="vuln-item ${this.selectedVulnerability === v.id ? 'selected' : ''}" onclick="game.selectVulnerability('${v.id}')">
                    <div class="vuln-name">${v.name}</div>
                    <div class="vuln-desc">${v.desc}</div>
                </div>
            `).join('');

            // Show variants if vulnerability is selected
            const variantLabel = document.getElementById('variantLabel');
            const combatVariants = document.getElementById('combatVariants');
            if (this.selectedVulnerability) {
                const selectedVuln = this.playerVulnerabilities.find(v => v.id === this.selectedVulnerability);
                variantLabel.style.display = 'block';
                combatVariants.innerHTML = selectedVuln.variants.map(variant => `
                    <div class="vuln-item ${this.selectedVariant === variant.id ? 'selected' : ''}" onclick="game.selectVariant('${variant.id}')">
                        <div class="vuln-name">${variant.name}</div>
                        <div class="vuln-desc">${variant.desc}</div>
                    </div>
                `).join('');
            } else {
                variantLabel.style.display = 'none';
                combatVariants.innerHTML = '';
            }

            document.getElementById('attackBtn').disabled = !this.selectedVulnerability || !this.selectedVariant;
        } else {
            combatPanel.classList.remove('active');
        }

        // Update message log
        const messageLog = document.getElementById('messageLog');
        messageLog.innerHTML = this.messages.map(m => 
            `<div class="message ${m.type}">${m.text}</div>`
        ).join('');
    }
}

// Initialize game
const game = new Game();
