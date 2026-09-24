// Brick Game marketing site behaviour. No framework: the page is static HTML on GitHub Pages.
(() => {
  'use strict';

  // Store links go live here once the listings are public; null keeps "Coming soon".
  const STORES = { appStore: null, googlePlay: null };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  // ---------------------------------------------------------------- i18n
  const VI = {
    skip: 'Bỏ qua tới nội dung',
    navGames: 'Trò chơi', navColour: 'Màn màu', navYours: 'Tuỳ biến', navPlay: 'Chơi thử',
    ctaPlay: 'Chơi ngay', ctaGames: 'Xem các trò',
    heroEyebrow: '8 trò trong 1',
    heroTitle: 'Tuổi thơ<br><em>trong túi bạn.</em>',
    heroLede: 'Tám trò LCD kinh điển trong một chiếc máy bạn tự sơn, dán sticker và chia sẻ. Sắp có trên iPhone và Android.',
    gamesTitle: 'Tám trò. Một bộ nút.',
    gamesLede: 'Đủ các trò của chiếc máy ngày xưa, mỗi trò có bảng top 10 riêng.',
    gA: 'Xếp gạch', gAd: 'Xoay và xếp khối cho kín hàng.',
    gB: 'Bắn xe tăng', gBd: 'Ba mạng. Bắn hạ đoàn xe địch.',
    gC: 'Rắn săn mồi', gCd: 'Ăn mồi, né tường, đừng cắn phải đuôi.',
    gD: 'Đua xe', gDd: 'Luồn lách giữa dòng xe. Giữ ▲ để tăng tốc.',
    gE: 'Phá gạch', gEd: 'Đỡ bóng bằng vợt và phá sạch bức tường.',
    gF: 'Bắn gạch', gFd: 'Bắn thủng bức tường trước khi nó chạm tới bạn.',
    gG: 'Nhảy cao', gGd: 'Nhảy lên mãi. Coi chừng bệ vỡ.',
    gH: 'Qua đường', gHd: 'Băng qua các làn xe mà không bị tông.',
    colourTitle: 'Đơn sắc mặc định. Có màu khi bạn muốn.',
    colourLede: 'Bật màn hình màu và mỗi trò tự tô màu vật thể của nó. Kéo để so sánh trên cùng một bàn chơi.',
    mono: 'Đơn sắc', colourWord: 'Màu',
    yoursTitle: 'Chiếc máy của riêng bạn.',
    shellsTitle: 'Năm màu vỏ cổ điển, hoặc bất kỳ màu nào.',
    shellsLede: 'Đổi cả màu nút bấm, màu mực in và màu kính LCD.',
    partsTitle: 'Thay linh kiện.',
    partsLede: 'D-pad tròn hay chữ thập, gân cầm tay, linh vật và mã máy in trên vỏ.',
    shareTitle: 'Lưu lại. Chia sẻ mã.',
    shareLede: 'Lưu thành bộ, gửi mã để bạn bè dựng lại y hệt chiếc máy của bạn.',
    stickerTitle: 'Ảnh của bạn trên vỏ máy.',
    stickerLede: 'Kéo, phóng và xoay sticker của riêng bạn. Ảnh không bao giờ rời khỏi điện thoại.',
    boardEyebrow: 'Top 10',
    boardTitle: 'Ba chữ cái trên bảng vàng.',
    boardLede: 'Phá kỷ lục và gõ tên ngay trên màn LCD, đúng kiểu máy thùng. Không tài khoản, không đăng nhập.',
    playTitle: 'Chơi ngay tại đây.',
    playLede: 'Đây là game thật, đúng bản trong app. Bật máy lên.',
    keyMove: 'Di chuyển', keyRotate: 'Xoay hoặc bắn', keyDrop: 'Thả rơi', keyStart: 'Bắt đầu hoặc tạm dừng', keyReset: 'Về menu chọn trò',
    touchNote: 'Trên điện thoại, bấm các nút trên máy.',
    powerOn: 'Bật máy',
    f1: 'Chơi không cần mạng', f2: 'Mười một ngôn ngữ', f3: 'Rung khi bấm', f4: 'Giới hạn khung hình cho máy yếu', f5: 'Chia sẻ điểm', f6: 'Quảng cáo không cá nhân hoá',
    finaleTitle: 'Bật máy.<br><em>Chọn một trò.</em>',
    soon: 'Sắp ra mắt',
    support: 'Hỗ trợ', privacy: 'Quyền riêng tư',
  };
  const EN = {};
  document.querySelectorAll('[data-i18n]').forEach((el) => { EN[el.dataset.i18n] = el.textContent; });
  document.querySelectorAll('[data-i18n-html]').forEach((el) => { EN[el.dataset.i18nHtml] = el.innerHTML; });

  function readLang() {
    try { const saved = localStorage.getItem('bg-site-lang'); if (saved === 'en' || saved === 'vi') return saved; } catch (_) { /* storage blocked */ }
    return (navigator.language || '').toLowerCase().startsWith('vi') ? 'vi' : 'en';
  }
  function applyLang(lang) {
    const dict = lang === 'vi' ? VI : EN;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach((el) => { const v = dict[el.dataset.i18n]; if (v !== undefined) el.textContent = v; });
    document.querySelectorAll('[data-i18n-html]').forEach((el) => { const v = dict[el.dataset.i18nHtml]; if (v !== undefined) el.innerHTML = v; });
    document.title = lang === 'vi' ? 'Brick Game - Máy chơi game tuổi thơ | Tám trò LCD kinh điển' : 'Brick Game - Retro Handheld | Eight LCD classics in one';
  }
  let lang = readLang();
  applyLang(lang);
  document.getElementById('lang').addEventListener('click', () => {
    lang = lang === 'en' ? 'vi' : 'en';
    applyLang(lang);
    try { localStorage.setItem('bg-site-lang', lang); } catch (_) { /* storage blocked */ }
  });

  // ---------------------------------------------------------------- store buttons
  document.querySelectorAll('[data-store]').forEach((a) => {
    const url = STORES[a.dataset.store];
    if (!url) return;
    a.href = url; a.removeAttribute('aria-disabled'); a.target = '_blank'; a.rel = 'noopener';
    a.querySelector('.store-kicker').remove();
  });

  // ---------------------------------------------------------------- scroll reveal
  // Staggers siblings that enter together, so a grid assembles instead of popping in at once.
  const reveals = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.filter((e) => e.isIntersecting).forEach((e, i) => {
        e.target.style.setProperty('--d', `${i * 80}ms`);
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => io.observe(el));
  }

  // ---------------------------------------------------------------- live LCD loops
  // Sprites only animate while their card is on screen.
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const lo = new IntersectionObserver((entries) => {
      entries.forEach((e) => e.target.classList.toggle('playing', e.isIntersecting));
    }, { threshold: 0.35 });
    document.querySelectorAll('.cart').forEach((c) => lo.observe(c));
  }

  // ---------------------------------------------------------------- hero tilt
  // The device follows the pointer a few degrees, like picking it up off the table.
  const tilt = document.getElementById('tilt');
  if (tilt && finePointer && !reduceMotion) {
    const hero = tilt.closest('.hero');
    let frame = 0;
    hero.addEventListener('pointermove', (e) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const r = tilt.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
        const y = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
        tilt.style.setProperty('--ry', `${(x * 18).toFixed(2)}deg`);
        tilt.style.setProperty('--rx', `${(-y * 12).toFixed(2)}deg`);
      });
    });
    hero.addEventListener('pointerleave', () => {
      tilt.style.setProperty('--ry', '0deg');
      tilt.style.setProperty('--rx', '0deg');
    });
  }

  // ---------------------------------------------------------------- colour compare
  const compare = document.getElementById('compare');
  const handle = document.getElementById('compareHandle');
  if (compare && handle) {
    const set = (pct) => {
      const v = Math.max(0, Math.min(100, pct));
      compare.style.setProperty('--pos', `${v}%`);
      handle.setAttribute('aria-valuenow', String(Math.round(v)));
    };
    const fromEvent = (e) => {
      const r = compare.getBoundingClientRect();
      set(((e.clientX - r.left) / r.width) * 100);
    };
    let dragging = false;
    compare.addEventListener('pointerdown', (e) => { dragging = true; compare.setPointerCapture(e.pointerId); fromEvent(e); });
    compare.addEventListener('pointermove', (e) => { if (dragging) fromEvent(e); });
    compare.addEventListener('pointerup', () => { dragging = false; });
    compare.addEventListener('pointercancel', () => { dragging = false; });
    handle.addEventListener('keydown', (e) => {
      const now = Number(handle.getAttribute('aria-valuenow'));
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { set(now - 5); e.preventDefault(); }
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { set(now + 5); e.preventDefault(); }
      if (e.key === 'Home') { set(0); e.preventDefault(); }
      if (e.key === 'End') { set(100); e.preventDefault(); }
    });
    // One sweep when it first comes into view, so it is obvious the divider moves.
    if (!reduceMotion && 'IntersectionObserver' in window) {
      const co = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        co.disconnect();
        const start = performance.now();
        const run = (t) => {
          if (dragging) return;
          const p = Math.min(1, (t - start) / 1800);
          set(50 + Math.sin(p * Math.PI * 2) * 28 * (1 - p));
          if (p < 1) requestAnimationFrame(run);
        };
        setTimeout(() => requestAnimationFrame(run), 500);
      }, { threshold: 0.6 });
      co.observe(compare);
    }
  }

  // ---------------------------------------------------------------- shell swatches
  const shellImg = document.getElementById('shellImg');
  const shellCell = document.querySelector('.cell-shells');
  const swatches = document.querySelectorAll('.swatches button');
  // Warm the other shells so a click swaps without a blank frame.
  const warm = () => swatches.forEach((b) => { new Image().src = `img/shell-${b.dataset.shell}.webp`; });
  if ('requestIdleCallback' in window) requestIdleCallback(warm); else setTimeout(warm, 1500);
  swatches.forEach((btn) => {
    btn.addEventListener('click', () => {
      swatches.forEach((b) => b.setAttribute('aria-checked', String(b === btn)));
      shellCell.style.setProperty('--shell', btn.style.getPropertyValue('--c'));
      const next = `img/shell-${btn.dataset.shell}.webp`;
      if (reduceMotion) { shellImg.src = next; return; }
      shellImg.classList.add('swap');
      setTimeout(() => {
        shellImg.src = next;
        shellImg.decode().catch(() => {}).then(() => shellImg.classList.remove('swap'));
      }, 220);
    });
  });

  // ---------------------------------------------------------------- top 10 name entry
  // Letters roll A..target on the first row, like entering initials on the machine.
  const typing = document.getElementById('typing');
  const panel = document.getElementById('boardPanel');
  if (typing && panel) {
    const rows = [...document.querySelectorAll('.board-list li:not(.entry-new)')];
    const target = 'NAM';
    if (reduceMotion || !('IntersectionObserver' in window)) {
      typing.textContent = target;
    } else {
      rows.forEach((r) => r.classList.add('dim'));
      const bo = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        bo.disconnect();
        const entry = typing.closest('li');
        entry.classList.add('typing');
        let slot = 0; let letter = 0; let shown = '';
        const tick = () => {
          const goal = target.charCodeAt(slot) - 65;
          const current = String.fromCharCode(65 + letter);
          typing.textContent = (shown + current).padEnd(3, '_');
          if (letter < goal) { letter += Math.max(1, Math.floor((goal - letter) / 3)); setTimeout(tick, 55); return; }
          shown += target[slot]; slot += 1; letter = 0;
          if (slot < target.length) { setTimeout(tick, 260); return; }
          typing.textContent = target;
          entry.classList.remove('typing');
          rows.forEach((r, i) => setTimeout(() => r.classList.remove('dim'), 140 * (i + 1)));
        };
        setTimeout(tick, 400);
      }, { threshold: 0.5 });
      bo.observe(panel);
    }
  }

  // ---------------------------------------------------------------- playable demo
  // The iframe loads only on request: it carries the whole game and its sounds.
  const powerOn = document.getElementById('powerOn');
  const frame = document.getElementById('playFrame');
  if (powerOn && frame) {
    powerOn.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = 'play/index.html';
      iframe.title = lang === 'vi' ? 'Brick Game, bản chơi thử' : 'Brick Game, playable demo';
      iframe.allow = 'autoplay';
      iframe.addEventListener('load', () => { try { iframe.contentWindow.focus(); } catch (_) { /* cross-origin */ } });
      frame.replaceChildren(iframe);
      iframe.focus();
    });
  }
})();
