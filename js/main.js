(function () {
  const C = window.PARTY_CONFIG;
  const $ = (id) => document.getElementById(id);
  let lang = null, T = null;
  let i = 0, score = 0;

  // ---------- שפה ----------
  function setLang(code) {
    lang = code; T = C[code];
    document.documentElement.lang = code;
    document.documentElement.dir = T.dir;
    try { localStorage.setItem('lera-lang', code); } catch (e) {}
    renderAll();
  }

  function renderAll() {
    document.title = T.title;
    $('nav-about').textContent = T.nav.about;
    $('nav-games').textContent = T.nav.games;
    $('nav-quiz').textContent = T.nav.quiz;
    $('nav-venue').textContent = T.nav.venue;
    $('lang-switch').textContent = T.langSwitch;

    $('hero-kicker').textContent = T.heroKicker;
    $('hero-title').textContent = T.title;
    $('hero-l1').textContent = T.heroLine1;
    $('hero-l2').textContent = T.heroLine2;
    $('hero-l3').textContent = T.heroLine3;
    $('hero-cta').textContent = T.heroCta;
    window.initCountdown(T, C.venue.datetime);
    window.initGallery(C.gallery, lang, T);
    $('sfx-btn').textContent = (window.SFX && SFX.enabled) ? T.sfxOn : T.sfxOff;

    $('about-title').textContent = T.aboutTitle;
    $('about-lead').textContent = T.aboutLead;
    $('facts').innerHTML = T.facts.map(f => `
      <div class="fact">
        <div class="icon">${f.icon}</div>
        <h3>${f.title}</h3>
        <p>${f.text}</p>
      </div>`).join('');
    observeFacts();

    window.initGames(T.games, T.dir);

    $('quiz-title').textContent = T.quizTitle;
    $('quiz-lead').textContent = T.quizLead;
    $('retry-btn').textContent = T.retry;
    $('goto-venue').textContent = T.gotoVenue;

    $('venue-title').textContent = T.venueTitle;
    $('lock-text').textContent = T.lockMsg;
    $('venue-kicker').textContent = T.venueKicker;
    $('venue-name').textContent = T.venueName;
    $('venue-sub').textContent = T.venueSub;
    $('date-label').textContent = T.dateLabel;
    $('time-label').textContent = T.timeLabel;
    $('date-value').textContent = T.dateValue;
    $('time-value').textContent = C.venue.time;
    $('venue-address').textContent = T.venueAddress;
    $('venue-note').textContent = T.note;
    $('waze-link').textContent = T.waze;
    $('maps-link').textContent = T.maps;

    $('menu-link').textContent = T.menuLink;
    $('gcal-link').textContent = T.calendar.google;
    $('ics-link').textContent = T.calendar.apple;
    buildCalendar();
    $('wish-title').textContent = T.wishText.title;
    $('wish-lead').textContent = T.wishText.lead;
    $('wish-text').placeholder = T.wishText.placeholder;
    $('wish-send').textContent = T.wishText.send;
    updateWish();
    $('footer-text').textContent = T.footer;

    // quiz restart in the new language
    i = 0; score = 0;
    $('quiz-result').style.display = 'none';
    $('quiz-body').style.display = 'block';
    renderQuestion();
  }

  // ---------- שער כניסה ----------
  document.querySelectorAll('.lang-btn').forEach(b => b.addEventListener('click', () => {
    setLang(b.dataset.lang);
    $('gate').classList.add('hidden');
  }));
  $('lang-switch').addEventListener('click', () => setLang(lang === 'he' ? 'ru' : 'he'));
  $('sfx-btn').addEventListener('click', () => { const on = SFX.toggle(); $('sfx-btn').textContent = on ? T.sfxOn : T.sfxOff; });
  window.initGate();

  // ---------- יומן ----------
  const fmtUTC = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  function buildCalendar() {
    const start = new Date(C.venue.datetime);
    const end = new Date(start.getTime() + (C.venue.durationHours || 2) * 3600000);
    const title = T.calendar.event, loc = `Benedict, ${T.venueAddress}`, desc = location.href.split('#')[0];
    $('gcal-link').href = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
      + `&text=${encodeURIComponent(title)}&dates=${fmtUTC(start)}/${fmtUTC(end)}`
      + `&location=${encodeURIComponent(loc)}&details=${encodeURIComponent(desc)}`;
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Lera Birthday//HE', 'BEGIN:VEVENT',
      'UID:lera-birthday-2026@family', `DTSTAMP:${fmtUTC(new Date())}`, `DTSTART:${fmtUTC(start)}`, `DTEND:${fmtUTC(end)}`,
      `SUMMARY:${title}`, `LOCATION:${loc}`, `DESCRIPTION:${desc}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    $('ics-link').href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
  }

  // ---------- ברכה ב-WhatsApp ----------
  const EMOJIS = ['💛', '🎂', '🥂', '🍳', '🎉', '😘'];
  $('wish-emojis').innerHTML = EMOJIS.map(e => `<button type="button" class="emoji-chip">${e}</button>`).join('');
  $('wish-emojis').querySelectorAll('.emoji-chip').forEach(b => b.addEventListener('click', () => {
    const ta = $('wish-text'); ta.value += (ta.value && !ta.value.endsWith(' ') ? ' ' : '') + b.textContent; ta.focus(); updateWish();
    if (window.SFX) SFX.pop();
  }));
  try { $('wish-text').value = localStorage.getItem('lera-wish') || ''; } catch (e) {}
  $('wish-text').addEventListener('input', updateWish);
  function updateWish() {
    const txt = $('wish-text').value.trim();
    try { localStorage.setItem('lera-wish', $('wish-text').value); } catch (e) {}
    const phone = ((C.wish && C.wish.phone) || '').replace(/\D/g, '');
    const msg = `${T.wishText.prefix}\n${txt}`;
    $('wish-send').href = (phone ? `https://wa.me/${phone}` : 'https://wa.me/') + `?text=${encodeURIComponent(msg)}`;
    $('wish-send').classList.toggle('disabled', !txt);
  }

  // ---------- עובדות: הופעה בגלילה ----------
  function observeFacts() {
    const cards = document.querySelectorAll('.fact');
    if (!('IntersectionObserver' in window)) { cards.forEach(c => c.classList.add('in')); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach((en, idx) => {
        if (en.isIntersecting) {
          setTimeout(() => en.target.classList.add('in'), idx * 70);
          io.unobserve(en.target);
        }
      });
    }, { threshold: .15 });
    cards.forEach(c => io.observe(c));
  }

  // ---------- היעד ----------
  const v = C.venue;
  const enc = encodeURIComponent(v.query);
  $('maps-link').href = v.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${enc}`;
  $('waze-link').href = v.wazeUrl || `https://waze.com/ul?q=${enc}&navigate=yes`;

  function unlockVenue(celebrate) {
    const el = $('venue');
    if (el.classList.contains('unlocked')) return;
    el.classList.remove('locked');
    el.classList.add('unlocked');
    try { localStorage.setItem('lera-unlocked', '1'); } catch (e) {}
    if (celebrate) {
      if (window.SFX) SFX.win();
      confetti({ particleCount: 180, spread: 100, origin: { y: 0.6 }, colors: ['#d20f17', '#f8bd15', '#fdf8df', '#75401c'] });
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 900);
    }
  }

  // ---------- טריוויה ----------
  function renderQuestion() {
    const total = T.quiz.length;
    const q = T.quiz[i];
    $('q-index').textContent = T.qOf(i + 1, total);
    $('q-score').textContent = T.correctCount(score);
    $('bar-fill').style.width = (i / total * 100) + '%';
    $('question').textContent = q.q;
    $('options').innerHTML = q.options.map((o, idx) =>
      `<button class="option" data-idx="${idx}">${o}</button>`).join('');
    $('next-btn').style.display = 'none';
    $('reveal').style.display = 'none';
    $('options').querySelectorAll('.option').forEach(b => b.addEventListener('click', onAnswer));
  }

  function onAnswer(e) {
    const total = T.quiz.length;
    const chosen = +e.currentTarget.dataset.idx;
    const q = T.quiz[i];
    const buttons = $('options').querySelectorAll('.option');
    buttons.forEach(b => b.disabled = true);
    $('reveal').style.display = 'none';
    if (q.answer === null) {
      buttons.forEach(b => b.classList.add('wrong'));
      $('reveal').textContent = q.reveal;
      $('reveal').style.display = 'block';
    } else if (chosen === q.answer) {
      buttons[q.answer].classList.add('correct');
      score++;
      if (window.SFX) SFX.pop();
      confetti({ particleCount: 35, spread: 55, origin: { y: 0.75 }, colors: ['#d20f17', '#f8bd15', '#fdf8df'] });
    } else {
      buttons[q.answer].classList.add('correct');
      buttons[chosen].classList.add('wrong');
    }
    $('q-score').textContent = T.correctCount(score);
    $('next-btn').textContent = (i === total - 1 ? T.finish : T.next) + (T.dir === 'rtl' ? ' ←' : ' →');
    $('next-btn').style.display = 'inline-block';
  }

  $('next-btn').addEventListener('click', () => {
    i++;
    if (i < T.quiz.length) renderQuestion(); else showResult();
  });

  function showResult() {
    const total = T.quiz.length;
    $('bar-fill').style.width = '100%';
    $('quiz-body').style.display = 'none';
    $('quiz-result').style.display = 'block';
    $('score').textContent = `${score} / ${total}`;
    const passed = score >= C.passScore;
    $('result-text').textContent = passed ? T.passText : T.failText;
    $('retry-btn').style.display = passed ? 'none' : 'inline-block';
    $('goto-venue').style.display = passed ? 'inline-block' : 'none';
    if (passed) unlockVenue(true);
  }

  $('retry-btn').addEventListener('click', () => {
    i = 0; score = 0;
    $('quiz-result').style.display = 'none';
    $('quiz-body').style.display = 'block';
    renderQuestion();
  });

  // ---------- אתחול ----------
  // השער (עוגה + בחירת שפה) מוצג בכל כניסה; השפה השמורה משמשת רק כברירת מחדל לרקע
  let saved = null;
  try { saved = localStorage.getItem('lera-lang'); } catch (e) {}
  setLang(saved && C[saved] ? saved : 'he');
  try { if (localStorage.getItem('lera-unlocked') === '1') unlockVenue(false); } catch (e) {}
})();
