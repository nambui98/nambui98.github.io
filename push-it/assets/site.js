/*
 * Chuyển ngôn ngữ Việt/Anh cho trang web công khai của Push It.
 *
 * HTML tĩnh viết sẵn bằng tiếng Việt (bản mặc định cho người không bật JS và
 * cho máy tìm kiếm). Script này chỉ đổi chữ ([data-i18n]), khối nội dung dài
 * ([data-lang-block]), ảnh chụp ([data-shot]) và liên kết cửa hàng.
 */
(function () {
  // Liên kết cửa hàng. Để trống thì nút hiện "Sắp có" và không bấm được —
  // điền URL App Store khi app có trang (apps.apple.com/app/id…).
  var LINKS = {
    play: "https://play.google.com/store/apps/details?id=com.futechx.pushit",
    appStore: "",
  };

  var EN = {
    "nav.support": "Support",
    "nav.privacy": "Privacy",
    "hero.eyebrow": "Box-pushing puzzle",
    "hero.title": 'Push the crate <span class="lit">onto the light.</span>',
    "hero.sub": "75 Sokoban levels that climb on purpose. Swipe to move, no countdown clock, plays offline.",
    "hero.hint": "Scroll to push the crate",
    "hud.level": "Level", "hud.moves": "Moves", "hud.stars": "Stars",
    "store.play.small": "Get it on",
    "store.play": "Google Play",
    "store.ios.small": "Download on the",
    "store.ios": "App Store",
    "store.ios.soon": "Coming soon to the App Store",
    "nav.cta": "Get the game",
    "fact.free": "Free", "fact.ads": "Contains ads", "fact.iap": "Nothing sold for real money",
    "curve.kicker": "75 levels · 6 worlds",
    "curve.title": "Six worlds. Every one steeper.",
    "curve.lede": "The number on each bar is the optimal solution — the fewest moves that solve the level. A machine solved every board, so it is exact, not an estimate.",
    "curve.moves": "moves",
    "curve.note": "Each world spans at least eight moves from its easiest level to its hardest, and averages at least five moves more than the world before it.",
    "w1": "Beginner", "w2": "Easy", "w3": "Medium", "w4": "Hard", "w5": "Expert", "w6": "Master",
    "w1s": "7 levels", "w2s": "12 levels", "w3s": "12 levels", "w4s": "16 levels", "w5s": "16 levels", "w6s": "12 levels",
    "feat.kicker": "How it plays",
    "feat.title": "A calm puzzle, not an easy one.",
    "f1.t": "Swipe, step, push",
    "f1.p": "One swipe moves one step. Crates can be pushed, never pulled — plan ahead or wedge one into a corner for good.",
    "f2.t": "Three stars for the shortest solution",
    "f2.p": "Solving a level lets you through. A worse replay never takes a star away.",
    "f2.ratio": "≤ 110% of the optimal moves",
    "f3.t": "Never stuck",
    "f3.p": "Every level gives you 3 undos and a hint that shows the next move. Need more? Watch a short ad, or skip the level and come back later.",
    "pill.undo": "Undo", "pill.hint": "Hint",
    "f4.t": "A new puzzle every day",
    "f4.p": "One level a day, the same for everyone in the world.",
    "chip.offline": "Plays offline", "chip.account": "No account needed", "chip.langs": "9 languages", "chip.views": "2.5D or top-down view",
    "shots.kicker": "In the game",
    "shots.title": "What it looks like",
    "s.menu": "Start straight from the menu",
    "s.hard": "Expert boards get tight",
    "s.complete": "Three stars, tight solution",
    "s.levels": "Replay any level",
    "s.shop": "Boards, characters, crates",
    "close.title": "Seventy-five crates are waiting.",
    "foot.rights": "© 2026 TECHNOLOGY PARADISE COMPANY LIMITED",
    "support.title": "Support",
  };

  var VI = {};
  var lang = "vi";

  function read(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function write(key, value) { try { localStorage.setItem(key, value); } catch (e) {} }

  function apply(next) {
    lang = next;
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (!(key in VI)) VI[key] = el.innerHTML; // the static Vietnamese is the source
      el.innerHTML = lang === "en" && key in EN ? EN[key] : VI[key];
    });
    document.querySelectorAll("[data-shot]").forEach(function (img) {
      img.src = "assets/shots/" + lang + "/" + img.getAttribute("data-shot") + ".jpg";
    });
    document.querySelectorAll("[data-lang-block]").forEach(function (el) {
      el.classList.toggle("on", el.getAttribute("data-lang-block") === lang);
    });
    document.querySelectorAll(".lang button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === lang));
    });
    var title = document.querySelector("title");
    if (title && title.dataset[lang]) title.textContent = title.dataset[lang];
    write("pushit-lang", lang);
    document.dispatchEvent(new CustomEvent("pushit:lang", { detail: lang }));
  }

  // Nút cửa hàng chưa có link thì ẩn hẳn — một nút bấm không đi đâu đặt ở chỗ
  // đắt nhất trang chỉ nói với người xem rằng chưa có gì để tải. Thay vào đó
  // hiện một dòng chữ nhỏ "sắp có" ([data-soon-for]). Điền link là tự thành nút.
  function wireStores() {
    document.querySelectorAll("[data-store]").forEach(function (a) {
      var key = a.getAttribute("data-store");
      var url = LINKS[key];
      if (url) a.href = url;
      else a.hidden = true;
    });
    document.querySelectorAll("[data-soon-for]").forEach(function (note) {
      note.hidden = !!LINKS[note.getAttribute("data-soon-for")];
    });
  }

  wireStores();
  document.querySelectorAll(".lang button").forEach(function (b) {
    b.addEventListener("click", function () { apply(b.getAttribute("data-lang")); });
  });
  // ?lang=vi / ?lang=en thắng mọi thứ — để gửi đúng bản cho từng nhóm người.
  var asked = null;
  try { asked = new URLSearchParams(location.search).get("lang"); } catch (e) {}
  var saved = read("pushit-lang");
  var guess = (navigator.language || "vi").toLowerCase().indexOf("vi") === 0 ? "vi" : "en";
  var pick = function (v) { return v === "vi" || v === "en" ? v : null; };
  apply(pick(asked) || pick(saved) || guess);
})();
