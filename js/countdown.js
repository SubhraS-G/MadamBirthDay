/**
 * countdown.js
 * Handles IST (Asia/Kolkata) time validation and live countdown.
 * Birthday unlock: 18 March 2026, 00:00 IST
 */

(function () {
  'use strict';

  // ── Configuration ──────────────────────────────────────
  // Birthday unlock target: 18 March 2026, 00:00:00 IST (UTC+5:30)
  // In UTC: 17 March 2026, 18:30:00 UTC
  const BIRTHDAY_UTC = Date.UTC(2026, 2, 16, 18, 30, 0); // Month is 0-indexed

  /**
   * Get current time in IST using Intl API.
   * Returns a Date-like object with IST components.
   */
  function getISTNow() {
    const now = new Date();
    // Use Intl to get IST time string
    const istString = now.toLocaleString('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    // Parse "YYYY-MM-DD, HH:MM:SS" format
    return new Date(istString.replace(',', ''));
  }

  /**
   * Check if we have passed the birthday unlock time.
   * Compares current UTC timestamp against BIRTHDAY_UTC.
   *
   * DEV BYPASS: Add ?preview=true to URL to skip the lock.
   * e.g. index.html?preview=true
   * REMOVE this param before sharing with her!
   */
  function isBirthdayUnlocked() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('preview') === 'true') return true;
    return Date.now() >= BIRTHDAY_UTC;
  }

  /**
   * Calculate remaining time until birthday.
   * @returns {{ days, hours, minutes, seconds, total }}
   */
  function getTimeRemaining() {
    const total = BIRTHDAY_UTC - Date.now();
    if (total <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };

    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours   = Math.floor((total / 1000 / 60 / 60) % 24);
    const days    = Math.floor(total / 1000 / 60 / 60 / 24);

    return { days, hours, minutes, seconds, total };
  }

  /**
   * Zero-pad a number to 2 digits.
   */
  function pad(n) {
    return String(n).padStart(2, '0');
  }

  /**
   * Update countdown DOM elements.
   */
  function updateCountdown() {
    const { days, hours, minutes, seconds, total } = getTimeRemaining();

    const elDays    = document.getElementById('cdDays');
    const elHours   = document.getElementById('cdHours');
    const elMinutes = document.getElementById('cdMinutes');
    const elSeconds = document.getElementById('cdSeconds');

    if (!elDays) return; // DOM not ready

    // Update with flip animation on change
    const updateEl = (el, val) => {
      if (el && el.textContent !== pad(val)) {
        el.classList.add('flip');
        el.textContent = pad(val);
        setTimeout(() => el.classList.remove('flip'), 300);
      }
    };

    updateEl(elDays, days);
    updateEl(elHours, hours);
    updateEl(elMinutes, minutes);
    updateEl(elSeconds, seconds);

    if (total <= 0) {
      // Time is up — trigger unlock
      clearInterval(window._countdownInterval);
      if (typeof window.onBirthdayUnlock === 'function') {
        window.onBirthdayUnlock();
      }
    }
  }

  /**
   * Public API
   */
  window.Countdown = {
    isBirthdayUnlocked,
    getISTNow,
    start() {
      updateCountdown();
      window._countdownInterval = setInterval(updateCountdown, 1000);
    },
  };
})();
