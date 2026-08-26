// גלריית זיכרונות: קרוסלה + lightbox
(function () {
  const $ = (id) => document.getElementById(id);
  let items = [], lang = 'he', cur = 0, wired = false;

  function cap(it) { return it[lang] || it.he || ''; }

  function openLb(i) {
    cur = i;
    $('lb-img').src = items[i].src;
    $('lb-cap').textContent = cap(items[i]);
    $('lightbox').hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeLb() { $('lightbox').hidden = true; document.body.style.overflow = ''; }
  function step(d) { openLb((cur + d + items.length) % items.length); }

  function scrollToIdx(i) {
    const track = $('gal-track');
    const fig = track.children[i]; if (!fig) return;
    track.scrollTo({ left: fig.offsetLeft - (track.clientWidth - fig.clientWidth) / 2, behavior: 'smooth' });
  }

  function updateDots() {
    const track = $('gal-track');
    const mid = track.scrollLeft + track.clientWidth / 2;
    let best = 0, bd = Infinity;
    [...track.children].forEach((f, i) => { const d = Math.abs(f.offsetLeft + f.clientWidth / 2 - mid); if (d < bd) { bd = d; best = i; } });
    [...$('gal-dots').children].forEach((d, i) => d.classList.toggle('on', i === best));
  }

  function wire() {
    if (wired) return; wired = true;
    const track = $('gal-track');
    const dir = () => (document.documentElement.dir === 'rtl' ? -1 : 1);
    $('gal-prev').addEventListener('click', () => track.scrollBy({ left: -track.clientWidth * 0.8 * dir(), behavior: 'smooth' }));
    $('gal-next').addEventListener('click', () => track.scrollBy({ left: track.clientWidth * 0.8 * dir(), behavior: 'smooth' }));
    track.addEventListener('scroll', () => requestAnimationFrame(updateDots), { passive: true });
    $('lb-close').addEventListener('click', closeLb);
    $('lightbox').addEventListener('click', (e) => { if (e.target === $('lightbox')) closeLb(); });
    document.addEventListener('keydown', (e) => {
      if ($('lightbox').hidden) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    });
    let x0 = null;
    $('lightbox').addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    $('lightbox').addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
    });
  }

  window.initGallery = function (list, code, t) {
    items = list || []; lang = code;
    const sec = $('memories');
    if (!items.length) { sec.hidden = true; return; }
    sec.hidden = false;
    $('gal-title').textContent = t.galleryTitle;
    $('gal-lead').textContent = t.galleryLead;
    $('gal-track').innerHTML = items.map((it, i) => `
      <figure class="gal-item" data-i="${i}">
        <img src="${it.src}" alt="" loading="lazy">
        <figcaption>${cap(it)}</figcaption>
      </figure>`).join('');
    $('gal-dots').innerHTML = items.map((_, i) => `<button class="dot${i === 0 ? ' on' : ''}" data-i="${i}" aria-label="${i + 1}"></button>`).join('');
    $('gal-track').querySelectorAll('.gal-item').forEach(f => f.addEventListener('click', () => openLb(+f.dataset.i)));
    $('gal-dots').querySelectorAll('.dot').forEach(d => d.addEventListener('click', () => scrollToIdx(+d.dataset.i)));
    wire();
  };
})();
