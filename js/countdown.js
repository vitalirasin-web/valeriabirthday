// ספירה לאחור חיה עד לאירוע
(function () {
  const $ = (id) => document.getElementById(id);
  let T = null, timer = null, target = 0;
  const pad = (n) => String(n).padStart(2, '0');

  function set(k, v) {
    const c = $('cd-' + k);
    if (c.textContent === String(v)) return;
    c.textContent = v;
    c.classList.remove('tick'); void c.offsetWidth; c.classList.add('tick');
  }

  function render() {
    const el = $('countdown');
    const diff = target - Date.now();
    if (diff <= 0) {
      el.classList.add('done');
      const sameDay = -diff < 86400000;
      $('cd-msg').textContent = sameDay ? T.countdown.today : T.countdown.past;
      if (sameDay && !el.dataset.celebrated) {
        el.dataset.celebrated = '1';
        confetti({ particleCount: 160, spread: 100, origin: { y: .4 }, colors: ['#d20f17', '#f8bd15', '#fdf8df', '#75401c'] });
      }
      return;
    }
    el.classList.remove('done');
    set('d', Math.floor(diff / 86400000));
    set('h', pad(Math.floor(diff / 3600000) % 24));
    set('m', pad(Math.floor(diff / 60000) % 60));
    set('s', pad(Math.floor(diff / 1000) % 60));
  }

  window.initCountdown = function (t, iso) {
    T = t; target = new Date(iso).getTime();
    $('cd-title').textContent = t.countdown.title;
    [['d', 'days'], ['h', 'hours'], ['m', 'minutes'], ['s', 'seconds']].forEach(([k, l]) => { $('cdl-' + k).textContent = t.countdown[l]; });
    render();
    if (!timer) timer = setInterval(render, 1000);
  };
})();
