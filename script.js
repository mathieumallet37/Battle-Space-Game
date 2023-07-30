var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");
var spaceshipImage = new Image();
spaceshipImage.src = "src/1.png";
var rightPressed = false;
var leftPressed = false;
var firePressed = false;
var paddleWidth = 50;
var paddleHeight = 50;
var paddleX = (canvas.width - paddleWidth) / 2;

var asteroids = [];
var asteroidWidth = 30;
var asteroidHeight = 30;

var missiles = [] ;
var missileWidth = 5;
var missileHeight = 15;
var missileSpeed = 5;

var score = 0;
var lives = 3;
var paused = false;
var gameOver = false;
var playAgainButton = {
  x: canvas.width / 2 - 50,
  y: canvas.height / 2 + 20,
  width: 100,
  height: 40,
};



document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
  if (e.code === "ArrowRight") {
    rightPressed = true;
  } else if (e.code === "ArrowLeft") {
    leftPressed = true;
  } else if (e.code === "Space") {
    firePressed = true;
  } else if (e.code === "KeyP" && !gameOver) {
    paused = !paused;
    if (!paused) {
      requestAnimationFrame(draw);
    }
  }
}

function keyUpHandler(e) {
  if (e.code === "ArrowRight") {
    rightPressed = false;
  } else if (e.code === "ArrowLeft") {
    leftPressed = false;
  } else if (e.code === "Space") {
    firePressed = false;
  }
}

function drawPaddle() {
  ctx.drawImage(spaceshipImage, paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
}

function drawAsteroids() {
  ctx.fillStyle = "#FF0000";
  for (var i = 0; i < asteroids.length; i++) {
    ctx.fillRect(asteroids[i].x, asteroids[i].y, asteroidWidth, asteroidHeight);
  }
}

function drawMissiles() {
  ctx.fillStyle = "#00FF00";
  for (var i = 0; i < missiles.length; i++) {
    ctx.fillRect(missiles[i].x, missiles[i].y, missileWidth, missileHeight);
  }
}

function generateAsteroid() {
  var randomX = Math.random() * (canvas.width - asteroidWidth);
  var newAsteroid = {
    x: randomX,
    y: 0 - asteroidHeight,
  };
  asteroids.push(newAsteroid);
}

function updateAsteroids() {
  for (var i = 0; i < asteroids.length; i++) {
    asteroids[i].y += 5;
    if (asteroids[i].y > canvas.height) {
      asteroids.splice(i, 1);
      i--;
    }
  }
}

function updateMissiles() {
  for (var i = 0; i < missiles.length; i++) {
    missiles[i].y -= missileSpeed;
    if (missiles[i].y + missileHeight < 0) {
      missiles.splice(i, 1);
      i--;
    } else {
      checkCollision(i);
    }
  }
}

function checkCollision(missileIndex) {
  for (var i = 0; i < asteroids.length; i++) {
    var asteroid = asteroids[i];
    var missile = missiles[missileIndex];
    if (
      missile.x < asteroid.x + asteroidWidth &&
      missile.x + missileWidth > asteroid.x &&
      missile.y < asteroid.y + asteroidHeight &&
      missile.y + missileHeight > asteroid.y
    ) {
      missiles.splice(missileIndex, 1);
      asteroids.splice(i, 1);
      score++;
      break;
    }
  }
}

function checkCollisionWithShip() {
  for (var i = 0; i < asteroids.length; i++) {
    var asteroid = asteroids[i];
    if (
      paddleX + paddleWidth > asteroid.x &&
      paddleX < asteroid.x + asteroidWidth &&
      canvas.height - paddleHeight < asteroid.y + asteroidHeight &&
      canvas.height > asteroid.y
    ) {
      asteroids.splice(i, 1);
      lives--;
      if (lives <= 0) {
        gameOver = true;
      }
      break;
    }
  }
}

function drawPauseScreen() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "40px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("PAUSE", canvas.width / 2, canvas.height / 2);
}

function drawGameOverScreen() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "40px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 40);
  ctx.font = "24px Arial";
  ctx.fillText("Your Score: " + score, canvas.width / 2, canvas.height / 2);
  ctx.fillStyle = "#0095DD";
  ctx.fillRect(playAgainButton.x, playAgainButton.y, playAgainButton.width, playAgainButton.height);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "20px Arial";
  ctx.fillText("Play Again", canvas.width / 2, canvas.height / 2 + 40);
}

function draw() {
  if (paused) {
    drawPauseScreen();
    return;
  }

  if (gameOver) {
    drawGameOverScreen();
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawAsteroids();
  drawMissiles();
  drawPaddle();

  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += 7;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= 7;
  }

  if (firePressed) {
    fireMissile();
  }

  updateAsteroids();
  updateMissiles();
  checkCollisionWithShip();

  ctx.fillStyle = "#000";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 20, 30);
  ctx.fillText("Lives: " + lives, canvas.width - 90, 30);

  requestAnimationFrame(draw);
}

function fireMissile() {
  var missileX = paddleX + paddleWidth / 2 - missileWidth / 2;
  var newMissile = {
    x: missileX,
    y: canvas.height - paddleHeight - missileHeight,
  };
  missiles.push(newMissile);
}


setInterval(generateAsteroid, 1500);


generateAsteroid();
draw();


canvas.addEventListener("click", function (event) {
  var rect = canvas.getBoundingClientRect();
  var mouseX = event.clientX - rect.left;
  var mouseY = event.clientY - rect.top;
  if (
    mouseX > playAgainButton.x &&
    mouseX < playAgainButton.x + playAgainButton.width &&
    mouseY > playAgainButton.y &&
    mouseY < playAgainButton.y + playAgainButton.height
  ) {

    gameOver = false;
    paused = false;
    score = 0;
    lives = 3;
    asteroids = [];
    missiles = [];
    generateAsteroid();
    draw();
  }
});
