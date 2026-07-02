const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayText = document.getElementById('overlayText');
const startBtn = document.getElementById('startBtn');
const muteBtn = document.getElementById('muteBtn');

// Game settings
const paddleWidth = 10;
const paddleHeight = 100;
const ballSize = 10;
const maxScore = 20;
const maxTrailLength = 12;

// Game state
let playerScore = 0;
let aiScore = 0;
let ball = { x: canvas.width / 2, y: canvas.height / 2, dx: 3, dy: 3 };
let playerPaddle = { x: 0, y: canvas.height / 2 - paddleHeight / 2 };
let aiPaddle = { x: canvas.width - paddleWidth, y: canvas.height / 2 - paddleHeight / 2 };
let aiSkill = parseFloat(document.getElementById('aiSkill').value);
let ballTrail = [];
let shakeMagnitude = 0;
let isRunning = false;
let isCountingDown = false;

// Overlay helpers
function showOverlay(title, text) {
    overlayTitle.textContent = title;
    overlayText.textContent = text;
    overlay.classList.remove('hidden');
}

function hideOverlay() {
    overlay.classList.add('hidden');
}

function triggerShake(amount) {
    shakeMagnitude = amount;
}

// Draw functions
function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawCenterLine() {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 14]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.restore();
}

function drawBallTrail() {
    ballTrail.forEach((pos, i) => {
        const alpha = ((i + 1) / ballTrail.length) * 0.35;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, ballSize * (0.4 + (i / ballTrail.length) * 0.6), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(77, 216, 255, ${alpha})`;
        ctx.fill();
        ctx.closePath();
    });
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ballSize, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#4dd8ff';
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;
}

function drawPaddles() {
    ctx.shadowBlur = 14;
    ctx.shadowColor = '#4dd8ff';
    drawRect(playerPaddle.x, playerPaddle.y, paddleWidth, paddleHeight, 'white');
    ctx.shadowColor = '#ff4dd8';
    drawRect(aiPaddle.x, aiPaddle.y, paddleWidth, paddleHeight, 'white');
    ctx.shadowBlur = 0;
}

function drawScores() {
    ctx.textAlign = 'left';
    ctx.font = "24px 'Orbitron', Arial";
    ctx.fillStyle = '#4dd8ff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#4dd8ff';
    ctx.fillText(`${playerName}  ${playerScore}`, 24, 36);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#ff4dd8';
    ctx.shadowColor = '#ff4dd8';
    ctx.fillText(`${aiScore}  AI`, canvas.width - 24, 36);
    ctx.shadowBlur = 0;
    ctx.textAlign = 'left';
}

// Game logic
function moveBall() {
    ballTrail.push({ x: ball.x, y: ball.y });
    if (ballTrail.length > maxTrailLength) ballTrail.shift();

    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision
    if (ball.y <= 0 || ball.y >= canvas.height) {
        ball.dy *= -1;
        soundEngine.playWallBounce();
    }

    // Paddle collision
    if (
        ball.x <= playerPaddle.x + paddleWidth &&
        ball.y >= playerPaddle.y &&
        ball.y <= playerPaddle.y + paddleHeight
    ) {
        ball.dx *= -1;
        ball.x = playerPaddle.x + paddleWidth + 1;
        soundEngine.playPaddleHit();
    }

    if (
        ball.x >= aiPaddle.x - paddleWidth &&
        ball.y >= aiPaddle.y &&
        ball.y <= aiPaddle.y + paddleHeight
    ) {
        ball.dx *= -1;
        ball.x = aiPaddle.x - paddleWidth - 1;
        soundEngine.playPaddleHit();
    }

    // Scoring
    if (ball.x <= 0) {
        aiScore++;
        resetBall();
        soundEngine.playScore();
        triggerShake(8);
    } else if (ball.x >= canvas.width) {
        playerScore++;
        resetBall();
        soundEngine.playScore();
        triggerShake(8);
    }
}

// Player paddle movement
let keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === 'Enter' && !isRunning && !isCountingDown) {
        startBtn.click();
    }
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
        aiPaddle.y += aiSkill + 4;
    } else if (aiPaddle.y > targetY && aiPaddle.y > 0) {
        aiPaddle.y -= aiSkill + 4;
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx *= -1;
    ballTrail = [];
}

function endGame() {
    isRunning = false;
    const playerWon = playerScore === maxScore;
    soundEngine.playGameOver(playerWon);
    showOverlay(
        playerWon ? `${playerName} WINS!` : 'AI WINS!',
        'Press Enter or click Start to play again'
    );
    startBtn.disabled = false;
}

function update() {
    if (!isRunning) return;

    moveBall();
    movePlayerPaddle();
    moveAiPaddle();

    if (playerScore === maxScore || aiScore === maxScore) {
        endGame();
    }
}

function render() {
    ctx.save();
    if (shakeMagnitude > 0.5) {
        const dx = (Math.random() - 0.5) * shakeMagnitude;
        const dy = (Math.random() - 0.5) * shakeMagnitude;
        ctx.translate(dx, dy);
        shakeMagnitude *= 0.85;
    } else {
        shakeMagnitude = 0;
    }

    ctx.clearRect(-20, -20, canvas.width + 40, canvas.height + 40);
    drawCenterLine();
    drawBallTrail();
    drawBall();
    drawPaddles();
    drawScores();
    ctx.restore();
}

function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

function startCountdown(onComplete) {
    isCountingDown = true;
    startBtn.disabled = true;
    let count = 3;
    showOverlay(String(count), 'Get ready!');
    soundEngine.playCountdownBeep(false);

    const interval = setInterval(() => {
        count -= 1;
        if (count > 0) {
            showOverlay(String(count), 'Get ready!');
            soundEngine.playCountdownBeep(false);
        } else {
            showOverlay('GO!', '');
            soundEngine.playCountdownBeep(true);
            clearInterval(interval);
            setTimeout(() => {
                hideOverlay();
                isCountingDown = false;
                onComplete();
            }, 500);
        }
    }, 700);
}

startBtn.addEventListener('click', () => {
    if (isRunning || isCountingDown) return;
    aiSkill = parseFloat(document.getElementById('aiSkill').value);
    playerScore = 0;
    aiScore = 0;
    ball = { x: canvas.width / 2, y: canvas.height / 2, dx: 3, dy: 3 };
    ballTrail = [];

    startCountdown(() => {
        isRunning = true;
        startBtn.disabled = false;
    });
});

// Mute toggle
muteBtn.addEventListener('click', () => {
    const muted = soundEngine.toggleMute();
    muteBtn.setAttribute('aria-pressed', String(muted));
    muteBtn.innerHTML = muted ? '&#128263; Muted' : '&#128266; Sound';
});

// Mouse control for player paddle
canvas.addEventListener('mousemove', (e) => {
    const canvasRect = canvas.getBoundingClientRect();
    const scaleY = canvas.height / canvasRect.height;
    const mouseY = (e.clientY - canvasRect.top) * scaleY;

    if (mouseY >= 0 && mouseY <= canvas.height) {
        playerPaddle.y = mouseY - paddleHeight / 2;

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
    } else if (document.exitFullscreen) {
        document.exitFullscreen();
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
    bgOptions.classList.toggle('hidden');
});

bgOptions.addEventListener('change', () => {
    const selectedBg = bgOptions.value;
    const body = document.body;

    switch (selectedBg) {
        case 'space':
            body.style.background =
                'radial-gradient(2px 2px at 20% 30%, #fff, transparent), ' +
                'radial-gradient(2px 2px at 70% 65%, #fff, transparent), ' +
                'radial-gradient(1px 1px at 40% 80%, #fff, transparent), ' +
                'radial-gradient(1px 1px at 85% 20%, #fff, transparent), ' +
                'radial-gradient(1px 1px at 55% 45%, #fff, transparent), ' +
                'radial-gradient(circle at 50% 30%, #14213d 0%, #050510 75%)';
            break;
        case 'forest':
            body.style.background =
                'radial-gradient(circle at 50% 20%, #2f5d3a 0%, #0d1f12 75%)';
            break;
        case 'gradient':
        default:
            body.style.background = 'radial-gradient(circle at 50% 20%, #1a1a2e 0%, #0a0a12 70%)';
    }
});

// Kick off the render loop immediately; update() is gated by isRunning
gameLoop();
