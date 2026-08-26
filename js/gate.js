// מסך כניסה: עוגה עם נרות – מכבים בלחיצה או בנשיפה למיקרופון, ואז בוחרים שפה
(function () {
  const $ = (id) => document.getElementById(id);
  const COLORS = ['#d20f17', '#f8bd15', '#cfe3dd', '#5a2628', '#f0bcae'];
  let left = 0, stream = null, raf = null;

  function blow(c) {
    if (c.classList.contains('out')) return;
    c.classList.add('out');
    if (window.SFX) SFX.whoosh();
    const r = c.getBoundingClientRect();
    confetti({ particleCount: 12, spread: 50, startVelocity: 18, origin: { x: (r.left + r.width / 2) / innerWidth, y: r.top / innerHeight }, colors: ['#f8bd15', '#fdf8df', '#d20f17'] });
    if (--left === 0) allOut();
  }

  function allOut() {
    stopMic();
    $('gate-hint').textContent = 'יאללה, נכנסים! 🎉 · Заходим!';
    $('mic-btn').hidden = true;
    $('gate-options').hidden = false;
    $('gate-options').classList.add('show');
    if (window.SFX) SFX.win();
    confetti({ particleCount: 140, spread: 110, origin: { y: .45 }, colors: ['#d20f17', '#f8bd15', '#fdf8df', '#75401c'] });
  }

  function stopMic() {
    if (raf) cancelAnimationFrame(raf); raf = null;
    if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
  }

  async function startMic() {
    const btn = $('mic-btn');
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) { btn.hidden = true; return; }
    btn.classList.add('listening');
    const A = window.AudioContext || window.webkitAudioContext;
    const ctx = new A();
    const src = ctx.createMediaStreamSource(stream);
    const an = ctx.createAnalyser(); an.fftSize = 1024;
    src.connect(an);
    const data = new Uint8Array(an.fftSize);
    let hot = 0;
    const tick = () => {
      an.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) { const v = (data[i] - 128) / 128; sum += v * v; }
      const rms = Math.sqrt(sum / data.length);
      hot = rms > 0.12 ? hot + 1 : Math.max(0, hot - 1);
      if (hot > 6) {
        const candles = [...document.querySelectorAll('.candle:not(.out)')];
        candles.forEach((c, i) => setTimeout(() => blow(c), i * 120));
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
  }

  window.initGate = function () {
    const box = $('candles');
    box.innerHTML = '';
    left = COLORS.length;
    COLORS.forEach(col => {
      const c = document.createElement('button');
      c.className = 'candle'; c.type = 'button'; c.setAttribute('aria-label', 'candle');
      c.style.setProperty('--c', col);
      c.innerHTML = '<span class="flame"></span><span class="smoke"></span>';
      c.addEventListener('click', () => blow(c));
      box.appendChild(c);
    });
    const mic = $('mic-btn');
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      mic.hidden = false;
      mic.addEventListener('click', startMic, { once: true });
    }
  };
})();
