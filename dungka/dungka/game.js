const enemyTypes = [
  { label: "Anger", value: 1 },
  { label: "Sadness", value: 1 },
  { label: "Anxiety", value: 1 },
  { label: "Joy", value: -1 },
  { label: "Hope", value: -1 },
  { label: "Gratitude", value: -1 },
];

const powers = [
  // {
  //   name: "wmian",
  //   folder: "assets/wmian",
  //   rarity: 2,
  //   effect: function () {
  //     showPowerOverlay('rgba(255, 200, 0, 0.5)');
  //     isWmianActive = true;
  //     powerActive = true;
  //     document.body.classList.add("wmian-mode");
  
  //     enemyTypes.forEach(type => {
  //       if (type.value > 0) type.tempValue = 2;
  //       if (type.value < 0) type.tempValue = 0;
  //     });
  
  //     const audio = new Audio("assets/wmian/sound.mp3");
  //     document.body.appendChild(audio);
  //     audio.play();
  
  //     let bigCrabCount = 0;
  //     const bigCrabSpawner = setInterval(() => {
  //       if (bigCrabCount >= 5 || !isWmianActive) {
  //         clearInterval(bigCrabSpawner);
  //         return;
  //       }
  //       spawnBigWmianCrab();
  //       bigCrabCount++;
  //     }, 1500);
  
  //     audio.addEventListener("ended", () => {
  //       if (!gameActive) return;
  //       cleanupAudio(audio);
  //       isWmianActive = false;
  //       powerActive = false;
  //       document.body.classList.remove("wmian-mode");
  //       enemyTypes.forEach(t => delete t.tempValue);
  //       powerSpawningStarted = false;
  //       spawnPower();
  //     });
  //   }
  // },
  // {
  //   name: "timerpause",
  //   folder: "assets/timerpause",
  //   rarity: 13,
  //   sounds: [
  //     { file: "sound1.mp3", weight: 2 },
  //     { file: "sound2.mp3", weight: 3 },
  //     { file: "sound3.mp3", weight: 5 },
  //   ],
  //   effect: function() {
  //     const power = this;
  //     isTimerPauseActive = true;
  //     document.body.classList.add("timerpause-active");
  //     document.querySelectorAll(".enemy").forEach(e => {
  //       if (e.src.includes("crab")) e.classList.add("crab-colored");
  //     });
    
  //     muteAll();
  //     clearInterval(countdownTimer);
  //     powerSpawnRate = 2000;
      
  //     const selectedSound = getWeightedRandomSound(power.sounds);
  //     const audio = new Audio(`${power.folder}/${selectedSound.file}`);
  //     document.body.appendChild(audio);
  //     activePowerAudios.push(audio);
  //     audio.play();
      
  //     audio.addEventListener("ended", () => {
  //       if (!gameActive) return;
  //       cleanupAudio(audio);
  //       unmuteAll();
  //       powerSpawnRate = 1000;
  //       isTimerPauseActive = false;
  //       startGameTimer();
  //       document.body.classList.remove("timerpause-active");
  //       document.querySelectorAll(".crab-colored").forEach(e => e.classList.remove("crab-colored"));
  //       powerSpawningStarted = false;
  //       spawnPower();
  //     });
  //   }
  // },
  // {
  //   name: "gento",
  //   folder: "assets/gento",
  //   rarity: 13,
  //   effect: () => {
  //     isGentoActive = true;
  //     muteAll();
  //     const audio = new Audio("assets/gento/sound.mp3");
  //     document.body.appendChild(audio);
  //     activePowerAudios.push(audio);
  //     audio.play();
      
  //     const originalEnemyTypes = [...enemyTypes];
  //     enemyTypes.forEach(type => {
  //       if (type.value > 0) {
  //         type.tempValue = 3;
  //         type.tempFrames = {
  //           frame1: "assets/gento/1.png",
  //           frame2: "assets/gento/2.png"
  //         };
  //       }
  //     });
      
  //     audio.addEventListener("ended", () => {
  //       if (!gameActive) return;
  //       cleanupAudio(audio);
  //       unmuteAll();
  //       enemyTypes.forEach((type, index) => {
  //         if (type.value > 0) {
  //           delete type.tempValue;
  //           delete type.tempFrames;
  //         }
  //       });
  //       isGentoActive = false;
  //       powerSpawningStarted = false;
  //       spawnPower();
  //     });
  //   }
  // },
  // {
  //   name: "bazinga",
  //   folder: "assets/bazinga",
  //   rarity: 24,
  //   effect: function() {
  //     showPowerOverlay('rgba(0, 100, 255, 0.5)');
  //     const audio = new Audio(`${this.folder}/activation.mp3`);
  //     document.body.appendChild(audio);
  //     activePowerAudios.push(audio);
  //     audio.play();
      
  //     const negativeEnemies = document.querySelectorAll('.enemy[data-negative="true"]');
  //     negativeEnemies.forEach((enemy) => {
  //       const rect = enemy.getBoundingClientRect();
  //       const x = rect.left + rect.width/2;
  //       const y = rect.top + rect.height/2;
  //       createElectricityEffect(x, y);
  //       const value = parseInt(enemy.dataset.value);
  //       handleEnemyClick(value);
  //       removeElement(enemy);
  //     });
      
  //     audio.addEventListener("ended", () => {
  //       cleanupAudio(audio);
  //       powerSpawningStarted = false;
  //       spawnPower();
  //     });
  //   }
  // },
  // {
  //   name: "mana",
  //   folder: "assets/mana",
  //   rarity: 24,
  //   effect: function () {
  //     showPowerOverlay('rgba(0, 255, 100, 0.25)');
  //     powerActive = true;
  //     const addedTime = Math.floor(Math.random() * 11) + 5;
  //     timeLeft += addedTime;
  //     timerDisplay.textContent = `${timeLeft}s`;
  //     timerDisplay.classList.add("timer-glow");
  //     setTimeout(() => timerDisplay.classList.remove("timer-glow"), 1000);
  //     const audio = new Audio(`assets/mana/sound.mp3`);
  //     document.body.appendChild(audio);
  //     activePowerAudios.push(audio);
  //     audio.play();
      
  //     audio.addEventListener("ended", () => {
  //       cleanupAudio(audio);
  //       powerActive = false;
  //       powerSpawningStarted = false;
  //       spawnPower();
  //     });
  //   }
  // },
  {
    name: "crimzone",
    folder: "assets/crimzone",
    rarity: 24,
    effect: () => {
      showPowerOverlay('rgba(255, 0, 0, 0.2)');
      powerActive = true;
      isCrimzoneActive = true;
      muteAll();
      activeTimeouts.forEach(timeout => clearTimeout(timeout));
      activeTimeouts = [];
      powerSpawnRate = 17000;

      let totalClearedScore = 0;
      document.querySelectorAll(".enemy").forEach(enemy => {
        const value = parseInt(enemy.dataset.value || 1);
        totalClearedScore += value;
        const rect = enemy.getBoundingClientRect();
        const x = rect.left + rect.width/2;
        const y = rect.top + rect.height/2;
        createRedEffect(x, y);
        removeElement(enemy);
      });
      updateScore(score + totalClearedScore);
      
      const audio = new Audio("assets/crimzone/sound.mp3");
      document.body.appendChild(audio);
      activePowerAudios.push(audio);
      audio.play();

      const crimzoneCrabs = [];

      const spawnCrimzoneCrab = () => {
        if (!gameActive ||!isCrimzoneActive) return;
        
        const crab = document.createElement("img");
        crab.classList.add("enemy", "crimzone-crab");
        crab.dataset.negative = "true";
        crab.dataset.value = "4";
        
        // Crab frames
        const frame1 = "assets/crab/1.png";
        const frame2 = "assets/crab/2.png";
        crab.src = frame1;
        
        // Smaller size for storm crabs
        const size = 80;
        crab.style.width = `${size}px`;
        
        // Starting position: random x at top
        const x = Math.random() * (window.innerWidth - size);
        crab.style.left = `${x}px`;
        crab.style.top = `-${size}px`;
        crab.style.position = "fixed";
        crab.style.zIndex = "10";
        crab.style.pointerEvents = "auto";
        crab.style.cursor = "pointer";
        crab.style.objectFit = "contain";
        crab.style.userSelect = "none";

        
        // Crab animation
        let currentFrame = 0;
        const animInterval = setInterval(() => {
          currentFrame = (currentFrame + 1) % 2;
          crab.src = currentFrame === 0 ? frame1 : frame2;
        }, 200);
        crab.dataset.intervalId = animInterval;
        
        // Movement: straight down at constant speed
        const speed = 8;
        let currentY = -size;
        let frameCount = 0;

        const move = () => {
          if (!document.body.contains(crab) || !isCrimzoneActive) return;
        
          currentY += speed;
          crab.style.top = `${currentY}px`;
        
          // Add red trail
          frameCount++;
          if (frameCount % 3 === 0) {
            const rect = crab.getBoundingClientRect();
            const xTrail = rect.left + rect.width / 5;
            const yTrail = rect.top + rect.height / 5;
            createCrimsonTrail(xTrail, yTrail);
          }

        
          if (currentY > window.innerHeight) {
            removeElement(crab);
          } else {
            requestAnimationFrame(move);
          }
        };
        
        
        
        // Click handler
        crab.addEventListener("click", () => {
          handleEnemyClick(4);
          removeElement(crab);
        });
        
        document.body.appendChild(crab);
        crimzoneCrabs.push(crab);
        move();
      };
      
      // Spawn crabs continuously during audio
      const spawnInterval = setInterval(spawnCrimzoneCrab, 150);
      activeIntervals.push(spawnInterval);
      
      audio.addEventListener("ended", () => {
        if (!gameActive) return;
        clearInterval(spawnInterval);
        document.querySelectorAll(".crimzone-crab").forEach(removeElement);
        unmuteAll();
        powerSpawnRate = 1000;
        isCrimzoneActive = false;
        powerActive = false;
        cleanupAudio(audio);
        powerSpawningStarted = false;
        spawnPower();
        spawnMultipleEnemies();
      });
    }
  },
  {
    name: "sfts",
    folder: "assets/sfts",
    rarity: 18,
    effect: function() {
      isSftsActive = true;
      powerActive = true;
      muteAll();
      activeTimeouts.forEach(timeout => clearTimeout(timeout));
      activeTimeouts = [];
      powerSpawnRate = 17000;
      
      let totalClearedScore = 0;
      document.querySelectorAll(".enemy").forEach(enemy => {
        const value = parseInt(enemy.dataset.value || 1);
        totalClearedScore += value;
        const rect = enemy.getBoundingClientRect();
        const x = rect.left + rect.width/2;
        const y = rect.top + rect.height/2;
        createElectricityEffect(x, y);
        removeElement(enemy);
      });
      updateScore(score + totalClearedScore);
      const audio = new Audio(`${this.folder}/sound.mp3`);
      document.body.appendChild(audio);
      activePowerAudios.push(audio);
      audio.play();
      const sftsCrabs = [];
      const spawnCrab = () => {
        if (!gameActive || !isSftsActive) return;
        const crab = document.createElement("img");
        crab.classList.add("sfts-crab");
        crab.src = `${this.folder}/1.png`;
        Object.assign(crab.style, {
          position: "fixed",
          zIndex: "50",
          width: "100px",
          height: "100px",
          pointerEvents: "auto",
          cursor: "pointer"
        });
        const startX = Math.random() * (window.innerWidth + 200) - 100; 
        const startY = -100;
        const endX = Math.random() * window.innerWidth;
        crab.style.left = `${startX}px`;
        crab.style.top = "-100px";
        let frame1 = `${this.folder}/1.png`;
        let frame2 = `${this.folder}/2.png`;
        let currentFrame = 0;
        const frameInterval = setInterval(() => {
          currentFrame = (currentFrame + 1) % 2;
          crab.src = currentFrame === 0 ? frame1 : frame2;
        }, 200);
        crab.dataset.frameInterval = frameInterval;
        const startTime = Date.now();
        const duration = 3000;
        let frameCount = 0; 
        const animate = () => {
          if (!crab.parentNode || !isSftsActive) return;
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const x = startX + (endX - startX) * progress;
          const y = -100 + (window.innerHeight + 200) * progress;
          const rotation = progress * 360;
          crab.style.left = `${x}px`;
          crab.style.top = `${y}px`;
          crab.style.transform = `rotate(${rotation}deg)`;
          if (frameCount % 3 === 0) createTrailParticle(x, y);
          frameCount++;
          if (progress < 1) requestAnimationFrame(animate);
          else removeElement(crab);
        };
        crab.addEventListener("click", () => {
          handleEnemyClick(5);
          removeElement(crab);
        });
        document.body.appendChild(crab);
        sftsCrabs.push(crab);
        requestAnimationFrame(animate);
      };
      sftsSpawnInterval = setInterval(spawnCrab, 600);
      audio.addEventListener("ended", () => {
        if (!gameActive) return;
        clearInterval(sftsSpawnInterval);
        document.querySelectorAll(".sfts-crab").forEach(removeElement);
        powerSpawnRate = 1000;
        isSftsActive = false;
        powerActive = false;
        unmuteAll();
        cleanupAudio(audio);
        powerSpawningStarted = false;
        spawnPower();
        spawnMultipleEnemies();
      });
    }
  }
];

