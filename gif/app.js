// Fixed defaults (per request)
const DEFAULTS = {
    frames: 2,
    delay: 120,
    quality: 10,
    workers: 2
  };
  
  const elFile = document.getElementById('file');
  const elMake = document.getElementById('make');
  const elDownload = document.getElementById('download');
  const elStatus = document.getElementById('status');
  const elBar = document.getElementById('bar');
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  
  let loadedImage = null;
  let lastGifUrl = null;
  
  function setStatus(text, progress01 = null) {
    elStatus.textContent = text || '';
    if (progress01 == null) return;
    const pct = Math.max(0, Math.min(1, progress01)) * 100;
    elBar.style.width = pct.toFixed(1) + '%';
  }
  
  function revokeLastGif() {
    if (lastGifUrl) URL.revokeObjectURL(lastGifUrl);
    lastGifUrl = null;
  }
  
  function resetDownload() {
    elDownload.hidden = true;
    elDownload.removeAttribute('href');
  }
  
  const MAX_WIDTH = 2000;

function drawToCanvas(img) {
  const srcW = img.naturalWidth || img.width;
  const srcH = img.naturalHeight || img.height;

  const scale = srcW > MAX_WIDTH ? (MAX_WIDTH / srcW) : 1;

  const w = Math.max(1, Math.round(srcW * scale));
  const h = Math.max(1, Math.round(srcH * scale));

  canvas.width = w;
  canvas.height = h;

  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h); // draws and scales in one call [web:52]
}
  
  async function createWorkerScriptUrl() {
    // gif.js expects a worker script; fetching it and using a Blob URL avoids cross-origin worker issues. [web:2]
    const workerCdnUrl = 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js';
    const res = await fetch(workerCdnUrl, { cache: 'force-cache' });
    if (!res.ok) throw new Error('Failed to fetch gif.worker.js');
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  }
  
  elFile.addEventListener('change', () => {
    revokeLastGif();
    resetDownload();
    setStatus('', 0);
  
    const file = elFile.files && elFile.files[0];
    if (!file) {
      loadedImage = null;
      elMake.disabled = true;
      return;
    }
  
    const url = URL.createObjectURL(file);
  
    const img = new Image();
    img.onload = () => {
      loadedImage = img;
      drawToCanvas(img);
      elMake.disabled = false;
      setStatus('Ready.', 0);
    };
    img.onerror = () => {
      loadedImage = null;
      elMake.disabled = true;
      setStatus('Failed to load image.', 0);
    };
    img.src = url;
  });
  
  elMake.addEventListener('click', async () => {
    if (!loadedImage) return;
  
    elMake.disabled = true;
    revokeLastGif();
    resetDownload();
    setStatus('Preparing…', 0);
  
    let workerScriptUrl = null;
  
    try {
      drawToCanvas(loadedImage);
  
      workerScriptUrl = await createWorkerScriptUrl();
  
      // gif.js usage: new GIF({workers, quality, workerScript}), addFrame(..., {delay, copy}), then render(), then read Blob from 'finished'. [web:1][web:3]
      const gif = new GIF({
        workers: DEFAULTS.workers,
        quality: DEFAULTS.quality,
        workerScript: workerScriptUrl,
        width: canvas.width,
        height: canvas.height,
        repeat: 0
      });
  
      gif.on('progress', p => setStatus('Encoding…', p));
  
      for (let i = 0; i < DEFAULTS.frames; i++) {
        gif.addFrame(canvas, { delay: DEFAULTS.delay, copy: true });
      }
  
      gif.on('finished', (blob) => {
        if (workerScriptUrl) URL.revokeObjectURL(workerScriptUrl);
  
        lastGifUrl = URL.createObjectURL(blob);
        elDownload.href = lastGifUrl;
        elDownload.hidden = false;
  
        setStatus('Done.', 1);
        elMake.disabled = false;
      });
  
      gif.render();
    } catch (err) {
      if (workerScriptUrl) URL.revokeObjectURL(workerScriptUrl);
      setStatus('Error: ' + (err?.message || String(err)), 0);
      elMake.disabled = false;
    }
  });
  