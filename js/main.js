/**
 * main.js
 * Orchestrates the entire birthday experience.
 * Manages: screen navigation, audio, dashboard counters,
 * scrapbook, video reveal, floating hearts, easter eggs.
 */

(function () {
  'use strict';

  const CONFIG = {
  
    birthdayDate: new Date(2006, 2, 18),

    metDate: new Date(2024, 3, 13),

    memoriesCount: 247,
    messagesSent: 1832,
  };
  // ────────────────────────────────────────────────────────

  // ── State ───────────────────────────────────────────────
  let currentPage  = 0;
  const TOTAL_PAGES = 5;
  let easterHeartCount = 0;
  let easterKeySequence = '';
  const EASTER_KEY_CODE = 'GARGEE';

  // ── AudioManager ────────────────────────────────────────
  const AudioManager = {
    _nodes: {},
    _bgPlaying: false,

    init() {
      this._nodes = {
        intro:        document.getElementById('audioIntro'),
        guide1:       document.getElementById('audioGuide1'),
        beforeVideo:  document.getElementById('audioBeforeVideo'),
        final:        document.getElementById('audioFinal'),
        bg:           document.getElementById('audioBg'),
      };
      // Mute all initially (browser policy)
      Object.values(this._nodes).forEach(a => { if (a) a.volume = 0.55; });
      if (this._nodes.bg) this._nodes.bg.volume = 0.25;
    },

    play(key) {
      const node = this._nodes[key];
      if (!node) return;
      node.currentTime = 0;
      node.play().catch(() => {}); // silently handle autoplay block
    },

    stopAll() {
      Object.values(this._nodes).forEach(a => {
        if (a) { a.pause(); a.currentTime = 0; }
      });
    },

    startBg() {
      if (this._bgPlaying || !this._nodes.bg) return;
      this._bgPlaying = true;
      this._nodes.bg.play().catch(() => {});
    },

    stopBg() {
      if (!this._nodes.bg) return;
      this._bgPlaying = false;
      this._nodes.bg.pause();
    },
  };
  window.AudioManager = AudioManager;

  // ── Screen Navigation ───────────────────────────────────
  function goToSection(id) {
    const screens = document.querySelectorAll('.screen');
    const target  = document.getElementById(id);
    if (!target) return;

    // Fade out all
    screens.forEach(s => {
      if (s !== target) {
        s.classList.remove('active');
        s.style.zIndex = '1';
      }
    });

    // Fade in target
    target.style.zIndex = '10';
    target.classList.add('active');
    target.scrollTop = 0;
  }
  window.goToSection = goToSection;

  // ── Dashboard ───────────────────────────────────────────
  function calcDaysLived() {
    const now  = new Date();
    const diff = now - CONFIG.birthdayDate;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  function calcDaysTogether() {
    const now  = new Date();
    const diff = now - CONFIG.metDate;
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }

  function animateCounter(el, target, duration = 2000, suffix = '') {
    if (!el) return;
    const start     = 0;
    const startTime = performance.now();

    function step(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = Math.floor(start + (target - start) * eased);
      el.textContent = current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  function initDashboard() {
    // Set dynamic targets
    const daysLivedEl     = document.getElementById('daysLived');
    const daysTogether    = document.getElementById('daysTogether');

    if (daysLivedEl)  daysLivedEl.dataset.target  = calcDaysLived();
    if (daysTogether) daysTogether.dataset.target  = calcDaysTogether();

    // Animate all counters
    document.querySelectorAll('.stat-number').forEach(el => {
      const target = parseInt(el.dataset.target, 10) || 0;
      const suffix = el.dataset.suffix || '';
      animateCounter(el, target, 2000, suffix);
    });

    // Animate happiness bar
    setTimeout(() => {
      const fill = document.getElementById('happinessFill');
      if (fill) fill.style.width = '100%';
    }, 500);
  }

  // ── Floating Hearts ─────────────────────────────────────
  const HEART_EMOJIS = ['❤️', '🩷', '💕', '💗', '💝', '🌸', '✨'];

  function createHeart(container, options = {}) {
    const el   = document.createElement('span');
    el.classList.add('heart');
    el.textContent = HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)];

    const size = options.large
      ? ['medium', 'large'][Math.floor(Math.random() * 2)]
      : ['small', 'medium'][Math.floor(Math.random() * 2)];

    el.classList.add(size);
    el.style.left             = Math.random() * 100 + '%';
    el.style.animationDuration = (6 + Math.random() * 10) + 's';
    el.style.animationDelay   = (Math.random() * 8) + 's';

    container.appendChild(el);
    setTimeout(() => el.remove(), 20000);
  }

  function spawnHearts(containerId, count = 10, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    for (let i = 0; i < count; i++) {
      createHeart(container, options);
    }
  }

  function startHeartLoop(containerId, interval = 1500, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const id = setInterval(() => {
      createHeart(container, options);
    }, interval);

    return id;
  }

  // ── Floating Particles (Scrapbook) ──────────────────────
  function initParticles(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const colors = ['#f4a7b9', '#b2dfdb', '#fce4ec', '#e0f2f1', '#80cbc4'];

    for (let i = 0; i < 18; i++) {
      const p = document.createElement('div');
      p.classList.add('particle');

      const size     = 4 + Math.random() * 8;
      const color    = colors[Math.floor(Math.random() * colors.length)];
      const duration = 8 + Math.random() * 12;
      const delay    = Math.random() * 10;
      const left     = Math.random() * 100;

      p.style.cssText = `
        width: ${size}px; height: ${size}px;
        background: ${color};
        left: ${left}%;
        animation-duration: ${duration}s;
        animation-delay: ${delay}s;
        opacity: 0;
      `;
      container.appendChild(p);
    }
  }

  // ── Lock-screen particles ────────────────────────────────
  function initLockParticles() {
    const container = document.getElementById('lockParticles');
    if (!container) return;

    for (let i = 0; i < 20; i++) {
      const p   = document.createElement('div');
      p.style.cssText = `
        position: absolute;
        width: ${2 + Math.random() * 4}px;
        height: ${2 + Math.random() * 4}px;
        background: rgba(244,167,185,${0.1 + Math.random() * 0.3});
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: particleDrift ${8 + Math.random() * 12}s ${Math.random() * 8}s linear infinite;
      `;
      container.appendChild(p);
    }
  }

  // ── Scrapbook ───────────────────────────────────────────
  function initScrapbook() {
    const pages = document.querySelectorAll('.page');
    const indicator = document.getElementById('pageIndicator');

    function showPage(n) {
      pages.forEach((p, i) => {
        p.classList.remove('active-page', 'flipping');
        if (i === n) p.classList.add('active-page');
      });
      if (indicator) indicator.textContent = `${n + 1} / ${TOTAL_PAGES}`;
    }

    showPage(0);

    document.getElementById('nextPage')?.addEventListener('click', () => {
      if (currentPage < TOTAL_PAGES - 1) {
        const cur = document.getElementById(`page${currentPage + 1}`);
        if (cur) {
          cur.classList.add('flipping');
          setTimeout(() => {
            currentPage++;
            showPage(currentPage);
          }, 350);
        }
      }
    });

    document.getElementById('prevPage')?.addEventListener('click', () => {
      if (currentPage > 0) {
        currentPage--;
        showPage(currentPage);
      }
    });

    // Reveal hidden notes
    document.querySelectorAll('.reveal-note-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const noteId = btn.dataset.note;
        const note   = document.getElementById(noteId);
        if (!note) return;
        note.classList.toggle('hidden');
        btn.textContent = note.classList.contains('hidden')
          ? 'Read the hidden note 💌'
          : 'Close note ✕';
      });
    });
  }

  // ── Video Screen ─────────────────────────────────────────
  function initVideoScreen() {
    const video     = document.getElementById('birthdayVideo');
    const overlay   = document.getElementById('fadeOverlay');
    const vidOverlay = document.getElementById('videoOverlay');
    const playBtn   = document.getElementById('playVideoBtn');
    const skipBtn   = document.getElementById('skipVideoBtn');

    if (!video) return;

    // Fade in (remove the black overlay)
    function revealVideo() {
      AudioManager.play('beforeVideo');
      if (overlay) overlay.style.opacity = '0';
    }

    // Called when video ends
    function onVideoEnd() {
      if (vidOverlay) {
        vidOverlay.classList.remove('hidden');
        setTimeout(() => {
          goToFinal();
        }, 3500);
      }
    }

    video.addEventListener('ended', onVideoEnd);

    playBtn?.addEventListener('click', () => {
      revealVideo();
      video.play().catch(() => {});
      playBtn.style.display = 'none';
    });

    skipBtn?.addEventListener('click', goToFinal);

    // When section becomes active, start fade reveal
    window.addEventListener('scrapbook-done', () => {
      setTimeout(revealVideo, 600);
    });
  }

  function goToFinal() {
    AudioManager.stopBg();
    AudioManager.play('final');
    goToSection('finalScreen');
    startHeartLoop('finalHeartsAnim', 800, { large: true });
  }

  // ── Easter Eggs ─────────────────────────────────────────
  function initEasterEggs() {
    // 1. Keyboard sequence: G A R G E E
    document.addEventListener('keydown', (e) => {
      easterKeySequence += e.key.toUpperCase();
      if (easterKeySequence.length > EASTER_KEY_CODE.length) {
        easterKeySequence = easterKeySequence.slice(-EASTER_KEY_CODE.length);
      }
      if (easterKeySequence === EASTER_KEY_CODE) {
        easterKeySequence = '';
        window.Puzzle && window.Puzzle.triggerConfetti(true);
        showToast('🌸 You spelled her name! Confetti for you!');
      }
    });

    // 2. 5 Hidden hearts — click hearts in the final screen
    document.getElementById('finalScreen')?.addEventListener('click', (e) => {
      const tgt = e.target.closest('.heart');
      if (tgt) {
        easterHeartCount++;
        tgt.style.transform = 'scale(1.8)';
        setTimeout(() => (tgt.style.transform = ''), 300);
        if (easterHeartCount >= 5) {
          easterHeartCount = 0;
          const secret = document.getElementById('easterSecret');
          if (secret) secret.classList.remove('hidden');
        }
      }
    });

    // 3. Long press anywhere: "I love you more."
    let pressTimer = null;
    document.addEventListener('pointerdown', () => {
      pressTimer = setTimeout(() => {
        showToast('💖 I love you more.');
      }, 1500);
    });
    document.addEventListener('pointerup',   () => clearTimeout(pressTimer));
    document.addEventListener('pointerleave',() => clearTimeout(pressTimer));
  }

  // ── Toast Notification ───────────────────────────────────
  function showToast(msg, duration = 3000) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.remove('hidden');
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.classList.add('hidden'), 300);
    }, duration);
  }
  window.showToast = showToast;

  // ── Replay ───────────────────────────────────────────────
  function replayJourney() {
    AudioManager.stopAll();
    easterHeartCount  = 0;
    easterKeySequence = '';

    // If locked, go back to lock; else entry
    if (Countdown.isBirthdayUnlocked()) {
      goToSection('entryScreen');
      AudioManager.startBg();
    } else {
      goToSection('lockScreen');
      Countdown.start();
    }
  }

  // ── Entry Point ─────────────────────────────────────────
  function boot() {
    AudioManager.init();
    initEasterEggs();
    initLockParticles();

    // ── IST time check ──────────────────────────────────
    if (Countdown.isBirthdayUnlocked()) {
      // It's birthday time — show entry screen
      goToSection('entryScreen');
      spawnHearts('entryHearts', 15);
      startHeartLoop('entryHearts', 2000);
      AudioManager.startBg();
    } else {
      // Still waiting — show lock screen with countdown
      goToSection('lockScreen');
      startHeartLoop('lockHearts', 3000);
      Countdown.start();

      // Register callback for when countdown hits 0
      window.onBirthdayUnlock = function () {
        goToSection('entryScreen');
        spawnHearts('entryHearts', 20);
        startHeartLoop('entryHearts', 2000);
        AudioManager.startBg();
      };
    }

    // ── Button: Start Journey ────────────────────────────
    document.getElementById('startJourneyBtn')?.addEventListener('click', () => {
      AudioManager.play('intro');
      goToSection('puzzleScreen');
      Puzzle.init();
    });

    // ── Dashboard next ───────────────────────────────────
    document.getElementById('toDashNextBtn')?.addEventListener('click', () => {
      goToSection('scrapbookScreen');
      initScrapbook();
      initParticles('scrapParticles');
    });

    // Trigger dashboard counters when it becomes active
    const dashObserver = new MutationObserver(() => {
      const dash = document.getElementById('dashboardScreen');
      if (dash && dash.classList.contains('active')) {
        initDashboard();
        dashObserver.disconnect();
      }
    });
    dashObserver.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class'] });

    // ── Scrapbook → Video ────────────────────────────────
    document.getElementById('toVideoBtn')?.addEventListener('click', () => {
      goToSection('videoScreen');
      initVideoScreen();
      window.dispatchEvent(new Event('scrapbook-done'));
    });

    // ── Replay ───────────────────────────────────────────
    document.getElementById('replayBtn')?.addEventListener('click', replayJourney);
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
