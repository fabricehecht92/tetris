const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
const ROWS = 20;
const COLUMNS = 10;
const BLOCK_SIZE = 30;
const COLORS = ["#000", "#FF0", "#F00", "#00F", "#0F0", "#0FF", "#F0F", "#FF0"];
let board = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0));
let score = 0;
let level = 1;
let linesCleared = 0;
let currentPiece, nextPiece;
let gameInterval;
let gameSpeed = 500;

const PIECES = [
  [[1, 1, 1], [0, 1, 0]], // T
  [[1, 1], [1, 1]], // O
  [[1, 1, 0], [0, 1, 1]], // S
  [[0, 1, 1], [1, 1, 0]], // Z
  [[1, 0, 0], [1, 1, 1]], // L
  [[0, 0, 1], [1, 1, 1]], // J
  [[1, 1, 1, 1]], // I
];

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLUMNS; col++) {
      if (board[row][col] !== 0) {
        ctx.fillStyle = COLORS[board[row][col]];
        ctx.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    }
  }
}

function drawPiece(piece, x, y) {
  for (let row = 0; row < piece.length; row++) {
    for (let col = 0; col < piece[row].length; col++) {
      if (piece[row][col] !== 0) {
        ctx.fillStyle = COLORS[piece[row][col]];
        ctx.fillRect((x + col) * BLOCK_SIZE, (y + row) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    }
  }
}

function newPiece() {
  const type = Math.floor(Math.random() * PIECES.length);
  return { shape: PIECES[type], x: Math.floor(COLUMNS / 2) - 2, y: 0, color: type + 1 };
}

function collision(piece, x, y) {
  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (piece.shape[row][col] !== 0) {
        if (x + col < 0 || x + col >= COLUMNS || y + row >= ROWS || board[y + row][x + col] !== 0) {
          return true;
        }
      }
    }
  }
  return false;
}

function placePiece() {
  for (let row = 0; row < currentPiece.shape.length; row++) {
    for (let col = 0; col < currentPiece.shape[row].length; col++) {
      if (currentPiece.shape[row][col] !== 0) {
        board[currentPiece.y + row][currentPiece.x + col] = currentPiece.color;
      }
    }
  }
}

function clearLines() {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row].every(cell => cell !== 0)) {
      board.splice(row, 1);
      board.unshift(Array(COLUMNS).fill(0));
      linesCleared++;
      score += 100;
      if (linesCleared >= 10) {
        level++;
        linesCleared = 0;
        gameSpeed = Math.max(100, gameSpeed - 50); // Geschwindigkeit erhÃ¶hen
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, gameSpeed);
      }
      document.getElementById('score').textContent = `Punktzahl: ${score}`;
      document.getElementById('level').textContent = `Level: ${level}`;
    }
  }
}

function rotatePiece() {
  const rotated = currentPiece.shape[0].map((_, index) => currentPiece.shape.map(row => row[index])).reverse();
  if (!collision({ ...currentPiece, shape: rotated }, currentPiece.x, currentPiece.y)) {
    currentPiece.shape = rotated;
  }
}

function movePiece(direction) {
  const newX = currentPiece.x + direction.x;
  const newY = currentPiece.y + direction.y;

  if (!collision(currentPiece, newX, newY)) {
    currentPiece.x = newX;
    currentPiece.y = newY;
  } else if (direction.y === 1) {
    placePiece();
    clearLines();
    currentPiece = nextPiece;
    nextPiece = newPiece();
    if (collision(currentPiece, currentPiece.x, currentPiece.y)) {
      clearInterval(gameInterval);
      alert('Game Over!');
    }
  }
}

function gameLoop() {
  drawBoard();
  drawPiece(currentPiece.shape, currentPiece.x, currentPiece.y);
  movePiece({ x: 0, y: 1 });
}

function startGame() {
  score = 0;
  level = 1;
  linesCleared = 0;
  gameSpeed = 500;
  document.getElementById('score').textContent = `Punktzahl: ${score}`;
  document.getElementById('level').textContent = `Level: ${level}`;
  board = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0));
  currentPiece = newPiece();
  nextPiece = newPiece();
  gameInterval = setInterval(gameLoop, gameSpeed);
}

function handleKeyPress(event) {
  switch (event.key) {
    case 'ArrowLeft':
      movePiece({ x: -1, y: 0 });
      break;
    case 'ArrowRight':
      movePiece({ x: 1, y: 0 });
      break;
    case 'ArrowDown':
      movePiece({ x: 0, y: 1 });
      break;
    case 'ArrowUp':
      rotatePiece();
      break;
  }
}

function handleTouch(buttonId) {
  switch (buttonId) {
    case 'left':
      movePiece({ x: -1, y: 0 });
      break;
    case 'right':
      movePiece({ x: 1, y: 0 });
      break;
    case 'down':
      movePiece({ x: 0, y: 1 });
      break;
    case 'rotate':
      rotatePiece();
      break;
  }
}

document.addEventListener('keydown', handleKeyPress);
document.getElementById('left').addEventListener('click', () => handleTouch('left'));
document.getElementById('right').addEventListener('click', () => handleTouch('right'));
document.getElementById('down').addEventListener('click', () => handleTouch('down'));
document.getElementById('rotate').addEventListener('click', () => handleTouch('rotate'));

startGame();

