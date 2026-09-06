"use strict";
(function () {
  let activePagePay = null;

  function announcePaySelection(key) {
    document.dispatchEvent(new CustomEvent("support:pay-selected", { detail: { key } }));
  }

  function togglePageQR(key) {
    const panel = document.getElementById(`page-${key}-qr`);
    if (!panel) return;
    const allPanels = document.querySelectorAll(".support-donate-panel .support-qr-panel");
    const allBtns = document.querySelectorAll(".support-donate-panel [data-page-pay]");
    const btn = document.querySelector(`.support-donate-panel [data-page-pay="${key}"]`);

    if (activePagePay === key) {
      panel.classList.remove("visible");
      btn && btn.classList.remove("active");
      activePagePay = null;
      announcePaySelection(null);
      return;
    }

    allPanels.forEach((p) => p.classList.remove("visible"));
    allBtns.forEach((b) => b.classList.remove("active"));

    requestAnimationFrame(() => {
      panel.classList.add("visible");
      btn && btn.classList.add("active");
      activePagePay = key;
      announcePaySelection(key);
      setTimeout(() => panel.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
    });
  }

  function initSupportPage() {
    document.querySelectorAll(".support-donate-panel [data-page-pay]").forEach((btn) => {
      btn.addEventListener("click", () => togglePageQR(btn.getAttribute("data-page-pay")));
    });
  }

  document.addEventListener("DOMContentLoaded", initSupportPage);
})();
