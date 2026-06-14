/* ==========================
   TOOL SELECTION
========================== */
const toolBtns = document.querySelectorAll(".tool-btn");

function setTool(name) {
    currentTool = name;
    toolBtns.forEach(b => b.classList.toggle("active", b.id === name + "Btn"));
    document.getElementById("mixerPanel").style.display = name === "mixer" ? "block" : "none";
}

document.getElementById("brushBtn").onclick  = () => setTool("brush");
document.getElementById("mixerBtn").onclick  = () => setTool("mixer");
document.getElementById("eraserBtn").onclick = () => setTool("eraser");
document.getElementById("fitBtn").onclick    = fitToScreen;

/* ==========================
   KEYBOARD SHORTCUTS
========================== */
window.addEventListener("keydown", e => {
    if (e.target.tagName === "INPUT") return;
    if (e.code === "Space" && !e.repeat) {
        spaceHeld = true;
        canvasArea.style.cursor = "grab";
        return;
    }
    if (e.key === "b" || e.key === "B") setTool("brush");
    if (e.key === "m" || e.key === "M") setTool("mixer");
    if (e.key === "e" || e.key === "E") setTool("eraser");
    if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault(); document.getElementById("undoBtn").click();
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "z"))) {
        e.preventDefault(); document.getElementById("redoBtn").click();
    }
});

window.addEventListener("keyup", e => {
    if (e.code === "Space") { spaceHeld = false; canvasArea.style.cursor = ""; }
});

/* ==========================
   SLIDERS
========================== */
document.getElementById("sizeSlider").oninput = e => {
    brushSize = Number(e.target.value);
    document.getElementById("sizeValue").textContent = brushSize;
    updateBrushCursorSize();
};

document.getElementById("opacitySlider").oninput = e => {
    brushOpacity = Number(e.target.value) / 100;
    document.getElementById("opacityValue").textContent = e.target.value + "%";
};

document.getElementById("mixSlider").oninput = e => {
    mixRatio = Number(e.target.value) / 100;
    document.getElementById("mixValue").textContent = e.target.value + "%";
};

document.getElementById("wetSlider").oninput = e => {
    wetRatio = Number(e.target.value) / 100;
    document.getElementById("wetValue").textContent = e.target.value + "%";
};

/* ==========================
   EYEDROPPER TOOL
========================== */
let _prevTool     = "brush";   // tool to restore after picking
let _eyeActive    = false;     // true while pointer is held down in eyedropper mode

const loupe = document.getElementById("eyedropperLoupe");

// Called by setTool — keep track of what we came from
const _origSetTool = setTool;
window.setTool = function(name) {
    if (name !== "eyedropper" && currentTool !== "eyedropper") _prevTool = name;
    _origSetTool(name);
    // Cursor style
    if (name === "eyedropper") {
        canvasArea.style.cursor = "crosshair";
        setBrushCursorVisible(false);
    } else {
        canvasArea.style.cursor = "";
        loupe.style.display     = "none";
    }
};
// Patch setTool reference used everywhere
setTool = window.setTool;

document.getElementById("eyedropperBtn").onclick = () => setTool("eyedropper");

// Keyboard shortcut — I (for "I-dropper")
window.addEventListener("keydown", e => {
    if (e.target.tagName === "INPUT") return;
    if (e.key === "i" || e.key === "I") {
        if (currentTool === "eyedropper") setTool(_prevTool);
        else setTool("eyedropper");
    }
});

