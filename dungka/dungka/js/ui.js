import { gameState } from './gameState.js';

/**
 * Manages all DOM interactions, UI updates, and visual/audio effects.
 * This module keeps the game logic separate from the presentation layer.
 */

// --- Cached DOM Elements ---
export const scoreDisplay = document.getElementById("score");
export const timerDisplay = document.getElementById("timer");
export const finalScoreDisplay = document.getElementById("finalScore");
export const usernameInput = document.getElementById("usernameInput");
export const leaderboardBody = document.getElementById("leaderboardBody");

let scoreFadeTimeout;

// --- UI Update Functions ---

export function showScreen(screenId) {
    document.querySelectorAll(".screen").forEach((screen) => screen.classList.remove("active"));
    document.getElementById(screenId).classList.add("active");
}

export function updateScore(newScore) {
    gameState.score = newScore;
    scoreDisplay.textContent = `${gameState.score}`;
    scoreDisplay.style.opacity = 1;

    clearTimeout(scoreFadeTimeout);
    scoreFadeTimeout = setTimeout(() => (scoreDisplay.style.opacity = 0.3), 1000);

    scoreDisplay.classList.add("bump");
    setTimeout(() => scoreDisplay.classList.remove("bump"), 200);
}

export function applyScoreGlow(isPositive) {
    const positiveClass = "positive-glow";
    const negativeClass = "negative-glow";
    scoreDisplay.classList.remove(positiveClass, negativeClass);
    scoreDisplay.classList.add(isPositive ? positiveClass : negativeClass);
    setTimeout(() => scoreDisplay.classList.remove(positiveClass, negativeClass), 200);
}

