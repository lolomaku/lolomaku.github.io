/* ======================== */
/* === GAME CONFIGURATION === */
/* ======================== */

// Enemy types with their score impact
const enemyTypes = [
  { label: "Anger", value: 1 },      // Negative emotions (add to score)
  { label: "Sadness", value: 1 },    // Negative emotions
  { label: "Anxiety", value: 1 },    // Negative emotions
  { label: "Joy", value: -1 },       // Positive emotions (subtract from score)
  { label: "Hope", value: -1 },      // Positive emotions
  { label: "Gratitude", value: -1 }, // Positive emotions
];


// Available power-ups in the game
const powers = [
  {
    name: "timerpause",
    folder: "assets/timerpause",
    sounds: [
      { file: "sound1.mp3", weight: 2 },   // 10% chance (1/10)
      { file: "sound2.mp3", weight: 3 },   // 30% chance (3/10)
      { file: "sound3.mp3", weight: 5 },   // 60% chance (6/10)
    ],
    effect: function() {
      // Store reference to power object
      const power = this;
      
      // Visual feedback for freeze effect
      showPowerOverlay('rgba(0, 255, 255, 0.25)');
      
      // Mute all game sounds
      muteAll();
      
      // Pause game timer
      clearInterval(countdownTimer);
      
      // Select weighted random sound
      const selectedSound = getWeightedRandomSound(power.sounds);
      const audio = new Audio(`${power.folder}/${selectedSound.file}`);
      document.body.appendChild(audio);
      
      // Track audio element
      activePowerAudios.push(audio);
      audio.play();
      
      // Handle sound completion
      audio.addEventListener("ended", () => {
        if (!gameActive) return; // Stop if game ended
        
        audio.remove();
        unmuteAll();
        // Remove from active audios
        const index = activePowerAudios.indexOf(audio);
        if (index > -1) activePowerAudios.splice(index, 1);
        
        // Restart game timer
        countdownTimer = setInterval(() => {
          timeLeft--;
          timerDisplay.textContent = `Time: ${timeLeft}s`;
          if (timeLeft <= 0) endGame();
        }, 1000);
        powerSpawningStarted = false;
        spawnPower();
      });
    }
  },
  {
    name: "gento",
    folder: "assets/gento",
    effect: () => {
      // Visual effect
      showPowerOverlay('rgba(255, 215, 0, 0.25)');
      isGentoActive = true; // Set the flag
      // Mute all game sounds
      muteAll();
      
      // Play sound
      const audio = new Audio("assets/gento/sound.mp3");
      document.body.appendChild(audio);
      
      // Track audio element
      activePowerAudios.push(audio);
      audio.play();
      
      // Store original enemy data for restoration
      const originalEnemyTypes = [...enemyTypes];
      
      // Modify negative enemies during power-up duration
      enemyTypes.forEach(type => {
        if (type.value > 0) { // Negative emotions
          type.tempValue = 5; // Set temporary score value
          type.tempFrames = {
            frame1: "assets/gento/1.png",
            frame2: "assets/gento/2.png"
          };
        }
      });
      
      // Handle sound completion
      audio.addEventListener("ended", () => {
        if (!gameActive) return; // Stop if game ended
        
        audio.remove();
        unmuteAll();
        // Remove from active audios
        const index = activePowerAudios.indexOf(audio);
        if (index > -1) activePowerAudios.splice(index, 1);
        
        // Restore original enemy data
        enemyTypes.forEach((type, index) => {
          if (type.value > 0) {
            delete type.tempValue;
            delete type.tempFrames;
          }
        });
        isGentoActive = false; // Clear the flag when effect ends
        powerSpawningStarted = false;
        spawnPower();
      });
    }
  }
];

/* ======================== */
/* === GAME STATE & REFERENCES === */
/* ======================== */
let username = "";          // Player name
let score = 0;              // Current score
let timeLeft = 30;          // Game duration (seconds)
let countdownTimer;         // Game timer reference
let powerActive = false;    // Power-up availability flag
let lastPowerTime = 0;      // Last power-up spawn time
const powerCooldown = Math.random() * 2000 + 2000; // Cooldown between power-ups (ms)
let gameActive = false;     // Game running state
let activePowerAudios = []; // Active power audio elements
let isGentoActive = false;
let powerSpawningStarted = false;

