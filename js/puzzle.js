/**
 * puzzle.js
 * Handles the two-step secret code puzzle.
 *
 * HOW TO CONFIGURE:
 * 1. Set PASSWORD below (her nickname, lowercase).
 * 2. Set RIDDLE_ANSWER below (DDMM format of date you first talked).
 */

(function () {
  'use strict';

  // ── ✏️  EDIT THESE TWO VALUES ───────────────────────────
  const PASSWORD     = 'nickname';   // ← Replace with her actual nickname (lowercase)
  const RIDDLE_ANSWER = '1803';      // ← Replace with DDMM of the date you first talked
  // ────────────────────────────────────────────────────────

  let puzzleReady = false;

  function initPuzzle() {
    if (puzzleReady) return;
    puzzleReady = true;

    const passwordInput  = document.getElementById('passwordInput');
    const passwordSubmit = document.getElementById('passwordSubmit');
    const passwordError  = document.getElementById('passwordError');
    const puzzleStep1    = document.getElementById('puzzleStep1');
    const puzzleStep2    = document.getElementById('puzzleStep2');

    const riddleInput   = document.getElementById('riddleInput');
    const riddleSubmit  = document.getElementById('riddleSubmit');
    const riddleError   = document.getElementById('riddleError');

    if (!passwordSubmit) return;

    // ── Step 1: Password ──────────────────────────────────
    function checkPassword() {
      const val = (passwordInput.value || '').trim().toLowerCase();
      if (val === PASSWORD.toLowerCase()) {
        // ✓ Correct password
        passwordError.classList.add('hidden');
        triggerConfetti();

        // Play guide1 audio
        window.AudioManager && window.AudioManager.play('guide1');

        // Animate step transition
        puzzleStep1.style.animation = 'fadeSlideUp 0.4s reverse forwards';
        setTimeout(() => {
          puzzleStep1.classList.add('hidden');
          puzzleStep2.classList.remove('hidden');
          puzzleStep2.style.animation = 'fadeSlideUp 0.5s ease both';
          if (riddleInput) riddleInput.focus();
        }, 400);
      } else {
        // ✗ Wrong password
        passwordError.classList.remove('hidden');
        passwordError.style.animation = 'none';
        void passwordError.offsetWidth; // reflow
        passwordError.style.animation = 'shake 0.4s ease';
        passwordInput.value = '';
        passwordInput.focus();
      }
    }

    passwordSubmit.addEventListener('click', checkPassword);
    passwordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') checkPassword();
    });

    // ── Step 2: Riddle ────────────────────────────────────
    function checkRiddle() {
      const val = (riddleInput.value || '').trim();
      if (val === RIDDLE_ANSWER) {
        // ✓ Correct riddle answer
        riddleError.classList.add('hidden');
        triggerConfetti(true);

        window.AudioManager && window.AudioManager.play('guide1');

        // Proceed to dashboard
        setTimeout(() => {
          if (typeof window.goToSection === 'function') {
            window.goToSection('dashboardScreen');
          }
        }, 1200);
      } else {
        // ✗ Wrong answer
        riddleError.classList.remove('hidden');
        riddleError.style.animation = 'none';
        void riddleError.offsetWidth;
        riddleError.style.animation = 'shake 0.4s ease';
        riddleInput.value = '';
        riddleInput.focus();
      }
    }

    riddleSubmit.addEventListener('click', checkRiddle);
    riddleInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') checkRiddle();
    });

    // Only allow digits in riddle input
    riddleInput.addEventListener('input', () => {
      riddleInput.value = riddleInput.value.replace(/\D/g, '');
    });
  }

  /**
   * Fire confetti animation.
   * @param {boolean} dense — more pieces for correct riddle
   */
  function triggerConfetti(dense = false) {
    const container = document.getElementById('confettiContainer');
    if (!container) return;

    const colors = [
      '#f4a7b9', '#e57fa0', '#b2dfdb', '#80cbc4',
      '#fce4ec', '#e0f2f1', '#f8bbd9', '#80deea',
    ];
    const count = dense ? 120 : 60;

    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      piece.classList.add('confetti-piece');

      // Random position, color, size, duration
      const size     = 6 + Math.random() * 8;
      const color    = colors[Math.floor(Math.random() * colors.length)];
      const left     = Math.random() * 100;
      const duration = 1.5 + Math.random() * 2;
      const delay    = Math.random() * 0.8;

      piece.style.cssText = `
        left: ${left}%;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        animation-duration: ${duration}s;
        animation-delay: ${delay}s;
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        transform: rotate(${Math.random() * 360}deg);
      `;

      container.appendChild(piece);

      // Remove after animation
      setTimeout(() => {
        piece.remove();
      }, (duration + delay) * 1000 + 200);
    }
  }

  // Expose to global scope
  window.Puzzle = { init: initPuzzle, triggerConfetti };
})();
