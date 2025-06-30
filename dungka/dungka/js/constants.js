/**
 * Contains all static configuration data for the game,
 * including enemy types, power-ups, messages, and cooldowns.
 * Centralizing this data makes game balancing and asset management simpler.
 */

// Import necessary functions from gameLogic, which will be defined later.
// This creates a circular dependency, which is handled by JavaScript's module system.
// We import the module to make its functions available within the power effects.
import * as gameLogic from './gameLogic.js';
import * as ui from './ui.js';
import { gameState } from './gameState.js';


export const SUBMISSION_COOLDOWN = 60000;
export const POWER_INTERACTION_THRESHOLD = 2000;

export const enemyTypes = [
    { label: "Anger", value: 1 },
    { label: "Sadness", value: 1 },
    { label: "Anxiety", value: 1 },
    { label: "Joy", value: -1 },
    { label: "Hope", value: -1 },
    { label: "Gratitude", value: -1 },
];

// The 'powers' array now directly uses functions from the imported modules.
export const powers = [
  {
      name: "wmian",
      folder: "assets/wmian",
      rarity: 3,
      effect: () => {
          gameState.isWmianActive = true;
          ui.muteAll();
          gameState.powerUsageLog.activated.wmiayn = (gameState.powerUsageLog.activated.wmiayn || 0) + 1;
          const audio = new Audio("assets/wmian/sound.mp3");
          document.body.appendChild(audio);
          gameState.activePowerAudios.push(audio);
          audio.play();
          const allWmianCrabs = [];
          const bigCrabCount = Math.floor(Math.random() * 4) + 3;
          let bigCrabsSpawned = 0;
          function spawnNextBigCrab() {
              if (bigCrabsSpawned >= bigCrabCount) return;
              const bigCrab = gameLogic.spawnBigWmianCrab(allWmianCrabs);
              allWmianCrabs.push(bigCrab);
              bigCrabsSpawned++;
              setTimeout(spawnNextBigCrab, 800);
          }
          spawnNextBigCrab();
          audio.addEventListener("ended", () => {
              if (!gameState.gameActive) return;
              ui.cleanupAudio(audio);
              ui.unmuteAll();
              gameState.isWmianActive = false;
              allWmianCrabs.forEach((crab) => {
                  if (crab.dataset.wmianFrameInterval) clearInterval(parseInt(crab.dataset.wmianFrameInterval));
                  if (crab.dataset.wmianMoveInterval) clearInterval(parseInt(crab.dataset.wmianMoveInterval));
                  ui.removeElement(crab);
              });
              gameState.powerSpawningStarted = false;
              gameLogic.spawnPower();
          });
      }
  },
  {
      name: "timerpause",
      folder: "assets/timerpause",
      rarity: 35,
      sounds: [
          { file: "sound1.mp3", weight: 2 },
          { file: "sound2.mp3", weight: 3 },
          { file: "sound3.mp3", weight: 5 },
      ],
      effect: function () {
          const power = this;
          gameState.isTimerPauseActive = true;
          document.body.classList.add("timerpause-active");
          document.querySelectorAll(".enemy").forEach((e) => {
              if (e.src.includes("crab")) e.classList.add("crab-colored");
          });
          ui.muteAll();
          gameState.powerUsageLog.activated.timerpause = (gameState.powerUsageLog.activated.timerpause || 0) + 1;
          clearInterval(gameState.countdownTimer);
          gameState.powerSpawnRate = 1500;
          const selectedSound = gameLogic.getWeightedRandomSound(power.sounds);
          const audio = new Audio(`${power.folder}/${selectedSound.file}`);
          document.body.appendChild(audio);
          gameState.activePowerAudios.push(audio);
          audio.play();
          audio.addEventListener("ended", () => {
              if (!gameState.gameActive) return;
              ui.cleanupAudio(audio);
              ui.unmuteAll();
              gameState.powerSpawnRate = 1000;
              gameState.isTimerPauseActive = false;
              gameLogic.startGameTimer();
              document.body.classList.remove("timerpause-active");
              document.querySelectorAll(".crab-colored").forEach((e) => e.classList.remove("crab-colored"));
              gameState.powerSpawningStarted = false;
              gameLogic.spawnPower();
          });
      }
  },
  {
      name: "gento",
      folder: "assets/gento",
      rarity: 35,
      effect: () => {
          gameState.isGentoActive = true;
          ui.muteAll();
          gameState.powerUsageLog.activated.gento = (gameState.powerUsageLog.activated.gento || 0) + 1;
          gameState.powerSpawnRate = 700;
          const audio = new Audio("assets/gento/sound.mp3");
          document.body.appendChild(audio);
          gameState.activePowerAudios.push(audio);
          audio.play();
          document.querySelectorAll('.enemy[data-negative="true"]').forEach((crab) => {
              if (crab.dataset.intervalId) {
                  clearInterval(parseInt(crab.dataset.intervalId));
                  delete crab.dataset.intervalId;
              }
              if (!crab.dataset.originalFrames) {
                  const frame1 = crab.src;
                  const frame2 = crab.src.includes("1.png") ? crab.src.replace("1.png", "2.png") : crab.src.replace("2.png", "1.png");
                  crab.dataset.originalFrames = JSON.stringify({ frame1, frame2 });
              }
              if (!crab.dataset.originalSound) {
                  crab.dataset.originalSound = "assets/crab/click.mp3";
              }
              let currentFrame = 0;
              const gentoInterval = setInterval(() => {
                  currentFrame = (currentFrame + 1) % 2;
                  crab.src = `assets/gento/${currentFrame + 1}.png`;
              }, 300);
              crab.dataset.gentoInterval = gentoInterval;
              crab.dataset.gentoTransformed = "true";
          });
          audio.addEventListener("ended", () => {
              if (!gameState.gameActive) return;
              ui.cleanupAudio(audio);
              ui.unmuteAll();
              gameState.isGentoActive = false;
              gameState.powerSpawnRate = 1000;
              document.querySelectorAll('.enemy[data-gento-transformed="true"]').forEach((crab) => {
                  if (crab.dataset.gentoInterval) {
                      clearInterval(parseInt(crab.dataset.gentoInterval));
                      delete crab.dataset.gentoInterval;
                  }
                  if (crab.dataset.originalFrames) {
                      const originalFrames = JSON.parse(crab.dataset.originalFrames);
                      let currentFrame = 0;
                      const originalInterval = setInterval(() => {
                          currentFrame = (currentFrame + 1) % 2;
                          crab.src = currentFrame === 0 ? originalFrames.frame1 : originalFrames.frame2;
                      }, 300);
                      crab.dataset.intervalId = originalInterval;
                      delete crab.dataset.originalFrames;
                  }
                  if (crab.dataset.originalSound) {
                      delete crab.dataset.originalSound;
                  }
                  delete crab.dataset.gentoTransformed;
              });
              gameState.powerSpawningStarted = false;
              gameLogic.spawnPower();
          });
      }
  },
  {
      name: "bazinga",
      folder: "assets/bazinga",
      rarity: 60,
      effect: function () {
          gameState.powerUsageLog.activated.bazinga = (gameState.powerUsageLog.activated.bazinga || 0) + 1;
          const audio = new Audio(`${this.folder}/activation.mp3`);
          document.body.appendChild(audio);
          gameState.activePowerAudios.push(audio);
          audio.play();
          const negativeEnemies = document.querySelectorAll('.enemy[data-negative="true"]');
          let wyatReward = 0;
          negativeEnemies.forEach((enemy) => {
              const rect = enemy.getBoundingClientRect();
              const x = rect.left + rect.width / 2;
              const y = rect.top + rect.height / 2;
              ui.createElectricityEffect(x, y);
              if (enemy.classList.contains("wyat-crab")) {
                  wyatReward = parseInt(enemy.dataset.rewinded || "0") * 3;
              } else {
                  const value = parseInt(enemy.dataset.value);
                  gameLogic.handleEnemyClick(value * 2);
              }
              ui.removeElement(enemy);
          });
          if (wyatReward > 0) {
              ui.updateScore(gameState.score + wyatReward);
          }
          audio.addEventListener("ended", () => {
              ui.cleanupAudio(audio);
              gameState.powerSpawningStarted = false;
              gameLogic.spawnPower();
          });
      }
  },
  {
      name: "mana",
      folder: "assets/mana",
      rarity: 30,
      effect: function () {
          gameState.powerUsageLog.activated.mana = (gameState.powerUsageLog.activated.mana || 0) + 1;
          gameState.powerActive = true;
          const addedTime = Math.floor(Math.random() * 6) + 5;
          gameState.timeLeft += addedTime;
          ui.timerDisplay.textContent = `${gameState.timeLeft}s`;
          ui.timerDisplay.classList.add("timer-glow");
          setTimeout(() => ui.timerDisplay.classList.remove("timer-glow"), 1000);
          const audio = new Audio(`assets/mana/sound.mp3`);
          document.body.appendChild(audio);
          gameState.activePowerAudios.push(audio);
          audio.play();
          audio.addEventListener("ended", () => {
              ui.cleanupAudio(audio);
              gameState.powerActive = false;
              gameState.powerSpawningStarted = false;
              gameLogic.spawnPower();
          });
      }
  },
  {
      name: "crimzone",
      folder: "assets/crimzone",
      rarity: 25,
      effect: () => {
          gameState.powerActive = true;
          gameState.isCrimzoneActive = true;
          ui.muteAll();
          gameState.powerUsageLog.activated.crimzone = (gameState.powerUsageLog.activated.crimzone || 0) + 1;
          gameState.activeTimeouts.forEach((timeout) => clearTimeout(timeout));
          gameState.activeTimeouts = [];
          gameState.powerSpawnRate = 17000;
          gameState.timerInterval = 2000;
          gameLogic.startGameTimer();
          let totalClearedScore = 0;
          document.querySelectorAll(".enemy").forEach((enemy) => {
              let value = parseInt(enemy.dataset.value || 1);
              if (value < 0) {
                const rect = enemy.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                ui.createRedEffect(x, y);
                ui.removeElement(enemy);
                return;
            }
              if (enemy.classList.contains("wyat-crab")) {
                  const rewinded = parseInt(enemy.dataset.rewinded || "0");
                  value = rewinded * 3;
              }
              totalClearedScore += value;
              const rect = enemy.getBoundingClientRect();
              const x = rect.left + rect.width / 2;
              const y = rect.top + rect.height / 2;
              ui.createRedEffect(x, y);
              ui.removeElement(enemy);
          });
          ui.updateScore(gameState.score + totalClearedScore);
          const audio = new Audio("assets/crimzone/sound.mp3");
          document.body.appendChild(audio);
          gameState.activePowerAudios.push(audio);
          audio.play();
          const crimzoneCrabs = [];
          const spawnCrimzoneCrab = () => {
              if (!gameState.gameActive || !gameState.isCrimzoneActive) return;
              const crab = document.createElement("img");
              crab.classList.add("enemy", "crimzone-crab");
              crab.dataset.negative = "true";
              crab.dataset.value = "5";
              const frame1 = "assets/crab/1.png";
              const frame2 = "assets/crab/2.png";
              crab.src = frame1;
              const size = 80;
              crab.style.width = `${size}px`;
              const x = Math.random() * (window.innerWidth - size);
              crab.style.left = `${x}px`;
              crab.style.top = `-${size}px`;
              crab.style.position = "fixed";
              crab.style.zIndex = "10";
              crab.style.pointerEvents = "auto";
              crab.style.cursor = "pointer";
              crab.style.objectFit = "contain";
              crab.style.userSelect = "none";
              let currentFrame = 0;
              const animInterval = setInterval(() => {
                  currentFrame = (currentFrame + 1) % 2;
                  crab.src = currentFrame === 0 ? frame1 : frame2;
              }, 200);
              crab.dataset.intervalId = animInterval;
              const speed = 7;
              let currentY = -size;
              let frameCount = 0;
              const move = () => {
                  if (!document.body.contains(crab) || !gameState.isCrimzoneActive) return;
                  currentY += speed;
                  crab.style.top = `${currentY}px`;
                  frameCount++;
                  if (frameCount % 7 === 0) {
                      const rect = crab.getBoundingClientRect();
                      const xTrail = rect.left + rect.width / 5;
                      const yTrail = rect.top + rect.height / 5;
                      ui.createCrimsonTrail(xTrail, yTrail);
                  }
                  if (currentY > window.innerHeight) {
                      ui.removeElement(crab);
                  } else {
                      requestAnimationFrame(move);
                  }
              };
              crab.addEventListener("click", () => {
                  gameLogic.handleEnemyClick(4);
                  ui.removeElement(crab);
              });
              document.body.appendChild(crab);
              crimzoneCrabs.push(crab);
              move();
          };
          const spawnInterval = setInterval(spawnCrimzoneCrab, 400);
          gameState.activeIntervals.push(spawnInterval);
          audio.addEventListener("ended", () => {
              if (!gameState.gameActive) return;
              clearInterval(spawnInterval);
              document.querySelectorAll(".crimzone-crab").forEach(ui.removeElement);
              ui.unmuteAll();
              gameState.powerSpawnRate = 1000;
              gameState.isCrimzoneActive = false;
              gameState.timerInterval = 1000;
              gameLogic.startGameTimer();
              gameState.powerActive = false;
              ui.cleanupAudio(audio);
              gameState.powerSpawningStarted = false;
              gameLogic.spawnMultipleEnemies();
              gameLogic.spawnPower();
          });
      },
  },
  {
      name: "sfts",
      folder: "assets/sfts",
      rarity: 25,
      effect: function () {
          gameState.isSftsActive = true;
          gameState.powerActive = true;
          ui.muteAll();
          gameState.powerUsageLog.activated.sfts = (gameState.powerUsageLog.activated.sfts || 0) + 1;
          gameState.activeTimeouts.forEach((timeout) => clearTimeout(timeout));
          gameState.activeTimeouts = [];
          gameState.powerSpawnRate = 17000;
          gameState.timerInterval = 2000;
          gameLogic.startGameTimer();
          let totalClearedScore = 0;
          document.querySelectorAll(".enemy").forEach((enemy) => {
              let value = parseInt(enemy.dataset.value || 1);
              if (value < 0) {
                const rect = enemy.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                ui.createElectricityEffect(x, y);
                ui.removeElement(enemy);
                return;
            }
              if (enemy.classList.contains("wyat-crab")) {
                  const rewinded = parseInt(enemy.dataset.rewinded || "0");
                  value = rewinded * 3;
              }
              totalClearedScore += value;
              const rect = enemy.getBoundingClientRect();
              const x = rect.left + rect.width / 2;
              const y = rect.top + rect.height / 2;
              ui.createElectricityEffect(x, y);
              ui.removeElement(enemy);
          });
          ui.updateScore(gameState.score + totalClearedScore);
          const audio = new Audio(`${this.folder}/sound.mp3`);
          document.body.appendChild(audio);
          gameState.activePowerAudios.push(audio);
          audio.play();
          const sftsCrabs = [];
          function spawnSftsCrab() {
              const crab = document.createElement("img");
              crab.classList.add("sfts-crab");
              crab.src = `${this.folder}/1.png`;
              Object.assign(crab.style, { position: "fixed", zIndex: "50", width: "100px", height: "100px", pointerEvents: "auto", cursor: "pointer" });
              const startX = Math.random() * (window.innerWidth + 200) - 100;
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
                  if (!crab.parentNode || !gameState.isSftsActive) return;
                  const elapsed = Date.now() - startTime;
                  const progress = Math.min(elapsed / duration, 1);
                  const x = startX + (endX - startX) * progress;
                  const y = -100 + (window.innerHeight + 200) * progress;
                  const rotation = progress * 360;
                  crab.style.left = `${x}px`;
                  crab.style.top = `${y}px`;
                  crab.style.transform = `rotate(${rotation}deg)`;
                  if (frameCount % 3 === 0) ui.createTrailParticle(x, y);
                  frameCount++;
                  if (progress < 1) requestAnimationFrame(animate);
                  else ui.removeElement(crab);
              };
              crab.addEventListener("click", () => {
                  gameLogic.handleEnemyClick(5);
                  ui.removeElement(crab);
              });
              document.body.appendChild(crab);
              sftsCrabs.push(crab);
              requestAnimationFrame(animate);
          }
          function spawnSftsPositive() {
              const sbIndex = Math.floor(Math.random() * 5) + 1;
              const enemy = document.createElement("img");
              enemy.classList.add("sfts-positive", "enemy");
              enemy.src = `assets/sb${sbIndex}/1.png`;
              Object.assign(enemy.style, { position: "fixed", zIndex: "50", width: "100px", height: "100px", pointerEvents: "auto", cursor: "pointer" });
              const startX = Math.random() * (window.innerWidth + 200) - 100;
              const endX = Math.random() * window.innerWidth;
              enemy.style.left = `${startX}px`;
              enemy.style.top = "-100px";
              let frame1 = `assets/sb${sbIndex}/1.png`;
              let frame2 = `assets/sb${sbIndex}/2.png`;
              let currentFrame = 0;
              const frameInterval = setInterval(() => {
                  currentFrame = (currentFrame + 1) % 2;
                  enemy.src = currentFrame === 0 ? frame1 : frame2;
              }, 300);
              enemy.dataset.frameInterval = frameInterval;
              enemy.dataset.value = "-3";
              enemy.dataset.negative = "false";
              const startTime = Date.now();
              const duration = 3000;
              let frameCount = 0;
              const animate = () => {
                  if (!enemy.parentNode || !gameState.isSftsActive) return;
                  const elapsed = Date.now() - startTime;
                  const progress = Math.min(elapsed / duration, 1);
                  const x = startX + (endX - startX) * progress;
                  const y = -100 + (window.innerHeight + 200) * progress;
                  const rotation = progress * 360;
                  enemy.style.left = `${x}px`;
                  enemy.style.top = `${y}px`;
                  enemy.style.transform = `rotate(${rotation}deg)`;
                  if (frameCount % 3 === 0) ui.createTrailParticle(x, y);
                  frameCount++;
                  if (progress < 1) requestAnimationFrame(animate);
                  else ui.removeElement(enemy);
              };
              enemy.addEventListener("click", () => {
                  gameLogic.handleEnemyClick(-3);
                  const voice = new Audio(`assets/sb${sbIndex}/click.mp3`);
                  voice.play();
                  ui.removeElement(enemy);
              });
              document.body.appendChild(enemy);
              sftsCrabs.push(enemy);
              requestAnimationFrame(animate);
          }
          gameState.sftsSpawnInterval = setInterval(() => {
              if (!gameState.gameActive || !gameState.isSftsActive) return;
              const roll = Math.random();
              if (roll < 0.8) {
                  spawnSftsCrab.call(this);
              } else {
                  spawnSftsPositive();
              }
          }, 600);
          audio.addEventListener("ended", () => {
              if (!gameState.gameActive) return;
              clearInterval(gameState.sftsSpawnInterval);
              document.querySelectorAll(".sfts-crab").forEach(ui.removeElement);
              document.querySelectorAll(".sfts-positive").forEach(ui.removeElement);
              gameState.powerSpawnRate = 1000;
              gameState.isSftsActive = false;
              gameState.powerActive = false;
              gameState.timerInterval = 1000;
              gameLogic.startGameTimer();
              ui.unmuteAll();
              ui.cleanupAudio(audio);
              gameState.powerSpawningStarted = false;
              gameLogic.spawnPower();
              gameLogic.spawnMultipleEnemies();
          });
      }
  },
  {
      name: "8tonball",
      folder: "assets/8tonball",
      rarity: 20,
      effect: function () {
          gameState.eightTonActive = true;
          gameState.ballCanBounce = true;
          let frame = 1;
          let frameCount = 5;
          const folder = this.folder;
          gameState.timerInterval = 2000;
          gameLogic.startGameTimer();
          gameState.powerActive = true;
          ui.muteAll();
          gameState.powerUsageLog.activated["8tonball"] = (gameState.powerUsageLog.activated["8tonball"] || 0) + 1;
          const ball = document.createElement("img");
          ball.src = `${folder}/1.png`;
          ball.style.position = "fixed";
          ball.style.width = "120px";
          ball.style.height = "120px";
          ball.style.zIndex = "40";
          ball.style.pointerEvents = "none";
          ball.style.userSelect = "none";
          const speed = gameLogic.isMobile ? 3 : 6;
          let vx, vy;
          const corner = Math.floor(Math.random() * 4);
          let x, y;
          switch (corner) {
              case 0: x = -120; y = -120; vx = speed; vy = speed; break;
              case 1: x = window.innerWidth + 120; y = -120; vx = -speed; vy = speed; break;
              case 2: x = window.innerWidth + 120; y = window.innerHeight + 120; vx = -speed; vy = -speed; break;
              case 3: x = -120; y = window.innerHeight + 120; vx = speed; vy = -speed; break;
          }
          const initialAngle = Math.atan2(vy, vx) * (180 / Math.PI) + 65;
          ball.style.transform = `rotate(${initialAngle}deg)`;
          document.body.appendChild(ball);
          const frameInterval = setInterval(() => {
              frame = (frame % frameCount) + 1;
              ball.src = `${folder}/${frame}.png`;
          }, 100);
          ball.dataset.intervalId = frameInterval;
          function moveBall() {
              if (!ball.parentNode) return;
              x += vx;
              y += vy;
              if (gameState.ballCanBounce) {
                  if (x < 0) { x = 0; vx = Math.abs(vx); }
                  else if (x > window.innerWidth - 120) { x = window.innerWidth - 120; vx = -Math.abs(vx); }
                  if (y < 0) { y = 0; vy = Math.abs(vy); }
                  else if (y > window.innerHeight - 120) { y = window.innerHeight - 120; vy = -Math.abs(vy); }
              }
              ball.style.left = `${x}px`;
              ball.style.top = `${y}px`;
              const angle = Math.atan2(vy, vx) * (180 / Math.PI) + 65;
              ball.style.transform = `rotate(${angle}deg)`;
              document.querySelectorAll(".enemy").forEach((enemy) => {
                  const ballRect = ball.getBoundingClientRect();
                  const ballX = ballRect.left + ballRect.width / 2;
                  const ballY = ballRect.top + ballRect.height / 2;
                  const ballRadius = ballRect.width / 2;
                  const enemyRect = enemy.getBoundingClientRect();
                  const enemyX = enemyRect.left + enemyRect.width / 2;
                  const enemyY = enemyRect.top + enemyRect.height / 2;
                  const enemyRadius = Math.max(enemyRect.width, enemyRect.height) / 2;
                  const dx = ballX - enemyX;
                  const dy = ballY - enemyY;
                  const distance = Math.sqrt(dx * dx + dy * dy);
                  if (distance < ballRadius + enemyRadius) {
                      enemy.dataset.hitBy8ton = "true";
                      ui.createClickSplash(`${enemyX - 60}px`, `${enemyY - 60}px`);
                      let value;
                      if (enemy.classList.contains("wyat-crab")) {
                          const rewinded = parseInt(enemy.dataset.rewinded || "0");
                          value = rewinded * 3;
                      } else if (enemy.dataset.negative === "true") {
                          value = 2;
                      } else {
                          value = -8;
                      }
                      ui.updateScore(gameState.score + value);
                      ui.removeElement(enemy);
                  }
              });
              if (x < -200 || x > window.innerWidth + 200 || y < -200 || y > window.innerHeight + 200) {
                  clearInterval(frameInterval);
                  if (ball.parentNode) ball.remove();
                  return;
              }
              requestAnimationFrame(moveBall);
          }
          requestAnimationFrame(moveBall);
          document.querySelectorAll(".enemy").forEach((enemy) => {
              if (enemy.dataset.negative === "false") {
                  enemy.dataset.originalClick = enemy.onclick;
                  enemy.onclick = () => {
                      gameLogic.handleEnemyClick(8);
                      const indexMatch = enemy.src.match(/sb(\d)/);
                      if (indexMatch) {
                          const sbIndex = indexMatch[1];
                          const voice = new Audio(`assets/sb${sbIndex}/click.mp3`);
                          voice.play();
                      }
                      ui.removeElement(enemy);
                  };
              }
          });
          const audio = new Audio(`${folder}/sound.mp3`);
          document.body.appendChild(audio);
          gameState.activePowerAudios.push(audio);
          audio.play();
          audio.addEventListener("ended", () => {
              document.querySelectorAll(".enemy").forEach((enemy) => {
                  if (enemy.dataset.negative === "false" && enemy.dataset.originalClick) {
                      enemy.onclick = enemy.dataset.originalClick;
                  }
              });
              gameState.eightTonActive = false;
              gameState.ballCanBounce = false;
              gameState.powerSpawnRate = 1000;
              gameState.powerActive = false;
              gameState.timerInterval = 1000;
              gameLogic.startGameTimer();
              ui.unmuteAll();
              ui.cleanupAudio(audio);
              gameState.powerSpawningStarted = false;
              gameLogic.spawnPower();
          });
      }
  },
  {
    name: "wyat",
    folder: "assets/wyat",
    rarity: 20,
    effect: function () {
        gameState.wyatActive = true;
        let rewindedScore = 0;
        const folder = this.folder;
        const maxPops = 6;
        let popCount = 0;
        let popInterval;
        let autoEndTimeout;
        gameState.powerUsageLog.activated.wyat = (gameState.powerUsageLog.activated.wyat || 0) + 1;
        const WYATAudio = new Audio(`${folder}/sound.mp3`);
        WYATAudio.play();
        const wyatCrab = document.createElement("img");
        wyatCrab.classList.add("enemy", "wyat-crab");
        wyatCrab.dataset.negative = "true";
        wyatCrab.dataset.value = "0";
        wyatCrab.dataset.rewinded = "0";
        wyatCrab.style.position = "fixed";
        wyatCrab.style.width = "150px";
        wyatCrab.style.height = "150px";
        wyatCrab.style.zIndex = "20";
        wyatCrab.style.pointerEvents = "auto";
        wyatCrab.style.userSelect = "none";
        wyatCrab.src = `${folder}/1.png`;
        wyatCrab.style.display = "none";
        let currentFrame = 0;
        const animInterval = setInterval(() => {
            currentFrame = (currentFrame + 1) % 2;
            wyatCrab.src = `${folder}/${currentFrame + 1}.png`;
        }, 300);
        wyatCrab.dataset.animInterval = animInterval;
        wyatCrab.cleanupWyat = function() {
            if (!gameState.wyatActive) return;
            const clickAudio = new Audio(`${folder}/click.mp3`);
            clickAudio.play();
            const rect = wyatCrab.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2 - 60;
            const centerY = rect.top + rect.height / 2 - 60;
            ui.createWYATSplash(centerX, centerY);
            clearInterval(popInterval);
            clearTimeout(autoEndTimeout);
            gameState.wyatActive = false;
        };
        document.body.appendChild(wyatCrab);
        function popIn() {
            if (!gameState.wyatActive || !document.body.contains(wyatCrab)) {
                clearInterval(popInterval);
                return;
            }
            if (popCount >= maxPops) {
                clearInterval(popInterval);
                return;
            }
            const x = Math.random() * (window.innerWidth - 100);
            const y = Math.random() * (window.innerHeight - 100);
            wyatCrab.style.left = `${x}px`;
            wyatCrab.style.top = `${y}px`;
            wyatCrab.style.display = "block";
            const inAudio = new Audio(`${folder}/popin.mp3`);
            inAudio.play();
            setTimeout(() => {
                if (!gameState.wyatActive || !document.body.contains(wyatCrab)) return;
                wyatCrab.style.display = "none";
                const popPenalty = Math.floor(Math.random() * 11) + 10;
                rewindedScore += popPenalty;
                ui.updateScore(gameState.score - popPenalty);
                wyatCrab.dataset.rewinded = rewindedScore;
                gameState.timeLeft += 3;
                ui.timerDisplay.textContent = `${gameState.timeLeft}s`;
                ui.timerDisplay.classList.add("timer-glow");
                setTimeout(() => ui.timerDisplay.classList.remove("timer-glow"), 1000);
                const outAudio = new Audio(`${folder}/popout.mp3`);
                outAudio.play();
                popCount++;
            }, 500);
        }
        popInterval = setInterval(popIn, 1500);
        popIn();
        wyatCrab.addEventListener("click", () => {
            if (!document.body.contains(wyatCrab)) return;
            wyatCrab.cleanupWyat();
            ui.removeElement(wyatCrab);
            gameState.powerSpawningStarted = false;
        });
        autoEndTimeout = setTimeout(() => {
            if (document.body.contains(wyatCrab)) {
                gameLogic.forceRemoveWyatQuietly(wyatCrab, popInterval, autoEndTimeout);
            }
            gameState.powerSpawningStarted = false;
        }, 8300);
        gameLogic.spawnPower();
    }
  },
  {
      name: "what",
      folder: "assets/what",
      rarity: 25,
      effect: function () {
          ui.muteAll();
          gameState.powerUsageLog.activated.what = (gameState.powerUsageLog.activated.what || 0) + 1;
          const folder = this.folder;
          gameState.whatActive = true;
          gameState.activeTimeouts.forEach((timeout) => clearTimeout(timeout));
          gameState.activeTimeouts = [];
          gameState.powerSpawnRate = 17000;
          gameState.timerInterval = 2000;
          gameLogic.startGameTimer();
          let totalClearedScore = 0;
          document.querySelectorAll(".enemy").forEach((enemy) => {
              let value = parseInt(enemy.dataset.value || 1);
              if (value < 0) {
                const rect = enemy.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                ui.createWhatHeartSplash(x, y);
                ui.removeElement(enemy);
                return;
            }
              if (enemy.classList.contains("wyat-crab")) {
                  const rewinded = parseInt(enemy.dataset.rewinded || "0");
                  value = rewinded * 3;
              }
              totalClearedScore += value;
              const rect = enemy.getBoundingClientRect();
              const x = rect.left + rect.width / 2;
              const y = rect.top + rect.height / 2;
              ui.createWhatHeartSplash(x, y);
              ui.removeElement(enemy);
          });
          ui.updateScore(gameState.score + totalClearedScore);
          const audio = new Audio(`${folder}/sound.mp3`);
          document.body.appendChild(audio);
          gameState.activePowerAudios.push(audio);
          audio.play();
          const allWhatCrabs = [];
          const whatCrabFolders = ["assets/gento", "assets/sfts", "assets/crab"];
          function spawnWhatCrab() {
              const crabFolder = whatCrabFolders[Math.floor(Math.random() * whatCrabFolders.length)];
              const crab = document.createElement("img");
              crab.classList.add("enemy", "what-crab");
              crab.src = `${crabFolder}/1.png`;
              crab.dataset.negative = "true";
              crab.dataset.value = "4";
              const size = 100;
              const startX = Math.random() * (window.innerWidth - size);
              const startY = window.innerHeight + size;
              crab.style.position = "absolute";
              crab.style.left = `${startX}px`;
              crab.style.top = `${startY}px`;
              crab.style.width = `${size}px`;
              crab.style.height = `${size}px`;
              crab.style.zIndex = "20";
              crab.style.transformOrigin = "center";
              document.body.appendChild(crab);
              allWhatCrabs.push(crab);
              let currentFrame = 0;
              const animInterval = setInterval(() => {
                  currentFrame = (currentFrame + 1) % 2;
                  crab.src = `${crabFolder}/${currentFrame + 1}.png`;
              }, 300);
              crab.dataset.animInterval = animInterval;
              let rotation = 0;
              let angularVelocity = (Math.random() - 0.5) * 0.3;
              let angularAcceleration = 0;
              const targetY = window.innerHeight * (Math.random() * 0.2);
              const ascentTime = 800 + Math.random() * 400;
              const descentTime = 1200 + Math.random() * 600;
              const startTime = Date.now();
              let lastFrameTime = startTime;
              function updateCrab() {
                  if (!crab.parentNode || !gameState.whatActive) return;
                  const now = Date.now();
                  const elapsed = now - startTime;
                  const deltaTime = now - lastFrameTime;
                  lastFrameTime = now;
                  let newY = startY;
                  if (elapsed < ascentTime) {
                      const progress = Math.min(1, elapsed / ascentTime);
                      const easedProgress = 1 - Math.pow(1 - progress, 2);
                      newY = startY - (startY - targetY) * easedProgress;
                      angularAcceleration = (Math.random() - 0.5) * 0.0005;
                  } else if (elapsed < ascentTime + descentTime) {
                      const progress = Math.min(1, (elapsed - ascentTime) / descentTime);
                      const easedProgress = Math.pow(progress, 2);
                      newY = targetY + (window.innerHeight + size - targetY) * easedProgress;
                      angularAcceleration = 0.001;
                  } else {
                      clearInterval(animInterval);
                      ui.removeElement(crab);
                      return;
                  }
                  angularVelocity += angularAcceleration * deltaTime;
                  rotation += angularVelocity * deltaTime;
                  crab.style.top = `${newY}px`;
                  crab.style.transform = `rotate(${rotation}deg)`;
                  requestAnimationFrame(updateCrab);
              }
              lastFrameTime = Date.now();
              requestAnimationFrame(updateCrab);
              crab.addEventListener("click", () => {
                  gameLogic.handleEnemyClick(4);
                  ui.createWhatHeartSplash(parseInt(crab.style.left) + size / 2, parseInt(crab.style.top) + size / 2);
                  clearInterval(animInterval);
                  ui.removeElement(crab);
              });
          }
          const spawnInterval = setInterval(() => {
              if (!gameState.whatActive) return;
              spawnWhatCrab();
          }, 500);
          audio.addEventListener("ended", () => {
              gameState.powerSpawnRate = 1000;
              gameState.whatActive = false;
              clearInterval(spawnInterval);
              gameState.timerInterval = 1000;
              gameLogic.startGameTimer();
              allWhatCrabs.forEach((crab) => {
                  if (crab.dataset.animInterval) clearInterval(parseInt(crab.dataset.animInterval));
                  ui.removeElement(crab);
              });
              ui.cleanupAudio(audio);
              ui.unmuteAll();
              gameState.powerSpawningStarted = false;
              gameLogic.spawnPower();
              gameLogic.spawnMultipleEnemies();
          });
      }
  },
  {
    name: "quit",
    folder: "assets/quit",
    rarity: 5,
    canSpawn: function () {
        const hasSfts = !!gameState.powerUsageLog.activated.sfts;
        const has8ton = !!gameState.powerUsageLog.activated["8tonball"];
        const hasTimer = !!gameState.powerUsageLog.activated.timerpause;
        const hasMana = !!gameState.powerUsageLog.activated.mana;
        const hasBazinga = !!gameState.powerUsageLog.activated.bazinga;
        const alreadyUsedQuit = gameState.powerUsageLog.activated.quit >= 1;
        return (
            !alreadyUsedQuit &&
            hasSfts && 
            has8ton && 
            hasTimer && 
            hasMana && 
            hasBazinga &&
            gameState.timeLeft <= 10
        );
    },
    effect: function () {
        gameState.activeTimeouts.forEach((timeout) => clearTimeout(timeout));
        gameState.activeTimeouts = [];
        gameState.powerSpawnRate = 17000;
        gameLogic.startGameTimer();
        let totalClearedScore = 0;
        document.querySelectorAll(".enemy").forEach((enemy) => {
            let value = parseInt(enemy.dataset.value || 1);
            if (value < 0) {
              const rect = enemy.getBoundingClientRect();
              const x = rect.left + rect.width / 2;
              const y = rect.top + rect.height / 2;
              ui.createRedEffect(x, y);
              ui.removeElement(enemy);
              return;
            }
            if (enemy.classList.contains("wyat-crab")) {
                const rewinded = parseInt(enemy.dataset.rewinded || "0");
                value = rewinded * 3;
            }
            totalClearedScore += value;
            const rect = enemy.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            ui.createRedEffect(x, y);
            ui.removeElement(enemy);
        });
        ui.updateScore(gameState.score + totalClearedScore);
        clearInterval(gameState.countdownTimer);
        let added = 0;
        const targetAdd = 25;
        const intervalTime = 3000 / targetAdd; 
        let glowToggle = false;
        const timerInterval = setInterval(() => {
            added++;
            gameState.timeLeft++;
            ui.timerDisplay.textContent = `${gameState.timeLeft}s`;
            ui.timerDisplay.classList.remove(glowToggle ? "timer-glow-a" : "timer-glow-b");
            ui.timerDisplay.classList.add(glowToggle ? "timer-glow-b" : "timer-glow-a");
            glowToggle = !glowToggle;
            if (added >= targetAdd) {
                setTimeout(() => ui.timerDisplay.classList.remove("timer-glow-a"), 100);
                setTimeout(() => ui.timerDisplay.classList.remove("timer-glow-b"), 100);
                clearInterval(timerInterval);
                gameLogic.startGameTimer();
            }
        }, intervalTime);
        const audio = new Audio(`${this.folder}/activation.mp3`);
        document.body.appendChild(audio);
        gameState.activePowerAudios.push(audio);
        audio.play();
        gameState.powerUsageLog.activated.quit = (gameState.powerUsageLog.activated.quit || 0) + 1;
        audio.addEventListener("ended", () => {
            ui.cleanupAudio(audio);
            gameState.powerSpawningStarted = false;
            gameLogic.spawnPower();
            gameState.powerSpawnRate = 1000;
            gameLogic.spawnMultipleEnemies();
        });
    }
  }
];
