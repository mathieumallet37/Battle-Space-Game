var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");
var rightPressed = false;
var leftPressed = false;
var firePressed = false;

var spaceshipImage = new Image();
    spaceshipImage.src = "src/1.png";
var paddleWidth = 50;
var paddleHeight = 50;
var paddleX = (canvas.width - paddleWidth) / 2;


var asteroidImage = new Image();
    asteroidImage.src = "src/asteroid.png";
var asteroids = [];
var asteroidHeight = 30;
var asteroidWidth = 30;
var minAsteriodSize = 20;
var maxAsteriodSize = 50;

var missiles = [] ;
var missileWidth = 5;
var missileHeight = 15;
var missileSpeed = 5;
var fireCooldown = 0;


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

var stars = [];
var numStars = 100;
for (var i = 0; i < numStars; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 3 + 1,
    opacity: Math.random() * 0.5 + 0.3,
    speed: Math.random() * 2 + 1,
  });
}


document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
  if (e.code === "ArrowRight") {
    rightPressed = true;
  } else if (e.code === "ArrowLeft") {
    leftPressed = true;
  } else if (e.code === "Space") {
    firePressed = true;
    fireMissile();
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
  for (var i = 0; i < asteroids.length; i++) {
    var asteroid = asteroids[i];
    ctx.drawImage(asteroidImage, asteroid.x, asteroid.y, asteroid.size, asteroid.size);
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
  var randomSize = Math.random() * (maxAsteriodSize - minAsteriodSize) + minAsteriodSize;
  var newAsteroid = {
    x: randomX,
    y: 0 - asteroidHeight,
    size: randomSize
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
      if (checkCollisionWithAsteroid(missiles[i])) {
        missiles.splice(i, 1);
        i--;
      }
    }
  }
}

function checkCollisionWithAsteroid(missile) {
  for (var i = 0; i < asteroids.length; i++) {
    var asteroid = asteroids[i];
    var asteroidRight = asteroid.x + asteroid.size;
    var asteroidBottom = asteroid.y + asteroid.size;

    if (
      missile.x < asteroidRight &&
      missile.x + missileWidth > asteroid.x &&
      missile.y < asteroidBottom &&
      missile.y + missileHeight > asteroid.y
    ) {
      asteroids.splice(i, 1);
      score++;
      if (score % 5 === 0 && score > 20) {
        lives++;
      }
      return true;
    }
  }
  return false;
}

function checkCollision() {
  var asteroidsToRemove = [];
  var missilesToRemove = [];

  for (var i = 0; i < asteroids.length; i++) {
    var asteroid = asteroids[i];
    var asteroidRight = asteroid.x + asteroid.size;
    var asteroidBottom = asteroid.y + asteroid.size;

    for (var j = 0; j < missiles.length; j++) {
      var missile = missiles[j];
      var missileRight = missile.x + missileWidth;
      var missileBottom = missile.y + missileHeight;

      if (
        missile.x < asteroidRight &&
        missileRight > asteroid.x &&
        missile.y < asteroidBottom &&
        missileBottom > asteroid.y
      ) {
        asteroidsToRemove.push(i);
        missilesToRemove.push(j);
        score++;
        if (score % 5 === 0 && score > 20) {
          lives++;
        }
        break;
      }
    }
  }

  // Supprimer les astéroïdes qui ont eu une collision avec un missile
  for (var i = asteroidsToRemove.length - 1; i >= 0; i--) {
    asteroids.splice(asteroidsToRemove[i], 1);
  }

  // Supprimer les missiles qui ont eu une collision avec un astéroïde
  for (var i = missilesToRemove.length - 1; i >= 0; i--) {
    missiles.splice(missilesToRemove[i], 1);
  }
}



