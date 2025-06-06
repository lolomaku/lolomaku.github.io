const enemyTypes = [
  { label: "Anger", value: 1 },
  { label: "Sadness", value: 1 },
  { label: "Anxiety", value: 1 },
  { label: "Joy", value: -1 },
  { label: "Hope", value: -1 },
  { label: "Gratitude", value: -1 },
];

const powers = [
  {
    name: "timerpause",
    folder: "assets/timerpause",
    effect: () => {
      // Flash visual
      showPowerOverlay('rgba(0, 255, 255, 0.25)'); // Cyan for freeze
  
      // Mute all game sounds
      muteAll();
  
      // Pause countdown
      clearInterval(countdownTimer);
  
      const audio = new Audio("assets/timerpause/sound.mp3");
      document.body.appendChild(audio);
      audio.play();
  
      audio.addEventListener("ended", () => {
        audio.remove();
        unmuteAll(); // Resume game sounds
        spawnPower();
        countdownTimer = setInterval(() => {
          timeLeft--;
          timerDisplay.textContent = `Time: ${timeLeft}s`;
          if (timeLeft <= 0) endGame();
        }, 1000);
      });
    }
  },
  // {
  //   name: "killcrabs",
  //   folder: "assets/killcrabs",
  //   effect: () => {
  //     showPowerOverlay();
  
  //     document.querySelectorAll(".enemy").forEach(e => {
  //       if (e.src.includes("crab")) e.remove();
  //     });
  
  //     const audio = new Audio("assets/killcrabs/sound.mp3");
  //     document.body.appendChild(audio);
  //     audio.play();
  //     audio.addEventListener("ended", () => audio.remove());
  //   }
  // }
];


let username = "";
let score = 0;
let timeLeft = 30;
let countdownTimer;

let lastPowerTime = 0;
const powerCooldown = 5000; // 5 seconds


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
  pulseTitle();
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
  // spawnPower();

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

let powerActive = false;

function spawnPower() {
  const now = Date.now();
  if (powerActive || timeLeft <= 0 || now - lastPowerTime < powerCooldown) return;

  powerActive = true;
  lastPowerTime = now;

  const power = powers[Math.floor(Math.random() * powers.length)];
  const powerImg = document.createElement("img");

  let frame1 = `${power.folder}/1.png`;
  let frame2 = `${power.folder}/2.png`;
  let currentFrame = 0;

  powerImg.src = frame1;
  powerImg.classList.add("power");
  powerImg.alt = power.name;
  powerImg.title = power.name;

  const size = 80;
  const x = Math.random() * (window.innerWidth - size);
  const y = Math.random() * (window.innerHeight - size);
  Object.assign(powerImg.style, {
    left: `${x}px`,
    top: `${y}px`,
    width: `${size}px`,
    position: "absolute",
    cursor: "pointer",
    zIndex: "15",
    objectFit: "contain",
    userSelect: "none",
    pointerEvents: "auto",
  });

  const animInterval = setInterval(() => {
    currentFrame = (currentFrame + 1) % 2;
    powerImg.src = currentFrame === 0 ? frame1 : frame2;
  }, 300);

  function removePower() {
    clearInterval(animInterval);
    powerImg.remove();
    powerActive = false;
  }

  function handleClick() {
    power.effect();
    removePower();
  }

  powerImg.addEventListener("click", handleClick);
  powerImg.addEventListener("touchstart", handleClick);

  document.body.appendChild(powerImg);

  // Power appears for 1s and disappears if not clicked
  setTimeout(() => {
    if (document.body.contains(powerImg)) {
      removePower();
      // Allow next appearance after cooldown delay
      setTimeout(spawnPower, powerCooldown);
    }
  }, 1000);
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
    soundPath = `assets/sb${randIndex}/click.mp3`;
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

 const titleImg = document.getElementById("titleImage");
  const frames = ["assets/title/1.png", "assets/title/2.png"];
  let frameIndex = 0;

  function pulseTitle() {
    // Switch to the next frame
    frameIndex = (frameIndex + 1) % frames.length;
    titleImg.src = frames[frameIndex];

    setTimeout(pulseTitle, 1000); // Change every 400ms (adjust if needed)
  }

function muteAll() {
  document.querySelectorAll("audio").forEach(audio => {
    audio.muted = true;
  });
}

function unmuteAll() {
  document.querySelectorAll("audio").forEach(audio => {
    audio.muted = false;
  });
}

function showPowerOverlay(color = 'rgba(255, 255, 0, 0.25)') {
  const overlay = document.getElementById("power-overlay");
  overlay.style.background = color;
  overlay.style.display = "block";
  overlay.style.animation = "flash 0.3s ease-out forwards";

  setTimeout(() => {
    overlay.style.display = "none";
  }, 300);
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
