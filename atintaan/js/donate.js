/* ==========================
   CHIBI BUTTON HOVER SWAPS
   + EMOJI FALLBACK
========================== */

// Emoji shown in place of each chibi when the PNG hasn't been added yet
const CHIBI_FALLBACK = {
    "assets/brushtool_default.png":  "🖌️",
    "assets/brushtool_onhover.png":  "🖌️",
    "assets/blendtool_default.png":  "💧",
    "assets/blendtool_onhover.png":  "💧",
    "assets/erasertool_default.png": "🧽",
    "assets/erasertool_onhover.png": "🧽",
    "assets/undo_default.png":       "↩️",
    "assets/undo_onhover.png":       "↩️",
    "assets/redo_default.png":       "↪️",
    "assets/redo_onhover.png":       "↪️",
    "assets/fit_default.png":        "🔍",
    "assets/fit_onhover.png":        "🔍",
    "assets/save_default.png":       "💾",
    "assets/save_onhover.png":       "💾",
    "assets/donate_default.png":     "☕",
    "assets/donate_onhover.png":     "☕",
    "assets/gallery_default.png":    "🏠",
    "assets/gallery_onhover.png":    "🏠",
};

function initChibiHovers() {
    document.querySelectorAll(".btn").forEach(btn => {
        const img = btn.querySelector(".btn-chibi");
        if (!img) return;

        // Replace broken image with an emoji <span> fallback
        img.addEventListener("error", function onErr() {
            img.removeEventListener("error", onErr);
            const emoji = CHIBI_FALLBACK[img.dataset.default] || "✨";
            const span  = document.createElement("span");
            span.className   = "btn-chibi btn-chibi-emoji";
            span.textContent = emoji;
            img.replaceWith(span);
        }, { once: false });

        // Hover swap (only fires if the image loaded successfully)
        btn.addEventListener("mouseenter", () => {
            const current = btn.querySelector(".btn-chibi");
            if (current && current.tagName === "IMG" && current.dataset.hover) {
                current.src = current.dataset.hover;
            }
        });
        btn.addEventListener("mouseleave", () => {
            const current = btn.querySelector(".btn-chibi");
            if (current && current.tagName === "IMG" && current.dataset.default) {
                current.src = current.dataset.default;
            }
        });
    });
}

/* ==========================
   DONATE MODAL
========================== */

// ── Fill in your real donate details here ──────────────────────────
const DONATE_INFO = {
    maya: {
        name:  "Maya",
        // Replace with your real QR code image path
        qr:    "assets/qr_maya.png",
        link:  "https://maya.ph/YOUR_LINK",
        label: "maya.ph/YOUR_LINK"
    },
    gcash: {
        name:  "GCash",
        qr:    "assets/qr_gcash.png",
        link:  "https://gcash.com/YOUR_LINK",
        label: "gcash.com/YOUR_LINK"
    },
    paypal: {
        name:  "PayPal",
        qr:    "assets/qr_paypal.png",
        link:  "https://paypal.me/markpajao?locale.x=en_US&country.x=PH",
        label: "paypal.me/lolomaku"
    }
};
// ───────────────────────────────────────────────────────────────────

function initDonateModal() {
    const modal      = document.getElementById("donateModal");
    const closeBtn   = document.getElementById("donateCloseBtn");
    const openBtn    = document.getElementById("donateBtn");
    const methodBtns = document.querySelectorAll(".donate-method-btn");
    const result     = document.getElementById("donateResult");
    const qrImg      = document.getElementById("donateQr");
    const linkEl     = document.getElementById("donateLink");
    const nameEl     = document.getElementById("donateResultName");

    // ── Open ──
    openBtn.addEventListener("click", () => {
        modal.classList.remove("hidden");
        methodBtns.forEach(b => b.classList.remove("selected"));
        result.classList.remove("show");
        linkRow.style.display = "none";
    });

    // ── Close ──
    function closeModal() { modal.classList.add("hidden"); }
    closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && !modal.classList.contains("hidden")) closeModal();
    });

    const linkRow = document.getElementById("donateLinkRow");

    // ── Method selection → show QR + link ──
    methodBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            methodBtns.forEach(b => b.classList.remove("selected"));
            btn.classList.add("selected");

            const key  = btn.dataset.method;
            const info = DONATE_INFO[key];
            if (!info) return;

            nameEl.textContent = `Send to via ${info.name}:`;
            qrImg.src          = info.qr;

            // Only show the link row for PayPal
            if (key === "paypal") {
                linkEl.href        = info.link;
                linkEl.textContent = info.label;
                linkRow.style.display = "";
            } else {
                linkRow.style.display = "none";
            }

            // Smooth reveal
            result.classList.add("show");
            result.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
    });
}
