// ארבעה מיני-משחקים. נקרא מחדש בכל החלפת שפה.
(function () {
  const $ = (id) => document.getElementById(id);
  const PALETTE = ['#d20f17', '#f8bd15', '#fdf8df', '#75401c'];
  const burst = (x, y, n) => confetti({ particleCount: n || 40, spread: 70, startVelocity: 25, origin: { x, y }, colors: PALETTE });
  const originOf = (el) => {
    const r = el.getBoundingClientRect();
    return { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height / 2) / innerHeight };
  };
  let G = null, done = new Set(), timers = [];

  function finish(key, el) {
    if (done.has(key)) return;
    done.add(key);
    el.classList.add('done');
    if (window.SFX) SFX.win();
    const o = originOf(el);
    burst(o.x, o.y, 90);
    $('games-count').textContent = G.count(done.size, 4);
    if (done.size === 4) setTimeout(() => confetti({ particleCount: 220, spread: 120, origin: { y: .5 }, colors: PALETTE }), 300);
  }

  window.initGames = function (g, dir) {
    G = g;
    timers.forEach(clearTimeout); timers = [];
    $('games-title').textContent = g.title;
    $('games-lead').textContent = g.lead;
    $('games-count').textContent = g.count(done.size, 4);
    coffee(g.coffee); stickers(g.stickers); dog(g.dog); balloons(g.balloons);
  };

  // ---------- 1. Coffee: tap fast ----------
  function coffee(c) {
    const btn = $('coffee-btn'), fill = $('cup-fill'), face = $('cup-face'), stage = $('g-coffee');
    let n = 0;
    if (done.has('coffee')) { btn.textContent = c.done; btn.disabled = true; return; }
    btn.textContent = c.btn; btn.disabled = false;
    fill.style.height = '0%'; face.textContent = '😴'; stage.classList.remove('brewing');
    btn.onclick = () => {
      n++;
      if (window.SFX) SFX.pour();
      fill.style.height = Math.min(100, n / c.clicks * 100) + '%';
      stage.classList.add('brewing');
      $('cup').classList.remove('wobble'); void $('cup').offsetWidth; $('cup').classList.add('wobble');
      face.textContent = n < c.clicks / 2 ? '😪' : n < c.clicks ? '🙂' : '😍';
      if (n >= c.clicks) {
        btn.textContent = c.done; btn.disabled = true;
        finish('coffee', stage);
      }
    };
  }

  // ---------- 2. Stickers: peel them off ----------
  function stickers(st) {
    const mirror = $('mirror');
    mirror.querySelectorAll('.sticker').forEach(e => e.remove());
    if (done.has('stickers')) { $('mirror-label').textContent = st.done; return; }
    $('mirror-label').textContent = st.label;
    const icons = ['🎀', '⭐', '🦄', '🌈', '🍭', '💖', '🐸'];
    const spots = [[8, 10], [70, 8], [40, 30], [15, 62], [78, 55], [50, 72], [30, 45]];
    let left = icons.length;
    icons.forEach((ic, i) => {
      const s = document.createElement('button');
      s.className = 'sticker'; s.textContent = ic; s.setAttribute('aria-label', 'sticker');
      s.style.left = spots[i][0] + '%'; s.style.top = spots[i][1] + '%';
      s.style.setProperty('--rot', (Math.random() * 40 - 20) + 'deg');
      s.onclick = () => {
        if (s.classList.contains('peeled')) return;
        s.classList.add('peeled');
        if (window.SFX) SFX.pop();
        const o = originOf(s); burst(o.x, o.y, 14);
        if (--left === 0) { $('mirror-label').textContent = st.done; finish('stickers', $('g-stickers')); }
      };
      mirror.appendChild(s);
    });
  }

  // ---------- 3. Catch Angel ----------
  function dog(d) {
    const yard = $('yard'), pup = $('dog'), bark = $('bark'), status = $('dog-status');
    let caught = 0, speed = 900, hop;
    const N = 3;
    if (done.has('dog')) { status.textContent = d.done; return; }
    status.textContent = d.caught(0, N);
    pup.textContent = '🐕'; pup.disabled = false; pup.classList.remove('sleep');
    const move = () => {
      pup.style.left = (5 + Math.random() * 75) + '%';
      pup.style.top = (5 + Math.random() * 60) + '%';
      pup.style.transform = `scaleX(${Math.random() > .5 ? 1 : -1})`;
    };
    const loop = () => { move(); hop = setTimeout(loop, speed); timers.push(hop); };
    clearTimeout(hop); loop();
    pup.onclick = () => {
      if (pup.disabled) return;
      caught++; speed = Math.max(350, speed - 220);
      if (window.SFX) SFX.bark();
      bark.textContent = d.barks[(caught - 1) % d.barks.length];
      bark.style.left = pup.style.left; bark.style.top = pup.style.top;
      bark.classList.remove('show'); void bark.offsetWidth; bark.classList.add('show');
      const o = originOf(pup); burst(o.x, o.y, 20);
      status.textContent = d.caught(caught, N);
      if (caught >= N) {
        clearTimeout(hop); pup.disabled = true; pup.textContent = '🐕'; pup.classList.add('sleep');
        pup.style.left = '40%'; pup.style.top = '35%'; pup.style.transform = 'none';
        status.textContent = d.done;
        finish('dog', $('g-dog'));
      }
    };
  }

  // ---------- 4. Chore balloons ----------
  function balloons(b) {
    const sky = $('sky'), status = $('balloons-status');
    sky.innerHTML = '';
    if (done.has('balloons')) { status.textContent = b.done; return; }
    let left = b.items.length;
    status.textContent = b.left(left);
    const colors = ['#d20f17', '#f8bd15', '#cfe3dd', '#f0bcae', '#8f7f4f', '#5a2628'];
    b.items.forEach((it, i) => {
      const bl = document.createElement('button');
      bl.className = 'balloon'; bl.setAttribute('aria-label', 'balloon');
      bl.style.setProperty('--c', colors[i % colors.length]);
      bl.style.left = (6 + i * 15) + '%';
      bl.style.animationDelay = (i * .5) + 's';
      bl.style.animationDuration = (5 + Math.random() * 3) + 's';
      bl.innerHTML = `<span class="chore">${it}</span>`;
      bl.onclick = () => {
        if (bl.classList.contains('pop')) return;
        bl.classList.add('pop');
        if (window.SFX) SFX.pop();
        const o = originOf(bl); burst(o.x, o.y, 18);
        left--; status.textContent = left ? b.left(left) : b.done;
        if (!left) finish('balloons', $('g-balloons'));
      };
      sky.appendChild(bl);
    });
  }
})();