let username = "";
let score = 0;
let timeLeft = 30;
let countdownTimer;
let powerActive = false;
let lastPowerTime = 0;
const powerCooldown = Math.random() * 2000 + 2000;
let gameActive = false;
let activePowerAudios = [];
let activeTimeouts = [];
let activeIntervals = [];
let isGentoActive = false;
let powerSpawningStarted = false;
let isTimerPauseActive = false;
let powerSpawnRate = 1000;
let isWmianActive = false;
let isSftsActive = false;
let sftsSpawnInterval = null;
let isCrimzoneActive = false;
let scoreSubmitted = false;
let lastScoreSubmissionTime = 0;
const SUBMISSION_COOLDOWN = 60000;

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
  musicPrestart.play().catch(() => {});
  pulseTitle();
});

startBtn.addEventListener("click", handleStartBtn);

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

function handleStartBtn() {
  const name = usernameInput.value.trim();
  if (!name || name.length < 4 || name.length > 15) return;
  username = name.toLowerCase();
  showScreen("countdownScreen");
  musicPrestart.pause();
  musicPrestart.currentTime = 0;
  musicIngame.play();
  score = 0;
  timeLeft = 60;
  gameActive = true;
  updateScore(0);
  timerDisplay.textContent = "60s";
  scoreSubmitted = false;
  const countdownText = document.getElementById("countdownText");
  let count = 3;
  countdownText.textContent = count;
  const countdownInterval = setInterval(() => {
    count--;
    if (count > 0) countdownText.textContent = count;
    else {
      clearInterval(countdownInterval);
      showScreen("gameScreen");
      startGame();
    }
  }, 1000);
}

