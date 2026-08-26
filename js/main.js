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
  let saved = null;
  try { saved = localStorage.getItem('lera-lang'); } catch (e) {}
  if (saved && C[saved]) {
    setLang(saved);
    $('gate').classList.add('hidden');
  } else {
    // ברירת מחדל בזמן שהשער מוצג
    setLang('he');
    try { localStorage.removeItem('lera-lang'); } catch (e) {}
  }
  try { if (localStorage.getItem('lera-unlocked') === '1') unlockVenue(false); } catch (e) {}
})();
