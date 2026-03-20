const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game settings
const paddleWidth = 10;
const paddleHeight = 100;
const ballSize = 10;
const maxScore = 20; // Updated max score to 20

// Game state
let playerScore = 0;
let aiScore = 0;
let ball = { x: canvas.width / 2, y: canvas.height / 2, dx: 3, dy: 3 }; // Reduced speed from 4 to 3
let playerPaddle = { x: 0, y: canvas.height / 2 - paddleHeight / 2 };
let aiPaddle = { x: canvas.width - paddleWidth, y: canvas.height / 2 - paddleHeight / 2 };
let aiSkill = parseFloat(document.getElementById('aiSkill').value);

// Load sound effects
const paddleHitSound = new Audio('sounds/paddle-hit.mp3');
const wallBounceSound = new Audio('sounds/wall-bounce.mp3');
const scoreSound = new Audio('sounds/score.mp3');

// Draw functions
function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ballSize, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'white';
    ctx.fill();
    ctx.closePath();
}

function drawPaddles() {
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'white';
    drawRect(playerPaddle.x, playerPaddle.y, paddleWidth, paddleHeight, 'white');
    drawRect(aiPaddle.x, aiPaddle.y, paddleWidth, paddleHeight, 'white');
    ctx.shadowBlur = 0; // Reset shadow for other elements
}

function drawScores() {
    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(`${playerName}: ${playerScore}`, 20, 20);
    ctx.fillText(`AI: ${aiScore}`, canvas.width - 100, 20);
}

// Game logic
function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision
    if (ball.y <= 0 || ball.y >= canvas.height) {
        ball.dy *= -1;
        wallBounceSound.play();
    }

    // Paddle collision
    if (
        ball.x <= playerPaddle.x + paddleWidth &&
        ball.y >= playerPaddle.y &&
        ball.y <= playerPaddle.y + paddleHeight
    ) {
        ball.dx *= -1;
        ball.x = playerPaddle.x + paddleWidth + 1; // Prevent sticking
        paddleHitSound.play();
    }

    if (
        ball.x >= aiPaddle.x - paddleWidth &&
        ball.y >= aiPaddle.y &&
        ball.y <= aiPaddle.y + paddleHeight
    ) {
        ball.dx *= -1;
        ball.x = aiPaddle.x - paddleWidth - 1; // Prevent sticking
        paddleHitSound.play();
    }

    // Scoring
    if (ball.x <= 0) {
        aiScore++;
        resetBall();
        scoreSound.play();
    } else if (ball.x >= canvas.width) {
        playerScore++;
        resetBall();
        scoreSound.play();
    }
}

// Player paddle movement
let keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

function movePlayerPaddle() {
    if (keys['ArrowUp'] && playerPaddle.y > 0) {
        playerPaddle.y -= 8;
    }
    if (keys['ArrowDown'] && playerPaddle.y < canvas.height - paddleHeight) {
        playerPaddle.y += 8;
    }
}

function moveAiPaddle() {
    const targetY = ball.y - paddleHeight / 2;

    if (aiPaddle.y < targetY && aiPaddle.y < canvas.height - paddleHeight) {
        aiPaddle.y += aiSkill + 4; // Increased speed
    } else if (aiPaddle.y > targetY && aiPaddle.y > 0) {
        aiPaddle.y -= aiSkill + 4; // Increased speed
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx *= -1;
}

function update() {
    moveBall();
    movePlayerPaddle();
    moveAiPaddle();

    // Game over condition
    if (playerScore === maxScore || aiScore === maxScore) {
        const winner = playerScore === maxScore ? 'Player' : 'AI';
        if (confirm(`${winner} wins! Play again?`)) {
            playerScore = 0;
            aiScore = 0;
        } else {
            return;
        }
    }
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBall();
    drawPaddles();
    drawScores();
}

function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

document.getElementById('startBtn').addEventListener('click', () => {
    aiSkill = parseFloat(document.getElementById('aiSkill').value);
    gameLoop();
});

// Mouse control for player paddle
canvas.addEventListener('mousemove', (e) => {
    const canvasRect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - canvasRect.top;

    if (mouseY >= 0 && mouseY <= canvas.height) {
        playerPaddle.y = mouseY - paddleHeight / 2;

        // Ensure paddle stays within bounds
        if (playerPaddle.y < 0) {
            playerPaddle.y = 0;
        } else if (playerPaddle.y > canvas.height - paddleHeight) {
            playerPaddle.y = canvas.height - paddleHeight;
        }
    }
});

// Fullscreen functionality
const fullscreenBtn = document.getElementById('fullscreenBtn');
fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
});

// Capture player name
const playerNameInput = document.getElementById('playerName');
let playerName = 'Player';

playerNameInput.addEventListener('change', () => {
    playerName = playerNameInput.value || 'Player';
});

// Background change functionality
const changeBgBtn = document.getElementById('changeBgBtn');
const bgOptions = document.getElementById('bgOptions');

changeBgBtn.addEventListener('click', () => {
    bgOptions.style.display = bgOptions.style.display === 'none' ? 'inline' : 'none';
});

bgOptions.addEventListener('change', () => {
    const selectedBg = bgOptions.value;
    const body = document.body;

    switch (selectedBg) {
        case 'gradient':
            body.style.background = 'linear-gradient(135deg, #1e1e1e, #3a3a3a)';
            break;
        case 'space':
            body.style.background = 'url("https://via.placeholder.com/1920x1080?text=Space+Background") no-repeat center center fixed';
            body.style.backgroundSize = 'cover';
            break;
        case 'forest':
            body.style.background = 'url("https://via.placeholder.com/1920x1080?text=Forest+Background") no-repeat center center fixed';
            body.style.backgroundSize = 'cover';
            break;
        default:
            body.style.background = 'linear-gradient(135deg, #1e1e1e, #3a3a3a)';
    }
});