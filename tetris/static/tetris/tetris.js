const COLS = 10;
const ROWS = 20;
const boardElement = document.getElementById('board');
const nextElement = document.getElementById('next');
const scoreElement = document.getElementById('score');
const startButton = document.getElementById('start');

let board = [];
let score = 0;
let dropInterval = 700;
let dropTimer = null;
let isRunning = false;

const SHAPES = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
};

const SHAPE_KEYS = Object.keys(SHAPES);

let current = null;
let next = null;

function createBoard() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function drawBoard() {
  boardElement.innerHTML = '';
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      if (board[y][x]) {
        cell.classList.add('filled');
      }
      boardElement.appendChild(cell);
    }
  }
}

function drawNext() {
  if (!nextElement) return;
  nextElement.innerHTML = '';
  const size = 4;
  const grid = [];
  for (let y = 0; y < size; y++) {
    const row = [];
    for (let x = 0; x < size; x++) {
      row.push(0);
    }
    grid.push(row);
  }

  const shape = next.shape;
  const offsetY = Math.floor((size - shape.length) / 2);
  const offsetX = Math.floor((size - shape[0].length) / 2);

  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        grid[offsetY + y][offsetX + x] = 1;
      }
    }
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cell = document.createElement('div');
      cell.classList.add('next-cell');
      if (grid[y][x]) {
        cell.classList.add('filled');
      }
      nextElement.appendChild(cell);
    }
  }
}

function randomShape() {
  const key = SHAPE_KEYS[Math.floor(Math.random() * SHAPE_KEYS.length)];
  return SHAPES[key].map(row => row.slice());
}

function spawnPiece() {
  if (!next) {
    next = { shape: randomShape(), x: 3, y: 0 };
  }
  current = next;
  current.x = 3;
  current.y = 0;
  next = { shape: randomShape(), x: 0, y: 0 };
  drawNext();

  if (collides(current.shape, current.x, current.y)) {
    resetGame();
  }
}

function collides(shape, offsetX, offsetY) {
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (!shape[y][x]) continue;
      const newX = offsetX + x;
      const newY = offsetY + y;
      if (newX < 0 || newX >= COLS || newY >= ROWS) {
        return true;
      }
      if (newY >= 0 && board[newY][newX]) {
        return true;
      }
    }
  }
  return false;
}

function mergePiece() {
  const shape = current.shape;
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const newX = current.x + x;
        const newY = current.y + y;
        if (newY >= 0 && newY < ROWS && newX >= 0 && newX < COLS) {
          board[newY][newX] = 1;
        }
      }
    }
  }
}

function rotate(shape) {
  const size = shape.length;
  const rotated = [];
  for (let x = 0; x < size; x++) {
    const row = [];
    for (let y = size - 1; y >= 0; y--) {
      row.push(shape[y][x] || 0);
    }
    rotated.push(row);
  }
  return rotated;
}

function clearLines() {
  let cleared = 0;
  for (let y = ROWS - 1; y >= 0; y--) {
    if (board[y].every(v => v !== 0)) {
      board.splice(y, 1);
      board.unshift(Array(COLS).fill(0));
      cleared++;
      y++;
    }
  }
  if (cleared > 0) {
    score += cleared * 100;
    scoreElement.textContent = score;
    dropInterval = Math.max(150, dropInterval - cleared * 20);
    restartTimer();
  }
}

function hardDrop() {
  if (!current) return;
  while (!collides(current.shape, current.x, current.y + 1)) {
    current.y++;
  }
  tick();
}

function stepDown() {
  if (!current) return;
  if (!collides(current.shape, current.x, current.y + 1)) {
    current.y++;
  } else {
    mergePiece();
    clearLines();
    spawnPiece();
  }
  redraw();
}

function redraw() {
  const temp = board.map(row => row.slice());
  if (current) {
    const shape = current.shape;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (!shape[y][x]) continue;
        const newX = current.x + x;
        const newY = current.y + y;
        if (newY >= 0 && newY < ROWS && newX >= 0 && newX < COLS) {
          temp[newY][newX] = 1;
        }
      }
    }
  }
  boardElement.innerHTML = '';
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      if (temp[y][x]) {
        cell.classList.add('filled');
      }
      boardElement.appendChild(cell);
    }
  }
}

function tick() {
  stepDown();
}

function restartTimer() {
  if (dropTimer) {
    clearInterval(dropTimer);
  }
  if (isRunning) {
    dropTimer = setInterval(tick, dropInterval);
  }
}

function resetGame() {
  createBoard();
  score = 0;
  dropInterval = 700;
  scoreElement.textContent = score;
  spawnPiece();
  redraw();
}

function toggleStart() {
  isRunning = !isRunning;
  if (isRunning && !current) {
    resetGame();
  }
  restartTimer();
}

function handleKey(e) {
  if (!isRunning || !current) return;
  switch (e.key) {
    case 'ArrowLeft': {
      if (!collides(current.shape, current.x - 1, current.y)) {
        current.x--;
        redraw();
      }
      break;
    }
    case 'ArrowRight': {
      if (!collides(current.shape, current.x + 1, current.y)) {
        current.x++;
        redraw();
      }
      break;
    }
    case 'ArrowDown': {
      stepDown();
      break;
    }
    case 'ArrowUp': {
      const rotatedShape = rotate(current.shape);
      if (!collides(rotatedShape, current.x, current.y)) {
        current.shape = rotatedShape;
        redraw();
      }
      break;
    }
    case ' ': {
      e.preventDefault();
      hardDrop();
      break;
    }
  }
}

function init() {
  createBoard();
  drawBoard();
  next = { shape: randomShape(), x: 0, y: 0 };
  drawNext();
  startButton.addEventListener('click', toggleStart);
  document.addEventListener('keydown', handleKey);
}

if (boardElement && nextElement && scoreElement && startButton) {
  init();
}
