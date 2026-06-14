/* ==========================
   UI TRANSITIONS & NAVIGATION
========================== */
function switchScreen(screenId) {
    if (screenId === 'app') {
        galleryScreen.classList.remove('active');
        galleryScreen.classList.add('hidden');
        app.classList.remove('hidden');
        app.classList.add('active');
        returnToCanvasBtn.style.display = 'none';
    } else {
        app.classList.remove('active');
        app.classList.add('hidden');
        galleryScreen.classList.remove('hidden');
        galleryScreen.classList.add('active');
        if (currentArtworkUrl) returnToCanvasBtn.style.display = 'flex';
    }
}

mobileMenuBtn.onclick = () => sidebar.classList.toggle('open');
returnToCanvasBtn.onclick = () => switchScreen('app');
canvasArea.addEventListener("pointerdown", () => sidebar.classList.remove('open'));

/* ==========================
   BRUSH CURSOR
========================== */
function setBrushCursorVisible(v) {
    brushCursor.style.display = v ? "block" : "none";
}

function updateBrushCursorSize() {
    const size = brushSize * zoom;
    brushCursor.style.width  = size + "px";
    brushCursor.style.height = size + "px";
}
