# TicTacToe Browser Game

## Project Overview
A two-player browser-based Tic Tac Toe game built with vanilla HTML, CSS, and JavaScript. No build tools or dependencies required — open `index.html` directly in any browser.

## File Structure
```
TicTacToe/
├── index.html   — markup: board grid (9 cells), scoreboard, controls
├── style.css    — dark gradient theme, animations, responsive layout
├── game.js      — all game logic: state, win detection, score tracking
└── CLAUDE.md    — this file
```

## Architecture
- **State**: flat `board` array (9 elements, null | 'X' | 'O'), `currentPlayer`, `gameOver`, `scores` object
- **Win detection**: checks all 8 `WINNING_COMBOS` after every move
- **No framework**: pure DOM manipulation via `querySelectorAll` + event delegation

## Features
- Two-player local multiplayer (X vs O)
- Win and draw detection with visual highlighting
- Persistent score tracking across rounds (X wins, O wins, draws)
- "New Game" resets the board but keeps scores
- "Clear Scores" resets everything
- Responsive layout (works on mobile)
- CSS animations: pop-in on place, pulse on winning cells, glow on active player score card

## History

### 2026-05-10 — Initial release
- Created project from scratch
- Implemented full game loop: move → win check → draw check → next turn
- Dark glassmorphism UI with gradient background
- Winning cells highlighted in gold with pulse animation
- Active player score card highlighted with colored glow
- Initial commit pushed to GitHub: `jameskhw-dev/TicTacToe`
