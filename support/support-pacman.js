"use strict";
(function () {
  var ROWS = 19, COLS = 27;
  var TUNNEL_ROW = Math.floor(ROWS / 2);
  var BEST_KEY = "lolomakuPacmanBest";
  var stage = document.getElementById("pacman-stage");
  var canvas = document.getElementById("pacman-canvas");
  var scoreEl = document.getElementById("pacman-score");
  var scoreValueEl = document.getElementById("pacman-score-value");
  var bestValueEl = document.getElementById("pacman-best-value");
  var ghostImg = document.getElementById("pacman-ghost");
  var container = document.querySelector(".support-bg-ghosts");
  var joystickEl = document.getElementById("pacman-joystick");
  var joystickBase = document.getElementById("pacman-joystick-base");
  var joystickKnob = document.getElementById("pacman-joystick-knob");
  if (!stage || !canvas || !scoreEl || !ghostImg || !container) return;

  var ctx = canvas.getContext("2d");
  var reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var mazeLayer = document.createElement("canvas");
  var mazeLayerCtx = mazeLayer.getContext("2d");
  var CELL = 40;
  var grid = [];
  var pellets = new Set();
  var powerPellets = new Set();
  var score = 0;
  var best = parseInt(localStorage.getItem(BEST_KEY), 10) || 0;
  var ghostPos = { row: 1, col: 1 };
  var currentDir = null;
  var queuedDir = null;
  var tickTimer = null;
  var bumpTimer = null;
  var powerTimer = null;
  var POWER_DURATION_MS = 5000;
  var autoPilot = true;
  var autoDir = null;
  var idleTimer = null;
  var IDLE_MS = 3500;
  var EVIL_HOME = { row: 17, col: 25 };
  var evilPos = { row: EVIL_HOME.row, col: EVIL_HOME.col };
  var evilDir = "left";
  var evilEl = null;
  var evilFrozen = false;
  var playerFrozen = false;
  var CAUGHT_FREEZE_MS = 900;
  var wallFlashActive = false;
  var TELEPORT_FADE_MS = 190;

  var GHOST_COLORS = {
    default: { hue: "150deg", glow: "#00f4cf" },
    gcash: { hue: "190deg", glow: "#2f6fed" },
    maya: { hue: "120deg", glow: "#22c55e" },
    maribank: { hue: "0deg", glow: "#f97316" },
    paypal: { hue: "20deg", glow: "#facc15" }
  };

  function setGhostColor(key) {
    var c = GHOST_COLORS[key] || GHOST_COLORS.default;
    ghostImg.style.setProperty("--ghost-hue", c.hue);
    ghostImg.style.setProperty("--ghost-glow", c.glow);
  }

  var CELL_ROWS = Math.floor((ROWS - 1) / 2);
  var CELL_COLS = Math.floor((COLS - 1) / 2);
  var LOOP_CHANCE = 0.2;

  function nodeToGrid(r, c) {
    return { row: 1 + 2 * r, col: 1 + 2 * c };
  }

  function shuffled(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function carveMaze() {
    var visited = [];
    for (var r = 0; r < CELL_ROWS; r++) {
      visited.push(new Array(CELL_COLS).fill(false));
    }
    var start = nodeToGrid(0, 0);
    grid[start.row][start.col] = ".";
    visited[0][0] = true;
    var stack = [[0, 0]];
    while (stack.length) {
      var cur = stack[stack.length - 1];
      var r = cur[0], c = cur[1];
      var options = shuffled([[1, 0], [-1, 0], [0, 1], [0, -1]]).filter(function (d) {
        var nr = r + d[0], nc = c + d[1];
        return nr >= 0 && nr < CELL_ROWS && nc >= 0 && nc < CELL_COLS && !visited[nr][nc];
      });
      if (!options.length) {
        stack.pop();
        continue;
      }
      var d = options[0];
      var nr = r + d[0], nc = c + d[1];
      var g1 = nodeToGrid(r, c), g2 = nodeToGrid(nr, nc);
      grid[(g1.row + g2.row) / 2][(g1.col + g2.col) / 2] = ".";
      grid[g2.row][g2.col] = ".";
      visited[nr][nc] = true;
      stack.push([nr, nc]);
    }
    for (var r2 = 0; r2 < CELL_ROWS; r2++) {
      for (var c2 = 0; c2 < CELL_COLS; c2++) {
        [[0, 1], [1, 0]].forEach(function (d) {
          var nr2 = r2 + d[0], nc2 = c2 + d[1];
          if (nr2 >= CELL_ROWS || nc2 >= CELL_COLS) return;
          var g1 = nodeToGrid(r2, c2), g2 = nodeToGrid(nr2, nc2);
          var wr = (g1.row + g2.row) / 2, wc = (g1.col + g2.col) / 2;
          if (grid[wr][wc] === "#" && Math.random() < LOOP_CHANCE) {
            grid[wr][wc] = ".";
          }
        });
      }
    }
  }

  function buildGrid() {
    grid = [];
    for (var r = 0; r < ROWS; r++) {
      var row = [];
      for (var c = 0; c < COLS; c++) {
        row.push("#");
      }
      grid.push(row);
    }
    grid[TUNNEL_ROW][0] = ".";
    grid[TUNNEL_ROW][COLS - 1] = ".";
    carveMaze();
  }

  var COFFEE_MIN = 4;
  var COFFEE_MAX = 8;

  function resetPellets() {
    pellets = new Set();
    powerPellets = new Set();
    var openCells = [];
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var occupied = (r === ghostPos.row && c === ghostPos.col) || (r === evilPos.row && c === evilPos.col);
        if (grid[r][c] === "." && !occupied) {
          openCells.push(r + "," + c);
        }
      }
    }
    shuffled(openCells);
    var coffeeCount = Math.min(openCells.length, COFFEE_MIN + Math.floor(Math.random() * (COFFEE_MAX - COFFEE_MIN + 1)));
    for (var i = 0; i < coffeeCount; i++) {
      powerPellets.add(openCells[i]);
    }
    for (var j = coffeeCount; j < openCells.length; j++) {
      pellets.add(openCells[j]);
    }
  }

  var DESKTOP_BREAKPOINT = 900;
  var FIXED_CELL = 32;

  function getCellSize() {
    var w = container.clientWidth - 24;
    var h = container.clientHeight - 24;
    var fitsFixed = window.innerWidth >= DESKTOP_BREAKPOINT && w >= COLS * FIXED_CELL && h >= ROWS * FIXED_CELL;
    if (fitsFixed) return FIXED_CELL;
    var size = Math.min(FIXED_CELL, Math.floor(w / COLS), Math.floor(h / ROWS));
    return Math.max(8, size);
  }

  function isWall(r, c) {
    return !!(grid[r] && grid[r][c] === "#");
  }

  function cellCenter(r, c) {
    return { x: c * CELL + CELL / 2, y: r * CELL + CELL / 2 };
  }

  function drawWalls(targetCtx, flashActive) {
    var thick = CELL * 0.34;
    var pulse = flashActive ? (reduceMotion ? 0.5 : 0.5 + 0.5 * Math.sin(performance.now() / 80)) : 0;
    var wallColor = flashActive ? "rgb(255," + Math.round(30 + pulse * 70) + "," + Math.round(30 + pulse * 70) + ")" : "#2437ff";
    var wallGlow = flashActive ? "rgba(255,40,40,.9)" : "rgba(37,60,255,.85)";
    targetCtx.save();
    targetCtx.lineCap = "round";
    targetCtx.lineJoin = "round";
    targetCtx.shadowColor = wallGlow;
    targetCtx.shadowBlur = Math.max(4, CELL * 0.22);
    targetCtx.strokeStyle = wallColor;
    targetCtx.fillStyle = wallColor;
    targetCtx.lineWidth = thick;
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        if (!isWall(r, c)) continue;
        var center = cellCenter(r, c);
        var hasNeighbor = false;
        if (isWall(r, c + 1)) {
          var nx = cellCenter(r, c + 1);
          targetCtx.beginPath();
          targetCtx.moveTo(center.x, center.y);
          targetCtx.lineTo(nx.x, nx.y);
          targetCtx.stroke();
          hasNeighbor = true;
        }
        if (isWall(r + 1, c)) {
          var ny = cellCenter(r + 1, c);
          targetCtx.beginPath();
          targetCtx.moveTo(center.x, center.y);
          targetCtx.lineTo(ny.x, ny.y);
          targetCtx.stroke();
          hasNeighbor = true;
        }
        if (!hasNeighbor && !isWall(r, c - 1) && !isWall(r - 1, c)) {
          targetCtx.beginPath();
          targetCtx.arc(center.x, center.y, thick / 2, 0, Math.PI * 2);
          targetCtx.fill();
        }
      }
    }
    targetCtx.shadowBlur = 0;
    targetCtx.strokeStyle = "rgba(255,255,255,.4)";
    targetCtx.lineWidth = thick * 0.32;
    for (var r2 = 0; r2 < ROWS; r2++) {
      for (var c2 = 0; c2 < COLS; c2++) {
        if (!isWall(r2, c2)) continue;
        var center2 = cellCenter(r2, c2);
        if (isWall(r2, c2 + 1)) {
          var hx = cellCenter(r2, c2 + 1);
          targetCtx.beginPath();
          targetCtx.moveTo(center2.x, center2.y);
          targetCtx.lineTo(hx.x, hx.y);
          targetCtx.stroke();
        }
        if (isWall(r2 + 1, c2)) {
          var hy = cellCenter(r2 + 1, c2);
          targetCtx.beginPath();
          targetCtx.moveTo(center2.x, center2.y);
          targetCtx.lineTo(hy.x, hy.y);
          targetCtx.stroke();
        }
      }
    }
    targetCtx.restore();
  }

  function renderMazeLayer() {
    mazeLayer.width = canvas.width;
    mazeLayer.height = canvas.height;
    mazeLayerCtx.clearRect(0, 0, mazeLayer.width, mazeLayer.height);
    mazeLayerCtx.fillStyle = "#050512";
    mazeLayerCtx.fillRect(0, 0, mazeLayer.width, mazeLayer.height);
    drawWalls(mazeLayerCtx, false);
  }

  function drawPowerPellets() {
    if (!powerPellets.size) return;
    var pulse = reduceMotion ? 0.5 : 0.5 + 0.5 * Math.sin(performance.now() / 260);
    var size = CELL * (0.95 + pulse * 0.18);
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = size + "px sans-serif";
    ctx.shadowColor = "rgba(250,204,21," + (0.45 + pulse * 0.4) + ")";
    ctx.shadowBlur = CELL * (0.25 + pulse * 0.25);
    powerPellets.forEach(function (key) {
      var parts = key.split(",");
      var center = cellCenter(parseInt(parts[0], 10), parseInt(parts[1], 10));
      ctx.fillText("\u2615", center.x, center.y);
    });
    ctx.restore();
  }

  function drawPellets() {
    if (!pellets.size) return;
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,.85)";
    pellets.forEach(function (key) {
      var comma = key.indexOf(",");
      var r = parseInt(key.slice(0, comma), 10);
      var c = parseInt(key.slice(comma + 1), 10);
      var x = c * CELL, y = r * CELL;
      ctx.beginPath();
      ctx.arc(x + CELL / 2, y + CELL / 2, Math.max(2, CELL * 0.09), 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  function draw() {
    if (wallFlashActive) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#050512";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawWalls(ctx, true);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(mazeLayer, 0, 0);
    }
    drawPellets();
    drawPowerPellets();
  }

  function updateGhostPosition() {
    var x = ghostPos.col * CELL + CELL / 2;
    var y = ghostPos.row * CELL + CELL / 2;
    ghostImg.style.translate = x + "px " + y + "px";
  }

  function createEvilPacman() {
    evilEl = document.createElement("div");
    evilEl.className = "bg-pacman";
    evilEl.setAttribute("aria-hidden", "true");
    stage.appendChild(evilEl);
  }

  function createPlayOverlay() {
    var overlay = document.createElement("div");
    overlay.className = "pacman-play-overlay";
    overlay.setAttribute("aria-hidden", "true");
    container.appendChild(overlay);
  }

  function updateEvilPosition() {
    if (!evilEl) return;
    var size = Math.round(CELL * 1.7);
    evilEl.style.width = size + "px";
    evilEl.style.height = size + "px";
    var gx = evilPos.col * CELL + CELL / 2;
    var gy = evilPos.row * CELL + CELL / 2;
    evilEl.style.translate = (gx - size / 2) + "px " + (gy - size / 2) + "px";
    var rotation = { right: 0, down: 90, left: 180, up: 270 }[evilDir] || 0;
    evilEl.style.rotate = rotation + "deg";
  }

  function manhattan(a, b) {
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
  }

  var BFS_DIRS = ["up", "down", "left", "right"];

  function bfsPath(start, goal) {
    var startKey = start.row + "," + start.col;
    var goalKey = goal.row + "," + goal.col;
    if (startKey === goalKey) return [];
    var visited = new Set([startKey]);
    var cameFrom = Object.create(null);
    var queue = [start];
    var qi = 0;
    while (qi < queue.length) {
      var cur = queue[qi++];
      var curKey = cur.row + "," + cur.col;
      for (var i = 0; i < BFS_DIRS.length; i++) {
        var next = nextCell(cur.row, cur.col, BFS_DIRS[i]);
        if (!next) continue;
        var key = next.row + "," + next.col;
        if (visited.has(key)) continue;
        visited.add(key);
        cameFrom[key] = { parentKey: curKey, dir: BFS_DIRS[i] };
        if (key === goalKey) {
          var path = [];
          var walkKey = key;
          while (cameFrom[walkKey]) {
            path.push(cameFrom[walkKey].dir);
            walkKey = cameFrom[walkKey].parentKey;
          }
          path.reverse();
          return path;
        }
        queue.push(next);
      }
    }
    return [];
  }

  function evilFleeStep() {
    var dirs = ["up", "down", "left", "right"];
    var valid = dirs.filter(function (d) {
      return !!nextCell(evilPos.row, evilPos.col, d);
    });
    if (!valid.length) return null;
    var best = null, bestDist = -1;
    valid.forEach(function (d) {
      var next = nextCell(evilPos.row, evilPos.col, d);
      var dist = manhattan(next, ghostPos);
      if (dist > bestDist) {
        bestDist = dist;
        best = d;
      }
    });
    return best;
  }

  function evilStep() {
    if (evilFrozen) return;
    var frightened = ghostImg.classList.contains("ghost-powered");
    var path = frightened ? null : bfsPath(evilPos, ghostPos);
    var dir = frightened ? evilFleeStep() : (path.length ? path[0] : null);
    if (dir) {
      var moved = nextCell(evilPos.row, evilPos.col, dir);
      if (moved) {
        if (isTunnelWrap(evilPos.row, evilPos.col, dir)) {
          evilDir = dir;
          respawnSprite(evilEl, function () {
            evilPos.row = moved.row;
            evilPos.col = moved.col;
            updateEvilPosition();
          });
          return;
        }
        evilPos.row = moved.row;
        evilPos.col = moved.col;
        evilDir = dir;
      }
    }
    updateEvilPosition();
  }

  function checkCatch() {
    if (evilFrozen) return;
    if (evilPos.row !== ghostPos.row || evilPos.col !== ghostPos.col) return;
    var frightened = ghostImg.classList.contains("ghost-powered");
    if (frightened) {
      score += 200;
      if (score > best) {
        best = score;
        localStorage.setItem(BEST_KEY, String(best));
      }
      updateScoreDisplay();
      evilFrozen = true;
      evilEl.classList.add("pacman-eaten");
      evilPos.row = EVIL_HOME.row;
      evilPos.col = EVIL_HOME.col;
      updateEvilPosition();
      setTimeout(function () {
        evilEl.classList.remove("pacman-eaten");
        evilFrozen = false;
      }, 1200);
    } else {
      evilFrozen = true;
      playerFrozen = true;
      wallFlashActive = true;
      ghostImg.classList.add("ghost-caught");
      if (reduceMotion) draw();
      setTimeout(function () {
        wallFlashActive = false;
        ghostImg.classList.remove("ghost-caught");
        ghostImg.classList.add("sprite-hidden");
        evilEl.classList.add("sprite-hidden");
        if (reduceMotion) draw();
        setTimeout(function () {
          applyInstant(ghostImg, function () {
            ghostPos.row = 1;
            ghostPos.col = 1;
            updateGhostPosition();
          });
          applyInstant(evilEl, function () {
            evilPos.row = EVIL_HOME.row;
            evilPos.col = EVIL_HOME.col;
            updateEvilPosition();
          });
          requestAnimationFrame(function () {
            ghostImg.classList.remove("sprite-hidden");
            evilEl.classList.remove("sprite-hidden");
          });
          evilFrozen = false;
          playerFrozen = false;
        }, TELEPORT_FADE_MS);
      }, CAUGHT_FREEZE_MS);
    }
  }

  function updateScoreDisplay() {
    if (scoreValueEl) scoreValueEl.textContent = score;
    else scoreEl.textContent = "Score: " + score;
    if (bestValueEl) bestValueEl.textContent = best;
  }

  function bumpGhost() {
    ghostImg.classList.remove("ghost-bump");
    void ghostImg.offsetWidth;
    ghostImg.classList.add("ghost-bump");
    clearTimeout(bumpTimer);
    bumpTimer = setTimeout(function () {
      ghostImg.classList.remove("ghost-bump");
    }, 180);
  }

  function activatePowerMode() {
    ghostImg.classList.add("ghost-powered");
    if (evilEl) evilEl.classList.add("pacman-frightened");
    clearTimeout(powerTimer);
    powerTimer = setTimeout(function () {
      ghostImg.classList.remove("ghost-powered");
      if (evilEl) evilEl.classList.remove("pacman-frightened");
    }, POWER_DURATION_MS);
  }

  function eatPellet(r, c) {
    var key = r + "," + c;
    var ate = false;
    var powered = false;
    if (powerPellets.has(key)) {
      powerPellets.delete(key);
      score += 50;
      ate = true;
      powered = true;
    } else if (pellets.has(key)) {
      pellets.delete(key);
      score += 10;
      ate = true;
    }
    if (ate) {
      if (score > best) {
        best = score;
        localStorage.setItem(BEST_KEY, String(best));
      }
      updateScoreDisplay();
      bumpGhost();
      if (powered) activatePowerMode();
      if (pellets.size === 0 && powerPellets.size === 0) {
        setTimeout(function () {
          buildGrid();
          ghostPos.row = 1;
          ghostPos.col = 1;
          updateGhostPosition();
          evilPos.row = EVIL_HOME.row;
          evilPos.col = EVIL_HOME.col;
          updateEvilPosition();
          resetPellets();
          renderMazeLayer();
          draw();
        }, 1200);
      }
      draw();
    }
  }

  function layout() {
    CELL = getCellSize();
    var width = COLS * CELL;
    var height = ROWS * CELL;
    stage.style.width = width + "px";
    stage.style.height = height + "px";
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ghostImg.style.width = Math.round(CELL * 1.3) + "px";
    updateGhostPosition();
    updateEvilPosition();
    renderMazeLayer();
    draw();
  }

  function nextCell(r, c, dir) {
    var nr = r, nc = c;
    if (dir === "up") nr--;
    else if (dir === "down") nr++;
    else if (dir === "left") nc--;
    else if (dir === "right") nc++;
    else return null;
    if (nr === TUNNEL_ROW) nc = ((nc % COLS) + COLS) % COLS;
    if (!grid[nr] || grid[nr][nc] === "#") return null;
    return { row: nr, col: nc };
  }

  function oppositeDir(dir) {
    if (dir === "up") return "down";
    if (dir === "down") return "up";
    if (dir === "left") return "right";
    if (dir === "right") return "left";
    return null;
  }

  function isTunnelWrap(row, col, dir) {
    return row === TUNNEL_ROW && ((dir === "left" && col === 0) || (dir === "right" && col === COLS - 1));
  }

  function applyInstant(el, fn) {
    el.classList.add("sprite-no-transition");
    fn();
    void el.offsetWidth;
    el.classList.remove("sprite-no-transition");
  }

  function respawnSprite(el, applyFn) {
    el.classList.add("sprite-hidden");
    setTimeout(function () {
      applyInstant(el, applyFn);
      requestAnimationFrame(function () {
        el.classList.remove("sprite-hidden");
      });
    }, TELEPORT_FADE_MS);
  }

  function autoStep() {
    var dirs = ["up", "down", "left", "right"];
    var valid = dirs.filter(function (d) {
      return !!nextCell(ghostPos.row, ghostPos.col, d);
    });
    if (!valid.length) return;
    var choice = null;
    if (autoDir && valid.indexOf(autoDir) !== -1 && Math.random() < 0.7) {
      choice = autoDir;
    }
    if (!choice) {
      var nonReverse = valid.filter(function (d) {
        return d !== oppositeDir(autoDir);
      });
      var pool = nonReverse.length ? nonReverse : valid;
      choice = pool[Math.floor(Math.random() * pool.length)];
    }
    autoDir = choice;
    var moved = nextCell(ghostPos.row, ghostPos.col, choice);
    if (isTunnelWrap(ghostPos.row, ghostPos.col, choice)) {
      respawnSprite(ghostImg, function () {
        ghostPos.row = moved.row;
        ghostPos.col = moved.col;
        updateGhostPosition();
        eatPellet(moved.row, moved.col);
      });
    } else {
      ghostPos.row = moved.row;
      ghostPos.col = moved.col;
      updateGhostPosition();
      eatPellet(moved.row, moved.col);
    }
  }

  function tick() {
    if (playerFrozen) return;
    if (autoPilot) {
      autoStep();
    } else {
      var moved = null;
      if (queuedDir) {
        moved = nextCell(ghostPos.row, ghostPos.col, queuedDir);
        if (moved) currentDir = queuedDir;
      }
      if (!moved && currentDir) {
        moved = nextCell(ghostPos.row, ghostPos.col, currentDir);
      }
      if (moved) {
        if (isTunnelWrap(ghostPos.row, ghostPos.col, currentDir)) {
          respawnSprite(ghostImg, function () {
            ghostPos.row = moved.row;
            ghostPos.col = moved.col;
            updateGhostPosition();
            eatPellet(moved.row, moved.col);
          });
        } else {
          ghostPos.row = moved.row;
          ghostPos.col = moved.col;
          updateGhostPosition();
          eatPellet(moved.row, moved.col);
        }
      }
    }
    evilStep();
    checkCatch();
  }

  function setDirection(dir) {
    if (autoPilot) {
      autoPilot = false;
      autoDir = null;
      currentDir = null;
      queuedDir = null;
    }
    queuedDir = dir;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () {
      autoPilot = true;
      currentDir = null;
      queuedDir = null;
    }, IDLE_MS);
  }

  function handleKey(e) {
    var key = e.key.toLowerCase();
    var dir = null;
    if (key === "arrowup" || key === "w") dir = "up";
    else if (key === "arrowdown" || key === "s") dir = "down";
    else if (key === "arrowleft" || key === "a") dir = "left";
    else if (key === "arrowright" || key === "d") dir = "right";
    if (dir) {
      e.preventDefault();
      setDirection(dir);
    }
  }

  function initJoystick() {
    if (!joystickEl || !joystickBase || !joystickKnob) return;
    var activePointerId = null;
    var baseRect = null;
    var maxDist = 0;

    function setKnob(dx, dy) {
      joystickKnob.style.translate = "calc(-50% + " + dx + "px) calc(-50% + " + dy + "px)";
    }

    function resetKnob() {
      joystickKnob.style.translate = "-50% -50%";
    }

    function directionFromVector(dx, dy) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 10) return null;
      if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "right" : "left";
      return dy > 0 ? "down" : "up";
    }

    function handleMove(e) {
      if (e.pointerId !== activePointerId || !baseRect) return;
      var cx = baseRect.left + baseRect.width / 2;
      var cy = baseRect.top + baseRect.height / 2;
      var dx = e.clientX - cx;
      var dy = e.clientY - cy;
      var dist = Math.min(maxDist, Math.hypot(dx, dy));
      var angle = Math.atan2(dy, dx);
      setKnob(Math.cos(angle) * dist, Math.sin(angle) * dist);
      var dir = directionFromVector(dx, dy);
      if (dir) setDirection(dir);
    }

    function endDrag(e) {
      if (e.pointerId !== activePointerId) return;
      activePointerId = null;
      baseRect = null;
      joystickKnob.classList.remove("dragging");
      resetKnob();
      joystickBase.removeEventListener("pointermove", handleMove);
    }

    joystickBase.addEventListener("pointerdown", function (e) {
      if (activePointerId !== null) return;
      e.preventDefault();
      activePointerId = e.pointerId;
      baseRect = joystickBase.getBoundingClientRect();
      maxDist = baseRect.width / 2 - joystickKnob.offsetWidth / 2;
      joystickKnob.classList.add("dragging");
      if (joystickBase.setPointerCapture) joystickBase.setPointerCapture(e.pointerId);
      joystickBase.addEventListener("pointermove", handleMove);
      handleMove(e);
    });
    joystickBase.addEventListener("pointerup", endDrag);
    joystickBase.addEventListener("pointercancel", endDrag);
    joystickBase.addEventListener("lostpointercapture", endDrag);
  }

  function initScoreToggle() {
    if (!scoreEl || !joystickEl) return;
    var focusTargets = document.querySelectorAll(".support-page-header, .support-page-content");
    scoreEl.setAttribute("aria-label", "Score. Tap to toggle touch controls and page content");
    scoreEl.addEventListener("click", function () {
      var showing = joystickEl.classList.toggle("visible");
      scoreEl.setAttribute("aria-pressed", showing ? "true" : "false");
      document.body.classList.toggle("pacman-focus-mode", showing);
      focusTargets.forEach(function (el) {
        el.setAttribute("aria-hidden", showing ? "true" : "false");
        el.inert = showing;
      });
    });
  }

  function initSwipe() {
    var startX = 0, startY = 0, active = false;
    stage.addEventListener("touchstart", function (e) {
      if (!e.touches[0]) return;
      active = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });
    stage.addEventListener("touchend", function (e) {
      if (!active || !e.changedTouches[0]) return;
      active = false;
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
      if (Math.abs(dx) > Math.abs(dy)) setDirection(dx > 0 ? "right" : "left");
      else setDirection(dy > 0 ? "down" : "up");
    }, { passive: true });
  }

  function startLoop() {
    if (tickTimer) return;
    tickTimer = setInterval(tick, 150);
  }

  function stopLoop() {
    clearInterval(tickTimer);
    tickTimer = null;
  }

  var pulseFrame = null;
  var lastPulseDraw = 0;
  var PULSE_INTERVAL_MS = 50;

  function pulseLoop(now) {
    if (!lastPulseDraw || now - lastPulseDraw >= PULSE_INTERVAL_MS) {
      lastPulseDraw = now;
      draw();
    }
    pulseFrame = requestAnimationFrame(pulseLoop);
  }

  function startPulseLoop() {
    if (reduceMotion || pulseFrame) return;
    lastPulseDraw = 0;
    pulseFrame = requestAnimationFrame(pulseLoop);
  }

  function stopPulseLoop() {
    cancelAnimationFrame(pulseFrame);
    pulseFrame = null;
  }

  buildGrid();
  createEvilPacman();
  createPlayOverlay();
  resetPellets();
  layout();
  updateScoreDisplay();

  document.addEventListener("keydown", handleKey);
  document.addEventListener("support:pay-selected", function (e) {
    setGhostColor(e.detail && e.detail.key);
  });
  initJoystick();
  initScoreToggle();
  initSwipe();

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layout, 150);
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      stopLoop();
      stopPulseLoop();
    } else {
      startLoop();
      startPulseLoop();
    }
  });

  startLoop();
  startPulseLoop();
})();