function startGame() {
  powerSpawningStarted = false;
  spawnMultipleEnemies();
  spawnPower();
  startGameTimer();
}

function startGameTimer() {
  countdownTimer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `${timeLeft}s`;
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function endGame() {
  if (!scoreSubmitted) sendScoreToSheet(score);
  isGentoActive = false;
  isTimerPauseActive = false;
  isWmianActive = false;
  isSftsActive = false;
  isCrimzoneActive = false;
  powerSpawningStarted = false;
  powerActive = false;
  clearInterval(countdownTimer);
  clearAllEnemies();
  clearAllPowerUps();
  clearPowerEffects();
  clearAllTimers();
  resetGameState();
  document.querySelectorAll(".sfts-crab").forEach(removeElement);
  if (sftsSpawnInterval) clearInterval(sftsSpawnInterval);
  musicIngame.volume = 0.3;
  setTimeout(() => {
    musicIngame.pause();
    musicIngame.currentTime = 0;
    musicPrestart.play();
  }, 3000);
  document.body.classList.add("breather");
  setTimeout(() => {
    document.body.classList.remove("breather");
    showScreen("gameOverScreen");
    finalScoreDisplay.textContent = getGameOverMessage(score, username);
    if (gameActive) sendScoreToSheet(score);
    gameActive = false;
  }, 3000);
}

function getGameOverMessage(score, username) {
  const ultimateScoreMessages = [
    `“🔊 BREAKING NEWS: ${username} just obliterated ${score} crabs. SB19 is shookt. 😳”`,
    `“🎤 ‘The Zone cleared, crowd hyped!’ ${username} got ${score} and saved the whole tour!”`,
    `“🛡️ THE ZONE GUARDIAN HAS RISEN. ${username} scored ${score} and crabs are extinct.”`,
    `“🔥 ${username} just performed the real GENTO. ${score} points ng pure destruction.”`,
    `“🚨 SB19 Management is now hiring ${username} as official crab bouncer. ${score} points!”`,
    `“📣 ‘Dun kayooo!’ – you, every second. ${username} scored ${score} in full anti-crab glory.”`,
    `“SB19 canceled crab invasion forever because ${username} cleared The Zone with ${score}.”`,
    `“🦀💥 ${username} just WMIAN’d the universe. Score: ${score}. Crabs are filing complaints.”`,
    `“🏆 Achievement unlocked: ‘Certified Anti-Crab Legend’. ${username} scored ${score}!”`,
  ];
  const highScoreMessages = [
    `“Grabe ka ${username}! You scored ${score}, parang ikaw na ang 6th member ng SB19 anti-crab squad!”`,
    `“Legend ka, ${username}! ${score} crabs down! The Zone is safe (for now).”`,
    `“The Zone cleared! ${username} scored ${score} and saved SB19’s rehearsal!”`,
    `“BOOM! ${username} with ${score} points, crabs ran for their lives!”`,
    `“Josh said ‘DUN KAYO!’ and so did ${username}, with a whopping ${score} score!”`,
    `“Ken is impressed. ${username}, with ${score} points? Pak!”`,
    `“Justin: ‘The Zone secured thanks to ${username} with ${score} hits!’”`,
    `“Pablo is proud. ${username} dropped ${score} points to protect the stage.”`,
    `“Stell: ‘Uy ${username}, salamat ah! ${score} points ka? MVP ka talaga!’”`,
    `“Shet ${username}, ${score}?? Hindi ka na gamer — performer ka na!”`,
    `“Ay grabe... ${username} went full GENTO mode! ${score} points!”`,
    `“Crabs left the chat. ${username} cleared ${score} worth of bad vibes!”`,
    `“With ${score} points, ${username} just made SB19 proud! G ka na for world tour?”`,
    `“The Zone defended like a champ! ${username} racked up ${score} anti-crab points!”`,
    `“Naka-hyper mode ka ba, ${username}? ${score} points! Pak na pak!”`,
    `“Walang crab-crab kay ${username}. ${score} points na agad! 😤”`,
    `“SB19 sa inyo: ‘SALAMAT PO ${username}!’ Dahil sa ${score} points mo.”`,
    `“Hindi ka lang naglaro, ${username} — nag-perform ka rin! ${score} points!”`,
    `“Yung crab, biglang nawala. ${username} came in with ${score} flex!”`,
    `“The Zone is safe… for now. ${username} scored ${score} and we’re impressed.”`,
    `“Kung may concert security, ikaw ang frontline. ${score} points, ${username}!”`,
  ];
  const midScoreMessages = [
    `“Nice try, ${username}! Pero may ilang crab pa rin na tumambling sa stage. Score: ${score}.”`,
    `“Ayos lang ${username}, ${score} crabs down.`,
    `“Not bad, ${username}! ${score} points sa crab clean-up mission.”`,
    `“Okay yung galaw mo, ${username}. ${score} points achieved. Next game ulit!”`,
    `“SB19: ‘Good effort, ${username}!’ You scored ${score}. Practice makes perfect!”`,
  ];
  const lowScoreMessages = [
    `“Oops ${username}, ${score} lang? Parang ikaw yung natawagan ng ‘DUN KAYO’ ah 😅”`,
    `“SB19 tried their best… pero crabs got through. ${username} scored ${score} only.”`,
    `“Crabs: 1. ${username}: ${score}. Better luck next round!”`,
    `“${username} nag-zoning IRL. ${score} points. The Zone NOT secured 😅”`,
  ];
  const negativeScoreMessages = [
    `“Ay! ${username}, SB19 ‘yung kinlick mo 😭 -${Math.abs(score)}? Foul ka dun!”`,
    `“Nooo ${username}! You clicked our boyfriends 😭 Score: ${score}... not good.”`,
    `“${username} accidentally sabotaged SB19’s stage with a score of ${score} 😅”`,
    `“SB19 are friends, not food 😭 ${username} got ${score} for friendly fire!”`,
  ];
   if (score < 0) return negativeScoreMessages[Math.floor(Math.random() * negativeScoreMessages.length)];
  else if (score >= 900) return ultimateScoreMessages[Math.floor(Math.random() * ultimateScoreMessages.length)];
  else if (score >= 300) return highScoreMessages[Math.floor(Math.random() * highScoreMessages.length)];
  else if (score >= 100) return midScoreMessages[Math.floor(Math.random() * midScoreMessages.length)];
  else return lowScoreMessages[Math.floor(Math.random() * lowScoreMessages.length)];
}

function clearPowerEffects() {
  isWmianActive = false;
  isGentoActive = false;
  isSftsActive = false;
  isCrimzoneActive = false;
  activePowerAudios.forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
    if (audio.parentNode) audio.parentNode.removeChild(audio);
  });
  activePowerAudios = [];
  document.getElementById("power-overlay").style.display = "none";
  unmuteAll();
  enemyTypes.forEach(type => {
    if (type.tempValue) delete type.tempValue;
    if (type.tempFrames) delete type.tempFrames;
  });
  powerActive = false;
}

