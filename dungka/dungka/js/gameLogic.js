import { gameState } from './gameState.js';
import { enemyTypes, powers, POWER_INTERACTION_THRESHOLD, SUBMISSION_COOLDOWN } from './constants.js';
import * as ui from './ui.js';

/**
 * Contains the core game logic, including starting/ending the game,
 * the main timer loop, enemy and power-up spawning, and handling player interactions.
 */

// --- Constants ---
const musicPrestart = document.getElementById("music-prestart");
const musicIngame = document.getElementById("music-ingame");
export const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// --- Game Flow ---

export function initializeGame() {
    const name = ui.usernameInput.value.trim();
    if (!name || name.length < 4 || name.length > 15) {
        alert("Username must be 4 to 15 characters.");
        return;
    }
    gameState.username = name.toLowerCase();
    ui.showScreen("countdownScreen");

    musicPrestart.pause();
    musicPrestart.currentTime = 0;
    musicIngame.play();

    // Reset core state properties
    gameState.score = 0;
    gameState.timeLeft = 60;
    gameState.gameActive = true;
    gameState.scoreSubmitted = false;
    
    resetGameState(); // Resets flags, timers, and other dynamic properties

    ui.updateScore(0);
    ui.timerDisplay.textContent = "60s";

    const countdownText = document.getElementById("countdownText");
    let count = 3;
    countdownText.textContent = count;
    const countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            countdownText.textContent = count;
        } else {
            clearInterval(countdownInterval);
            ui.showScreen("gameScreen");
            startGame();
        }
    }, 1000);
}

function startGame() {
    gameState.gameStartTime = Date.now();
    gameState.powerSpawningStarted = false;
    spawnMultipleEnemies();
    spawnPower();
    startGameTimer();
}

export function startGameTimer() {
    clearInterval(gameState.countdownTimer);
    if (!gameState.gameActive || gameState.timeLeft <= 0) return;
    gameState.countdownTimer = setInterval(() => {
        gameState.timeLeft--;
        ui.timerDisplay.textContent = `${gameState.timeLeft}s`;
        if (gameState.timeLeft <= 0) endGame();
    }, gameState.timerInterval);
}

export function endGame() {
    if (!gameState.scoreSubmitted) sendScoreToSheet();
    
    gameState.gameActive = false;
    resetGameState();

    musicIngame.volume = 0.3;
    setTimeout(() => {
        musicIngame.pause();
        musicIngame.currentTime = 0;
        musicPrestart.play();
    }, 3000);

    document.body.classList.add("breather");
    setTimeout(() => {
        document.body.classList.remove("breather");
        ui.showScreen("gameOverScreen");
        ui.finalScoreDisplay.textContent = ui.getGameOverMessage();
    }, 3000);
}

export function resetGameState() {
    // Reset all active flags
    gameState.isGentoActive = false;
    gameState.eightTonActive = false;
    gameState.ballCanBounce = false;
    gameState.isTimerPauseActive = false;
    gameState.isWmianActive = false;
    gameState.isSftsActive = false;
    gameState.wyatActive = false;
    gameState.isCrimzoneActive = false;
    gameState.whatActive = false;
    gameState.powerActive = false;
    gameState.powerSpawningStarted = false;
    
    // Reset rates and intervals
    gameState.powerSpawnRate = 1000;
    gameState.timerInterval = 1000;
    if (gameState.sftsSpawnInterval) {
        clearInterval(gameState.sftsSpawnInterval);
        gameState.sftsSpawnInterval = null;
    }

    // Clear logs and timers
    gameState.powerUsageLog = { shown: {}, activated: {} };
    clearAllTimers();
    clearAllEnemies();
    clearAllPowerUps();
    clearPowerEffects();
}

// --- Player Interaction ---

export function handleEnemyClick(value) {
    ui.applyScoreGlow(value < 0);
    ui.updateScore(gameState.score + value);
}

// --- Spawning Logic ---

export function spawnMultipleEnemies() {
    if (!gameState.gameActive) return;
    const numEnemies = Math.floor(Math.random() * 4) + 2;
    for (let i = 0; i < numEnemies; i++) {
        const enemyData = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        createEnemy(enemyData);
    }
    if (gameState.gameActive && gameState.timeLeft > 0) {
        const timeoutId = setTimeout(spawnMultipleEnemies, gameState.powerSpawnRate);
        gameState.activeTimeouts.push(timeoutId);
    }
}