// DOM element references
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

// Audio elements
const musicPrestart = document.getElementById("music-prestart");
const musicIngame = document.getElementById("music-ingame");

/* ======================== */
/* === INITIAL SETUP === */
/* ======================== */
window.addEventListener("load", () => {
  // Initialize audio settings
  musicPrestart.volume = 0.5;
  musicIngame.volume = 0.5;
  
  // Attempt autoplay with fallback
  musicPrestart.play().catch(() => {
    console.warn("🔇 Autoplay blocked. Will start on click.");
  });
  
  // Start title animation
  pulseTitle();
});

// Start button handler
startBtn.addEventListener("click", handleStartBtn);

/* ======================== */
/* === SCREEN MANAGEMENT === */
/* ======================== */
function showScreen(screenId) {
  // Hide all screens
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  // Show requested screen
  document.getElementById(screenId).classList.add('active');
}

/* ======================== */
/* === GAME FLOW CONTROL === */
/* ======================== */
function handleStartBtn() {
  // Validate username
  const name = usernameInput.value.trim();
  if (!name) {
    alert("Please enter your name.");
    return;
  }

  username = name;
  showScreen("gameScreen");

  // Handle audio transition
  musicPrestart.pause();
  musicPrestart.currentTime = 0;
  musicIngame.play();

  // Reset game state
  score = 0;
  timeLeft = 30;
  gameActive = true;
  updateScore(0);
  timerDisplay.textContent = "Time: 30s";

  // Start countdown sequence
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
  // Reset power spawning flag
  powerSpawningStarted = false;

  // Initialize game elements
  spawnMultipleEnemies();
  spawnPower();

  // Start main game timer
  countdownTimer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `Time: ${timeLeft}s`;
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function endGame() {
  // Set game inactive
  gameActive = false;
  isGentoActive = false;
  
  // Clean up game state
  clearInterval(countdownTimer);
  clearAllEnemies();
  clearAllPowerUps(); // Add this line
  clearPowerEffects();

  // Handle audio
  musicIngame.pause();
  musicIngame.currentTime = 0;
  musicPrestart.play();

  // Show game over screen
  showScreen("gameOverScreen");
  
  // Generate random game over message
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
  
  finalScoreDisplay.textContent = gameOverMessages[Math.floor(Math.random() * gameOverMessages.length)];

  // Submit score
  sendScoreToSheet(score);
}

/* ======================== */
/* === POWER EFFECT CLEANUP === */
/* ======================== */
function clearPowerEffects() {
  // Stop all power audio
  activePowerAudios.forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
    if (audio.parentNode) {
      audio.parentNode.removeChild(audio);
    }
  });
  activePowerAudios = [];
  
  // Hide power overlay
  document.getElementById("power-overlay").style.display = "none";
  
  // Unmute all sounds
  unmuteAll();
  
  // Revert enemy types
  enemyTypes.forEach(type => {
    if (type.tempValue) delete type.tempValue;
    if (type.tempFrames) delete type.tempFrames;
  });

    // Ensure powerActive is reset
    powerActive = false;
}

/* ======================== */
/* === GAME ELEMENT CREATION === */
/* ======================== */
function spawnMultipleEnemies() {
  // Stop if game ended
  if (!gameActive) return;
  
  // Create 2-5 enemies
  const numEnemies = Math.floor(Math.random() * 4) + 2;
  
  for (let i = 0; i < numEnemies; i++) {
    const enemyData = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    createEnemy(enemyData);
  }

  // Schedule next spawn if game still active
  if (gameActive && timeLeft > 0) {
    setTimeout(spawnMultipleEnemies, 1000);
  }
}

