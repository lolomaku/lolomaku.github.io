/* ==========================
   COLOR WHEEL
========================== */
let cwHue = 0, cwSat = 1.0, cwVal = 0.5, cwDragging = null;

const wheelCanvas = document.getElementById("wheelCanvas");
const triCanvas   = document.getElementById("triangleCanvas");
const wCtx        = wheelCanvas.getContext("2d");
const tCtx        = triCanvas.getContext("2d");

let CW = 200, CX = CW / 2, CY = CW / 2;
let R_OUTER = CW / 2 - 2, R_INNER = R_OUTER - 24;

/* ---------- COLOR MATH ---------- */
function hsvToRgb(h, s, v) {
    let r, g, b;
    const i = Math.floor(h / 60) % 6;
    const f = h / 60 - Math.floor(h / 60);
    const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
    switch (i) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    let h = 0;
    const s = max === 0 ? 0 : d / max, v = max;
    if (d !== 0) {
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return [h * 360, s, v];
}

function hexToRgbArr(hex) {
    const n = parseInt(hex.replace("#", ""), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
}

/* ---------- WHEEL DRAWING ---------- */
function drawRing() {
    wCtx.clearRect(0, 0, CW, CW);
    const steps = 360;
    for (let i = 0; i < steps; i++) {
        const a1 = (i / steps) * Math.PI * 2 - Math.PI / 2;
        const a2 = ((i + 1.5) / steps) * Math.PI * 2 - Math.PI / 2;
        const [r, g, b] = hsvToRgb(i, 1, 1);
        wCtx.beginPath();
        wCtx.moveTo(CX + Math.cos(a1) * R_INNER, CY + Math.sin(a1) * R_INNER);
        wCtx.arc(CX, CY, R_OUTER, a1, a2);
        wCtx.arc(CX, CY, R_INNER, a2, a1, true);
        wCtx.closePath();
        wCtx.fillStyle = `rgb(${r},${g},${b})`;
        wCtx.fill();
    }
    const hRad = (cwHue / 360) * Math.PI * 2 - Math.PI / 2;
    const rMid = (R_OUTER + R_INNER) / 2;
    const dx = CX + Math.cos(hRad) * rMid;
    const dy = CY + Math.sin(hRad) * rMid;
    wCtx.beginPath();
    wCtx.arc(dx, dy, 10, 0, Math.PI * 2);
    wCtx.fillStyle = "#fff";
    wCtx.fill();
    wCtx.lineWidth = 2;
    wCtx.strokeStyle = "#333";
    wCtx.stroke();
}

function triVertices() {
    const r = R_INNER - 6;
    const baseAngle = (cwHue / 360) * Math.PI * 2 - Math.PI / 2;
    return [
        [CX + Math.cos(baseAngle)                * r, CY + Math.sin(baseAngle)                * r],
        [CX + Math.cos(baseAngle + 2*Math.PI/3)  * r, CY + Math.sin(baseAngle + 2*Math.PI/3)  * r],
        [CX + Math.cos(baseAngle - 2*Math.PI/3)  * r, CY + Math.sin(baseAngle - 2*Math.PI/3)  * r]
    ];
}

function drawTriangle() {
    tCtx.clearRect(0, 0, CW, CW);
    const [v0, v1, v2] = triVertices();
    const [hr, hg, hb] = hsvToRgb(cwHue, 1, 1);

    tCtx.save();
    tCtx.beginPath();
    tCtx.moveTo(v0[0], v0[1]); tCtx.lineTo(v1[0], v1[1]); tCtx.lineTo(v2[0], v2[1]);
    tCtx.closePath();
    tCtx.clip();

    tCtx.fillStyle = `rgb(${hr},${hg},${hb})`;
    tCtx.fillRect(0, 0, CW, CW);

    const whiteGrad = tCtx.createLinearGradient(v2[0], v2[1], (v0[0]+v1[0])/2, (v0[1]+v1[1])/2);
    whiteGrad.addColorStop(0, "rgba(255,255,255,1)");
    whiteGrad.addColorStop(1, "rgba(255,255,255,0)");
    tCtx.fillStyle = whiteGrad;
    tCtx.fillRect(0, 0, CW, CW);

    const blackGrad = tCtx.createLinearGradient(v1[0], v1[1], (v0[0]+v2[0])/2, (v0[1]+v2[1])/2);
    blackGrad.addColorStop(0, "rgba(0,0,0,1)");
    blackGrad.addColorStop(1, "rgba(0,0,0,0)");
    tCtx.fillStyle = blackGrad;
    tCtx.fillRect(0, 0, CW, CW);
    tCtx.restore();

    const [px, py] = svToXY(cwSat, cwVal);
    tCtx.beginPath(); tCtx.arc(px, py, 8, 0, Math.PI * 2);
    tCtx.strokeStyle = "#fff"; tCtx.lineWidth = 3; tCtx.stroke();
    tCtx.beginPath(); tCtx.arc(px, py, 7, 0, Math.PI * 2);
    tCtx.strokeStyle = "#000"; tCtx.lineWidth = 1; tCtx.stroke();
}

/* ---------- COORDINATE MATH ---------- */
function svToXY(s, v) {
    const [v0, v1, v2] = triVertices();
    const w0 = s * v, w1 = 1 - v, w2 = (1 - s) * v;
    return [v0[0]*w0 + v1[0]*w1 + v2[0]*w2, v0[1]*w0 + v1[1]*w1 + v2[1]*w2];
}

function xyToSV(px, py) {
    const [v0, v1, v2] = triVertices();
    const denom = (v1[1]-v2[1])*(v0[0]-v2[0]) + (v2[0]-v1[0])*(v0[1]-v2[1]);
    if (Math.abs(denom) < 1e-6) return [cwSat, cwVal];
    let w0 = ((v1[1]-v2[1])*(px-v2[0]) + (v2[0]-v1[0])*(py-v2[1])) / denom;
    let w1 = ((v2[1]-v0[1])*(px-v2[0]) + (v0[0]-v2[0])*(py-v2[1])) / denom;
    let w2 = 1 - w0 - w1;
    w0 = Math.max(0, w0); w1 = Math.max(0, w1); w2 = Math.max(0, w2);
    const total = w0 + w1 + w2;
    return [(w0 + w2) < 1e-6 ? 0 : Math.min(1, w0 / (w0 + w2)), Math.min(1, (w0 + w2) / total)];
}

function isInRing(px, py) {
    const d = Math.hypot(px - CX, py - CY);
    return d >= R_INNER && d <= R_OUTER;
}

function isInTriangle(px, py) {
    const [v0, v1, v2] = triVertices();
    const sign = (ax, ay, bx, by, cx, cy) => (ax-cx)*(by-cy) - (bx-cx)*(ay-cy);
    const d0 = sign(px,py, v0[0],v0[1], v1[0],v1[1]);
    const d1 = sign(px,py, v1[0],v1[1], v2[0],v2[1]);
    const d2 = sign(px,py, v2[0],v2[1], v0[0],v0[1]);
    return !(((d0<0)||(d1<0)||(d2<0)) && ((d0>0)||(d1>0)||(d2>0)));
}

/* ---------- RENDER & APPLY ---------- */
function redrawWheel() { drawRing(); drawTriangle(); }

function applyColor() {
    const [r, g, b] = hsvToRgb(cwHue, cwSat, cwVal);
    brushColor = rgbToHex(r, g, b);
    document.getElementById("hexInput").value          = brushColor;
    document.getElementById("hexSwatch").style.background = brushColor;
}

/* ---------- POINTER EVENTS ---------- */
function wheelPointerDown(e) {
    const rect = wheelCanvas.getBoundingClientRect();
    const px   = (e.clientX - rect.left) * (CW / rect.width);
    const py   = (e.clientY - rect.top)  * (CW / rect.height);
    if (isInRing(px, py))     cwDragging = "ring";
    else if (isInTriangle(px, py)) cwDragging = "tri";
    else return;
    wheelPointerMove(e);
    triCanvas.setPointerCapture(e.pointerId);
    e.stopPropagation();
}

function wheelPointerMove(e) {
    if (!cwDragging) return;
    const rect = triCanvas.getBoundingClientRect();
    const px   = (e.clientX - rect.left) * (CW / rect.width);
    const py   = (e.clientY - rect.top)  * (CW / rect.height);
    if (cwDragging === "ring") {
        cwHue = ((Math.atan2(py - CY, px - CX) + Math.PI / 2) * 180 / Math.PI + 360) % 360;
    } else {
        [cwSat, cwVal] = xyToSV(px, py);
    }
    redrawWheel();
    applyColor();
    e.stopPropagation();
}

function wheelPointerUp(e) { cwDragging = null; e.stopPropagation(); }

triCanvas.addEventListener("pointerdown",   wheelPointerDown);
triCanvas.addEventListener("pointermove",   wheelPointerMove);
triCanvas.addEventListener("pointerup",     wheelPointerUp);
triCanvas.addEventListener("pointercancel", wheelPointerUp);
wheelCanvas.addEventListener("pointerdown", wheelPointerDown);

/* ---------- HEX INPUT ---------- */
document.getElementById("hexInput").addEventListener("change", e => {
    let val = e.target.value.trim();
    if (!val.startsWith("#")) val = "#" + val;
    if (!/^#[0-9a-fA-F]{6}$/.test(val)) return;
    const [r, g, b] = hexToRgbArr(val);
    [cwHue, cwSat, cwVal] = rgbToHsv(r, g, b);
    brushColor = val;
    document.getElementById("hexSwatch").style.background = val;
    redrawWheel();
});

/* ---------- RESIZE ---------- */
function resizeWheel() {
    CW      = window.innerWidth <= 768 ? 180 : 200;
    wheelCanvas.width  = CW; wheelCanvas.height  = CW;
    triCanvas.width    = CW; triCanvas.height    = CW;
    CX = CW / 2; CY = CW / 2;
    R_OUTER = CW / 2 - 2;
    R_INNER = R_OUTER - 24;
    redrawWheel();
}

window.addEventListener('resize', resizeWheel);

// Init
resizeWheel();
cwHue = 0; cwSat = 1; cwVal = 0.6;
applyColor();
redrawWheel();
