import './Game.css';
import { useEffect, useState, useRef, useCallback } from 'react';

const Game = () => {
  const [score, setScore] = useState(0);
  const [buttonText, setButtonText] = useState('');

  const ctx = useRef(null);
  const minMaxX = useRef({ min: 0, max: 0 });
  const minMaxY = useRef({ min: 0, max: 0 });
  const directionRef = useRef({ dx: 0, dy: 0 }); //last direction

  const gameLoop = useRef(null)
  const GRID = 30; // snake step size
  const SCORE_INCREMENT = 10
  const SNAKE_HEIGHT = 20
  const snakePos = useRef(null)
  const foodPos = useRef(null)
  const rectRef = useRef(null)

  useEffect(() => {
    setButtonText('Start Game');
    const canvas = document.getElementById('container');
    ctx.current = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    rectRef.current = rect
    canvas.width = rect.width;
    canvas.height = rect.height;
    minMaxX.current = { min: GRID * 2, max: canvas.width - GRID };
    minMaxY.current = { min: GRID * 2, max: canvas.height - GRID };
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          if (directionRef.current.dy === 0) directionRef.current = { dx: 0, dy: -GRID };
          break;
        case 'ArrowDown':
          if (directionRef.current.dy === 0) directionRef.current = { dx: 0, dy: GRID };
          break;
        case 'ArrowLeft':
          if (directionRef.current.dx === 0) directionRef.current = { dx: -GRID, dy: 0 };
          break;
        case 'ArrowRight':
          if (directionRef.current.dx === 0) directionRef.current = { dx: GRID, dy: 0 };
          break;
        default:
          return;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const drawFood = () => {
    const cols = Math.floor((minMaxX.current.max - minMaxX.current.min) / GRID);
    const rows = Math.floor((minMaxY.current.max - minMaxY.current.min) / GRID);

    foodPos.current = {x: minMaxX.current.min + Math.floor(Math.random() * cols) * GRID, y:minMaxY.current.min + Math.floor(Math.random() * rows) * GRID} 

    ctx.current.fillStyle = '#e35b5bff';
    ctx.current.beginPath();
    ctx.current.arc(foodPos.current.x + 10, foodPos.current.y + 10, 5, 0, 2 * Math.PI);
    ctx.current.fill();
  }

  const drawSnake = () => {
    snakePos.current.forEach((pos) => {
      ctx.current.fillStyle = '#ffa500';
      ctx.current.fillRect(pos.x, pos.y, SNAKE_HEIGHT, SNAKE_HEIGHT);
    })
   
  }

  const checkFoodCollision = () => snakePos.current[0].x === foodPos.current.x && snakePos.current[0].y === foodPos.current.y;

  const checkWallCollision = () => snakePos.current[0].x === 0 || snakePos.current[0].y === 0|| snakePos.current[0].x === rectRef.current.height || snakePos.current[0].y === rectRef.current.width;
  
  const onGameStart = useCallback(() => {
    document.getElementById('button').style.visibility = 'hidden'
    // draw initial snake 
    snakePos.current = [{x: 150, y: 150}]
    drawSnake()
    // draw initial food
    drawFood()
    // initial move right
    directionRef.current = { dx: GRID, dy: 0 }; // initial move right
    if (gameLoop.current) {
      clearInterval(gameLoop.current)
    }
    gameLoop.current = setInterval(() => {
      let newArray = [{x: snakePos.current[0].x + directionRef.current.dx, y: snakePos.current[0].y + directionRef.current.dy}, ...snakePos.current.slice(0, -1)]
      const tail = snakePos.current[snakePos.current.length - 1]
      snakePos.current = newArray
      drawSnake()
      if (checkWallCollision()) {
        clearInterval(gameLoop.current)
        setButtonText('Game Over! Play Again?')
        gameLoop.current = null
        document.getElementById('button').style.visibility = 'visible'
        ctx.current.clearRect(0, 0, rectRef.current.width, rectRef.current.height)
      } else if (checkFoodCollision()) {
        setScore(score => score + SCORE_INCREMENT)
        drawFood()
        let newArray = [{x: snakePos.current[0].x + directionRef.current.dx, y: snakePos.current[0].y + directionRef.current.dy}, ...snakePos.current]
        snakePos.current = newArray
        drawSnake()
      }
      ctx.current.clearRect(tail.x, tail.y, SNAKE_HEIGHT, SNAKE_HEIGHT)
    }, 170)
    return () => clearInterval(gameLoop.current)
  }, [])

  return (
    <div className="page">
      <canvas id="container"></canvas>
      <h3 id='score'>Score: {score}</h3>
        <button id='button' onClick={onGameStart}>{buttonText}</button>
    </div>
  );
};

export default Game;
