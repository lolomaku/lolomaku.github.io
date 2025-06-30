import { initializeGame, endGame } from './gameLogic.js';
import { showScreen, loadLeaderboard, pulseTitle } from './ui.js';

/**
 * Main entry point of the application.
 * Sets up initial event listeners and orchestrates the game flow
 * by calling functions from the logic and UI modules.
 */

// --- DOM Element References ---
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const returnToTitleBtn = document.getElementById("returnToTitleBtn");
const viewLeaderboardBtn = document.getElementById("viewLeaderboardBtn");
const backFromLeaderboardBtn = document.getElementById("backFromLeaderboardBtn");
const musicPrestart = document.getElementById("music-prestart");
const musicIngame = document.getElementById("music-ingame");

// --- Event Listeners ---
window.addEventListener("load", () => {
  musicPrestart.volume = 0.5;
  musicIngame.volume = 0.5;
  musicPrestart.play().catch(() => {});
  pulseTitle();
});

startBtn.addEventListener("click", initializeGame);

restartBtn.addEventListener("click", () => {
    // End the current game cleanly before starting a new one
    endGame();
    // A brief delay to allow the end game sequence to start before re-initializing
    setTimeout(initializeGame, 50); 
});

returnToTitleBtn.addEventListener("click", () => {
    showScreen("titleScreen");
});

viewLeaderboardBtn.addEventListener("click", () => {
    showScreen("leaderboardScreen");
    loadLeaderboard();
});

backFromLeaderboardBtn.addEventListener("click", () => {
    showScreen("gameOverScreen");
});

// --- Global Event Prevention for Anti-Cheat/UX ---
document.addEventListener("contextmenu", (e) => e.preventDefault());

window.addEventListener("keydown", (e) => {
  if (
    (e.ctrlKey && (e.key === "+" || e.key === "-" || e.key === "=")) ||
    e.key === "F12" ||
    (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key.toUpperCase())) ||
    (e.ctrlKey && e.key === "U")
  ) {
      e.preventDefault();
  }
});

window.addEventListener("wheel", (e) => {
    if (e.ctrlKey) e.preventDefault();
  },
  { passive: false }
);

document.addEventListener("gesturestart", (e) => e.preventDefault());
document.addEventListener("gesturechange", (e) => e.preventDefault());
document.addEventListener("gestureend", (e) => e.preventDefault());

document.querySelectorAll("img").forEach((img) => {
    img.addEventListener("dragstart", (e) => e.preventDefault());
});
