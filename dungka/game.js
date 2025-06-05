const enemyTypes = [
  { label: "Anger", value: 1 },
  { label: "Sadness", value: 1 },
  { label: "Anxiety", value: 1 },
  { label: "Joy", value: -1 },
  { label: "Hope", value: -1 },
  { label: "Gratitude", value: -1 },
];

let username = "";
let score = 0;
let timeLeft = 30;
let countdownTimer;

const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const startBtn = document.getElementById("startBtn");
const titleScreen = document.getElementById("titleScreen");
const gameScreen = document.getElementById("gameScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScoreDisplay = document.getElementById("finalScore");
const restartBtn = document.getElementById("restartBtn");
const returnToTitleBtn = document.getElementById("returnToTitleBtn");
const usernameInput = document.getElementById("usernameInput");
const countdownEl = document.getElementById("countdown");

const musicPrestart = document.getElementById("music-prestart");
const musicIngame = document.getElementById("music-ingame");

window.addEventListener("load", () => {
  musicPrestart.volume = 0.5;
  musicIngame.volume = 0.5;
  musicPrestart.play().catch(() => {
    console.warn("🔇 Autoplay blocked. Will start on click.");
  });
});

startBtn.addEventListener("click", handleStartBtn);

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(screenId).classList.add('active');
}

function handleStartBtn() {
  const name = usernameInput.value.trim();
  if (!name) {
    alert("Please enter your name.");
    return;
  }

  username = name;
  showScreen("gameScreen");

  musicPrestart.pause();
  musicPrestart.currentTime = 0;
  musicIngame.play();

  score = 0;
  timeLeft = 30;
  updateScore(0);
  timerDisplay.textContent = "Time: 30s";

  let count = 3;
  countdownEl.style.display = "block";
  countdownEl.textContent = count;

  const countdownInterval = setInterval(() => {
    count--;
    if (count > 0) {
      countdownEl.textContent = count;
    } else {
      clearInterval(countdownInterval);
      countdownEl.style.display = "none";
      startGame();
    }
  }, 1000);
}


