// צלילים מסונתזים (Web Audio) + רטט. בלי קבצי אודיו.
(function () {
  let ctx = null, enabled = true;
  try { enabled = localStorage.getItem('lera-sfx') !== '0'; } catch (e) {}

  function ac() {
    if (!ctx) {
      const A = window.AudioContext || window.webkitAudioContext;
      if (!A) return null;
      ctx = new A();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  const now = () => (ctx ? ctx.currentTime : 0);

  function tone(freq, type, dur, vol, t0, slideTo) {
    const c = ac(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(c.destination);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }

  function noise(dur, vol, fFrom, fTo, t0) {
    const c = ac(); if (!c) return;
    const n = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, n, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const s = c.createBufferSource(); s.buffer = buf;
    const f = c.createBiquadFilter(); f.type = 'lowpass';
    f.frequency.setValueAtTime(fFrom, t0);
    f.frequency.exponentialRampToValueAtTime(fTo, t0 + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(f).connect(g).connect(c.destination);
    s.start(t0);
  }

  const vib = (p) => { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {} };

  const SFX = {
    get enabled() { return enabled; },
    pop() { if (!enabled) return; ac(); const t = now(); tone(600, 'sine', 0.08, 0.25, t, 200); noise(0.06, 0.2, 3000, 400, t); vib(15); },
    bark() { if (!enabled) return; ac(); const t = now(); tone(220, 'sawtooth', 0.09, 0.2, t, 140); tone(260, 'sawtooth', 0.1, 0.2, t + 0.12, 150); vib([20, 40, 20]); },
    pour() { if (!enabled) return; ac(); const t = now(); noise(0.35, 0.15, 400, 2500, t); tone(500, 'sine', 0.3, 0.05, t, 900); vib(10); },
    whoosh() { if (!enabled) return; ac(); const t = now(); noise(0.4, 0.25, 4000, 200, t); vib(25); },
    win() { if (!enabled) return; ac(); const t = now(); [523, 659, 784, 1047].forEach((f, i) => tone(f, 'triangle', 0.25, 0.2, t + i * 0.12)); vib([30, 30, 30, 30, 80]); },
    toggle() {
      enabled = !enabled;
      try { localStorage.setItem('lera-sfx', enabled ? '1' : '0'); } catch (e) {}
      if (enabled) SFX.pop();
      return enabled;
    }
  };
  window.SFX = SFX;
})();