/* --- sample the composite of both canvases at a canvas-space point --- */
function samplePixelAt(cx, cy) {
    // Clamp to canvas bounds
    const x = Math.max(0, Math.min(Math.round(cx), colorCanvas.width  - 1));
    const y = Math.max(0, Math.min(Math.round(cy), colorCanvas.height - 1));

    // Color layer
    const cd = colorCtx.getImageData(x, y, 1, 1).data;
    // Line layer
    const ld = lineCtx.getImageData(x, y, 1, 1).data;

    // Composite: line art drawn on top of color (source-over)
    // Blend line alpha over color pixel manually
    const la = ld[3] / 255;
    const ca = cd[3] / 255;
    const outA = la + ca * (1 - la);
    if (outA < 0.01) return null;   // transparent — nothing to pick
    const r = Math.round((ld[0] * la + cd[0] * ca * (1 - la)) / outA);
    const g = Math.round((ld[1] * la + cd[1] * ca * (1 - la)) / outA);
    const b = Math.round((ld[2] * la + cd[2] * ca * (1 - la)) / outA);
    return { r, g, b };
}

/* --- update loupe position + preview --- */
function updateLoupe(e) {
    const rect = canvasArea.getBoundingClientRect();

    // Canvas-space coords (for pixel sampling)
    const canvasX = (e.clientX - rect.left - panX) / zoom;
    const canvasY = (e.clientY - rect.top  - panY) / zoom;

    const px = samplePixelAt(canvasX, canvasY);

    // Loupe is position:fixed — use raw viewport coords (clientX/Y).
    // Anchor upper-right of cursor tip; flip near viewport edges.
    const OFFSET = 20;
    const loupeW = loupe.offsetWidth  || 80;
    const loupeH = loupe.offsetHeight || 90;
    const vpW    = window.innerWidth;

    let lx = e.clientX + OFFSET;
    let ly = e.clientY - OFFSET - loupeH;

    // Flip left if overflowing right viewport edge
    if (lx + loupeW > vpW) lx = e.clientX - OFFSET - loupeW;
    // Flip down if overflowing top viewport edge
    if (ly < 0)            ly = e.clientY + OFFSET;

    loupe.style.left    = lx + "px";
    loupe.style.top     = ly + "px";
    loupe.style.display = "block";

    const swatch = document.getElementById("loupeColor");
    const label  = document.getElementById("loupeHex");

    if (px) {
        const hex = "#" + [px.r, px.g, px.b].map(v => v.toString(16).padStart(2,"0")).join("");
        swatch.style.background = hex;
        label.textContent       = hex.toUpperCase();
        loupe.dataset.hex       = hex;
        loupe.classList.remove("loupe--empty");
    } else {
        swatch.style.background = "transparent";
        label.textContent       = "—";
        loupe.dataset.hex       = "";
        loupe.classList.add("loupe--empty");
    }
}

/* --- apply the picked color to the wheel + brushColor --- */
function applyPickedColor(hex) {
    if (!hex) return;
    brushColor = hex;

    // Update color wheel state
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    [cwHue, cwSat, cwVal] = rgbToHsv(r, g, b);
    redrawWheel();
    document.getElementById("hexInput").value             = hex.toUpperCase();
    document.getElementById("hexSwatch").style.background = hex;

    // Flash the loupe to confirm pick
    loupe.classList.add("loupe--picked");
    setTimeout(() => loupe.classList.remove("loupe--picked"), 280);
}

/* --- eyedropper pointer events (wired into the canvasArea) --- */
canvasArea.addEventListener("pointermove", e => {
    if (currentTool !== "eyedropper") return;
    updateLoupe(e);
});

canvasArea.addEventListener("pointerdown", e => {
    if (currentTool !== "eyedropper") return;
    if (e.button !== 0) return;
    _eyeActive = true;
    updateLoupe(e);
    e.stopImmediatePropagation();   // don't let brush.js also handle this
}, true);   // capture phase so it runs before brush.js

canvasArea.addEventListener("pointerup", e => {
    if (currentTool !== "eyedropper" || !_eyeActive) return;
    _eyeActive = false;
    const hex = loupe.dataset.hex;
    if (hex) {
        applyPickedColor(hex);
        // Auto-switch back to the previous drawing tool
        setTool(_prevTool);
    }
    e.stopImmediatePropagation();
}, true);

canvasArea.addEventListener("pointerleave", () => {
    if (currentTool === "eyedropper") loupe.style.display = "none";
});