function startGame() {
  spawnMultipleEnemies();

  countdownTimer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `Time: ${timeLeft}s`;
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function spawnMultipleEnemies() {
  const numEnemies = Math.floor(Math.random() * 4) + 2;

  for (let i = 0; i < numEnemies; i++) {
    const enemyData = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    createEnemy(enemyData);
  }

  if (timeLeft > 0) {
    setTimeout(spawnMultipleEnemies, 1000);
  }
}

function createEnemy(enemyData) {
  const isNegative = enemyData.value > 0;
  const enemy = document.createElement("img");
  enemy.classList.add("enemy");

  let frame1, frame2, soundPath;
  if (isNegative) {
    frame1 = "assets/crab/1.png";
    frame2 = "assets/crab/2.png";
    soundPath = "assets/crab/click.mp3";
  } else {
    const randIndex = Math.floor(Math.random() * 5) + 1;
    frame1 = `assets/sb${randIndex}/1.png`;
    frame2 = `assets/sb${randIndex}/2.png`;
    // soundPath = `assets/sb${randIndex}/click.mp3`;
  }

  const sound = soundPath ? new Audio(soundPath) : null;

  enemy.src = frame1;
  enemy.alt = enemyData.label;
  enemy.title = enemyData.label;

  const size = 120;
  const x = Math.random() * (window.innerWidth - size);
  const y = Math.random() * (window.innerHeight - size);
  Object.assign(enemy.style, {
    left: `${x}px`,
    top: `${y}px`,
    width: "120px",
    position: "absolute",
    pointerEvents: "auto",
    cursor: "pointer",
    zIndex: "10",
    objectFit: "contain",
    userSelect: "none"
  });

  let currentFrame = 0;
  const animationInterval = setInterval(() => {
    currentFrame = (currentFrame + 1) % 2;
    enemy.src = currentFrame === 0 ? frame1 : frame2;
  }, 300);

  function removeEnemy() {
    if (enemy.parentNode) {
      clearInterval(animationInterval);
      enemy.remove();
    }
  }

  function handleClick() {
    handleEnemyClick(enemyData.value);
    if (sound) {
      sound.currentTime = 0;
      sound.play();
    }
    createClickSplash(enemy.style.left, enemy.style.top);
    removeEnemy();
  }

  enemy.addEventListener("click", handleClick);
  enemy.addEventListener("touchstart", handleClick);
  document.body.appendChild(enemy);

  if (!isNegative) {
    const timeout = Math.random() * 2000 + 4000;
    setTimeout(removeEnemy, timeout);
  }
}

let scoreFadeTimeout;
function updateScore(newScore) {
  score = newScore;
  scoreDisplay.textContent = `Score: ${score}`;
  scoreDisplay.style.opacity = 1;

  clearTimeout(scoreFadeTimeout);
  scoreFadeTimeout = setTimeout(() => {
    scoreDisplay.style.opacity = 0.3;
  }, 1000);
}

function handleEnemyClick(value) {
  updateScore(score + value);
}

function endGame() {
  clearInterval(countdownTimer);
  clearAllEnemies();

  musicIngame.pause();
  musicIngame.currentTime = 0;
  musicPrestart.play();

  showScreen("gameOverScreen");
  const gameOverMessages = [
    `I'm ${username}, and my score is ${score}!`,
    `${username} scored ${score} points!`,
    `Whoa! ${username} just dropped a score of ${score}!`,
    `${username} fought bravely and earned ${score} points before falling.`,
    `Not bad, ${username}! You scored ${score}. Wanna go again?`,
    `${username}: A legend with ${score} points to their name.`,
    `${username}, you brought so much joy! Score: ${score}`,
    `${username}, thanks for playing! You scored ${score} – great job!`,
    `${username}, you survived... barely. Final score: ${score}.`,
    `${username} showed no mercy and scored ${score}!`
  ];
  
  const randomMsg = gameOverMessages[Math.floor(Math.random() * gameOverMessages.length)];
  finalScoreDisplay.textContent = randomMsg;

  sendScoreToSheet(score);
}


function clearAllEnemies() {
  document.querySelectorAll(".enemy").forEach(e => e.remove());
}

function createClickSplash(x, y) {
  const splash = document.createElement("div");
  splash.classList.add("splash");
  splash.style.left = x;
  splash.style.top = y;
  document.body.appendChild(splash);
  setTimeout(() => splash.remove(), 600);
}

function sendScoreToSheet(score) {
  fetch("https://script.google.com/macros/s/AKfycbxFr8KtI3WSCraxaE13UUGVlO6oip487adB4EWu4P70OMbE_vWFSlOjwE1e8UN81zUIqg/exec", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `score=${score}&username=${encodeURIComponent(username)}`
  })
    .then(res => res.text())
    .then(msg => console.log("✅ Score recorded:", msg))
    .catch(err => console.error("❌ Failed to send score", err));
}

// Game over buttons
restartBtn.addEventListener("click", () => {
  showScreen("gameScreen");
  handleStartBtn();
});

returnToTitleBtn.addEventListener("click", () => {
  showScreen("titleScreen"); 
});

// Extra security and UI behavior
document.addEventListener('contextmenu', e => e.preventDefault());
window.addEventListener('keydown', e => {
  if (
    e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '=') ||
    e.key === 'F12' ||
    (e.ctrlKey && e.shiftKey && ['I', 'J', 'U'].includes(e.key.toUpperCase())) ||
    (e.ctrlKey && e.key === 'U')
  ) {
    e.preventDefault();
  }
});
window.addEventListener('wheel', e => {
  if (e.ctrlKey) e.preventDefault();
}, { passive: false });

document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('gesturechange', e => e.preventDefault());
document.addEventListener('gestureend', e => e.preventDefault());
document.querySelectorAll('img').forEach(img => {
  img.addEventListener('dragstart', e => e.preventDefault());
});
document.addEventListener('dragstart', e => {
  if (e.target.tagName === 'IMG') e.preventDefault();
});

let devtoolsOpen = false;
setInterval(() => {
  const widthThreshold = window.outerWidth - window.innerWidth > 160;
  const heightThreshold = window.outerHeight - window.innerHeight > 160;
  devtoolsOpen = widthThreshold || heightThreshold;
}, 1000);
