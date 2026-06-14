/* ==========================
   USER NAME PROMPT
========================== */
const NAME_KEY = "colorbook_username";
let userName = localStorage.getItem(NAME_KEY) || null;

// Alternating chibi animation for the gallery header
let _chibiInterval = null;

function startChibiAnimation() {
    const el = document.getElementById("galleryHeaderChibi");
    if (!el) return;
    if (_chibiInterval) clearInterval(_chibiInterval);

    const SRCS = ["assets/gallery/stell_frame01.png", "assets/gallery/stell_frame02.png"];

    // Preload both frames into real Image objects
    const loaded = [null, null];
    let readyCount = 0;

    SRCS.forEach((src, i) => {
        const preload = new Image();
        preload.onload = () => {
            loaded[i] = preload.src;   // use the resolved src after successful load
            readyCount++;
            // Start the loop only once BOTH frames are confirmed loaded
            if (readyCount === 2) beginLoop();
        };
        preload.onerror = () => {
            // Frame missing — use the other frame for both slots so loop still works
            loaded[i] = loaded[i === 0 ? 1 : 0] || null;
            readyCount++;
            if (readyCount === 2 && loaded.some(Boolean)) beginLoop();
        };
        preload.src = src;
    });

    function beginLoop() {
        let frame = 0;
        el.src = loaded[frame];
        el.style.display = "";          // ensure visible even if it was hidden before

        if (_chibiInterval) clearInterval(_chibiInterval);
        _chibiInterval = setInterval(() => {
            frame = frame === 0 ? 1 : 0;
            const src = loaded[frame];
            if (src) el.src = src;      // only swap if that frame exists
        }, 600);
    }
}

function initNamePrompt() {
    const modal     = document.getElementById("nameModal");
    const input     = document.getElementById("nameInput");
    const submitBtn = document.getElementById("nameSubmitBtn");
    const charCount = document.getElementById("nameCharCount");

    startChibiAnimation();

    if (userName) { updateGalleryGreeting(); return; }
    modal.classList.remove("hidden");

    input.addEventListener("input", () => {
        const val = input.value.slice(0, 15);
        input.value = val;
        charCount.textContent = val.length;
    });

    function submitName() {
        const name = input.value.trim().slice(0, 15);
        if (!name) {
            input.style.borderColor = "#f87171";
            input.focus();
            setTimeout(() => input.style.borderColor = "", 600);
            return;
        }
        userName = name;
        localStorage.setItem(NAME_KEY, userName);
        modal.classList.add("hidden");
        updateGalleryGreeting();
    }

    submitBtn.addEventListener("click", submitName);
    input.addEventListener("keydown", e => { if (e.key === "Enter") submitName(); });
    setTimeout(() => input.focus(), 100);
}

function updateGalleryGreeting() {
    const nameEl = document.getElementById("galleryUserName");
    if (nameEl && userName) nameEl.textContent = `Hi ${userName},`;
}
