# Vulnerability Roguelike

A retro-style terminal roguelike game where you explore a dungeon filled with dangerous machines and defeat them using software vulnerabilities and exploits.

## Overview

In this game, you play as a hacker navigating through procedurally-generated dungeons. You encounter various enemy machines (Malware, Bots, Servers, and Worms) and must exploit their security vulnerabilities to defeat them. Each machine has specific weaknesses—discover the right vulnerability and attack variant to take them down efficiently.

### Game Features

- **ASCII-based Dungeon Exploration**: Navigate a 40x15 grid dungeon using arrow keys or WASD
- **Dynamic Combat System**: Engage enemies in turn-based combat with strategic vulnerability selection
- **Vulnerability Variants**: Each exploit has multiple attack variants—find the one that works best against each enemy type
- **Progressive Difficulty**: Advance through levels with increasing challenges
- **Item Collection**: Discover new vulnerabilities scattered throughout the dungeon
- **Retro Terminal Aesthetic**: Green-on-black terminal styling for that classic hacker feel

### Enemy Types & Weaknesses

| Enemy | Type | Weakness |
|-------|------|----------|
| Malware | M | SQL Injection (UNION-based) |
| Bot | B | Cross-Site Scripting (Stored XSS) |
| Server | S | Buffer Overflow (Stack Overflow) |
| Worm | W | Remote Code Execution (Command Injection) |

## Installation

### Requirements

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3.x (for running a local web server)

### Setup

1. Clone or download this repository
2. Navigate to the project directory
3. No additional dependencies needed—it's pure HTML/CSS/JavaScript!

## Execution

### Option 1: Using Python's Built-in Server (Recommended)

```bash
python3 -m http.server 8000
```

Then open your browser and navigate to:
```
http://localhost:8000
```

### Option 2: Using Node.js http-server

If you have Node.js installed:

```bash
npx http-server
```

Then open your browser to the displayed URL (typically `http://localhost:8080`)

### Option 3: Direct File Access

Simply open `index.html` directly in your web browser (though some features may be limited depending on your browser's security settings).

## How to Play

### Controls

| Key | Action |
|-----|--------|
| **↑↓←→** or **WASD** | Move around the dungeon |
| **Click on vulnerability** | Select an exploit to use |
| **Click on variant** | Choose your attack method |
| **ATTACK button** | Execute your selected exploit |
| **FLEE button** | Attempt to escape combat (60% success rate) |
| **SPACE** | Interact (placeholder for future features) |

### Gameplay Loop

1. **Explore**: Move through the dungeon to find enemies and items
2. **Collect**: Pick up vulnerability items (`?`) to expand your arsenal
3. **Engage**: Walk into an enemy to start combat
4. **Exploit**: Select a vulnerability, then choose an attack variant
5. **Attack**: Use the ATTACK button to execute your exploit
6. **Survive**: Defeat all enemies on a level to advance
7. **Progress**: Advance through increasingly difficult levels

### Combat Strategy

- **Critical Hits**: Using the exact vulnerability and variant an enemy is weak to deals massive damage (25-50)
- **Partial Hits**: Using the right vulnerability but wrong variant deals moderate damage (8-20)
- **Misses**: Using the wrong vulnerability entirely fails and triggers a counter-attack
- **Counter-Attacks**: Enemies always counter-attack after your turn (unless you defeat them)
- **Fleeing**: You can attempt to flee combat with a 60% success rate

### Tips

- Pay attention to the hint when combat starts—it tells you the enemy type
- Experiment with different vulnerabilities to discover which ones work
- Collect new vulnerabilities as you explore to expand your options
- Health regenerates slightly when you advance to the next level
- The game ends when your health reaches 0

## Game Stats

- **Health**: Your current HP (starts at 100)
- **Exploits**: Number of unique vulnerabilities you've collected
- **Machines Defeated**: Total enemies defeated across all levels
- **Level**: Current dungeon level

## File Structure

```
.
├── index.html      # Main HTML file with UI and styling
├── game.js         # Game logic and mechanics
└── README.md       # This file
```

## Technical Details

- **Language**: Vanilla JavaScript (no frameworks)
- **Rendering**: DOM-based grid rendering
- **Game Loop**: Event-driven with render-on-change
- **Data**: All game state stored in the Game class instance

## Future Features

Potential enhancements for future versions:

- [ ] Save/load game state
- [ ] More vulnerability types and variants
- [ ] Boss enemies with unique mechanics
- [ ] Procedural difficulty scaling
- [ ] Leaderboard/high scores
- [ ] Sound effects and music
- [ ] More detailed enemy AI
- [ ] Special items and power-ups
- [ ] Skill tree progression system

## License

This project is open source and available for educational purposes.

## Credits

Created as an educational roguelike game exploring cybersecurity concepts through gameplay.