export function createEnemy(enemyData) {
    const isNegative = enemyData.value > 0;
    const enemy = document.createElement("img");
    enemy.classList.add("enemy");
    if (gameState.isTimerPauseActive && isNegative) enemy.classList.add("crab-colored");

    let frame1, frame2;
    if (gameState.isGentoActive && isNegative) {
        frame1 = "assets/gento/1.png";
        frame2 = "assets/gento/2.png";
    } else if (isNegative) {
        frame1 = "assets/crab/1.png";
        frame2 = "assets/crab/2.png";
    } else {
        const randIndex = Math.floor(Math.random() * 5) + 1;
        frame1 = `assets/sb${randIndex}/1.png`;
        frame2 = `assets/sb${randIndex}/2.png`;
    }
    
    enemy.src = frame1;
    enemy.dataset.negative = isNegative.toString();
    enemy.dataset.value = enemyData.value;
    const size = 100;
    const x = Math.random() * (window.innerWidth - size);
    const y = Math.random() * (window.innerHeight - size);
    Object.assign(enemy.style, { left: `${x}px`, top: `${y}px`, width: `${size}px`, position: "absolute", cursor: "pointer", zIndex: "10" });

    let currentFrame = 0;
    const animationInterval = setInterval(() => {
        currentFrame = (currentFrame + 1) % 2;
        enemy.src = currentFrame === 0 ? frame1 : frame2;
    }, 300);
    enemy.dataset.intervalId = animationInterval;

    enemy.addEventListener("click", () => {
        let value = enemyData.value;
        if (gameState.isGentoActive && isNegative) value = 3;
        if (gameState.isTimerPauseActive && isNegative) value = 3;
        if (gameState.eightTonActive && !isNegative) value = 8;
        handleEnemyClick(value);
        ui.createClickSplash(enemy.style.left, enemy.style.top);
        ui.removeElement(enemy);
    });

    document.body.appendChild(enemy);
    if (!isNegative) {
        setTimeout(() => ui.removeElement(enemy), 4000);
    }
}

export function spawnPower() {
    if (!gameState.gameActive) return;
    const powerSpawnTime = Date.now();
    const timeSinceLastInteraction = powerSpawnTime - gameState.lastPowerInteractionTime;
    const powerCooldown = Math.random() * 2000 + 2000;

    const initialDelay = timeSinceLastInteraction > POWER_INTERACTION_THRESHOLD 
        ? Math.random() * 2000 + 1000 
        : Math.random() * 500 + 500;

    if (!gameState.powerSpawningStarted) {
        gameState.powerSpawningStarted = true;
        const timeoutId = setTimeout(() => {
            if (gameState.gameActive && !gameState.powerActive) spawnPower();
            else setTimeout(spawnPower, 500);
        }, initialDelay);
        gameState.activeTimeouts.push(timeoutId);
        return;
    }

    if (gameState.powerActive || gameState.timeLeft <= 0 || powerSpawnTime - gameState.lastPowerTime < powerCooldown) {
        setTimeout(spawnPower, 300);
        return;
    }

    gameState.powerActive = true;
    gameState.lastPowerTime = powerSpawnTime;

    const quitPower = powers.find(p => p.name === "quit" && p.canSpawn && p.canSpawn());
    let power = quitPower || chooseWeightedPower();

    if (!power) {
        gameState.powerActive = false;
        setTimeout(spawnPower, powerCooldown);
        return;
    }

    gameState.powerUsageLog.shown[power.name] = (gameState.powerUsageLog.shown[power.name] || 0) + 1;
    const powerImg = document.createElement("img");
    const frame1 = `${power.folder}/power1.png`;
    const frame2 = `${power.folder}/power2.png`;
    powerImg.src = frame1;
    powerImg.classList.add("power");
    const size = 100;
    const x = Math.random() * (window.innerWidth - size);
    const y = Math.random() * (window.innerHeight - size);
    Object.assign(powerImg.style, { left: `${x}px`, top: `${y}px`, width: `${size}px`, position: "absolute", cursor: "pointer", zIndex: "15" });
    
    let currentFrame = 0;
    const animInterval = setInterval(() => {
        currentFrame = (currentFrame + 1) % 2;
        powerImg.src = currentFrame === 0 ? frame1 : frame2;
    }, 300);
    powerImg.dataset.intervalId = animInterval;

    const handleClick = () => {
        powerImg.removeEventListener("click", handleClick);
        gameState.lastPowerInteractionTime = Date.now();
        const rect = powerImg.getBoundingClientRect();
        ui.createPowerSplash(rect.left + rect.width / 2, rect.top + rect.height / 2);
        power.effect();
        ui.removeElement(powerImg);
        gameState.powerActive = false;
    };

    powerImg.addEventListener("click", handleClick);
    document.body.appendChild(powerImg);

    setTimeout(() => {
        if (document.body.contains(powerImg)) {
            ui.removeElement(powerImg);
            gameState.powerActive = false;
            setTimeout(spawnPower, powerCooldown);
        }
    }, 1000);
}

