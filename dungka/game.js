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
        name: "wmian",
        folder: "assets/wmian",
        rarity: 3,
        effect: () => {
            wmianModeActive = true;
            muteAll();
            powerUsageLog.activated.wmiayn = (powerUsageLog.activated.wmiayn || 0) + 1;
            const audio = new Audio("assets/wmian/sound.mp3");
            document.body.appendChild(audio);
            activePowerAudios.push(audio);
            audio.play();
            const allWmianCrabs = [];
            const bigCrabCount = Math.floor(Math.random() * 4) + 3;
            let bigCrabsSpawned = 0;

            function spawnNextBigCrab() {
                if (bigCrabsSpawned >= bigCrabCount) return;
                const bigCrab = spawnBigWmianCrab(allWmianCrabs);
                allWmianCrabs.push(bigCrab);
                bigCrabsSpawned++;
                setTimeout(spawnNextBigCrab, 800);
            }
            spawnNextBigCrab();
            audio.addEventListener("ended", () => {
                if (!gameActive) return;
                cleanupAudio(audio);
                unmuteAll();
                wmianModeActive = false;
                allWmianCrabs.forEach((crab) => {
                    if (crab.dataset.wmianFrameInterval) clearInterval(parseInt(crab.dataset.wmianFrameInterval));
                    if (crab.dataset.wmianMoveInterval) clearInterval(parseInt(crab.dataset.wmianMoveInterval));
                    removeElement(crab);
                });
                powerSpawningStarted = false;
                spawnPower();
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
            isTimerPauseActive = true;
            document.body.classList.add("timerpause-active");
            document.querySelectorAll(".enemy").forEach((e) => {
                if (e.src.includes("crab")) e.classList.add("crab-colored");
            });
            muteAll();
            powerUsageLog.activated.timerpause = (powerUsageLog.activated.timerpause || 0) + 1;
            clearInterval(countdownTimer);
            powerSpawnRate = 1500;
            const selectedSound = getWeightedRandomSound(power.sounds);
            const audio = new Audio(`${power.folder}/${selectedSound.file}`);
            document.body.appendChild(audio);
            activePowerAudios.push(audio);
            audio.play();
            audio.addEventListener("ended", () => {
                if (!gameActive) return;
                cleanupAudio(audio);
                unmuteAll();
                powerSpawnRate = 1000;
                isTimerPauseActive = false;
                startGameTimer();
                document.body.classList.remove("timerpause-active");
                document.querySelectorAll(".crab-colored").forEach((e) => e.classList.remove("crab-colored"));
                powerSpawningStarted = false;
                spawnPower();
            });
        }
    },
    {
        name: "gento",
        folder: "assets/gento",
        rarity: 35,
        effect: () => {
            isGentoActive = true;
            muteAll();
            powerUsageLog.activated.gento = (powerUsageLog.activated.gento || 0) + 1;
            powerSpawnRate = 700;
            const audio = new Audio("assets/gento/sound.mp3");
            document.body.appendChild(audio);
            activePowerAudios.push(audio);
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
                if (!gameActive) return;
                cleanupAudio(audio);
                unmuteAll();
                isGentoActive = false;
                powerSpawnRate = 1000;
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
                powerSpawningStarted = false;
                spawnPower();
            });
        }
    },
    {
        name: "bazinga",
        folder: "assets/bazinga",
        rarity: 60,
        effect: function () {
            powerUsageLog.activated.bazinga = (powerUsageLog.activated.bazinga || 0) + 1;
            const audio = new Audio(`${this.folder}/activation.mp3`);
            document.body.appendChild(audio);
            activePowerAudios.push(audio);
            audio.play();
            const negativeEnemies = document.querySelectorAll('.enemy[data-negative="true"]');
            let wyatReward = 0;
            negativeEnemies.forEach((enemy) => {
                const rect = enemy.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                createElectricityEffect(x, y);
                if (enemy.classList.contains("wyat-crab")) {
                    wyatReward = parseInt(enemy.dataset.rewinded || "0") * 3;
                } else {
                    const value = parseInt(enemy.dataset.value);
                    handleEnemyClick(value * 2);
                }
                removeElement(enemy);
            });
            if (wyatReward > 0) {
                updateScore(score + wyatReward);
            }
            audio.addEventListener("ended", () => {
                cleanupAudio(audio);
                powerSpawningStarted = false;
                spawnPower();
            });
        }
    },
    {
        name: "mana",
        folder: "assets/mana",
        rarity: 30,
        effect: function () {
            powerUsageLog.activated.mana = (powerUsageLog.activated.mana || 0) + 1;
            powerActive = true;
            const addedTime = Math.floor(Math.random() * 6) + 5;
            timeLeft += addedTime;
            timerDisplay.textContent = `${timeLeft}s`;
            timerDisplay.classList.add("timer-glow");
            setTimeout(() => timerDisplay.classList.remove("timer-glow"), 1000);
            const audio = new Audio(`assets/mana/sound.mp3`);
            document.body.appendChild(audio);
            activePowerAudios.push(audio);
            audio.play();
            audio.addEventListener("ended", () => {
                cleanupAudio(audio);
                powerActive = false;
                powerSpawningStarted = false;
                spawnPower();
            });
        }
    },
    {
        name: "crimzone",
        folder: "assets/crimzone",
        rarity: 25,
        effect: () => {
            powerActive = true;
            isCrimzoneActive = true;
            muteAll();
            powerUsageLog.activated.crimzone = (powerUsageLog.activated.crimzone || 0) + 1;
            activeTimeouts.forEach((timeout) => clearTimeout(timeout));
            activeTimeouts = [];
            powerSpawnRate = 17000;
            timerInterval = 2000;
            startGameTimer();
            let totalClearedScore = 0;
            document.querySelectorAll(".enemy").forEach((enemy) => {

                let value = parseInt(enemy.dataset.value || 1);

                if (value < 0) {
                    const rect = enemy.getBoundingClientRect();
                    const x = rect.left + rect.width / 2;
                    const y = rect.top + rect.height / 2;
                    createRedEffect(x, y);
                    removeElement(enemy);
                    return;
                }

                if (enemy.classList.contains("wyat-crab")) {
                    const rewinded = parseInt(enemy.dataset.rewinded || "0");
                    console.log(rewinded);
                    value = rewinded * 3;
                }
                totalClearedScore += value;
                const rect = enemy.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
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
                if (!gameActive || !isCrimzoneActive) return;
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
                    if (!document.body.contains(crab) || !isCrimzoneActive) return;
                    currentY += speed;
                    crab.style.top = `${currentY}px`;
                    frameCount++;
                    if (frameCount % 7 === 0) {
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
                crab.addEventListener("click", () => {
                    handleEnemyClick(4);
                    removeElement(crab);
                });
                document.body.appendChild(crab);
                crimzoneCrabs.push(crab);
                move();
            };
            const spawnInterval = setInterval(spawnCrimzoneCrab, 400);
            activeIntervals.push(spawnInterval);
            audio.addEventListener("ended", () => {
                if (!gameActive) return;
                clearInterval(spawnInterval);
                document.querySelectorAll(".crimzone-crab").forEach(removeElement);
                unmuteAll();
                powerSpawnRate = 1000;
                isCrimzoneActive = false;
                timerInterval = 1000;
                startGameTimer();
                powerActive = false;
                cleanupAudio(audio);
                powerSpawningStarted = false;
                spawnMultipleEnemies();
                spawnPower();
            });
        },
    },
    {
        name: "sfts",
        folder: "assets/sfts",
        rarity: 25,
        effect: function () {
            isSftsActive = true;
            powerActive = true;
            muteAll();
            powerUsageLog.activated.sfts = (powerUsageLog.activated.sfts || 0) + 1;
            activeTimeouts.forEach((timeout) => clearTimeout(timeout));
            activeTimeouts = [];
            powerSpawnRate = 17000;
            timerInterval = 2000;
            startGameTimer();
            let totalClearedScore = 0;
            document.querySelectorAll(".enemy").forEach((enemy) => {
                let value = parseInt(enemy.dataset.value || 1);
                if (value < 0) {
                    const rect = enemy.getBoundingClientRect();
                    const x = rect.left + rect.width / 2;
                    const y = rect.top + rect.height / 2;
                    createElectricityEffect(x, y);
                    removeElement(enemy);
                    return;
                }
                if (enemy.classList.contains("wyat-crab")) {
                    const rewinded = parseInt(enemy.dataset.rewinded || "0");
                    console.log(rewinded);
                    value = rewinded * 3;
                }
                totalClearedScore += value;
                const rect = enemy.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                createElectricityEffect(x, y);
                removeElement(enemy);
            });
            updateScore(score + totalClearedScore);
            const audio = new Audio(`${this.folder}/sound.mp3`);
            document.body.appendChild(audio);
            activePowerAudios.push(audio);
            audio.play();
            const sftsCrabs = [];
            let spawnCrabNext = true;

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
                    if (!enemy.parentNode || !isSftsActive) return;
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const x = startX + (endX - startX) * progress;
                    const y = -100 + (window.innerHeight + 200) * progress;
                    const rotation = progress * 360;
                    enemy.style.left = `${x}px`;
                    enemy.style.top = `${y}px`;
                    enemy.style.transform = `rotate(${rotation}deg)`;
                    if (frameCount % 3 === 0) createTrailParticle(x, y);
                    frameCount++;
                    if (progress < 1) requestAnimationFrame(animate);
                    else removeElement(enemy);
                };
                enemy.addEventListener("click", () => {
                    handleEnemyClick(-3);
                    const voice = new Audio(`assets/sb${sbIndex}/click.mp3`);
                    voice.play();
                    removeElement(enemy);
                });
                document.body.appendChild(enemy);
                sftsCrabs.push(enemy);
                requestAnimationFrame(animate);
            }
            sftsSpawnInterval = setInterval(() => {
                if (!gameActive || !isSftsActive) return;
                const roll = Math.random();
                if (roll < 0.8) {
                    spawnSftsCrab.call(this);
                } else {
                    spawnSftsPositive();
                }
            }, 600);
            audio.addEventListener("ended", () => {
                if (!gameActive) return;
                clearInterval(sftsSpawnInterval);
                document.querySelectorAll(".sfts-crab").forEach(removeElement);
                document.querySelectorAll(".sfts-positive").forEach(removeElement);
                powerSpawnRate = 1000;
                isSftsActive = false;
                powerActive = false;
                timerInterval = 1000;
                startGameTimer();
                unmuteAll();
                cleanupAudio(audio);
                powerSpawningStarted = false;
                spawnPower();
                spawnMultipleEnemies();
            });
        }
    },
    {
        name: "8tonball",
        folder: "assets/8tonball",
        rarity: 20,
        effect: function () {
            eightTonActive = true;
            ballCanBounce = true;
            let ballActive = true;
            let frame = 1;
            let frameCount = 5;
            const folder = this.folder;
            timerInterval = 2000;
            startGameTimer();
            powerActive = true;
            muteAll();
            powerUsageLog.activated["8tonball"] = (powerUsageLog.activated["8tonball"] || 0) + 1;
            const ball = document.createElement("img");
            ball.src = `${folder}/1.png`;
            ball.style.position = "fixed";
            ball.style.width = "120px";
            ball.style.height = "120px";
            ball.style.zIndex = "40";
            ball.style.pointerEvents = "none";
            ball.style.userSelect = "none";
            const speed = isMobile ? 3 : 6;
            let vx, vy;
            const corner = Math.floor(Math.random() * 4);
            let x, y;
            switch (corner) {
                case 0:
                    x = -120;
                    y = -120;
                    vx = speed;
                    vy = speed;
                    break;
                case 1:
                    x = window.innerWidth + 120;
                    y = -120;
                    vx = -speed;
                    vy = speed;
                    break;
                case 2:
                    x = window.innerWidth + 120;
                    y = window.innerHeight + 120;
                    vx = -speed;
                    vy = -speed;
                    break;
                case 3:
                    x = -120;
                    y = window.innerHeight + 120;
                    vx = speed;
                    vy = -speed;
                    break;
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
                if (ballCanBounce) {
                    if (x < 0) {
                        x = 0;
                        vx = Math.abs(vx);
                    } else if (x > window.innerWidth - 120) {
                        x = window.innerWidth - 120;
                        vx = -Math.abs(vx);
                    }
                    if (y < 0) {
                        y = 0;
                        vy = Math.abs(vy);
                    } else if (y > window.innerHeight - 120) {
                        y = window.innerHeight - 120;
                        vy = -Math.abs(vy);
                    }
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
                        createClickSplash(`${enemyX - 60}px`, `${enemyY - 60}px`);
                        let value;
                        if (enemy.classList.contains("wyat-crab")) {
                            const rewinded = parseInt(enemy.dataset.rewinded || "0");
                            value = rewinded * 3;
                        } else if (enemy.dataset.negative === "true") {
                            value = 2;
                        } else {
                            value = -8;
                        }
                        updateScore(score + value);
                        removeElement(enemy);
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
                        handleEnemyClick(8);
                        const indexMatch = enemy.src.match(/sb(\d)/);
                        if (indexMatch) {
                            const sbIndex = indexMatch[1];
                            const voice = new Audio(`assets/sb${sbIndex}/click.mp3`);
                            voice.play();
                        }
                        removeElement(enemy);
                    };
                }
            });
            const audio = new Audio(`${folder}/sound.mp3`);
            document.body.appendChild(audio);
            activePowerAudios.push(audio);
            audio.play();
            audio.addEventListener("ended", () => {
                document.querySelectorAll(".enemy").forEach((enemy) => {
                    if (enemy.dataset.negative === "false" && enemy.dataset.originalClick) {
                        enemy.onclick = enemy.dataset.originalClick;
                    }
                });
                eightTonActive = false;
                ballCanBounce = false;
                ballActive = false;
                powerSpawnRate = 1000;
                powerActive = false;
                timerInterval = 1000;
                startGameTimer();
                unmuteAll();
                cleanupAudio(audio);
                powerSpawningStarted = false;
                spawnPower();
            });
        }
    },
    {
        name: "wyat",
        folder: "assets/wyat",
        rarity: 20,
    
        effect: function () {
            wyatActive = true;
            let rewindedScore = 0;
            const folder = this.folder;
            const maxPops = 6;
            let popCount = 0;
    
            powerUsageLog.activated.wyat = (powerUsageLog.activated.wyat || 0) + 1;
    
            // WYAT crab element
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
            document.body.appendChild(wyatCrab);
    
            // Frame animation
            let currentFrame = 0;
            const animInterval = setInterval(() => {
                currentFrame = (currentFrame + 1) % 2;
                wyatCrab.src = `${folder}/${currentFrame + 1}.png`;
            }, 300);
            wyatCrab.dataset.animInterval = animInterval;
    
            // Cleanup function (now globally callable)
            window.forceRemoveWyatQuietly = function() {
                if (!document.body.contains(wyatCrab)) return;
    
                // Stop animation and pop timers
                clearInterval(animInterval);
                clearInterval(popInterval);
                clearTimeout(autoEndTimeout);
    
                wyatActive = false;
                removeElement(wyatCrab);
            };
    
            // WYAT Pop logic
            function popIn() {
                if (!wyatActive || !document.body.contains(wyatCrab)) {
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
                    if (!wyatActive || !document.body.contains(wyatCrab)) return;
    
                    wyatCrab.style.display = "none";
    
                    const popPenalty = Math.floor(Math.random() * 11) + 10;
                    rewindedScore += popPenalty;
                    wyatCrab.dataset.rewinded = rewindedScore;
                    updateScore(score - popPenalty);
    
                    timeLeft += 3;
                    timerDisplay.textContent = `${timeLeft}s`;
                    timerDisplay.classList.add("timer-glow");
                    setTimeout(() => timerDisplay.classList.remove("timer-glow"), 1000);
    
                    const outAudio = new Audio(`${folder}/popout.mp3`);
                    outAudio.play();
    
                    popCount++;
                }, 500);
            }
    
            const popInterval = setInterval(popIn, 1500);
            popIn();
    
            // WYAT click handler (Reward)
            wyatCrab.addEventListener("click", () => {
                if (!document.body.contains(wyatCrab)) return;
    
                const clickAudio = new Audio(`${folder}/click.mp3`);
                clickAudio.play();
    
                const rect = wyatCrab.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2 - 60;
                const centerY = rect.top + rect.height / 2 - 60;
                createWYATSplash(centerX, centerY);
    
                updateScore(score + (rewindedScore * 2));
    
                window.forceRemoveWyatQuietly();
                powerSpawningStarted = false;
            });
    
            // Auto-end after 8.3 seconds
            const autoEndTimeout = setTimeout(() => {
                if (document.body.contains(wyatCrab)) {
                    window.forceRemoveWyatQuietly();
                }
                wyatActive = false;
                powerSpawningStarted = false;
            }, 8300);
    
            powerActive = false;
            spawnPower();
        }
    },    
    {
        name: "what",
        folder: "assets/what",
        rarity: 25,
        effect: function () {
            muteAll();
            powerUsageLog.activated.what = (powerUsageLog.activated.what || 0) + 1;
            const folder = this.folder;
            whatActive = true;
            activeTimeouts.forEach((timeout) => clearTimeout(timeout));
            activeTimeouts = [];
            powerSpawnRate = 17000;
            timerInterval = 2000;
            startGameTimer();
            let totalClearedScore = 0;
            document.querySelectorAll(".enemy").forEach((enemy) => {
                let value = parseInt(enemy.dataset.value || 1);
                if (value < 0) {
                    const rect = enemy.getBoundingClientRect();
                    const x = rect.left + rect.width / 2;
                    const y = rect.top + rect.height / 2;
                    createWhatHeartSplash(x, y);
                    removeElement(enemy);
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
                createWhatHeartSplash(x, y);
                removeElement(enemy);
            });
            updateScore(score + totalClearedScore);
            const audio = new Audio(`${folder}/sound.mp3`);
            document.body.appendChild(audio);
            activePowerAudios.push(audio);
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
                    if (!crab.parentNode || !whatActive) return;
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
                        removeElement(crab);
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
                    handleEnemyClick(4);
                    createWhatHeartSplash(parseInt(crab.style.left) + size / 2, parseInt(crab.style.top) + size / 2);
                    clearInterval(animInterval);
                    removeElement(crab);
                });
            }
            const spawnInterval = setInterval(() => {
                if (!whatActive) return;
                spawnWhatCrab();
            }, 500);
            audio.addEventListener("ended", () => {
                powerSpawnRate = 1000;
                whatActive = false;
                clearInterval(spawnInterval);
                timerInterval = 1000;
                startGameTimer();
                allWhatCrabs.forEach((crab) => {
                    if (crab.dataset.animInterval) clearInterval(parseInt(crab.dataset.animInterval));
                    removeElement(crab);
                });
                cleanupAudio(audio);
                unmuteAll();
                powerSpawningStarted = false;
                spawnPower();
                spawnMultipleEnemies();
            });
        }
    },
    {
        name: "quit",
        folder: "assets/quit",
        rarity: 1,
        oncePerGame: true,
        canSpawn: function () {
            const hasSfts = !!powerUsageLog.activated.sfts;
            const has8ton = !!powerUsageLog.activated["8tonball"];
            const hasTimer = !!powerUsageLog.activated.timerpause;
            const hasMana = !!powerUsageLog.activated.mana;
            const hasBazinga = !!powerUsageLog.activated.bazinga;
            const alreadyUsedQuit = powerUsageLog.activated.quit >= 1;

            return (
                !alreadyUsedQuit &&
                hasSfts &&
                has8ton &&
                hasTimer &&
                hasMana &&
                hasBazinga &&
                timeLeft <= 10
            );
        },
        effect: function () {
            activeTimeouts.forEach((timeout) => clearTimeout(timeout));
            activeTimeouts = [];
            powerSpawnRate = 17000;
            startGameTimer();
            let totalClearedScore = 0;
            document.querySelectorAll(".enemy").forEach((enemy) => {
                let value = parseInt(enemy.dataset.value || 1);
                if (value < 0) {
                    const rect = enemy.getBoundingClientRect();
                    const x = rect.left + rect.width / 2;
                    const y = rect.top + rect.height / 2;
                    createRedEffect(x, y);
                    removeElement(enemy);
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
                createRedEffect(x, y);
                removeElement(enemy);
            });
            updateScore(score + totalClearedScore);

            clearInterval(countdownTimer);

            let added = 0;
            const targetAdd = 30;
            const intervalTime = 3000 / targetAdd;
            let glowToggle = false;
            const timerInterval = setInterval(() => {
                added++;
                timeLeft++;
                timerDisplay.textContent = `${timeLeft}s`;
                timerDisplay.classList.remove(glowToggle ? "timer-glow-a" : "timer-glow-b");
                timerDisplay.classList.add(glowToggle ? "timer-glow-b" : "timer-glow-a");
                glowToggle = !glowToggle;

                if (added >= targetAdd) {
                    setTimeout(() => timerDisplay.classList.remove("timer-glow-a"), 100);
                    setTimeout(() => timerDisplay.classList.remove("timer-glow-b"), 100);
                    clearInterval(timerInterval);
                    startGameTimer();
                }
            }, intervalTime);

            const audio = new Audio(`${this.folder}/activation.mp3`);
            document.body.appendChild(audio);
            activePowerAudios.push(audio);
            audio.play();

            powerUsageLog.activated.quit = (powerUsageLog.activated.quit || 0) + 1;

            audio.addEventListener("ended", () => {
                cleanupAudio(audio);
                powerSpawningStarted = false;
                spawnPower();
                powerSpawnRate = 1000;
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
let lastPowerInteractionTime = 0;
const POWER_INTERACTION_THRESHOLD = 2000;
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
let eightTonActive = false;
let wyatActive = false;
let whatActive = false;
let ballCanBounce = true;
let scoreSubmitted = false;
let lastScoreSubmissionTime = 0;
let gameStartTime;
const SUBMISSION_COOLDOWN = 60000;
let timerInterval = 1000;

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
const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const powerUsageLog = { shown: {}, activated: {} };

window.addEventListener("load", () => {
    musicPrestart.volume = 0.5;
    musicIngame.volume = 0.5;
    musicPrestart.play().catch(() => {});
    pulseTitle();
});

startBtn.addEventListener("click", initializeGame);

function showScreen(screenId) {
    document.querySelectorAll(".screen").forEach((screen) => screen.classList.remove("active"));
    document.getElementById(screenId).classList.add("active");
}

function initializeGame() {
    const name = usernameInput.value.trim();
    if (!name || name.length < 4 || name.length > 15) {
        alert("Username must be 4 to 15 characters.");
        return;
    }
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
    gameStartTime = Date.now();
    powerSpawningStarted = false;
    spawnMultipleEnemies();
    spawnPower();
    startGameTimer();
    powerUsageLog.shown = {};
    powerUsageLog.activated = {};
}

function startGameTimer() {
    clearInterval(countdownTimer);
    if (!gameActive || timeLeft <= 0) return;
    countdownTimer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = `${timeLeft}s`;
        if (timeLeft <= 0) endGame();
    }, timerInterval);
}

function endGame() {
    if (!scoreSubmitted) sendScoreToSheet(score);
    isGentoActive = false;
    eightTonActive = false;
    ballCanBounce = false;
    isTimerPauseActive = false;
    isWmianActive = false;
    isSftsActive = false;
    isCrimzoneActive = false;
    whatActive = false;
    powerSpawningStarted = false;
    powerActive = false;
    clearInterval(countdownTimer);
    clearAllEnemies();
    clearAllPowerUps();
    clearPowerEffects();
    clearAllTimers();
    resetGameState();
    powerUsageLog.shown = {};
    powerUsageLog.activated = {};
    document.querySelectorAll('img[src*="8tonball"]').forEach(removeElement);
    document.querySelectorAll(".sfts-crab").forEach(removeElement);
    document.querySelectorAll(".crimzone-crab").forEach(removeElement);
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
        `“Shet ${username}, ${score}?? Hindi ka na gamer, performer ka na!”`,
        `“Ay grabe... ${username} went full GENTO mode! ${score} points!”`,
        `“Crabs left the chat. ${username} cleared ${score} worth of bad vibes!”`,
        `“With ${score} points, ${username} just made SB19 proud! G ka na for world tour?”`,
        `“The Zone defended like a champ! ${username} racked up ${score} anti-crab points!”`,
        `“Naka-hyper mode ka ba, ${username}? ${score} points! Pak na pak!”`,
        `“Walang crab-crab kay ${username}. ${score} points na agad! 😤”`,
        `“SB19 sa inyo: ‘SALAMAT PO ${username}!’ Dahil sa ${score} points mo.”`,
        `“Hindi ka lang naglaro, ${username}, nag-perform ka rin! ${score} points!”`,
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
        `“Nooo ${username}! You clicked our PPOP Kings 😭 Score: ${score}... not good.”`,
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
    eightTonActive = false;
    ballCanBounce = false;
    isSftsActive = false;
    isCrimzoneActive = false;
    whatActive = false;
    activePowerAudios.forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
        if (audio.parentNode) audio.parentNode.removeChild(audio);
    });
    activePowerAudios = [];
    document.getElementById("power-overlay").style.display = "none";
    unmuteAll();
    enemyTypes.forEach((type) => {
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

function addEnemyClickHandlers(enemy, value, isNegative) {
    const clickHandler = () => {
        let finalValue = value;
        if (isGentoActive && finalValue > 0) finalValue = 3;
        if (isTimerPauseActive && finalValue > 0) finalValue = 3;
        if (eightTonActive && finalValue < 0) finalValue = 8;
        handleEnemyClick(finalValue);
        let clickSoundPath;
        if (isGentoActive && isNegative) {
            clickSoundPath = "assets/gento/click.mp3";
        } else if (enemy.dataset.originalSound) {
            clickSoundPath = enemy.dataset.originalSound;
        } else if (isNegative) {
            clickSoundPath = "assets/crab/click.mp3";
        } else {
            const indexMatch = enemy.src.match(/sb(\d)/);
            if (indexMatch) {
                clickSoundPath = `assets/sb${indexMatch[1]}/click.mp3`;
            }
        }
        if (clickSoundPath) {
            const clickSound = new Audio(clickSoundPath);
            clickSound.play();
        }
        createClickSplash(enemy.style.left, enemy.style.top);
        removeElement(enemy);
    };
    enemy.addEventListener("pointerdown", clickHandler);
    enemy.addEventListener("mousedown", clickHandler);
    enemy.addEventListener("touchstart", clickHandler);
}

function createEnemy(enemyData) {
    const isNegative = enemyData.value > 0;
    const enemy = document.createElement("img");
    enemy.classList.add("enemy");
    if (isTimerPauseActive && isNegative) enemy.classList.add("crab-colored");
    if (enemyData.label === "PARTY CRAB") enemy.classList.add("big-crab");
    let frame1, frame2, soundPath;
    if (isGentoActive && isNegative) {
        frame1 = "assets/gento/1.png";
        frame2 = "assets/gento/2.png";
        soundPath = "assets/gento/click.mp3";
        enemy.dataset.gentoTransformed = "true";
        enemy.dataset.originalFrames = JSON.stringify({ frame1: "assets/crab/1.png", frame2: "assets/crab/2.png" });
        enemy.dataset.originalSound = "assets/crab/click.mp3";
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
    enemy.src = frame1;
    enemy.alt = enemyData.label;
    enemy.title = enemyData.label;
    enemy.dataset.negative = (enemyData.value > 0).toString();
    enemy.dataset.value = enemyData.value;
    const size = 100;
    const x = enemyData.spawnOverridePosition?.x || Math.random() * (window.innerWidth - size);
    const y = enemyData.spawnOverridePosition?.y || Math.random() * (window.innerHeight - size);
    Object.assign(enemy.style, { left: `${x}px`, top: `${y}px`, width: `${size}px`, position: "absolute", pointerEvents: "auto", cursor: "pointer", zIndex: "10", objectFit: "contain", userSelect: "none" });
    let currentFrame = 0;
    if (isGentoActive && isNegative) {
        const gentoInterval = setInterval(() => {
            currentFrame = (currentFrame + 1) % 2;
            enemy.src = `assets/gento/${currentFrame + 1}.png`;
        }, 300);
        enemy.dataset.gentoInterval = gentoInterval;
    } else {
        const animationInterval = setInterval(() => {
            currentFrame = (currentFrame + 1) % 2;
            enemy.src = currentFrame === 0 ? frame1 : frame2;
        }, 300);
        enemy.dataset.intervalId = animationInterval;
    }
    let value = enemyData.tempValue || enemyData.value;
    if (isGentoActive && value > 0) value = 3;
    if (isTimerPauseActive && value > 0) value = 3;
    if (eightTonActive && value < 0) value = 8;
    let clickSoundPath;
    if (isGentoActive && isNegative) {
        clickSoundPath = "assets/gento/click.mp3";
    } else if (enemy.dataset.originalSound) {
        clickSoundPath = enemy.dataset.originalSound;
    } else if (isNegative) {
        clickSoundPath = "assets/crab/click.mp3";
    } else {
        const indexMatch = enemy.src.match(/sb(\d)/);
        if (indexMatch) {
            clickSoundPath = `assets/sb${indexMatch[1]}/click.mp3`;
        }
    }
    addEnemyClickHandlers(enemy, value, isNegative);
    document.body.appendChild(enemy);
    if (!isNegative) {
        setTimeout(() => {
            if (document.body.contains(enemy)) {
                removeElement(enemy);
            }
        }, 4000);
    }
}

function showPowerInstruction(text, color = "white") {
    const instruction = document.getElementById("power-instruction");
    instruction.textContent = text;
    instruction.style.color = color;
    instruction.classList.remove("hidden", "flash-animation");
    void instruction.offsetWidth;
    instruction.classList.add("flash-animation");
    setTimeout(() => {
        instruction.classList.add("hidden");
    }, 1000);
}

function spawnPower() {
    if (!gameActive || powerActive) return;
    
    const eligiblePowers = powers.filter(power => {
        const hasShown = !!powerUsageLog.shown[power.name];
        const passesCanSpawn = !power.canSpawn || power.canSpawn();
        const isOneTimePower = power.oncePerGame;
    
        // For powers marked as oncePerGame, only allow them if not shown yet
        if (isOneTimePower && hasShown) return false;

        if (wyatActive) {
            const blockedDuringWyat = ["wyat", "gento", "timerpause", "mana", "wmian"];
            if (blockedDuringWyat.includes(power.name)) {
                return false;
            }
        }
    
        return passesCanSpawn;
    });

    if (eligiblePowers.length === 0) return;

    const powerSpawnTime = Date.now();
    const timeSinceLastInteraction = powerSpawnTime - lastPowerInteractionTime;

    const initialDelay = timeSinceLastInteraction > POWER_INTERACTION_THRESHOLD
        ? Math.random() * 2000 + 1000
        : Math.random() * 500 + 500;

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

    // === PRIORITY CHECK: Force Spawn Quit if its canSpawn() is met ===
    const quitPower = powers.find(p => p.name === "quit");
    const quitReady = quitPower && (!quitPower.oncePerGame || !powerUsageLog.shown["quit"]) && (!quitPower.canSpawn || quitPower.canSpawn());

    let selectedPower = null;

    if (quitReady) {
        selectedPower = quitPower;
    } else {
        // Otherwise: Weighted random selection
        const totalRarity = eligiblePowers.reduce((sum, power) => sum + power.rarity, 0);
        let roll = Math.random() * totalRarity;

        for (const power of eligiblePowers) {
            roll -= power.rarity;
            if (roll <= 0) {
                selectedPower = power;
                break;
            }
        }
    }

    if (!selectedPower) return;

    powerActive = true;
    
    powerUsageLog.shown[selectedPower.name] = (powerUsageLog.shown[selectedPower.name] || 0) + 1;
    const powerImg = document.createElement("img");
    const frame1 = `${selectedPower.folder}/power1.png`;
    const frame2 = `${selectedPower.folder}/power2.png`;
    let currentFrame = 0;
    powerImg.src = frame1;
    powerImg.classList.add("power");
    powerImg.alt = selectedPower.name;
    powerImg.title = selectedPower.name;
    const size = 100;
    const x = Math.random() * (window.innerWidth - size);
    const y = Math.random() * (window.innerHeight - size);
    Object.assign(powerImg.style, { left: `${x}px`, top: `${y}px`, width: `${size}px`, position: "absolute", cursor: "pointer", zIndex: "15", objectFit: "contain", userSelect: "none", pointerEvents: "auto" });
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
        powerImg.removeEventListener("click", handleClick);
        powerImg.removeEventListener("touchstart", handleClick);
        lastPowerInteractionTime = Date.now();
        const rect = powerImg.getBoundingClientRect();
        const px = rect.left + rect.width / 2;
        const py = rect.top + rect.height / 2;
        createPowerSplash(px, py);
        selectedPower.effect();
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

function spawnBigWmianCrab(allWmianCrabs) {
    const crab = document.createElement("img");
    crab.classList.add("enemy", "big-crab");
    crab.src = "assets/wmian/1.png";
    crab.dataset.wmianCrab = "true";
    const size = 150;
    let x = Math.random() * (window.innerWidth - size);
    let y = Math.random() * (window.innerHeight - size);
    crab.style.position = "absolute";
    crab.style.left = `${x}px`;
    crab.style.top = `${y}px`;
    crab.style.width = `${size}px`;
    crab.style.height = `${size}px`;
    crab.style.zIndex = "20";
    let currentFrame = 0;
    const frameInterval = setInterval(() => {
        currentFrame = (currentFrame + 1) % 2;
        crab.src = `assets/wmian/${currentFrame + 1}.png`;
    }, 300);
    crab.dataset.wmianFrameInterval = frameInterval;
    const moveInterval = setInterval(() => {
        x = Math.random() * (window.innerWidth - size);
        y = Math.random() * (window.innerHeight - size);
        crab.style.left = `${x}px`;
        crab.style.top = `${y}px`;
    }, 1000);
    crab.dataset.wmianMoveInterval = moveInterval;
    crab.addEventListener("click", () => {
        const clickSound = new Audio("assets/wmian/click.mp3");
        clickSound.play();
        handleEnemyClick(20);
        for (let i = 0; i < 5; i++) {
            const smallCrab = document.createElement("img");
            smallCrab.classList.add("enemy", "big-crab");
            smallCrab.src = "assets/wmian/1.png";
            smallCrab.dataset.wmianCrab = "true";
            const smallSize = 100;
            let sx = Math.random() * (window.innerWidth - smallSize);
            let sy = Math.random() * (window.innerHeight - smallSize);
            smallCrab.style.position = "absolute";
            smallCrab.style.left = `${sx}px`;
            smallCrab.style.top = `${sy}px`;
            smallCrab.style.width = `${smallSize}px`;
            smallCrab.style.height = `${smallSize}px`;
            smallCrab.style.zIndex = "20";
            let smallFrame = 0;
            const smallFrameInterval = setInterval(() => {
                smallFrame = (smallFrame + 1) % 2;
                smallCrab.src = `assets/wmian/${smallFrame + 1}.png`;
            }, 300);
            smallCrab.dataset.wmianFrameInterval = smallFrameInterval;
            const smallMoveInterval = setInterval(() => {
                sx = Math.random() * (window.innerWidth - smallSize);
                sy = Math.random() * (window.innerHeight - smallSize);
                smallCrab.style.left = `${sx}px`;
                smallCrab.style.top = `${sy}px`;
            }, 1000);
            smallCrab.dataset.wmianMoveInterval = smallMoveInterval;
            smallCrab.addEventListener("click", () => {
                const smallClickSound = new Audio("assets/wmian/click.mp3");
                smallClickSound.play();
                handleEnemyClick(10);
                clearInterval(smallFrameInterval);
                clearInterval(smallMoveInterval);
                removeElement(smallCrab);
            });
            document.body.appendChild(smallCrab);
            allWmianCrabs.push(smallCrab);
        }
        clearInterval(frameInterval);
        clearInterval(moveInterval);
        removeElement(crab);
    });
    document.body.appendChild(crab);
    return crab;
}

function clearAllPowerUps() {
    document.querySelectorAll(".power").forEach(removeElement);
}

function clearAllTimers() {
    activeTimeouts.forEach((timeout) => clearTimeout(timeout));
    activeIntervals.forEach((interval) => clearInterval(interval));
    activeTimeouts = [];
    activeIntervals = [];
    clearInterval(countdownTimer);
}

function resetGameState() {
    isGentoActive = false;
    eightTonActive = false;
    ballCanBounce = false;
    isTimerPauseActive = false;
    isWmianActive = false;
    isSftsActive = false;
    wyatActive = false;
    isCrimzoneActive = false;
    whatActive = false;
    powerActive = false;
    powerSpawningStarted = false;
    powerSpawnRate = 1000;
    timerInterval = 1000;
    powerUsageLog.shown = {};
    powerUsageLog.activated = {};
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
    scoreFadeTimeout = setTimeout(() => (scoreDisplay.style.opacity = 0.3), 1000);
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

function createWhatHeartSplash(x, y) {
    const splash = document.createElement("div");
    splash.classList.add("what-heart-splash");
    splash.style.left = typeof x === "number" ? `${x}px` : x;
    splash.style.top = typeof y === "number" ? `${y}px` : y;
    document.body.appendChild(splash);
    setTimeout(() => splash.remove(), 600);
}

function createPowerSplash(x, y) {
    const splash = document.createElement("div");
    splash.classList.add("power-splash");
    splash.style.left = typeof x === "number" ? `${x}px` : x;
    splash.style.top = typeof y === "number" ? `${y}px` : y;
    document.body.appendChild(splash);
    setTimeout(() => splash.remove(), 600);
}

function muteAll() {
    document.querySelectorAll("audio").forEach((audio) => (audio.muted = true));
}

function unmuteAll() {
    document.querySelectorAll("audio").forEach((audio) => (audio.muted = false));
}

function showPowerOverlay(color = "rgba(255, 255, 0, 0.25)") {
    const overlay = document.getElementById("power-overlay");
    overlay.style.background = color;
    overlay.style.display = "block";
    overlay.style.animation = "flash 0.3s ease-out forwards";
    if (color.includes("255, 255")) document.body.classList.add("timerpause-active");
    setTimeout(() => {
        overlay.style.display = "none";
        document.body.classList.remove("timerpause-active");
    }, 300);
}

function clearAllEnemies() {
    document.querySelectorAll(".enemy").forEach(removeElement);
    activeTimeouts = activeTimeouts.filter((id) => {
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
    explosion.style.animation = "explosionScale 0.8s ease-out forwards";
    setTimeout(() => removeElement(explosion), 800);
}

function createTrailParticle(x, y) {
    const particle = document.createElement("div");
    particle.className = "trail-particle";
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
    } else if (eightTonActive) {
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

function createWYATSplash(x, y) {
    const splash = document.createElement("div");
    splash.classList.add("splash");
    splash.style.background = `
  radial-gradient(circle, 
    rgba(0, 255, 255, 0.8) 0%, 
    rgba(0, 128, 255, 0.4) 60%, 
    transparent 100%)
`;
    splash.style.boxShadow = `
  0 0 8px #0ff, 
  0 0 20px #0ff, 
  0 0 30px #0ff, 
  0 0 40px #00f
`;
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

const devtoolsCheck = () => {
    try {
        const threshold = 100;
        devtoolsOpen = Math.abs(window.outerWidth - window.innerWidth) > threshold || Math.abs(window.outerHeight - window.innerHeight) > threshold || window.Firebug?.firebugEnabled;
    } catch {}
};
setInterval(devtoolsCheck, 500);

function sendScoreToSheet(score) {
    const gameDurationSeconds = Math.floor((Date.now() - gameStartTime) / 1000);
    const devtoolsNow = (() => {
        try {
            const threshold = 160;
            return Math.abs(window.outerWidth - window.innerWidth) > threshold || Math.abs(window.outerHeight - window.innerHeight) > threshold;
        } catch {
            return false;
        }
    })();
    const now = Date.now();
    if (scoreSubmitted) return;
    if (now - lastScoreSubmissionTime < SUBMISSION_COOLDOWN) return;
    scoreSubmitted = true;
    lastScoreSubmissionTime = now;
    const payload = new URLSearchParams();
    payload.append("score", score);
    payload.append("username", username);
    payload.append("devtools", devtoolsNow ? "yes" : "no");
    payload.append("powers_shown", JSON.stringify(powerUsageLog.shown));
    payload.append("powers_activated", JSON.stringify(powerUsageLog.activated));
    payload.append("game_duration", gameDurationSeconds);
    fetch("https://script.google.com/macros/s/AKfycbwWhP0Lg2xeZNnvmrGEO6fkWF-XyDIjts0t7NRHWrtCIhBvXFuxGos4TYIEWcOJNDnt/exec", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: payload.toString() });
}

restartBtn.addEventListener("click", () => {
    scoreSubmitted = false;
    isGentoActive = false;
    isTimerPauseActive = false;
    isWmianActive = false;
    isSftsActive = false;
    eightTonActive = false;
    isCrimzoneActive = false;
    whatActive = false;
    ballCanBounce = false;
    powerSpawningStarted = false;
    powerSpawnRate = 1000;
    powerActive = false;
    clearInterval(countdownTimer);
    clearAllEnemies();
    clearAllPowerUps();
    clearPowerEffects();
    clearAllTimers();
    resetGameState();
    powerUsageLog.shown = {};
    powerUsageLog.activated = {};
    document.querySelectorAll(".sfts-crab").forEach(removeElement);
    document.querySelectorAll(".crimzone-crab").forEach(removeElement);
    if (sftsSpawnInterval) clearInterval(sftsSpawnInterval);
    showScreen("gameScreen");
    score = 0;
    timeLeft = 60;
    gameActive = true;
    initializeGame();
});

returnToTitleBtn.addEventListener("click", () => showScreen("titleScreen"));
document.addEventListener("contextmenu", (e) => e.preventDefault());
window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey && (e.key === "+" || e.key === "-" || e.key === "=")) || e.key === "F12" || (e.ctrlKey && e.shiftKey && ["I", "J", "U"].includes(e.key.toUpperCase())) || (e.ctrlKey && e.key === "U")) e.preventDefault();
});
window.addEventListener(
    "wheel",
    (e) => {
        if (e.ctrlKey) e.preventDefault();
    },
    { passive: false }
);

document.addEventListener("gesturestart", (e) => e.preventDefault());
document.addEventListener("gesturechange", (e) => e.preventDefault());
document.addEventListener("gestureend", (e) => e.preventDefault());
document.querySelectorAll("img").forEach((img) => img.addEventListener("dragstart", (e) => e.preventDefault()));
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
    const leaderboardBody = document.getElementById("leaderboardBody");
    const requestedUsername = username;
    leaderboardBody.innerHTML = '<tr><td colspan="3"><div class="loading-spinner"></div></td></tr>';
    fetch(`https://script.google.com/macros/s/AKfycbwWhP0Lg2xeZNnvmrGEO6fkWF-XyDIjts0t7NRHWrtCIhBvXFuxGos4TYIEWcOJNDnt/exec?username=${encodeURIComponent(requestedUsername.toLowerCase())}`)
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
            currentScoreRow.innerHTML = `<td>${userRank}</td><td><strong>${username}</strong></td><td>${userHighScore}</td>`;
            leaderboardBody.appendChild(currentScoreRow);
            const highScoreRow = document.createElement("tr");
            highScoreRow.classList.add("current-user");
            highScoreRow.innerHTML = `<td></td><td><strong>Current Score</strong></td><td>${score}</td>`;
            leaderboardBody.appendChild(highScoreRow);
        })
        .catch((err) => {
            leaderboardBody.innerHTML = '<tr><td colspan="3">Error loading leaderboard</td></tr>';
        });
}

function removeElement(element) {
    if (element && element.parentNode) {
        if (element.classList.contains("wyat-crab") && typeof element.cleanupWyat === "function") {
            element.cleanupWyat();
        }
        if (element.dataset.animInterval) {
            clearInterval(element.dataset.animInterval);
        }
        element.parentNode.removeChild(element);
    }
}

function cleanupAudio(audio) {
    audio.remove();
    const index = activePowerAudios.indexOf(audio);
    if (index > -1) activePowerAudios.splice(index, 1);
}