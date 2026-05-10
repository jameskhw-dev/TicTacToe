const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],             // diagonals
];

const board = Array(9).fill(null);
const placedX = []; // indices of X's pieces in placement order (oldest first)
const placedO = []; // indices of O's pieces in placement order (oldest first)
let currentPlayer = 'X';
let gameOver = false;
let aiMode = true;
let aiDifficulty = 'easy';
const scores = { X: 0, O: 0, draws: 0 };

const cells = document.querySelectorAll('.cell');
const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const scoreXEl = document.getElementById('score-x-val');
const scoreOEl = document.getElementById('score-o-val');
const scoreDrawsEl = document.getElementById('score-draws');
const scoreCardX = document.getElementById('score-x');
const scoreCardO = document.getElementById('score-o');
const modeToggle = document.getElementById('mode-toggle');
const difficultyRow = document.getElementById('difficulty-row');
const diffBtns = document.querySelectorAll('.diff-btn');

function setStatus(msg, cls = '') {
  statusEl.textContent = msg;
  statusEl.className = 'status ' + cls;
}

function highlightActivePlayer() {
  scoreCardX.classList.toggle('active-x', currentPlayer === 'X' && !gameOver);
  scoreCardO.classList.toggle('active-o', currentPlayer === 'O' && !gameOver);
}

function updateScoreDisplay() {
  scoreXEl.textContent = scores.X;
  scoreOEl.textContent = scores.O;
  scoreDrawsEl.textContent = scores.draws;
}

function checkWinnerOnBoard(b) {
  for (const [i, j, k] of WINNING_COMBOS) {
    if (b[i] && b[i] === b[j] && b[i] === b[k]) {
      return { winner: b[i], combo: [i, j, k] };
    }
  }
  return null;
}

function checkWinner() {
  return checkWinnerOnBoard(board);
}

// --- Oldest-piece highlight ---

function updateOldestHighlight() {
  cells.forEach(c => c.classList.remove('oldest-x', 'oldest-o'));
  if (gameOver) return;
  if (placedX.length >= 3) cells[placedX[0]].classList.add('oldest-x');
  if (placedO.length >= 3) cells[placedO[0]].classList.add('oldest-o');
}

// --- Minimax AI (queue-aware) ---
// Simulates removal before iterating so the freed cell is a valid candidate.

function minimax(b, isMaximizing, qX, qO, depth) {
  const result = checkWinnerOnBoard(b);
  if (result?.winner === 'O') return 10 - depth;
  if (result?.winner === 'X') return depth - 10;
  if (depth >= 8) return 0;

  if (isMaximizing) {
    const nb = [...b];
    const nqO = [...qO];
    if (nqO.length >= 3) nb[nqO.shift()] = null;

    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!nb[i]) {
        const cb = [...nb]; const cqO = [...nqO];
        cb[i] = 'O'; cqO.push(i);
        best = Math.max(best, minimax(cb, false, qX, cqO, depth + 1));
      }
    }
    return best;
  } else {
    const nb = [...b];
    const nqX = [...qX];
    if (nqX.length >= 3) nb[nqX.shift()] = null;

    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!nb[i]) {
        const cb = [...nb]; const cqX = [...nqX];
        cb[i] = 'X'; cqX.push(i);
        best = Math.min(best, minimax(cb, true, cqX, qO, depth + 1));
      }
    }
    return best;
  }
}

function getAiMove() {
  if (aiDifficulty === 'easy') {
    const empty = board.map((v, i) => (v ? null : i)).filter(i => i !== null);
    return empty[Math.floor(Math.random() * empty.length)];
  }

  // Pre-apply O's removal so the freed cell is a valid candidate for Hard AI.
  const nb = [...board];
  const nqO = [...placedO];
  if (nqO.length >= 3) nb[nqO.shift()] = null;

  let best = -Infinity;
  let move = nb.findIndex(v => !v);
  for (let i = 0; i < 9; i++) {
    if (!nb[i]) {
      const cb = [...nb]; const cqO = [...nqO];
      cb[i] = 'O'; cqO.push(i);
      const score = minimax(cb, false, [...placedX], cqO, 0);
      if (score > best) { best = score; move = i; }
    }
  }
  return move;
}

// --- Move logic ---

function finishGame(result) {
  gameOver = true;
  cells.forEach(c => c.classList.remove('oldest-x', 'oldest-o'));
  if (result.winner) {
    scores[result.winner]++;
    updateScoreDisplay();
    result.combo.forEach(i => cells[i].classList.add('winning'));
    const label = aiMode && result.winner === 'O' ? 'AI wins!' : `Player ${result.winner} wins!`;
    setStatus(label, 'winner');
  } else {
    scores.draws++;
    updateScoreDisplay();
    setStatus("It's a draw!", 'draw');
  }
  boardEl.classList.add('disabled');
  scoreCardX.classList.remove('active-x');
  scoreCardO.classList.remove('active-o');
}

function placeMove(idx, player) {
  const queue = player === 'X' ? placedX : placedO;

  // Remove oldest piece when player already has 3 on the board.
  if (queue.length >= 3) {
    const oldIdx = queue.shift();
    board[oldIdx] = null;
    cells[oldIdx].textContent = '';
    cells[oldIdx].className = 'cell';
  }

  board[idx] = player;
  cells[idx].textContent = player;
  cells[idx].classList.add(player.toLowerCase(), 'taken', 'pop');
  queue.push(idx);

  updateOldestHighlight();

  const result = checkWinner();
  if (result) { finishGame(result); return true; }
  return false;
}

function scheduleAiMove() {
  boardEl.classList.add('disabled');
  setStatus('AI is thinking…');
  setTimeout(() => {
    if (gameOver) return;
    boardEl.classList.remove('disabled');
    const ended = placeMove(getAiMove(), 'O');
    if (!ended) {
      currentPlayer = 'X';
      setStatus("Your turn (X)");
      highlightActivePlayer();
    }
  }, 450);
}

function handleClick(e) {
  const idx = Number(e.currentTarget.dataset.index);
  if (gameOver || board[idx]) return;
  if (aiMode && currentPlayer !== 'X') return;

  const ended = placeMove(idx, currentPlayer);
  if (!ended) {
    if (aiMode) {
      currentPlayer = 'O';
      scheduleAiMove();
    } else {
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      setStatus(`Player ${currentPlayer}'s turn`);
      highlightActivePlayer();
    }
  }
}

function resetGame() {
  board.fill(null);
  placedX.length = 0;
  placedO.length = 0;
  currentPlayer = 'X';
  gameOver = false;

  cells.forEach(cell => {
    cell.textContent = '';
    cell.className = 'cell';
  });

  boardEl.classList.remove('disabled');
  setStatus(aiMode ? "Your turn (X)" : "Player X's turn");
  highlightActivePlayer();
}

// --- UI wiring ---

cells.forEach(cell => cell.addEventListener('click', handleClick));

document.getElementById('reset-btn').addEventListener('click', resetGame);

document.getElementById('clear-scores-btn').addEventListener('click', () => {
  scores.X = 0;
  scores.O = 0;
  scores.draws = 0;
  updateScoreDisplay();
  resetGame();
});

modeToggle.addEventListener('change', () => {
  aiMode = modeToggle.checked;
  difficultyRow.style.display = aiMode ? 'flex' : 'none';
  document.querySelector('#score-o .player-label').textContent = aiMode ? 'AI' : 'O';
  resetGame();
});

diffBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    diffBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    aiDifficulty = btn.dataset.diff;
    resetGame();
  });
});

// Init
resetGame();