function createEnemy(enemyData) {
  const isNegative = enemyData.value > 0; // Negative emotion flag
  const enemy = document.createElement("img");
  enemy.classList.add("enemy");

  // Use temporary frames if available
  let frame1, frame2, soundPath;
  if (isNegative && enemyData.tempFrames) {
    frame1 = enemyData.tempFrames.frame1;
    frame2 = enemyData.tempFrames.frame2;
    soundPath = "assets/gento/click.mp3"; // Optional: custom sound
  } else if (isNegative) {
    frame1 = "assets/crab/1.png";
    frame2 = "assets/crab/2.png";
    soundPath = "assets/crab/click.mp3";
  } else {
    const randIndex = Math.floor(Math.random() * 5) + 1;
    frame1 = `assets/sb${randIndex}/1.png`;
    frame2 = `assets/sb${randIndex}/2.png`;
    soundPath = `assets/sb${randIndex}/click.mp3`;
  }

  // Create audio object
  const sound = soundPath ? new Audio(soundPath) : null;

  // Set initial frame
  enemy.src = frame1;
  enemy.alt = enemyData.label;
  enemy.title = enemyData.label;

  // Position randomly
  const size = 120;
  const x = Math.random() * (window.innerWidth - size);
  const y = Math.random() * (window.innerHeight - size);
  
  Object.assign(enemy.style, {
    left: `${x}px`,
    top: `${y}px`,
    width: `${size}px`,
    position: "absolute",
    pointerEvents: "auto",
    cursor: "pointer",
    zIndex: "10",
    objectFit: "contain",
    userSelect: "none"
  });

  // Animation handling
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

  // Click handler
  function handleClick() {
    // Use temporary value if available
    const value = enemyData.tempValue || enemyData.value;
    handleEnemyClick(value);
    
    if (sound) {
      sound.currentTime = 0;
      sound.play();
    }
    createClickSplash(enemy.style.left, enemy.style.top);
    removeEnemy();
  }

  // Register events
  enemy.addEventListener("click", handleClick);
  enemy.addEventListener("touchstart", handleClick);
  document.body.appendChild(enemy);

  // Auto-remove positive emotions after delay
  if (!isNegative) {
    setTimeout(removeEnemy, Math.random() * 2000 + 4000);
  }
}

function spawnPower() {
  // Stop if game ended
  if (!gameActive) return;

  if (!powerSpawningStarted) {
    powerSpawningStarted = true;
    
    // Set initial delay before first power spawns
    setTimeout(() => {
      if (gameActive) {
        spawnPower(); // Actually spawn the power after delay
      }
    }, Math.random() * 2000 + 1000); // Random delay between 3-5 seconds
    return;
  }
  
  const now = Date.now();
  // Check if power can be spawned
  if (powerActive || timeLeft <= 0 || now - lastPowerTime < powerCooldown) return;

  powerActive = true;
  lastPowerTime = now;

  const power = powers[Math.floor(Math.random() * powers.length)];
  const powerImg = document.createElement("img");

  // Set animation frames
  const frame1 = `${power.folder}/power1.png`;
  const frame2 = `${power.folder}/power2.png`;
  let currentFrame = 0;

  powerImg.src = frame1;
  powerImg.classList.add("power");
  powerImg.alt = power.name;
  powerImg.title = power.name;

  // Position randomly
  const size = 90;
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

  // Animation handling
  const animInterval = setInterval(() => {
    currentFrame = (currentFrame + 1) % 2;
    powerImg.src = currentFrame === 0 ? frame1 : frame2;
  }, 300);
  
  // Store interval ID on element for cleanup
  powerImg.dataset.intervalId = animInterval;

  function removePower() {
    clearInterval(animInterval);
    powerImg.remove();
    powerActive = false;
  }

  // Click handler
  function handleClick() {
    power.effect();
    removePower();
  }

  // Register events
  powerImg.addEventListener("click", handleClick);
  powerImg.addEventListener("touchstart", handleClick);
  document.body.appendChild(powerImg);

  // Auto-remove after timeout
  setTimeout(() => {
    if (!gameActive) return; // Stop if game ended
    
    if (document.body.contains(powerImg)) {
      removePower();
      // Schedule next power-up after cooldown
      setTimeout(spawnPower, powerCooldown);
    }
  }, 1000);
}

