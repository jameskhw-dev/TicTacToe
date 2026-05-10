# TicTacToe Browser Game

## Project Overview
A browser-based Tic Tac Toe game built with vanilla HTML, CSS, and JavaScript. Supports two-player local multiplayer and single-player vs AI. No build tools or dependencies required — open `index.html` directly in any browser.

## File Structure
```
TicTacToe/
├── index.html   — markup: board grid (9 cells), scoreboard, mode toggle, controls
├── style.css    — dark gradient theme, animations, responsive layout
├── game.js      — all game logic: state, win detection, score tracking, AI
└── CLAUDE.md    — this file
```

## Architecture
- **State**: flat `board` array (9 elements, null | 'X' | 'O'), `currentPlayer`, `gameOver`, `scores`, `aiMode`, `aiDifficulty`
- **Win detection**: `checkWinnerOnBoard(b)` checks all 8 `WINNING_COMBOS` on any board — used by both the live game and the minimax AI
- **AI**: queue-aware minimax in `minimax(b, isMaximizing, qX, qO, depth)` simulates removal before iterating so the freed cell is a valid candidate; depth-limited to 8; `getAiMove()` dispatches to random (Easy) or minimax (Hard)
- **Piece queues**: `placedX[]` / `placedO[]` track placement order (oldest first) for both live game and AI simulation
- **No framework**: pure DOM manipulation via `querySelectorAll` + event delegation

## Features
- Two-player local multiplayer (X vs O)
- Single-player vs AI with Easy (random) and Hard (unbeatable minimax) difficulty
- **vs AI mode is the default** on page load; toggle to switch to 2 Player
- Mode toggle: 2 Player ↔ vs AI; difficulty selector appears in AI mode
- Win and draw detection with visual highlighting
- Persistent score tracking across rounds (X wins, O/AI wins, draws)
- "New Game" resets the board but keeps scores
- "Clear Scores" resets everything
- Responsive layout (works on mobile)
- CSS animations: pop-in on place, pulse on winning cells, glow on active player score card
- Board disables with "AI is thinking…" status during AI turn (450ms delay for UX)
- **3-piece sliding rule**: each player holds max 3 pieces; on the 4th move the oldest piece is automatically removed before placing the new one; the oldest piece pulses (faded) to signal it's next to go

## History

### 2026-05-10 — Initial release
- Created project from scratch
- Implemented full game loop: move → win check → draw check → next turn
- Dark glassmorphism UI with gradient background
- Winning cells highlighted in gold with pulse animation
- Active player score card highlighted with colored glow
- Initial commit pushed to GitHub: `jameskhw-dev/TicTacToe`

### 2026-05-10 — AI opponent
- Added mode toggle (2 Player / vs AI) above scoreboard
- Easy mode: AI picks a random empty cell
- Hard mode: unbeatable minimax AI (`minimax` + `getAiMove`)
- Refactored `checkWinner` into `checkWinnerOnBoard(b)` to support minimax board simulation
- Extracted `placeMove` and `finishGame` helpers shared by human and AI turns
- O score card label updates to "AI" in single-player mode
- Pill-style difficulty buttons and CSS toggle switch styled to match existing dark theme

### 2026-05-10 — 3-piece sliding rule
- Each player holds max 3 pieces; 4th move removes the oldest automatically
- `placedX` / `placedO` queues track placement order for live game and minimax simulation
- Minimax updated to be queue-aware: pre-applies removal so the freed cell is a valid AI candidate; depth-limited to 8 half-moves
- Oldest piece pulses (faded, colored) to telegraph the upcoming removal
- Static rule hint added below the board

### 2026-05-10 — vs AI default
- vs AI mode now enabled by default on page load (player is X, AI is O)
- Difficulty row visible and toggle checked on initial render
- Score card shows "AI" label from the start; status reads "Your turn (X)"
- Init now calls `resetGame()` instead of `highlightActivePlayer()` for a fully consistent initial state
