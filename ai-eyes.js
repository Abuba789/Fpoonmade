(() => {
  'use strict';

  const HIDDEN = 'HIDDEN', ENTERING = 'ENTERING', OBSERVING = 'OBSERVING';
  const CORRECT_REACTION = 'CORRECT_REACTION', WRONG_REACTION = 'WRONG_REACTION';
  const DISAPPEARING = 'DISAPPEARING';

  function createEyes(canvas, quiz = false) {
    const ctx = canvas.getContext('2d');
    const glyphs = '01011001<>/\\{}[]+=-*:#;01';
    const cellW = 9;
    const cellH = 12;
    const state = { width: 0, height: 0, dpr: 1, mouseX: 0, mouseY: 0, gazeX: 0, gazeY: 0,
      formed: 0, fade: 1, mode: HIDDEN, elapsed: 0, last: null, raf: null,
      glitchUntil: 0, nextGlitch: 0 };

    function transition(mode) {
      state.mode = mode;
      state.elapsed = 0;
      canvas.dataset.state = mode;
    }

    function hide() {
      if (state.raf !== null) cancelAnimationFrame(state.raf);
      state.raf = null;
      transition(HIDDEN);
      ctx.clearRect(0, 0, state.width, state.height);
    }

    function show() {
      if (state.mode !== HIDDEN) return;
      resize();
      Object.assign(state, { formed: 0, fade: 1, last: null, gazeX: 0, gazeY: 0,
        glitchUntil: 0, nextGlitch: 0 });
      transition(ENTERING);
      state.raf = requestAnimationFrame(frame);
    }

    function react(correct) {
      if (state.mode !== ENTERING && state.mode !== OBSERVING) return;
      transition(correct ? CORRECT_REACTION : WRONG_REACTION);
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      state.width = Math.max(1, rect.width);
      state.height = Math.max(1, rect.height);
      state.dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(state.width * state.dpr);
      canvas.height = Math.round(state.height * state.dpr);
      ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
      state.mouseX = state.width / 2;
      state.mouseY = state.height / 2;
    }

    function hash(x, y, eye) {
      const n = Math.sin(x * 127.1 + y * 311.7 + eye * 74.7) * 43758.5453;
      return n - Math.floor(n);
    }

    function eyeShape(nx, ny, eye) {
      const asymmetry = Math.sin(nx * 5 + eye * 1.7) * 0.025;
      const height = (0.78 - Math.pow(Math.abs(nx), 1.25) * 0.63) * (1 + asymmetry);
      return Math.abs(ny) < height;
    }

    function drawGlyph(char, x, y, color, alpha, size = 11, glow = 0) {
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = glow;
      ctx.font = `${size}px "Courier New", monospace`;
      ctx.fillText(char, x, y);
    }

    function drawEye(eye, cx, cy, halfW, halfH, pulse, now) {
      const left = Math.floor((cx - halfW) / cellW);
      const right = Math.ceil((cx + halfW) / cellW);
      const top = Math.floor((cy - halfH) / cellH);
      const bottom = Math.ceil((cy + halfH) / cellH);
      const correct = state.mode === CORRECT_REACTION;
      const wrong = state.mode === WRONG_REACTION;
      const reaction = state.elapsed;
      const nod = correct ? Math.sin(Math.min(1, reaction / 0.52) * Math.PI) : 0;
      const pupilX = state.gazeX * 0.14 + (wrong ? Math.sin(reaction * 46 + eye) * 0.16 : 0);
      const pupilY = state.gazeY * 0.12 + nod * 0.24 + (wrong ? Math.cos(reaction * 31) * 0.14 : 0);
      const glitching = now < state.glitchUntil;
      const tick = Math.floor(now * (wrong ? 20 : 5));
      const scatter = state.mode === ENTERING && quiz ? (1 - state.formed) * 0.62 : 1 - state.fade;

      for (let gy = top; gy <= bottom; gy++) {
        for (let gx = left; gx <= right; gx++) {
          const px = gx * cellW + cellW / 2;
          const py = gy * cellH + cellH / 2;
          const nx = (px - cx) / halfW;
          const tilt = wrong ? nx * (eye === 0 ? -0.18 : 0.12) : 0;
          const ny = (py - cy) / (halfH * (1 - nod * 0.15)) + tilt;
          if (Math.abs(nx) > 1 || !eyeShape(nx, ny, eye)) continue;

          const seed = hash(gx, gy, eye);
          const edge = Math.abs(ny) / (0.78 - Math.pow(Math.abs(nx), 1.25) * 0.63);
          const irisX = nx - pupilX;
          const irisY = ny - pupilY;
          const radius = Math.hypot(irisX * 1.55, irisY * 1.05);
          const isPupil = radius < 0.19;
          const isIris = radius >= 0.19 && radius < 0.46;
          const isContour = edge > 0.81 || Math.abs(nx) > 0.84;
          const density = isPupil ? 0.9 : isIris ? 0.83 : isContour ? 0.94 : 0.52 + seed * 0.37;
          if (seed > density) continue;

          const reveal = hash(gx + 19, gy - 11, eye + 3);
          if (reveal > state.formed) continue;

          const flicker = quiz && seed > 0.81 ? hash(gx, gy, tick) : 0;
          const char = glyphs[Math.floor(hash(gx - 4, gy + 7, eye + 8 + (flicker > 0.55 ? tick : 0)) * glyphs.length)];
          let color = seed > 0.82 ? '#ffb2bb' : (isContour ? '#ff3049' : '#ca102c');
          let glow = isContour ? 7 : 2;
          let size = seed > 0.9 ? 12 : 10;
          if (isIris) { color = seed > 0.5 ? '#35e6db' : '#10a9d2'; glow = 9; }
          if (isPupil) { color = seed > 0.38 ? '#b9fff0' : '#46ff9c'; glow = 11; size = 12; }
          if (correct && isIris) color = '#50ffae';
          if (wrong && isIris && seed > 0.35) color = '#ff354e';

          const rowGlitch = glitching && hash(gx, gy, eye + 21) > (wrong ? 0.66 : 0.86);
          const drift = scatter * (4 + seed * 28);
          const jump = wrong ? 20 : 11;
          const dx = (rowGlitch ? (seed > 0.5 ? jump : -jump) : 0) + (eye === 0 ? -drift : drift);
          const dy = scatter * (seed - 0.5) * 24 + (rowGlitch ? (seed > 0.5 ? 2 : -2) : 0);
          const alpha = pulse * state.fade * (0.62 + seed * 0.38) * (1 - flicker * 0.24);
          drawGlyph(char, px + dx, py + dy, color, alpha, size, glow * pulse * state.fade);

          if (isContour && seed > 0.72 && state.fade > 0.5) {
            drawGlyph(seed > 0.5 ? '|' : '/', px + dx, py + dy + cellH, '#ff263f', alpha * 0.48, 8, 3);
          }
        }
      }

      drawCircuit(eye, cx, cy, halfW, halfH, pulse, now);
    }

    function drawCircuit(eye, cx, cy, halfW, halfH, pulse, now) {
      const side = eye === 0 ? -1 : 1;
      const startX = cx + side * halfW * 0.82;
      const endX = cx + side * halfW * 1.22;
      const startY = cy + 2;
      const rows = [startY, startY + 20, startY - 19];
      const paths = [
        [[startX, startY], [endX, startY], [endX, startY - 20]],
        [[startX, startY + 8], [startX + side * 18, startY + 8], [startX + side * 18, startY + 25], [endX - side * 2, startY + 25]],
        [[startX + side * 4, startY - 8], [startX + side * 15, startY - 8], [startX + side * 15, startY - 23], [endX, startY - 23]]
      ];

      paths.forEach((path, pathIndex) => {
        for (let segment = 0; segment < path.length - 1; segment++) {
          const [ax, ay] = path[segment];
          const [bx, by] = path[segment + 1];
          const length = Math.max(Math.abs(bx - ax), Math.abs(by - ay));
          const steps = Math.max(1, Math.floor(length / 11));
          for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = ax + (bx - ax) * t;
            const y = ay + (by - ay) * t;
            const seed = hash(i, pathIndex, eye + segment);
            if (seed > state.formed || seed < 0.12) continue;
            const char = Math.abs(bx - ax) > Math.abs(by - ay)
              ? (i % 3 === 0 ? '-' : (i % 3 === 1 ? '=' : '+'))
              : (i % 2 ? '|' : ':');
            const glitch = now < state.glitchUntil && seed > 0.82 ? (seed > 0.9 ? 7 : -7) : 0;
            drawGlyph(char, x + glitch, y, pathIndex === 0 ? '#ff4155' : '#9d1830', pulse * state.fade * 0.66, 9, 4);
          }
        }
      });

      rows.forEach((y, index) => {
        if (hash(index, eye, 43) < state.formed) {
          drawGlyph(index === 0 ? '[]' : '0x', endX - (side < 0 ? 12 : 0), y, '#ff5866', pulse * state.fade * 0.82, 10, 5);
        }
      });
    }

    function frame(timestamp) {
      state.raf = null;
      const now = timestamp / 1000;
      const dt = Math.min(0.05, state.last === null ? 0 : now - state.last);
      state.last = now;
      state.elapsed += dt;
      state.formed = Math.min(1, state.formed + dt * (quiz ? 1.45 : 0.72));
      if (state.mode === ENTERING && state.formed === 1) transition(OBSERVING);
      if ((state.mode === CORRECT_REACTION && state.elapsed >= 0.9) ||
          (state.mode === WRONG_REACTION && state.elapsed >= 1.05)) transition(DISAPPEARING);
      if (state.mode === DISAPPEARING) {
        state.fade = Math.max(0, 1 - state.elapsed * (quiz ? 1.5 : 0.62));
        if (state.fade === 0) {
          hide();
          return;
        }
      }
      const targetX = Math.max(-1, Math.min(1, (state.mouseX - state.width / 2) / (state.width / 2)));
      const targetY = Math.max(-1, Math.min(1, (state.mouseY - state.height / 2) / (state.height / 2)));
      state.gazeX += (targetX - state.gazeX) * Math.min(1, dt * 5);
      state.gazeY += (targetY - state.gazeY) * Math.min(1, dt * 5);

      if (now > state.nextGlitch) {
        const frequent = state.mode === WRONG_REACTION || (quiz && state.mode === ENTERING);
        state.glitchUntil = now + 0.07 + hash(now, 1, 4) * 0.11;
        state.nextGlitch = now + (frequent ? 0.14 : 1.8) + hash(now, 2, 7) * (frequent ? 0.16 : 3.4);
      }
      if (state.mode === WRONG_REACTION && state.elapsed < 0.13) {
        state.glitchUntil = now + 0.08;
        state.nextGlitch = now + 0.17;
      }

      ctx.clearRect(0, 0, state.width, state.height);
      const reactionPulse = state.mode === CORRECT_REACTION ? 0.28 * Math.sin(Math.PI * state.elapsed / 0.9) : 0;
      const pulse = 0.84 + Math.sin(now * 2.1) * 0.12 + reactionPulse;
      const scale = Math.min(state.width / 580, state.height / 300, 1.12);
      const halfW = 116 * scale;
      const halfH = 91 * scale;
      const separation = 143 * scale;
      const centerY = state.height * 0.49;
      drawEye(0, state.width / 2 - separation, centerY, halfW, halfH, pulse, now);
      drawEye(1, state.width / 2 + separation, centerY, halfW, halfH, pulse, now);
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      state.raf = requestAnimationFrame(frame);
    }

    function trackPointer(event) {
      if (state.mode === HIDDEN) return;
      const rect = canvas.getBoundingClientRect();
      state.mouseX = event.clientX - rect.left;
      state.mouseY = event.clientY - rect.top;
    }

    function disappear() {
      if (state.mode !== HIDDEN && state.mode !== DISAPPEARING) transition(DISAPPEARING);
    }

    new ResizeObserver(resize).observe(canvas);
    window.addEventListener('pointermove', trackPointer, { passive: true });
    transition(HIDDEN);
    return { show, react, hide, disappear };
  }

  const intro = document.querySelector('#intro');
  const introEyes = createEyes(document.querySelector('#ai-eyes'));
  window.SanityQuizEyes = createEyes(document.querySelector('#quiz-ai-eyes'), true);
  document.querySelector('#start')?.addEventListener('click', introEyes.disappear);
  document.querySelector('#game')?.addEventListener('mousedown', () => {
    if (!intro.classList.contains('hidden')) introEyes.disappear();
  });
  introEyes.show();
})();