function spawnMultipleEnemies() {
  if (!gameActive) return;
  const numEnemies = Math.floor(Math.random() * 4) + 2;
  for (let i = 0; i < numEnemies; i++) {
    const enemyData = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    createEnemy(enemyData);
  }
  if (gameActive && timeLeft > 0) {
    const timeoutId = setTimeout(spawnMultipleEnemies, powerSpawnRate);
    activeTimeouts.push(timeoutId);
  }
}

function createEnemy(enemyData) {
  const isNegative = enemyData.value > 0;
  const enemy = document.createElement("img");
  enemy.classList.add("enemy");
  if (isTimerPauseActive && isNegative) enemy.classList.add("crab-colored");
  if (enemyData.label === "PARTY CRAB") enemy.classList.add("big-crab");
  let frame1, frame2, soundPath;
  if (isNegative && enemyData.tempFrames) {
    frame1 = enemyData.tempFrames.frame1;
    frame2 = enemyData.tempFrames.frame2;
    soundPath = "assets/gento/click.mp3";
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
  if (enemyData.label === "PARTY CRAB") soundPath = "assets/wmian/click.mp3";
  const sound = soundPath ? new Audio(soundPath) : null;
  enemy.src = frame1;
  enemy.alt = enemyData.label;
  enemy.title = enemyData.label;
  enemy.dataset.negative = (enemyData.value > 0).toString();
  enemy.dataset.value = enemyData.value;
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
  let currentFrame = 0;
  const animationInterval = setInterval(() => {
    currentFrame = (currentFrame + 1) % 2;
    enemy.src = currentFrame === 0 ? frame1 : frame2;
  }, 300);
  enemy.dataset.intervalId = animationInterval;
  function removeEnemy() {
    removeElement(enemy);
  }
  function handleClick() {
    let value = enemyData.tempValue || enemyData.value;
    if (isTimerPauseActive && value > 0) value = 2;
    handleEnemyClick(value);
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
  if (!isNegative) setTimeout(removeEnemy, Math.random() * 2000 + 4000);
}

function spawnPower() {
  if (!gameActive) return;
  const initialDelay = Math.random() * 2000 + 1000; 
  if (!powerSpawningStarted) {
    powerSpawningStarted = true;
    const timeoutId = setTimeout(() => {
      if (gameActive && !powerActive) spawnPower();
      else setTimeout(spawnPower, 500);
    }, initialDelay);
    activeTimeouts.push(timeoutId);
    return;
  }
  const now = Date.now();
  if (powerActive || timeLeft <= 0 || now - lastPowerTime < powerCooldown) {
    setTimeout(spawnPower, 300);
    return;
  }
  powerActive = true;
  lastPowerTime = now;
  const power = chooseWeightedPower();
  const powerImg = document.createElement("img");
  const frame1 = `${power.folder}/power1.png`;
  const frame2 = `${power.folder}/power2.png`;
  let currentFrame = 0;
  powerImg.src = frame1;
  powerImg.classList.add("power");
  powerImg.alt = power.name;
  powerImg.title = power.name;
  const size = 100;
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
  powerImg.dataset.intervalId = animInterval;
  function removePower() {
    removeElement(powerImg);
    powerActive = false;
  }
  function handleClick() {
    power.effect();
    removePower();
  }
  powerImg.addEventListener("click", handleClick);
  powerImg.addEventListener("touchstart", handleClick);
  document.body.appendChild(powerImg);
  setTimeout(() => {
    if (!gameActive) return;
    if (document.body.contains(powerImg)) {
      removePower();
      setTimeout(spawnPower, powerCooldown);
    }
  }, 1000);
}

function chooseWeightedPower() {
  const totalWeight = powers.reduce((sum, p) => sum + p.rarity, 0);
  const rand = Math.random() * totalWeight;
  let acc = 0;
  for (let power of powers) {
    acc += power.rarity;
    if (rand < acc) return power;
  }
  return powers[0];
}

function spawnBigWmianCrab() {
  const big = document.createElement("img");
  big.src = "assets/wmian/1.png";
  big.classList.add("enemy", "big-crab");
  const size = 160;
  const padding = 200;
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
    removeElement(big);
    const clickSound = new Audio("assets/wmian/click.mp3");
    clickSound.play();
    score += 20;
    updateScore(score);
    scoreDisplay.classList.add("green-glow");
    setTimeout(() => scoreDisplay.classList.remove("green-glow"), 200);
    createExplosionEffect(centerX, centerY);
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
  document.querySelectorAll(".power").forEach(removeElement);
}

function clearAllTimers() {
  activeTimeouts.forEach(timeout => clearTimeout(timeout));
  activeIntervals.forEach(interval => clearInterval(interval));
  activeTimeouts = [];
  activeIntervals = [];
  clearInterval(countdownTimer);
}

function resetGameState() {
  isGentoActive = false;
  isTimerPauseActive = false;
  isWmianActive = false;
  isSftsActive = false;
  isCrimzoneActive = false;
  powerActive = false;
  powerSpawningStarted = false;
  powerSpawnRate = 1000;
  if (sftsSpawnInterval) {
    clearInterval(sftsSpawnInterval);
    sftsSpawnInterval = null;
  }
  clearAllEnemies();
  clearAllPowerUps();
  clearPowerEffects();
}

function getWeightedRandomSound(sounds) {
  const totalWeight = sounds.reduce((sum, sound) => sum + sound.weight, 0);
  const random = Math.random() * totalWeight;
  let currentWeight = 0;
  for (const sound of sounds) {
    currentWeight += sound.weight;
    if (random <= currentWeight) return sound;
  }
  return sounds[sounds.length - 1];
}

let scoreFadeTimeout;
function updateScore(newScore) {
  score = newScore;
  scoreDisplay.textContent = `${score}`;
  scoreDisplay.style.opacity = 1;
  const hadPositiveGlow = scoreDisplay.classList.contains("positive-glow");
  const hadNegativeGlow = scoreDisplay.classList.contains("negative-glow");
  clearTimeout(scoreFadeTimeout);
  scoreFadeTimeout = setTimeout(() => scoreDisplay.style.opacity = 0.3, 1000);
  scoreDisplay.classList.add("bump");
  setTimeout(() => {
    scoreDisplay.classList.remove("bump");
    if (hadPositiveGlow) scoreDisplay.classList.add("positive-glow");
    if (hadNegativeGlow) scoreDisplay.classList.add("negative-glow");
  }, 200);
}

function handleEnemyClick(value) {
  scoreDisplay.classList.remove("positive-glow", "negative-glow");
  if (value < 0) scoreDisplay.classList.add("positive-glow");
  else scoreDisplay.classList.add("negative-glow");
  updateScore(score + value);
  setTimeout(() => scoreDisplay.classList.remove("positive-glow", "negative-glow"), 200);
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
  effect.style.animation = "electricityFlash 0.8s ease-out forwards";
  setTimeout(() => removeElement(effect), 800);
}

function createRedEffect(x, y) {
  const effect = document.createElement("div");
  effect.className = "redsplash";
  effect.style.left = `${x}px`;
  effect.style.top = `${y}px`;
  document.body.appendChild(effect);
  effect.style.animation = "electricityFlash 0.8s ease-out forwards";
  setTimeout(() => removeElement(effect), 800);
}

function muteAll() {
  document.querySelectorAll("audio").forEach(audio => audio.muted = true);
}

function unmuteAll() {
  document.querySelectorAll("audio").forEach(audio => audio.muted = false);
}

function showPowerOverlay(color = 'rgba(255, 255, 0, 0.25)') {
  const overlay = document.getElementById("power-overlay");
  overlay.style.background = color;
  overlay.style.display = "block";
  overlay.style.animation = "flash 0.3s ease-out forwards";
  if (color.includes('255, 255')) document.body.classList.add("timerpause-active");
  setTimeout(() => {
    overlay.style.display = "none";
    document.body.classList.remove("timerpause-active");
  }, 300);
}

function clearAllEnemies() {
  document.querySelectorAll(".enemy").forEach(removeElement);
  activeTimeouts = activeTimeouts.filter(id => {
    try { clearTimeout(id); return false; } catch { return true; }
  });
}

function createExplosionEffect(x, y) {
  const explosion = document.createElement("div");
  explosion.className = "explosion";
  explosion.style.left = `${x}px`;
  explosion.style.top = `${y}px`;
  document.body.appendChild(explosion);
  explosion.style.animation = "explosionScale 0.8s ease-out forwards";
  setTimeout(() => removeElement(explosion), 800);
}

function createTrailParticle(x, y) {
  const particle = document.createElement('div');
  particle.className = 'trail-particle';
  particle.style.left = `${x}px`;
  particle.style.top = `${y}px`;
  document.body.appendChild(particle);
  setTimeout(() => removeElement(particle), 1000);
}

function createCrimsonTrail(x, y) {
  const trail = document.createElement("div");
  trail.className = "crimson-trail";
  trail.style.left = `${x}px`;
  trail.style.top = `${y}px`;
  document.body.appendChild(trail);
  setTimeout(() => {
    trail.remove();
  }, 600);
}


function createClickSplash(x, y) {
  const splash = document.createElement("div");
  splash.classList.add("splash");
  if (isGentoActive) {
    splash.style.background = "radial-gradient(circle, rgba(255,215,0,0.8) 0%, rgba(255,165,0,0.4) 70%, transparent 100%)";
    splash.style.boxShadow = "0 0 20px 10px gold";
  } else splash.style.background = "rgba(255, 255, 255, 0.6)";
  splash.style.left = x;
  splash.style.top = y;
  document.body.appendChild(splash);
  splash.style.animation = "splashScale 0.6s ease-out forwards";
  setTimeout(() => removeElement(splash), 600);
}

const devtoolsCheck = () => {
  try {
    const threshold = 100;
    devtoolsOpen = (
      Math.abs(window.outerWidth - window.innerWidth) > threshold ||
      Math.abs(window.outerHeight - window.innerHeight) > threshold ||
      window.Firebug?.firebugEnabled
    );
  } catch {}
};
setInterval(devtoolsCheck, 500);

function sendScoreToSheet(score) {
  const devtoolsNow = (() => {
    try {
      const threshold = 160;
      return (
        Math.abs(window.outerWidth - window.innerWidth) > threshold ||
        Math.abs(window.outerHeight - window.innerHeight) > threshold
      );
    } catch { return false; }
  })();
  const now = Date.now();
  if (scoreSubmitted) return;
  if (now - lastScoreSubmissionTime < SUBMISSION_COOLDOWN) return;
  scoreSubmitted = true;
  lastScoreSubmissionTime = now;
  fetch("https://script.google.com/macros/s/AKfycbwWhP0Lg2xeZNnvmrGEO6fkWF-XyDIjts0t7NRHWrtCIhBvXFuxGos4TYIEWcOJNDnt/exec", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `score=${score}&username=${encodeURIComponent(username)}&devtools=${devtoolsOpen ? 'yes' : 'no'}`
  });
}

restartBtn.addEventListener("click", () => {
  scoreSubmitted = false;
  isGentoActive = false;
  isTimerPauseActive = false;
  isWmianActive = false;
  isSftsActive = false;
  powerSpawningStarted = false;
  powerActive = false;
  clearInterval(countdownTimer);
  clearAllEnemies();
  clearAllPowerUps();
  clearPowerEffects();
  clearAllTimers();
  resetGameState();
  document.querySelectorAll(".sfts-crab").forEach(removeElement);
  if (sftsSpawnInterval) clearInterval(sftsSpawnInterval);
  showScreen("gameScreen");
  score = 0;
  timeLeft = 60;
  gameActive = true;
  handleStartBtn();
});

returnToTitleBtn.addEventListener("click", () => showScreen("titleScreen"));

document.addEventListener('contextmenu', e => e.preventDefault());
window.addEventListener('keydown', e => {
  if (
    e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '=') ||
    e.key === 'F12' ||
    (e.ctrlKey && e.shiftKey && ['I', 'J', 'U'].includes(e.key.toUpperCase())) ||
    (e.ctrlKey && e.key === 'U')
  ) e.preventDefault();
});
window.addEventListener('wheel', e => { if (e.ctrlKey) e.preventDefault(); }, { passive: false });
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('gesturechange', e => e.preventDefault());
document.addEventListener('gestureend', e => e.preventDefault());
document.querySelectorAll('img').forEach(img => img.addEventListener('dragstart', e => e.preventDefault()));

