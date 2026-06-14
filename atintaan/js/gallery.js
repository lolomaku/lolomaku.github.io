/* ==========================
   GALLERY
========================== */

// ── Filter state ──
let activeFilter = "all";
let allGalleryFiles = [];

// ── Completion detection threshold ──
// We sample 1-in-16 pixels from the colorCanvas for speed.
// A pixel is considered "colored" if its alpha > 10 (i.e. paint was applied).
// If more than 85% of the artwork's *non-white-background* area is covered,
// we call it "Finished". We compare against the line art's transparent pixels
// (the coloring layer starts empty, so any alpha > 10 there = user painted it).
const FINISHED_THRESHOLD = 0.85; // 85% of colorable area painted
const SAMPLE_STEP        = 4;    // sample every 4th pixel (1/16 of total)

async function computeCompletionRatio(saved) {
    if (!saved || !saved.colorBlob) return 0;
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
            const c   = document.createElement("canvas");
            c.width   = img.width;
            c.height  = img.height;
            const ctx = c.getContext("2d", { willReadFrequently: true });
            ctx.drawImage(img, 0, 0);
            const data    = ctx.getImageData(0, 0, c.width, c.height).data;
            let colored   = 0;
            let total     = 0;
            // Walk every SAMPLE_STEP-th pixel
            for (let i = 3; i < data.length; i += 4 * SAMPLE_STEP) {
                total++;
                if (data[i] > 10) colored++; // alpha > 10 = painted
            }
            resolve(total === 0 ? 0 : colored / total);
        };
        img.onerror = () => resolve(0);
        img.src = URL.createObjectURL(saved.colorBlob);
    });
}

// Determine the status of one artwork entry:
//   "new"        — never opened
//   "in-progress"— opened & has saved data, but < FINISHED_THRESHOLD colored
//   "finished"   — ≥ FINISHED_THRESHOLD of colorable area is painted
async function getArtworkStatus(file) {
    const saved = await dbGet(file.data);
    if (!saved) return { status: "new", saved: null, ratio: 0 };
    const ratio = await computeCompletionRatio(saved);
    return {
        status: ratio >= FINISHED_THRESHOLD ? "finished" : "in-progress",
        saved,
        ratio
    };
}

// ── Build one card DOM element ──
function buildCard(file, status, saved) {
    const card = document.createElement("div");
    card.className = "card";
    card.setAttribute("data-url",    file.data);
    card.setAttribute("data-status", status);

    const thumbSrc = saved ? saved.thumb : (file.thumbnail || "");

    let badgeHTML = "";
    if (status === "in-progress") {
        badgeHTML = `<div class="progress-badge progress-badge--wip">🎨 In Progress</div>`;
    } else if (status === "finished") {
        badgeHTML = `<div class="progress-badge progress-badge--done">🏅 Finished!</div>`;
    }

    card.innerHTML = `<img src="${thumbSrc}" loading="lazy"><h3>${file.name}</h3>${badgeHTML}`;

    // Lazy-load the real thumbnail if we only have a URL string
    if (!saved && file.thumbnail) {
        fetchAndCacheImage(file.thumbnail).then(src => {
            const img = card.querySelector("img");
            if (img) img.src = src;
        });
    }

    card.onclick = async () => {
        if (saved) await resumeSession(saved);
        else loadArtwork(file.data, file.name);
    };

    return card;
}

// ── Render (with active filter) ──
function renderFiltered() {
    gallery.innerHTML = "";
    const filtered = activeFilter === "all"
        ? allGalleryFiles
        : allGalleryFiles.filter(f => f._status === activeFilter);

    if (filtered.length === 0) {
        gallery.innerHTML = `<p class="gallery-empty">Nothing here yet! Start coloring to fill this section. 🎨</p>`;
        return;
    }

    filtered.forEach(f => {
        gallery.appendChild(buildCard(f, f._status, f._saved));
    });
}

// ── Main load ──
async function renderGalleryItems(files) {
    gallery.innerHTML = `<p class="gallery-loading">Loading your artworks…</p>`;

    // Enrich each file with its status (async, per item)
    const enriched = await Promise.all(files.map(async file => {
        const { status, saved } = await getArtworkStatus(file);
        return { ...file, _status: status, _saved: saved };
    }));

    allGalleryFiles = enriched;
    updateFilterCounts();
    renderFiltered();

    // Pre-cache uncached artwork blobs in background
    enriched.forEach(f => {
        if (!f._saved) fetchAndCacheImage(f.data);
    });
}

async function loadGallery() {
    // 1. Serve from local cache immediately
    const cachedJSON = localStorage.getItem("galleryList");
    if (cachedJSON) {
        try { await renderGalleryItems(JSON.parse(cachedJSON)); }
        catch (e) { console.warn("Cache parse failed.", e); }
    }

    // 2. Fetch fresh list in background
    try {
        const res   = await fetch(API_URL);
        const files = await res.json();
        if (JSON.stringify(files) !== cachedJSON) {
            localStorage.setItem("galleryList", JSON.stringify(files));
            await renderGalleryItems(files);
        }
    } catch (err) {
        if (!cachedJSON) {
            gallery.innerHTML = `<p style="text-align:center;width:100%;padding:40px;">
                Unable to connect and no offline cache found.</p>`;
        }
    }
}

// ── Filter chip counts ──
function updateFilterCounts() {
    const counts = { all: allGalleryFiles.length, new: 0, "in-progress": 0, finished: 0 };
    allGalleryFiles.forEach(f => { if (counts[f._status] !== undefined) counts[f._status]++; });

    document.querySelectorAll(".filter-chip").forEach(chip => {
        const key   = chip.dataset.filter;
        const count = counts[key] ?? 0;
        const badge = chip.querySelector(".chip-count");
        if (badge) badge.textContent = count;
        chip.classList.toggle("filter-chip--empty", count === 0 && key !== "all");
    });
}

// ── Wire up filter chips (called once on init) ──
function initFilterChips() {
    document.querySelectorAll(".filter-chip").forEach(chip => {
        chip.addEventListener("click", () => {
            document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            activeFilter = chip.dataset.filter;
            renderFiltered();
        });
    });
}