function clearAllPowerUps() {
  document.querySelectorAll(".power").forEach(power => {
    // Clear animation interval
    const intervalId = power.dataset.intervalId;
    if (intervalId) clearInterval(Number(intervalId));
    
    // Remove element from DOM
    power.remove();
  });
}

// Helper function for weighted random selection
function getWeightedRandomSound(sounds) {
  // Calculate total weight
  const totalWeight = sounds.reduce((sum, sound) => sum + sound.weight, 0);
  
  // Generate random number in range
  const random = Math.random() * totalWeight;
  
  // Find the selected sound based on weight
  let currentWeight = 0;
  for (const sound of sounds) {
    currentWeight += sound.weight;
    if (random <= currentWeight) {
      return sound;
    }
  }
  
  // Fallback to last sound
  return sounds[sounds.length - 1];
}

/* ======================== */
/* === UI/UX FUNCTIONS === */
/* ======================== */
let scoreFadeTimeout;

function updateScore(newScore) {
  score = newScore;
  scoreDisplay.textContent = `Score: ${score}`;
  scoreDisplay.style.opacity = 1;

  // Fade out effect
  clearTimeout(scoreFadeTimeout);
  scoreFadeTimeout = setTimeout(() => {
    scoreDisplay.style.opacity = 0.3;
  }, 1000);
}

function handleEnemyClick(value) {
  updateScore(score + value);
}

function pulseTitle() {
  const titleImg = document.getElementById("titleImage");
  const frames = ["assets/title/1.png", "assets/title/2.png"];
  let frameIndex = 0;

  function animate() {
    frameIndex = (frameIndex + 1) % frames.length;
    titleImg.src = frames[frameIndex];
    setTimeout(animate, 1000);
  }
  
  animate();
}

/* ======================== */
/* === AUDIO MANAGEMENT === */
/* ======================== */
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

/* ======================== */
/* === VISUAL EFFECTS === */
/* ======================== */
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
  
  // Golden splash for gento power
  if (isGentoActive) {
    splash.style.background = "radial-gradient(circle, rgba(255,215,0,0.8) 0%, rgba(255,165,0,0.4) 70%, transparent 100%)";
    splash.style.boxShadow = "0 0 20px 10px gold";
  } 
  // Normal splash
  else {
    splash.style.background = "rgba(255, 255, 255, 0.6)";
  }

  splash.style.left = x;
  splash.style.top = y;
  document.body.appendChild(splash);
  
  // Add animation class
  splash.style.animation = "splashScale 0.6s ease-out forwards";
  
  setTimeout(() => {
    if (splash.parentNode) {
      splash.parentNode.removeChild(splash);
    }
  }, 600);
}

/* ======================== */
/* === SCORE SUBMISSION === */
/* ======================== */
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

/* ======================== */
/* === GAME OVER HANDLERS === */
/* ======================== */
restartBtn.addEventListener("click", () => {
  showScreen("gameScreen");
  handleStartBtn();
});

returnToTitleBtn.addEventListener("click", () => {
  showScreen("titleScreen"); 
});

/* ======================== */
/* === SECURITY MEASURES === */
/* ======================== */
// Disable context menu
document.addEventListener('contextmenu', e => e.preventDefault());

// Block devtools shortcuts
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

// Prevent zooming
window.addEventListener('wheel', e => {
  if (e.ctrlKey) e.preventDefault();
}, { passive: false });

// Block touch gestures
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('gesturechange', e => e.preventDefault());
document.addEventListener('gestureend', e => e.preventDefault());

// Disable image dragging
document.querySelectorAll('img').forEach(img => {
  img.addEventListener('dragstart', e => e.preventDefault());
});

// Devtools detection
let devtoolsOpen = false;
setInterval(() => {
  const widthThreshold = window.outerWidth - window.innerWidth > 160;
  const heightThreshold = window.outerHeight - window.innerHeight > 160;
  devtoolsOpen = widthThreshold || heightThreshold;
}, 1000);
