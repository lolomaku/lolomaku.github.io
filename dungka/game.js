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
    rarity: 19, // common
    sounds: [
      { file: "sound1.mp3", weight: 2 },   // 10% chance (1/10)
      { file: "sound2.mp3", weight: 3 },   // 30% chance (3/10)
      { file: "sound3.mp3", weight: 5 },   // 60% chance (6/10)
    ],
    effect: function() {
      // Store reference to power object
      const power = this;
      isTimerPauseActive = true; // Set the flag

      // Visual feedback for freeze effect
      // showPowerOverlay('rgba(0, 255, 255, 0.25)');
      document.body.classList.add("timerpause-active");
      document.querySelectorAll(".enemy").forEach(e => {
        if (e.src.includes("crab")) {
          e.classList.add("crab-colored");
        }
      });
    
      // Mute all game sounds
      muteAll();
      
      // Pause game timer
      clearInterval(countdownTimer);

      // Slow down enemy spawn rate
    powerSpawnRate = 2000; // 3 seconds between spawns
      
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
        
        // Restore normal spawn rate
      powerSpawnRate = 1000;
      isTimerPauseActive = false;

        // Restart game timer
        countdownTimer = setInterval(() => {
          timeLeft--;
          timerDisplay.textContent = `${timeLeft}s`;
          if (timeLeft <= 0) endGame();
        }, 1000);

        document.body.classList.remove("timerpause-active");
        document.querySelectorAll(".crab-colored").forEach(e => e.classList.remove("crab-colored"));
        powerSpawningStarted = false;
        spawnPower();
      });
    }
  },
  {
    name: "gento",
    folder: "assets/gento",
    rarity: 19, // common
    effect: () => {
      // Visual effect
      // showPowerOverlay('rgba(255, 215, 0, 0.25)');
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
          type.tempValue = 3; // Set temporary score value
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
  },
  {
    name: "bazinga",
    folder: "assets/bazinga",
    rarity: 30, // common
    effect: function() {
      // Visual feedback for electricity effect
      showPowerOverlay('rgba(0, 100, 255, 0.5)');
      
      // Play activation sound
      const audio = new Audio(`${this.folder}/activation.mp3`);
      document.body.appendChild(audio);
      activePowerAudios.push(audio);
      audio.play();
      
      // Collect all negative enemies
      const negativeEnemies = document.querySelectorAll('.enemy[data-negative="true"]');
      
      // Destroy each negative enemy with electricity effect
      negativeEnemies.forEach((enemy, index) => {
        setTimeout(() => {
          // Get enemy position
          const rect = enemy.getBoundingClientRect();
          const x = rect.left + rect.width/2;
          const y = rect.top + rect.height/2;
          
          // Create electricity effect
          createElectricityEffect(x, y);
          
          // Add score for this enemy
          const value = parseInt(enemy.dataset.value);
          handleEnemyClick(value);
          
          // Remove enemy
          if (enemy.parentNode) {
            clearInterval(parseInt(enemy.dataset.intervalId));
            enemy.remove();
          }
        }, index * 150); // Staggered destruction
      });
      
      // Clean up after destruction sequence
      setTimeout(() => {
        audio.remove();
        const index = activePowerAudios.indexOf(audio);
        if (index > -1) activePowerAudios.splice(index, 1);
        powerSpawningStarted = false;
        spawnPower();
      }, negativeEnemies.length * 150 + 500);
    }
  },
  {
    name: "mana",
    folder: "assets/mana",
    rarity: 30, // common
    effect: function () {
      showPowerOverlay('rgba(0, 255, 100, 0.25)');
      powerActive = true;
  
      // Add random seconds
      const addedTime = Math.floor(Math.random() * 11) + 5; // 5–15 seconds
      timeLeft += addedTime;
      timerDisplay.textContent = `${timeLeft}s`;
  
      // Add glow animation
      timerDisplay.classList.add("timer-glow");
      setTimeout(() => timerDisplay.classList.remove("timer-glow"), 1000);
  
      // Pick a random sound
      const audio = new Audio(`assets/mana/sound.mp3`);
      document.body.appendChild(audio);
      audio.play();
  
      audio.addEventListener("ended", () => {
        audio.remove();
        powerActive = false;
        powerSpawningStarted = false;
        spawnPower(); // continue power cycle
      });
    }
  },
  {
    name: "wmian",
    folder: "assets/wmian",
    rarity: 2,
    effect: function () {
      showPowerOverlay('rgba(255, 200, 0, 0.5)');  // More visible overlay
      isWmianActive = true;
      powerActive = true;
      document.body.classList.add("wmian-mode");
  
      // Modify enemy types
      enemyTypes.forEach(type => {
        if (type.value > 0) type.tempValue = 2; // Regular crab = +2
        if (type.value < 0) type.tempValue = 0; // Disable penalty
      });
  
      // Start music
      const audio = new Audio("assets/wmian/sound.mp3");
      document.body.appendChild(audio);
      audio.play();
  
      // Spawn 5 big crabs over time
      let bigCrabCount = 0;
      const bigCrabSpawner = setInterval(() => {
        if (bigCrabCount >= 5 || !isWmianActive) {
          clearInterval(bigCrabSpawner);
          return;
        }
        spawnBigWmianCrab();
        bigCrabCount++;
      }, 1500);
  
      audio.addEventListener("ended", () => {
        // Cleanup if game ended during power-up
        if (!gameActive) return;
        
        audio.remove();
        isWmianActive = false;
        powerActive = false;
        document.body.classList.remove("wmian-mode");
  
        // Revert enemy types
        enemyTypes.forEach(t => {
          delete t.tempValue;
        });
        
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
let activeTimeouts = [];
let activeIntervals = [];
let isGentoActive = false;
let powerSpawningStarted = false;
let isTimerPauseActive = false;
let powerSpawnRate = 1000; // Normal spawn rate (1s)
let isWmianActive = false;

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
  const name = usernameInput.value.trim();
  if (!name) {
    alert("Please enter your name.");
    return;
  }

  username = name;

  // Switch to countdown screen
  showScreen("countdownScreen");

  // Stop title music and play game music
  musicPrestart.pause();
  musicPrestart.currentTime = 0;
  musicIngame.play();

  // Reset score, time, and game state
  score = 0;
  timeLeft = 60;
  gameActive = true;
  updateScore(0);
  timerDisplay.textContent = "60s";

  // Countdown logic
  const countdownText = document.getElementById("countdownText");
  let count = 3;
  countdownText.textContent = count;

  const countdownInterval = setInterval(() => {
    count--;
    if (count > 0) {
      countdownText.textContent = count;
    } else {
      clearInterval(countdownInterval);
      showScreen("gameScreen");
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
    timerDisplay.textContent = `${timeLeft}s`;
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function endGame() {
  // Set game inactive
  gameActive = false;
  isGentoActive = false;
  isTimerPauseActive = false; // Add this line
  isWmianActive = false;
  // Add explicit power spawn reset
  powerSpawningStarted = false;
  powerActive = false;
  
  // Clean up game state
  clearInterval(countdownTimer);
  clearAllEnemies();
  clearAllPowerUps(); // Add this line
  clearPowerEffects();
// Add comprehensive cleanup
clearAllTimers();
resetGameState();
  // Handle audio
  musicIngame.pause();
  musicIngame.currentTime = 0;
  musicPrestart.play();

  // Show game over screen
  showScreen("gameOverScreen");

  // const randomMsg = gameOverMessages[Math.floor(Math.random() * gameOverMessages.length)];
  // finalScoreDisplay.textContent = randomMsg;
  
  finalScoreDisplay.textContent = getGameOverMessage(score, username);

  // Submit score
  sendScoreToSheet(score);
}

function getGameOverMessage(score, username) {

  const ultimateScoreMessages = [
    `“🔊 BREAKING NEWS: ${username} just obliterated ${score} crabs. SB19 is shookt. 😳”`,
    `“🎤 ‘Zone cleared, crowd hyped!’ ${username} got ${score} and saved the whole tour!”`,
    `“🛡️ THE ZONE GUARDIAN HAS RISEN. ${username} scored ${score} and crabs are extinct.”`,
    `“🔥 ${username} just performed the real GENTO. ${score} points ng pure destruction.”`,
    `“🚨 SB19 Management is now hiring ${username} as official crab bouncer. ${score} points!”`,
    `“📣 ‘Dun kayooo!’ – you, every second. ${username} scored ${score} in full anti-crab glory.”`,
    `“SB19 canceled crab invasion forever because ${username} cleared the zone with ${score}.”`,
    `“🦀💥 ${username} just WMIAN’d the universe. Score: ${score}. Crabs are filing complaints.”`,
    `“🏆 Achievement unlocked: ‘Certified Anti-Crab Legend’. ${username} scored ${score}!”`,
  ];

  const highScoreMessages = [
    `“Grabe ka ${username}! You scored ${score}, parang ikaw na ang 6th member ng SB19 anti-crab squad!”`,
    `“Legend ka, ${username}! ${score} crabs down! The zone is safe (for now).”`,
    `“Zone cleared! ${username} scored ${score} and saved SB19’s rehearsal!”`,
    `“BOOM! ${username} with ${score} points, crabs ran for their lives!”`,
    `“Josh said ‘DUN KAYO!’ and so did ${username}, with a whopping ${score} score!”`,
    `“Ken is impressed. ${username}, with ${score} points? Pak!”`,
    `“Justin: ‘Zone secured thanks to ${username} with ${score} hits!’”`,
    `“Pablo is proud. ${username} dropped ${score} points to protect the stage.”`,
    `“Stell: ‘Uy ${username}, salamat ah! ${score} points ka? MVP ka talaga!’”`,
  ];

  const midScoreMessages = [
    `“Nice try, ${username}! Pero may ilang crab pa rin na tumambling sa stage. Score: ${score}.”`,
    `“Ayos lang ${username}, ${score} crabs down. Pero may sneak pa sa gilid!”`,
    `“Not bad, ${username}! ${score} points sa crab clean-up mission.”`,
    `“Okay yung galaw mo, ${username}. ${score} points achieved. Next game ulit!”`,
    `“SB19: ‘Good effort, ${username}!’ You scored ${score}. Practice makes perfect!”`,
  ];

  const lowScoreMessages = [
    `“Oops ${username}, ${score} lang? Parang ikaw yung natawagan ng ‘DUN KAYO’ ah 😅”`,
    `“SB19 tried their best… pero crabs got through. ${username} scored ${score} only.”`,
    `“Crabs: 1. ${username}: ${score}. Better luck next round!”`,
    `“${username} nag-zoning IRL. ${score} points. Zone NOT secured 😅”`,
  ];

  const negativeScoreMessages = [
    `“Ay! ${username}, SB19 ‘yung kinlick mo 😭 -${Math.abs(score)}? Foul ka dun!”`,
    `“Nooo ${username}! You clicked our boyfriends 😭 Score: ${score}... not good.”`,
    `“${username} accidentally sabotaged SB19’s stage with a score of ${score} 😅”`,
    `“SB19 are friends, not food 😭 ${username} got ${score} for friendly fire!”`,
  ];

   if (score < 0) {
    return negativeScoreMessages[Math.floor(Math.random() * negativeScoreMessages.length)];
  } else if (score >= 900) {
    return ultimateScoreMessages[Math.floor(Math.random() * ultimateScoreMessages.length)];
  } else if (score >= 300) {
    return highScoreMessages[Math.floor(Math.random() * highScoreMessages.length)];
  } else if (score >= 100) {
    return midScoreMessages[Math.floor(Math.random() * midScoreMessages.length)];
  } else {
    return lowScoreMessages[Math.floor(Math.random() * lowScoreMessages.length)];
  }
}

/* ======================== */
/* === POWER EFFECT CLEANUP === */
/* ======================== */
function clearPowerEffects() {

  isWmianActive = false;
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
    const timeoutId = setTimeout(spawnMultipleEnemies, powerSpawnRate);
    activeTimeouts.push(timeoutId);
  }
}

function createEnemy(enemyData) {
  const isNegative = enemyData.value > 0; // Negative emotion flag
  const enemy = document.createElement("img");
  enemy.classList.add("enemy");

  if (isTimerPauseActive && isNegative) {
    enemy.classList.add("crab-colored");
  }

  if (enemyData.label === "PARTY CRAB") {
    enemy.classList.add("big-crab");
  }

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

  if (enemyData.label === "PARTY CRAB") {
    soundPath = "assets/wmian/click.mp3";
  }
  // Create audio object
  const sound = soundPath ? new Audio(soundPath) : null;

  // Set initial frame
  enemy.src = frame1;
  enemy.alt = enemyData.label;
  enemy.title = enemyData.label;

  // Add to createEnemy function (inside the createEnemy function)
  // Mark negative enemies with data attribute
  enemy.dataset.negative = (enemyData.value > 0).toString();
  enemy.dataset.value = enemyData.value; // Store value for scoring

  // Position randomly
  const size = 100;
  const x = enemyData.spawnOverridePosition?.x || Math.random() * (window.innerWidth - size);
  const y = enemyData.spawnOverridePosition?.y || Math.random() * (window.innerHeight - size);
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

    // Store animation interval ID for cleanup
    enemy.dataset.intervalId = animationInterval;

  function removeEnemy() {
    if (enemy.parentNode) {
      clearInterval(animationInterval);
      enemy.remove();
    }
  }

  // Click handler
  function handleClick() {
    // Use temporary value if available
    let value = enemyData.tempValue || enemyData.value;

    // Apply timerpause bonus to negative emotions
  if (isTimerPauseActive && value > 0) {
    value = 2; // +2 instead of +1
  }

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

  // Declare initialDelay here so it's accessible throughout the function
  const initialDelay = Math.random() * 2000 + 1000; 

  if (!powerSpawningStarted) {
    powerSpawningStarted = true;
    
    // Set initial delay before first power spawns
    const timeoutId = setTimeout(() => {
      if (gameActive && !powerActive) {
        spawnPower();
      } else {
        setTimeout(spawnPower, 500); 
      }
    }, initialDelay);
    
    activeTimeouts.push(timeoutId);
    return;
  }
  
  const now = Date.now();
  // Check if power can be spawned
  if (powerActive || timeLeft <= 0 || now - lastPowerTime < powerCooldown) {
    // Add retry instead of exiting
    setTimeout(spawnPower, 300); 
    return;
  }

  powerActive = true;
  lastPowerTime = now;

  // const power = powers[Math.floor(Math.random() * powers.length)];
  const power = chooseWeightedPower();
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

  // Initial delay timeout
  const initialDelayId = setTimeout(() => { /* ... */ }, initialDelay);
  activeTimeouts.push(initialDelayId);
  
  // Auto-removal timeout
  const removalTimeoutId = setTimeout(() => { /* ... */ }, 1000);
  activeTimeouts.push(removalTimeoutId);
}

function chooseWeightedPower() {
  const totalWeight = powers.reduce((sum, p) => sum + p.rarity, 0);
  const rand = Math.random() * totalWeight;
  let acc = 0;
  for (let power of powers) {
    acc += power.rarity;
    if (rand < acc) return power;
  }
  return powers[0]; // fallback
}

function spawnBigWmianCrab() {
  const big = document.createElement("img");
  big.src = "assets/wmian/1.png";
  big.classList.add("enemy", "big-crab");
  
  const size = 160;
  // Calculate a spawn zone near center with padding
  const padding = 200; // prevent edge clipping
  const x = Math.random() * (window.innerWidth - size - padding * 2) + padding;
  const y = Math.random() * (window.innerHeight - size - padding * 2) + padding;
  const centerX = x + size/2;
  const centerY = y + size/2;

  Object.assign(big.style, {
    left: `${x}px`,
    top: `${y}px`,
    width: `${size}px`,
    position: "absolute",
    pointerEvents: "auto",
    cursor: "pointer",
    zIndex: "20",
    objectFit: "contain",
    userSelect: "none"
  });

  let currentFrame = 0;
  const anim = setInterval(() => {
    currentFrame = (currentFrame + 1) % 2;
    big.src = `assets/wmian/${currentFrame + 1}.png`;
  }, 300);

  big.addEventListener("click", () => {
    clearInterval(anim);
    big.remove();
    const clickSound = new Audio("assets/wmian/click.mp3");
    clickSound.play();
    score += 20;
    updateScore(score);
    scoreDisplay.classList.add("green-glow");
    setTimeout(() => scoreDisplay.classList.remove("green-glow"), 200);

    // Create explosion at center of big crab
    createExplosionEffect(centerX, centerY);

    // Spawn 5 regular crabs around explosion
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const distance = 100;
      const offsetX = centerX + Math.cos(angle) * distance - 60;
      const offsetY = centerY + Math.sin(angle) * distance - 60;
      
      createEnemy({
        label: "PARTY CRAB",
        value: 5,
        tempFrames: {
          frame1: "assets/wmian/1.png",
          frame2: "assets/wmian/2.png"
        },
        spawnOverridePosition: { x: offsetX, y: offsetY }
      });
    }
  });

  document.body.appendChild(big);
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

function clearAllTimers() {
  // Clear all tracked timeouts and intervals
  activeTimeouts.forEach(timeout => clearTimeout(timeout));
  activeIntervals.forEach(interval => clearInterval(interval));
  activeTimeouts = [];
  activeIntervals = [];
  
  // Clear main game timers
  clearInterval(countdownTimer);
}

function resetGameState() {
  // Reset all game state variables
  isGentoActive = false;
  isTimerPauseActive = false;
  isWmianActive = false;
  powerActive = false;
  powerSpawningStarted = false;
  powerSpawnRate = 1000;
  devtoolsOpen = false;
  
  // Clear any remaining DOM elements
  clearAllEnemies();
  clearAllPowerUps();
  clearPowerEffects();
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
  scoreDisplay.textContent = `${score}`;
  scoreDisplay.style.opacity = 1;

  // Preserve any active glow during the bump animation
  const hadPositiveGlow = scoreDisplay.classList.contains("positive-glow");
  const hadNegativeGlow = scoreDisplay.classList.contains("negative-glow");
  
  clearTimeout(scoreFadeTimeout);
  scoreFadeTimeout = setTimeout(() => {
    scoreDisplay.style.opacity = 0.3;
  }, 1000);
  
  // Add bump animation
  scoreDisplay.classList.add("bump");
  setTimeout(() => {
    scoreDisplay.classList.remove("bump");
    
    // Restore glow classes if they were present
    if (hadPositiveGlow) scoreDisplay.classList.add("positive-glow");
    if (hadNegativeGlow) scoreDisplay.classList.add("negative-glow");
  }, 200);
}

// Update the handleEnemyClick function
function handleEnemyClick(value) {
  // First remove any existing glow classes
  scoreDisplay.classList.remove("positive-glow", "negative-glow");
  
  // Apply new glow based on value
  if (value < 0) {
    // Positive emotion (value is negative)
    scoreDisplay.classList.add("positive-glow");
  } else {
    // Negative emotion (value is positive)
    scoreDisplay.classList.add("negative-glow");
  }
  
  updateScore(score + value);
  
  // Remove the glow after 200ms
  setTimeout(() => {
    scoreDisplay.classList.remove("positive-glow", "negative-glow");
  }, 200);
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

function createElectricityEffect(x, y) {
  const effect = document.createElement("div");
  effect.className = "electricity";
  effect.style.left = `${x}px`;
  effect.style.top = `${y}px`;
  document.body.appendChild(effect);
  
  // Add lightning animation
  effect.style.animation = "electricityFlash 0.8s ease-out forwards";
  
  // Remove after animation
  setTimeout(() => {
    if (effect.parentNode) {
      effect.parentNode.removeChild(effect);
    }
  }, 800);
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

  // Add class for slow spawn animation
  if (color.includes('255, 255')) {
    document.body.classList.add("timerpause-active");
  }

  setTimeout(() => {
    overlay.style.display = "none";
    document.body.classList.remove("timerpause-active");
  }, 300);
}

function clearAllEnemies() {
  document.querySelectorAll(".enemy").forEach(e => {
    if (e.dataset.intervalId) {
      clearInterval(parseInt(e.dataset.intervalId));
    }
    e.remove();
  });
  
  // Also clear any pending enemy spawn timeouts
  activeTimeouts = activeTimeouts.filter(id => {
    try {
      clearTimeout(id);
      return false;
    } catch {
      return true;
    }
  });
}

function createExplosionEffect(x, y) {
  const explosion = document.createElement("div");
  explosion.className = "explosion";
  explosion.style.left = `${x}px`;
  explosion.style.top = `${y}px`;
  document.body.appendChild(explosion);
  
  // Add explosion animation
  explosion.style.animation = "explosionScale 0.8s ease-out forwards";
  
  setTimeout(() => {
    if (explosion.parentNode) {
      explosion.parentNode.removeChild(explosion);
    }
  }, 800);
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

const devtoolsCheck = () => {
  try {
    const threshold = 100; // Lower threshold for mobile
    devtoolsOpen = (
      Math.abs(window.outerWidth - window.innerWidth) > threshold ||
      Math.abs(window.outerHeight - window.innerHeight) > threshold ||
      window.Firebug?.firebugEnabled // Undocked detection
    );
  } catch {}
};

// Run check every 500ms + BEFORE SCORE SUBMISSION
setInterval(devtoolsCheck, 500);

/* ======================== */
/* === SCORE SUBMISSION === */
/* ======================== */
function sendScoreToSheet(score) {
  const devtoolsNow = (() => {
    try {
      const threshold = 160;
      return (
        Math.abs(window.outerWidth - window.innerWidth) > threshold ||
        Math.abs(window.outerHeight - window.innerHeight) > threshold
      );
    } catch {
      return false;
    }
  })();

  fetch("https://script.google.com/macros/s/AKfycbxFr8KtI3WSCraxaE13UUGVlO6oip487adB4EWu4P70OMbE_vWFSlOjwE1e8UN81zUIqg/exec", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `score=${score}&username=${encodeURIComponent(username)}&devtools=${devtoolsOpen ? 'yes' : 'no'}`
  })
    .then(res => res.text())
    .then(msg => console.log("✅ Score recorded:", msg))
    .catch(err => console.error("❌ Failed to send score", err));
}

/* ======================== */
/* === GAME OVER HANDLERS === */
/* ======================== */
restartBtn.addEventListener("click", () => {
  // Add comprehensive reset before restarting
  endGame();  // Properly clean up current game
  showScreen("gameScreen");
  
  // Reset game state variables
  score = 0;
  timeLeft = 60;
  gameActive = true;
  
  // Start new game
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
