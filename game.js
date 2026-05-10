const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],             // diagonals
];

const board = Array(9).fill(null);
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
  if (b.every(Boolean)) return { winner: null, combo: null, draw: true };
  return null;
}

function checkWinner() {
  return checkWinnerOnBoard(board);
}

// --- Minimax AI ---

function minimax(b, isMaximizing) {
  const result = checkWinnerOnBoard(b);
  if (result?.winner === 'O') return 10;
  if (result?.winner === 'X') return -10;
  if (result?.draw) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!b[i]) {
        b[i] = 'O';
        best = Math.max(best, minimax(b, false));
        b[i] = null;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!b[i]) {
        b[i] = 'X';
        best = Math.min(best, minimax(b, true));
        b[i] = null;
      }
    }
    return best;
  }
}

function getAiMove() {
  const empty = board.map((v, i) => (v ? null : i)).filter(i => i !== null);

  if (aiDifficulty === 'easy') {
    return empty[Math.floor(Math.random() * empty.length)];
  }

  // Hard: unbeatable minimax
  let best = -Infinity;
  let move = empty[0];
  for (const i of empty) {
    board[i] = 'O';
    const score = minimax(board, false);
    board[i] = null;
    if (score > best) {
      best = score;
      move = i;
    }
  }
  return move;
}

// --- Move logic ---

function finishGame(result) {
  gameOver = true;
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
  board[idx] = player;
  cells[idx].textContent = player;
  cells[idx].classList.add(player.toLowerCase(), 'taken', 'pop');

  const result = checkWinner();
  if (result) {
    finishGame(result);
    return true;
  }
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
