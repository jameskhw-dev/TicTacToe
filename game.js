const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],             // diagonals
];

const board = Array(9).fill(null);
let currentPlayer = 'X';
let gameOver = false;
const scores = { X: 0, O: 0, draws: 0 };

const cells = document.querySelectorAll('.cell');
const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const scoreXEl = document.getElementById('score-x-val');
const scoreOEl = document.getElementById('score-o-val');
const scoreDrawsEl = document.getElementById('score-draws');
const scoreCardX = document.getElementById('score-x');
const scoreCardO = document.getElementById('score-o');

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

function checkWinner() {
  for (const combo of WINNING_COMBOS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], combo };
    }
  }
  if (board.every(Boolean)) return { winner: null, combo: null, draw: true };
  return null;
}

function handleClick(e) {
  const idx = Number(e.currentTarget.dataset.index);
  if (gameOver || board[idx]) return;

  board[idx] = currentPlayer;
  const cell = e.currentTarget;
  cell.textContent = currentPlayer;
  cell.classList.add(currentPlayer.toLowerCase(), 'taken', 'pop');

  const result = checkWinner();

  if (result?.winner) {
    gameOver = true;
    scores[result.winner]++;
    updateScoreDisplay();
    result.combo.forEach(i => cells[i].classList.add('winning'));
    boardEl.classList.add('disabled');
    scoreCardX.classList.remove('active-x');
    scoreCardO.classList.remove('active-o');
    setStatus(`Player ${result.winner} wins!`, 'winner');
  } else if (result?.draw) {
    gameOver = true;
    scores.draws++;
    updateScoreDisplay();
    boardEl.classList.add('disabled');
    scoreCardX.classList.remove('active-x');
    scoreCardO.classList.remove('active-o');
    setStatus("It's a draw!", 'draw');
  } else {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    setStatus(`Player ${currentPlayer}'s turn`);
    highlightActivePlayer();
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
  setStatus("Player X's turn");
  highlightActivePlayer();
}

cells.forEach(cell => cell.addEventListener('click', handleClick));

document.getElementById('reset-btn').addEventListener('click', resetGame);

document.getElementById('clear-scores-btn').addEventListener('click', () => {
  scores.X = 0;
  scores.O = 0;
  scores.draws = 0;
  updateScoreDisplay();
  resetGame();
});

// Init
highlightActivePlayer();