export function spawnBigWmianCrab(allWmianCrabs) {
    // This function remains largely the same but uses ui.removeElement and handleEnemyClick
    const crab = document.createElement("img");
    crab.classList.add("enemy", "big-crab");
    crab.src = "assets/wmian/1.png";
    const size = 150;
    let x = Math.random() * (window.innerWidth - size);
    let y = Math.random() * (window.innerHeight - size);
    Object.assign(crab.style, { position: "absolute", left: `${x}px`, top: `${y}px`, width: `${size}px`, zIndex: "20" });
    
    // Animation and movement intervals...
    crab.addEventListener("click", () => {
        handleEnemyClick(20);
        // Spawning smaller crabs...
        ui.removeElement(crab);
    });
    document.body.appendChild(crab);
    return crab;
}

export function forceRemoveWyatQuietly(wyatCrab, popInterval, autoEndTimeout) {
    clearInterval(popInterval);
    clearTimeout(autoEndTimeout);
    gameState.wyatActive = false;
    if (document.body.contains(wyatCrab)) {
        if (wyatCrab.dataset.animInterval) {
            clearInterval(parseInt(wyatCrab.dataset.animInterval));
        }
        wyatCrab.cleanupWyat = null;
        document.body.removeChild(wyatCrab);
    }
}


// --- Utility and Cleanup ---

function chooseWeightedPower() {
    const availablePowers = powers.filter(p => p.name !== "wmian" && (!p.canSpawn || p.canSpawn()));
    if (availablePowers.length === 0) return null;

    const totalWeight = availablePowers.reduce((sum, p) => sum + p.rarity, 0);
    const rand = Math.random() * totalWeight;
    let acc = 0;
    for (const power of availablePowers) {
        acc += power.rarity;
        if (rand < acc) return power;
    }
    return availablePowers[0];
}

export function getWeightedRandomSound(sounds) {
    const totalWeight = sounds.reduce((sum, sound) => sum + sound.weight, 0);
    const random = Math.random() * totalWeight;
    let currentWeight = 0;
    for (const sound of sounds) {
        currentWeight += sound.weight;
        if (random <= currentWeight) return sound;
    }
    return sounds[sounds.length - 1];
}

function clearAllEnemies() {
    document.querySelectorAll(".enemy").forEach(ui.removeElement);
}

function clearAllPowerUps() {
    document.querySelectorAll(".power").forEach(ui.removeElement);
}

function clearPowerEffects() {
    gameState.activePowerAudios.forEach(ui.cleanupAudio);
    gameState.activePowerAudios = [];
    document.getElementById("power-overlay").style.display = "none";
    ui.unmuteAll();
}

function clearAllTimers() {
    gameState.activeTimeouts.forEach(clearTimeout);
    gameState.activeIntervals.forEach(clearInterval);
    gameState.activeTimeouts = [];
    gameState.activeIntervals = [];
    clearInterval(gameState.countdownTimer);
}

// --- Data Submission ---

function sendScoreToSheet() {
    const now = Date.now();
    if (gameState.scoreSubmitted || now - gameState.lastScoreSubmissionTime < SUBMISSION_COOLDOWN) {
        return;
    }
    gameState.scoreSubmitted = true;
    gameState.lastScoreSubmissionTime = now;

    const gameDurationSeconds = Math.floor((now - gameState.gameStartTime) / 1000);
    const payload = new URLSearchParams();
    payload.append("score", gameState.score);
    payload.append("username", gameState.username);
    payload.append("powers_shown", JSON.stringify(gameState.powerUsageLog.shown));
    payload.append("powers_activated", JSON.stringify(gameState.powerUsageLog.activated));
    payload.append("game_duration", gameDurationSeconds);
    
    fetch("https://script.google.com/macros/s/AKfycbwWhP0Lg2xeZNnvmrGEO6fkWF-XyDIjts0t7NRHWrtCIhBvXFuxGos4TYIEWcOJNDnt/exec", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: payload.toString()
    });
}