function checkCollisionWithShip() {
  for (var i = 0; i < asteroids.length; i++) {
    var asteroid = asteroids[i];
    var asteroidRight = asteroid.x + asteroidWidth;
    var asteroidBottom = asteroid.y + asteroidHeight;

    if (
      paddleX + paddleWidth > asteroid.x &&
      paddleX < asteroidRight &&
      canvas.height - paddleHeight < asteroidBottom &&
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

function checkCollision() {
  var asteroidsToRemove = [];
  var missilesToRemove = [];

  for (var i = 0; i < asteroids.length; i++) {
    var asteroid = asteroids[i];
    var asteroidRight = asteroid.x + asteroidWidth;
    var asteroidBottom = asteroid.y + asteroidHeight;

    for (var j = 0; j < missiles.length; j++) {
      var missile = missiles[j];
      var missileRight = missile.x + missileWidth;
      var missileBottom = missile.y + missileHeight;

      if (
        missile.x < asteroidRight &&
        missileRight > asteroid.x &&
        missile.y < asteroidBottom &&
        missileBottom > asteroid.y
      ) {
        asteroidsToRemove.push(i);
        missilesToRemove.push(j);
        score++;
        if (score % 5 == 0 && score > 20) {
          lives++;
        }
        break;
      }
    }
  }

  // Supprimer les astéroïdes qui ont eu une collision avec un missile
  for (var i = asteroidsToRemove.length - 1; i >= 0; i--) {
    asteroids.splice(asteroidsToRemove[i], 1);
  }

  // Supprimer les missiles qui ont eu une collision avec un astéroïde
}




function moveStars() {
  for (var i = 0; i < numStars; i++) {
    var star = stars[i];
    star.y += star.speed;
    if (star.y > canvas.height) {
      star.x = Math.random() * canvas.width;
      star.y = 0;
    }
    // Ajout de cette ligne pour actualiser la position de l'étoile dans le tableau stars
    stars[i] = star;
  }
}

function updateStars() {
  moveStars();
}



function drawStars() {
  ctx.fillStyle = "#FFFFFF";
  for (var i = 0; i < numStars; i++) {
    var star = stars[i];
    ctx.globalAlpha = star.opacity;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;
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

function drawHeart(x, y, size) {
  ctx.fillStyle = "#FF0000";
  ctx.beginPath();
  ctx.moveTo(x, y + size / 4);
  ctx.bezierCurveTo(
    x,
    y,
    x - size / 2,
    y,
    x - size / 2,
    y + size / 4
  );
  ctx.bezierCurveTo(
    x - size / 2,
    y + size / 2,
    x,
    y + size / 2 + size / 4,
    x,
    y + size / 2 + size / 4
  );
  ctx.bezierCurveTo(
    x,

   y + size / 2,
    x + size / 2,
    y + size / 2,
    x + size / 2,
    y + size / 4
  );
  ctx.bezierCurveTo(
    x + size / 2,
    y,
    x,
    y,
    x,
    y + size / 4
  );
  ctx.closePath();
  ctx.fill();
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

  // Dessine le fond d'écran
  ctx.fillStyle = "rgba(0, 0, 0, 1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Dessine les étoiles
  drawStars();

  // Dessine les astéroïdes, les missiles et le vaisseau
  drawAsteroids();
  drawMissiles();
  drawPaddle();

  // Met à jour les positions des astéroïdes, des missiles et détecte les collisions
  updateAsteroids();
  updateMissiles();
  checkCollisionWithShip();

  // Dessine le score et le nombre de vies
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 30);
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(canvas.width - 120, 10, 100, 50);
  drawHeart(canvas.width - 20, 15, 45);

  // Dessine le nombre de vies
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "20px Arial";
  ctx.fillText("Lives:   " + lives, canvas.width - 95, 35);

  // Met à jour la position du vaisseau en fonction des touches enfoncées
  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += 7;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= 7;
  }

  updateStars()
  updateCooldown();
  requestAnimationFrame(draw);
}


function fireMissile() {
  if (fireCooldown <= 0) {
    var missileX = paddleX + paddleWidth / 2 - missileWidth / 2;
    var newMissile = {
      x: missileX,
      y: canvas.height - paddleHeight - missileHeight,
    };
    missiles.push(newMissile);
    fireCooldown = 1; // Définissez ici le délai souhaité entre chaque tir en frames
  }
}

function updateCooldown() {
  if (fireCooldown > 0) {
    fireCooldown--;
  }
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