export function pulseTitle() {
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

// --- Audio Functions ---

export function muteAll() {
    document.querySelectorAll("audio").forEach((audio) => (audio.muted = true));
}

export function unmuteAll() {
    document.querySelectorAll("audio").forEach((audio) => (audio.muted = false));
}

export function cleanupAudio(audio) {
    if (audio) {
        audio.remove();
        const index = gameState.activePowerAudios.indexOf(audio);
        if (index > -1) gameState.activePowerAudios.splice(index, 1);
    }
}

// --- Element Management ---

export function removeElement(element) {
    if (element && element.parentNode) {
        if (element.classList.contains("wyat-crab") && typeof element.cleanupWyat === "function") {
            element.cleanupWyat();
        }
        if (element.dataset.animInterval) {
            clearInterval(parseInt(element.dataset.animInterval));
        }
        if (element.dataset.intervalId) {
            clearInterval(parseInt(element.dataset.intervalId));
        }
        element.parentNode.removeChild(element);
    }
}

// --- Visual Effects ---

export function createElectricityEffect(x, y) {
    const effect = document.createElement("div");
    effect.className = "electricity";
    effect.style.left = `${x}px`;
    effect.style.top = `${y}px`;
    document.body.appendChild(effect);
    effect.style.animation = "electricityFlash 0.8s ease-out forwards";
    setTimeout(() => removeElement(effect), 800);
}

export function createRedEffect(x, y) {
    const effect = document.createElement("div");
    effect.className = "redsplash";
    effect.style.left = `${x}px`;
    effect.style.top = `${y}px`;
    document.body.appendChild(effect);
    effect.style.animation = "electricityFlash 0.8s ease-out forwards";
    setTimeout(() => removeElement(effect), 800);
}

export function createWhatHeartSplash(x, y) {
    const splash = document.createElement("div");
    splash.classList.add("what-heart-splash");
    splash.style.left = typeof x === "number" ? `${x}px` : x;
    splash.style.top = typeof y === "number" ? `${y}px` : y;
    document.body.appendChild(splash);
    setTimeout(() => splash.remove(), 600);
}

export function createPowerSplash(x, y) {
    const splash = document.createElement("div");
    splash.classList.add("power-splash");
    splash.style.left = typeof x === "number" ? `${x}px` : x;
    splash.style.top = typeof y === "number" ? `${y}px` : y;
    document.body.appendChild(splash);
    setTimeout(() => splash.remove(), 600);
}

export function createTrailParticle(x, y) {
    const particle = document.createElement("div");
    particle.className = "trail-particle";
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    document.body.appendChild(particle);
    setTimeout(() => removeElement(particle), 1000);
}

export function createCrimsonTrail(x, y) {
    const trail = document.createElement("div");
    trail.className = "crimson-trail";
    trail.style.left = `${x}px`;
    trail.style.top = `${y}px`;
    document.body.appendChild(trail);
    setTimeout(() => trail.remove(), 600);
}

export function createClickSplash(x, y) {
    const splash = document.createElement("div");
    splash.classList.add("splash");
    if (gameState.isGentoActive) {
        splash.style.background = "radial-gradient(circle, rgba(255,215,0,0.8) 0%, rgba(255,165,0,0.4) 70%, transparent 100%)";
        splash.style.boxShadow = "0 0 20px 10px gold";
    } else if (gameState.eightTonActive) {
        splash.style.background = "radial-gradient(circle, rgba(0, 255, 200, 1) 0%, rgba(0, 180, 255, 0.7) 70%, transparent 100%)";
        splash.style.boxShadow = "0 0 20px 10px rgba(0, 255, 200, 1)";
    } else {
        splash.style.background = "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(200,200,200,0.4) 70%, transparent 100%)";
        splash.style.boxShadow = "0 0 10px rgba(255,255,255,0.6)";
    }
    splash.style.left = x;
    splash.style.top = y;
    document.body.appendChild(splash);
    splash.style.animation = "splashScale 0.6s ease-out forwards";
    setTimeout(() => removeElement(splash), 600);
}

export function createWYATSplash(x, y) {
    const splash = document.createElement("div");
    splash.classList.add("splash");
    splash.style.background = `radial-gradient(circle, rgba(0, 255, 255, 0.8) 0%, rgba(0, 128, 255, 0.4) 60%, transparent 100%)`;
    splash.style.boxShadow = `0 0 8px #0ff, 0 0 20px #0ff, 0 0 30px #0ff, 0 0 40px #00f`;
    splash.style.filter = "contrast(150%) saturate(120%)";
    splash.style.position = "absolute";
    splash.style.left = x + "px";
    splash.style.top = y + "px";
    splash.style.width = "150px";
    splash.style.height = "150px";
    splash.style.borderRadius = "8px";
    splash.style.border = "2px solid #0ff";
    document.body.appendChild(splash);
    splash.style.animation = "retroRewind 0.6s ease-out forwards";
    setTimeout(() => splash.remove(), 600);
}

// --- Game Over and Leaderboard ---

export function getGameOverMessage() {
    const score = gameState.score;
    const username = gameState.username;
    const ultimateScoreMessages = [
      `“🔊 BREAKING NEWS: ${username} just obliterated ${score} crabs. SB19 is shookt. 😳”`,
      `“🎤 ‘The Zone cleared, crowd hyped!’ ${username} got ${score} and saved the whole tour!”`,
      `“🛡️ THE ZONE GUARDIAN HAS RISEN. ${username} scored ${score} and crabs are extinct.”`,
      `“🔥 ${username} just performed the real GENTO. ${score} points ng pure destruction.”`,
      `“🚨 SB19 Management is now hiring ${username} as official crab bouncer. ${score} points!”`,
    ];
    const highScoreMessages = [
      `“Grabe ka ${username}! You scored ${score}, parang ikaw na ang 6th member ng SB19 anti-crab squad!”`,
      `“Legend ka, ${username}! ${score} crabs down! The Zone is safe (for now).”`,
      `“The Zone cleared! ${username} scored ${score} and saved SB19’s rehearsal!”`,
    ];
    const midScoreMessages = [
      `“Nice try, ${username}! Pero may ilang crab pa rin na tumambling sa stage. Score: ${score}.”`,
      `“Not bad, ${username}! ${score} points sa crab clean-up mission.”`,
    ];
    const lowScoreMessages = [
      `“Oops ${username}, ${score} lang? Parang ikaw yung natawagan ng ‘DUN KAYO’ ah 😅”`,
      `“Crabs: 1. ${username}: ${score}. Better luck next round!”`,
    ];
    const negativeScoreMessages = [
      `“Ay! ${username}, SB19 ‘yung kinlick mo 😭 -${Math.abs(score)}? Foul ka dun!”`,
      `“Nooo ${username}! You clicked our PPOP Kings 😭 Score: ${score}... not good.”`,
    ];
    if (score < 0) return negativeScoreMessages[Math.floor(Math.random() * negativeScoreMessages.length)];
    if (score >= 900) return ultimateScoreMessages[Math.floor(Math.random() * ultimateScoreMessages.length)];
    if (score >= 300) return highScoreMessages[Math.floor(Math.random() * highScoreMessages.length)];
    if (score >= 100) return midScoreMessages[Math.floor(Math.random() * midScoreMessages.length)];
    return lowScoreMessages[Math.floor(Math.random() * lowScoreMessages.length)];
}

export function loadLeaderboard() {
    leaderboardBody.innerHTML = '<tr><td colspan="3"><div class="loading-spinner"></div></td></tr>';
    fetch(`https://script.google.com/macros/s/AKfycbwWhP0Lg2xeZNnvmrGEO6fkWF-XyDIjts0t7NRHWrtCIhBvXFuxGos4TYIEWcOJNDnt/exec?username=${encodeURIComponent(gameState.username.toLowerCase())}`)
        .then((res) => res.json())
        .then((data) => {
            const top5 = data.top5 || [];
            const userHighScore = data.userHighScore || 0;
            let userRank = data.userRank || "Unranked";
            leaderboardBody.innerHTML = "";
            top5.forEach((entry, i) => {
                const row = document.createElement("tr");
                if (i === 0) row.classList.add("first-place");
                else if (i === 1) row.classList.add("second-place");
                else if (i === 2) row.classList.add("third-place");
                row.innerHTML = `<td>${entry.rank}</td><td><strong>${entry.username}</strong></td><td>${entry.score}</td>`;
                leaderboardBody.appendChild(row);
            });
            const separator = document.createElement("tr");
            separator.innerHTML = '<td colspan="3" style="height: 20px; background: transparent; border-bottom: 1px dashed #444;"></td>';
            leaderboardBody.appendChild(separator);
            const currentScoreRow = document.createElement("tr");
            currentScoreRow.classList.add("current-user");
            currentScoreRow.innerHTML = `<td>${userRank}</td><td><strong>${gameState.username}</strong></td><td>${userHighScore}</td>`;
            leaderboardBody.appendChild(currentScoreRow);
            const highScoreRow = document.createElement("tr");
            highScoreRow.classList.add("current-user");
            highScoreRow.innerHTML = `<td></td><td><strong>Current Score</strong></td><td>${gameState.score}</td>`;
            leaderboardBody.appendChild(highScoreRow);
        })
        .catch(() => {
            leaderboardBody.innerHTML = '<tr><td colspan="3">Error loading leaderboard</td></tr>';
        });
}
