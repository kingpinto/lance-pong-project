import React, { useState, useEffect, useRef } from 'react';
import './Game.css';

const Game = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState({
    playerY: 250,
    aiY: 250,
    ballX: 400,
    ballY: 300,
    ballSpeedX: 5,
    ballSpeedY: 3,
    playerScore: 0,
    aiScore: 0,
    gameOver: false,
    gameStarted: false,
  });

  const paddleHeight = 100;
  const paddleWidth = 10;
  const ballSize = 10;
  const canvasWidth = 800;
  const canvasHeight = 600;

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw paddles
    ctx.fillStyle = 'white';
    ctx.fillRect(20, gameState.playerY, paddleWidth, paddleHeight);
    ctx.fillRect(canvasWidth - 30, gameState.aiY, paddleWidth, paddleHeight);

    // Draw ball
    ctx.fillRect(gameState.ballX, gameState.ballY, ballSize, ballSize);

    // Draw scores
    ctx.font = '40px Arial';
    ctx.fillText(gameState.playerScore, canvasWidth / 4, 50);
    ctx.fillText(gameState.aiScore, (3 * canvasWidth) / 4, 50);

    // Draw game over message
    if (gameState.gameOver) {
      ctx.font = '60px Arial';
      ctx.fillStyle = 'yellow';
      ctx.fillText(
        gameState.playerScore >= 30 ? 'You Win!' : 'AI Wins!',
        canvasWidth / 2,
        canvasHeight / 2
      );
    }
  };

  const update = () => {
    if (!gameState.gameStarted || gameState.gameOver) return;

    let {
      playerY,
      aiY,
      ballX,
      ballY,
      ballSpeedX,
      ballSpeedY,
      playerScore,
      aiScore,
    } = gameState;

    // Ball movement
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Ball collision with top and bottom
    if (ballY <= 0 || ballY + ballSize >= canvasHeight) {
      ballSpeedY = -ballSpeedY;
    }

    // Ball collision with paddles
    if (
      ballX <= 30 &&
      ballY + ballSize >= playerY &&
      ballY <= playerY + paddleHeight
    ) {
      ballSpeedX = -ballSpeedX;
    }

    if (
      ballX + ballSize >= canvasWidth - 30 &&
      ballY + ballSize >= aiY &&
      ballY <= aiY + paddleHeight
    ) {
      ballSpeedX = -ballSpeedX;
    }

    // Scoring
    if (ballX < 0) {
      aiScore++;
      ballX = canvasWidth / 2;
      ballY = canvasHeight / 2;
    }

    if (ballX > canvasWidth) {
      playerScore++;
      ballX = canvasWidth / 2;
      ballY = canvasHeight / 2;
    }

    // AI movement
    if (aiY + paddleHeight / 2 < ballY) {
      aiY += 3;
    } else if (aiY + paddleHeight / 2 > ballY) {
      aiY -= 3;
    }

    // Check for game over
    if (playerScore >= 30 || aiScore >= 30) {
      setGameState({ ...gameState, gameOver: true });
    } else {
      setGameState({
        ...gameState,
        playerY,
        aiY,
        ballX,
        ballY,
        ballSpeedX,
        ballSpeedY,
        playerScore,
        aiScore,
      });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      update();
      draw();
    }, 1000 / 60);
    return () => clearInterval(interval);
  }, [gameState]);

  return (
    <div className="game-container">
      <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight}></canvas>
      <button
        onClick={() =>
          setGameState({
            ...gameState,
            gameStarted: true,
            gameOver: false,
            playerScore: 0,
            aiScore: 0,
            ballX: canvasWidth / 2,
            ballY: canvasHeight / 2,
          })
        }
      >
        Start Game
      </button>
    </div>
  );
};

export default Game;