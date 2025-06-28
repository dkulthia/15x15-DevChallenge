const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');
const scoreboardPlayer = document.getElementById('player-score');
const scoreboardAI = document.getElementById('ai-score');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');
const winnerMsg = document.getElementById('winner-message');

// Constants
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 90;
const BALL_RADIUS = 10;
const PADDLE_MARGIN = 12;
const PLAYER_X = PADDLE_MARGIN;
const AI_X = canvas.width - PADDLE_WIDTH - PADDLE_MARGIN;
const PADDLE_SPEED = 6;
const AI_REACTIVITY = 0.09; // Lower = easier AI
const WIN_SCORE = 10;

// State
let playerY = (canvas.height - PADDLE_HEIGHT) / 2;
let aiY = (canvas.height - PADDLE_HEIGHT) / 2;
let ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  vx: 6 * (Math.random() > 0.5 ? 1 : -1),
  vy: 4 * (Math.random() > 0.5 ? 1 : -1)
};
let playerScore = 0;
let aiScore = 0;
let isPaused = false;
let winner = null;
let animationId = null;

// Player paddle follows mouse Y
canvas.addEventListener('mousemove', (e) => {
  if (winner) return;
  const rect = canvas.getBoundingClientRect();
  const mouseY = e.clientY - rect.top;
  playerY = mouseY - PADDLE_HEIGHT / 2;
  playerY = Math.max(Math.min(playerY, canvas.height - PADDLE_HEIGHT), 0);
});

// Draw the net
function drawNet() {
  ctx.setLineDash([8, 18]);
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);
}

// Draw paddles and ball
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawNet();

  // Player paddle
  ctx.fillStyle = "#fff";
  ctx.fillRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);

  // AI paddle
  ctx.fillRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT);

  // Ball
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
}

// Basic AI for right paddle
function moveAI() {
  let target = ball.y - PADDLE_HEIGHT / 2;
  aiY += (target - aiY) * AI_REACTIVITY;
  aiY = Math.max(Math.min(aiY, canvas.height - PADDLE_HEIGHT), 0);
}

// Ball movement and collision
function updateBall() {
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Collide top/bottom wall
  if (ball.y - BALL_RADIUS < 0) {
    ball.y = BALL_RADIUS;
    ball.vy = -ball.vy;
  }
  if (ball.y + BALL_RADIUS > canvas.height) {
    ball.y = canvas.height - BALL_RADIUS;
    ball.vy = -ball.vy;
  }

  // Collide with player paddle
  if (
    ball.x - BALL_RADIUS < PLAYER_X + PADDLE_WIDTH &&
    ball.y > playerY &&
    ball.y < playerY + PADDLE_HEIGHT
  ) {
    ball.x = PLAYER_X + PADDLE_WIDTH + BALL_RADIUS;
    ball.vx = -ball.vx;
    // Add "spin"
    ball.vy += ((ball.y - (playerY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2)) * 3;
  }

  // Collide with AI paddle
  if (
    ball.x + BALL_RADIUS > AI_X &&
    ball.y > aiY &&
    ball.y < aiY + PADDLE_HEIGHT
  ) {
    ball.x = AI_X - BALL_RADIUS;
    ball.vx = -ball.vx;
    // Add "spin"
    ball.vy += ((ball.y - (aiY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2)) * 3;
  }

  // Score check
  if (ball.x < 0) {
    aiScore++;
    updateScore();
    if (aiScore >= WIN_SCORE) {
      endGame('AI');
    } else {
      resetBall(-1);
    }
  } else if (ball.x > canvas.width) {
    playerScore++;
    updateScore();
    if (playerScore >= WIN_SCORE) {
      endGame('Player');
    } else {
      resetBall(1);
    }
  }
}

function updateScore() {
  scoreboardPlayer.textContent = playerScore;
  scoreboardAI.textContent = aiScore;
}

// Reset ball position and speed
function resetBall(dir) {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.vx = 6 * dir;
  ball.vy = 4 * (Math.random() > 0.5 ? 1 : -1);
}

function gameLoop() {
  if (!isPaused && !winner) {
    moveAI();
    updateBall();
    draw();
  } else if (!winner) {
    // Still draw paused frame
    draw();
    // Draw overlay if paused
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = "#fff";
    ctx.font = "2em Arial";
    ctx.textAlign = "center";
    ctx.fillText("Paused", canvas.width / 2, canvas.height / 2);
    ctx.restore();
  }
  animationId = requestAnimationFrame(gameLoop);
}

function endGame(who) {
  winner = who;
  winnerMsg.innerText = who + " wins!";
  winnerMsg.classList.remove('hidden');
}

function resetGame() {
  playerScore = 0;
  aiScore = 0;
  playerY = (canvas.height - PADDLE_HEIGHT) / 2;
  aiY = (canvas.height - PADDLE_HEIGHT) / 2;
  winner = null;
  isPaused = false;
  updateScore();
  winnerMsg.classList.add('hidden');
  resetBall((Math.random() > 0.5 ? 1 : -1));
  draw();
}

// Button handlers
pauseBtn.addEventListener('click', () => {
  if (winner) return;
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? "Resume" : "Pause";
});

restartBtn.addEventListener('click', () => {
  resetGame();
  pauseBtn.textContent = "Pause";
});

// Initial draw and start
draw();
gameLoop();