const leaderboardScreen = document.getElementById("leaderboardScreen");
const viewLeaderboardBtn = document.getElementById("viewLeaderboardBtn");
const backFromLeaderboardBtn = document.getElementById("backFromLeaderboardBtn");
const leaderboardList = document.getElementById("leaderboardList");

viewLeaderboardBtn.addEventListener("click", () => {
  showScreen("leaderboardScreen");
  loadLeaderboard();
});
backFromLeaderboardBtn.addEventListener("click", () => showScreen("gameOverScreen"));

function loadLeaderboard() {
  const leaderboardBody = document.getElementById('leaderboardBody');
  const requestedUsername = username;
  leaderboardBody.innerHTML = '<tr><td colspan="3"><div class="loading-spinner"></div></td></tr>';
  fetch(`https://script.google.com/macros/s/AKfycbwWhP0Lg2xeZNnvmrGEO6fkWF-XyDIjts0t7NRHWrtCIhBvXFuxGos4TYIEWcOJNDnt/exec?username=${encodeURIComponent(requestedUsername.toLowerCase())}`)
    .then(res => res.json())
    .then(data => {
      const top5 = data.top5 || [];
      const userHighScore = data.userHighScore || 0;
      let userRank = data.userRank || "Unranked";
      leaderboardBody.innerHTML = '';
      top5.forEach((entry, i) => {
        const row = document.createElement('tr');
        if (i === 0) row.classList.add('first-place');
        else if (i === 1) row.classList.add('second-place');
        else if (i === 2) row.classList.add('third-place');
        row.innerHTML = `<td>${entry.rank}</td><td><strong>${entry.username}</strong></td><td>${entry.score}</td>`;
        leaderboardBody.appendChild(row);
      });
      const separator = document.createElement('tr');
      separator.innerHTML = '<td colspan="3" style="height: 20px; background: transparent; border-bottom: 1px dashed #444;"></td>';
      leaderboardBody.appendChild(separator);
      const currentScoreRow = document.createElement('tr');
      currentScoreRow.classList.add('current-user');
      currentScoreRow.innerHTML = `<td>${userRank}</td><td><strong>${username}</strong></td><td>${userHighScore}</td>`;
      leaderboardBody.appendChild(currentScoreRow);
      const highScoreRow = document.createElement('tr');
      highScoreRow.classList.add('current-user');
      highScoreRow.innerHTML = `<td></td><td><strong>Current Score</strong></td><td>${score}</td>`;
      leaderboardBody.appendChild(highScoreRow);
    })
    .catch(err => {
      leaderboardBody.innerHTML = '<tr><td colspan="3">Error loading leaderboard</td></tr>';
    });
}

function removeElement(element) {
  if (element.dataset.intervalId) clearInterval(parseInt(element.dataset.intervalId));
  if (element.parentNode) element.parentNode.removeChild(element);
}

function cleanupAudio(audio) {
  audio.remove();
  const index = activePowerAudios.indexOf(audio);
  if (index > -1) activePowerAudios.splice(index, 1);
}