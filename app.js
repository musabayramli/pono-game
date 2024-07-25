// Canvas ve diğer gerekli elementleri oluştur
const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");
const controlBtn = document.getElementById("controlBtn");
const width = 500;
const height = 700;
const canvasPosition = window.innerWidth / 2 - width / 2;
const isMobile = window.matchMedia("(max-width: 600px)");

// Paddle ve top ile ilgili değişkenler
const paddleHeight = 10;
const paddleWidth = 50;
const paddleDiff = 25;
let paddleBottomX = 225;
let paddleTopX = 225;
let playerMoved = false;
let paddleContact = false;

// Topun konumu ve hız değişkenleri
let ballX = 250;
let ballY = 350;
const ballRadius = 5;
let speedY;
let speedX;
let trajectoryX;
let computerSpeed;

// Skor ve oyun durumu değişkenleri
let playerScore = 0;
let computerScore = 0;
const winningScore = 7;
let isGameOver = true;
let isNewGame = true;
let isPaused = false;

// Mobil ayarları yap
if (isMobile.matches) {
  speedY = -2;
  speedX = speedY;
  computerSpeed = 4;
} else {
  speedY = -1;
  speedX = speedY;
  computerSpeed = 3;
}

// Canvas öğesini oluştur ve ayarla
function createCanvas() {
  canvas.width = width;
  canvas.height = height;
  canvas.style.display = "block"; // Canvas görünür hale getirilir
}

// Canvas'a her şeyi render et
function renderCanvas() {
  context.fillStyle = "black";
  context.fillRect(0, 0, width, height);

  context.fillStyle = "white";
  context.fillRect(paddleBottomX, height - 20, paddleWidth, paddleHeight);
  context.fillRect(paddleTopX, 10, paddleWidth, paddleHeight);

  context.beginPath();
  context.setLineDash([4]);
  context.moveTo(0, 350);
  context.lineTo(500, 350);
  context.strokeStyle = "grey";
  context.stroke();

  context.beginPath();
  context.arc(ballX, ballY, ballRadius, 2 * Math.PI, false);
  context.fillStyle = "white";
  context.fill();

  context.font = "32px Courier New";
  context.fillText(playerScore, 20, canvas.height / 2 + 50);
  context.fillText(computerScore, 20, canvas.height / 2 - 30);
}

// Topun konumunu sıfırla
function ballReset() {
  ballX = width / 2;
  ballY = height / 2;
  speedY = -3;
  paddleContact = false;
}

// Topun hareketini ayarla
function ballMove() {
  ballY += -speedY;
  if (playerMoved && paddleContact) {
    ballX += speedX;
  }
}

// Topun sınırlarına çarpmasını ve puan eklemeyi kontrol et
function ballBoundaries() {
  if (ballX < 0 && speedX < 0) {
    speedX = -speedX;
  }
  if (ballX > width && speedX > 0) {
    speedX = -speedX;
  }
  if (ballY > height - paddleDiff) {
    if (ballX > paddleBottomX && ballX < paddleBottomX + paddleWidth) {
      paddleContact = true;
      if (playerMoved) {
        speedY -= 1;
        if (speedY < -5) {
          speedY = -5;
          computerSpeed = 6;
        }
      }
      speedY = -speedY;
      trajectoryX = ballX - (paddleBottomX + paddleDiff);
      speedX = trajectoryX * 0.3;
    } else if (ballY > height) {
      ballReset();
      computerScore++;
    }
  }
  if (ballY < paddleDiff) {
    if (ballX > paddleTopX && ballX < paddleTopX + paddleWidth) {
      if (playerMoved) {
        speedY += 1;
        if (speedY > 5) {
          speedY = 5;
        }
      }
      speedY = -speedY;
    } else if (ballY < 0) {
      ballReset();
      playerScore++;
    }
  }
}

// Bilgisayarın hareketini kontrol et
function computerAI() {
  if (playerMoved) {
    if (paddleTopX + paddleDiff < ballX) {
      paddleTopX += computerSpeed;
    } else {
      paddleTopX -= computerSpeed;
    }
  }
}

// Oyun bitiş ekranını göster
function showGameOverEl(winner) {
  canvas.style.display = "none";
  const gameOverEl = document.createElement("div");
  gameOverEl.classList.add("game-over-container");
  const title = document.createElement("h1");
  title.textContent = `${winner} Wins!`;
  const playAgainBtn = document.createElement("button");
  playAgainBtn.setAttribute("onclick", "startGame()");
  playAgainBtn.textContent = "Play Again";
  gameOverEl.append(title, playAgainBtn);
  document.body.appendChild(gameOverEl);
}

// Oyunun bitip bitmediğini kontrol et
function gameOver() {
  if (playerScore === winningScore || computerScore === winningScore) {
    isGameOver = true;
    const winner = playerScore === winningScore ? "Player 1" : "Computer";
    showGameOverEl(winner);
  }
}

// Oyun animasyonunu başlat
function animate() {
  if (!isPaused) {
    renderCanvas();
    ballMove();
    ballBoundaries();
    computerAI();
    gameOver();
    if (!isGameOver) {
      window.requestAnimationFrame(animate);
    }
  }
}

// Oyun başlatma ve kontrol düğmesini yönetme
function startGame() {
  if (isGameOver && !isNewGame) {
    document.querySelector(".game-over-container")?.remove();
    canvas.style.display = "block";
    controlBtn.textContent = "Pause"; // Başlangıçta "Pause" yazısı
  }
  isGameOver = false;
  isNewGame = false;
  isPaused = false;
  playerScore = 0;
  computerScore = 0;
  ballReset();
  createCanvas();
  animate();
  canvas.addEventListener("mousemove", (e) => {
    playerMoved = true;
    paddleBottomX = e.clientX - canvasPosition - paddleDiff;
    if (paddleBottomX < paddleDiff) {
      paddleBottomX = 0;
    }
    if (paddleBottomX > width - paddleWidth) {
      paddleBottomX = width - paddleWidth;
    }
    canvas.style.cursor = "none";
  });
}

// Kontrol düğmesinin işlevini ayarla
function togglePause() {
  if (isPaused) {
    isPaused = false;
    controlBtn.textContent = "Pause"; // Duraklatıldığında "Pause" yazısı
    animate();
  } else {
    isPaused = true;
    controlBtn.textContent = "Resume"; // Duraklatıldığında "Resume" yazısı
  }
}

// Düğmeye tıklama olayını yönet
controlBtn.addEventListener("click", () => {
  if (isGameOver) {
    startGame();
    controlBtn.textContent = "Pause";
  } else {
    togglePause();
  }
});
