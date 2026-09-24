/*
 * Hero của trang Push It: một màn chơi thật, vẽ bằng SVG isometric theo đúng
 * bảng màu của game. Cuộn trang = đẩy thùng: nhân vật đi 3 bước, thùng vào ô
 * sáng, thùng hoá xanh, 3 sao sáng — đúng câu chuyện "ba sao cho lời giải
 * ngắn nhất".
 *
 * Máy tính: hero được ghim, hoạt ảnh chạy theo thanh cuộn (scrub).
 * Điện thoại: tự chạy lặp — ghim + cuộn trên màn nhỏ làm người ta kẹt tay.
 * Giảm chuyển động: hiện luôn trạng thái đã giải, không chạy gì.
 * Không có GSAP (CDN lỗi): bàn cờ vẫn vẽ, đứng yên ở trạng thái đầu.
 */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var W = 64; // bề ngang một ô trên màn hình
  var H = 32; // bề cao một ô (tỉ lệ 2:1 như game)

  // Bảng màu lấy từ game (tools/brand/svg.mjs và ảnh chụp).
  var PAL = {
    wall: { top: "#9b90e3", inner: "#a99ff0", left: "#6f61c4", right: "#5b4eaa" },
    floorA: "#2a2347", floorB: "#30284f",
    plinth: { left: "#1e1836", right: "#17122b" },
    crate: { top: "#f3a95f", left: "#c07636", right: "#96551f", edge: "#ffc98a", plank: "#b86d2c" },
    solved: { top: "#6fdc97", left: "#3fb46f", right: "#2e9058", edge: "#a6f0c1", plank: "#3fb46f" },
    player: { top: "#8ff3e6", left: "#56d8c8", right: "#3bb3a6", edge: "#c9fbf4" },
  };

  function iso(c, r) { return { x: (c - r) * W / 2, y: (c + r) * H / 2 }; }
  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function pts(list) { return list.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" "); }
  function lerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }

  // Bốn góc mặt trên của một ô ở độ cao h, thụt vào k (0..0.5) mỗi cạnh.
  // Thứ tự: đỉnh trên, phải, dưới, trái — như nhìn trong game.
  function diamond(c, r, h, k) {
    return [[c + k, r + k], [c + 1 - k, r + k], [c + 1 - k, r + 1 - k], [c + k, r + 1 - k]].map(function (g) {
      var p = iso(g[0], g[1]);
      return [p.x, p.y - h];
    });
  }

  // Một khối hộp: mặt trên + hai mặt đứng hướng về người xem.
  function box(parent, c, r, h, k, pal) {
    var t = diamond(c, r, h, k);
    var b = diamond(c, r, 0, k);
    var g = el("g", {}, parent);
    var left = el("polygon", { points: pts([t[3], t[2], b[2], b[3]]), fill: pal.left }, g);
    var right = el("polygon", { points: pts([t[2], t[1], b[1], b[2]]), fill: pal.right }, g);
    var top = el("polygon", { points: pts(t), fill: pal.top, stroke: pal.edge || "none", "stroke-width": pal.edge ? 1.2 : 0, "stroke-linejoin": "round" }, g);
    return { g: g, top: top, left: left, right: right, t: t, b: b };
  }

  function crate(parent, c, r, pal, withCheck) {
    var bx = box(parent, c, r, 30, 0.13, pal);
    var t = bx.t;
    var planks = el("g", { stroke: pal.plank, "stroke-width": 1.6, opacity: 0.75, "stroke-linecap": "round" }, bx.g);
    [0.36, 0.64].forEach(function (u) {
      var a = lerp(t[0], t[1], u), d = lerp(t[3], t[2], u);
      el("line", { x1: a[0], y1: a[1], x2: d[0], y2: d[1] }, planks);
    });
    var cx = (t[0][0] + t[2][0]) / 2, cy = (t[0][1] + t[2][1]) / 2;
    var check = el("path", {
      d: "M" + (cx - 9) + " " + cy + " l6 4.5 l12 -9",
      fill: "none", stroke: "#ffffff", "stroke-width": 3.6, "stroke-linecap": "round", "stroke-linejoin": "round",
      opacity: withCheck ? 1 : 0,
    }, bx.g);
    if (withCheck) planks.setAttribute("opacity", 0);
    bx.planks = planks;
    bx.check = check;
    return bx;
  }

  function player(parent, c, r) {
    var outer = el("g", {}, parent); // di chuyển theo ô
    var bob = el("g", {}, outer);    // nảy mỗi bước
    var idle = el("g", {}, bob);     // thở nhẹ khi đứng yên
    var bx = box(idle, c, r, 28, 0.15, PAL.player);
    // Mặt nằm ở mặt đứng bên trái, như trong game.
    var t = bx.t, b = bx.b;
    function onFace(u, v) { return lerp(lerp(t[3], t[2], u), lerp(b[3], b[2], u), v); }
    [[0.3, 0.36], [0.64, 0.36]].forEach(function (uv) {
      var p = onFace(uv[0], uv[1]);
      el("circle", { cx: p[0], cy: p[1], r: 4.4, fill: "#ffffff" }, idle);
      el("circle", { cx: p[0] + 0.9, cy: p[1] + 0.6, r: 2.3, fill: "#1b1530" }, idle);
    });
    var s0 = onFace(0.4, 0.6), s1 = onFace(0.56, 0.62), sc = onFace(0.48, 0.74);
    el("path", { d: "M" + s0[0] + " " + s0[1] + " Q" + sc[0] + " " + sc[1] + " " + s1[0] + " " + s1[1], fill: "none", stroke: "#1b1530", "stroke-width": 1.8, "stroke-linecap": "round" }, idle);
    var ch = onFace(0.2, 0.56);
    el("ellipse", { cx: ch[0], cy: ch[1], rx: 3.2, ry: 1.8, fill: "#ff9ec4", opacity: 0.55 }, idle);
    return { outer: outer, bob: bob, idle: idle };
  }

  function target(parent, c, r) {
    var p = iso(c + 0.5, r + 0.5);
    var g = el("g", {}, parent);
    var glow = el("ellipse", { cx: p.x, cy: p.y, rx: W * 0.5, ry: H * 0.5, fill: "url(#tgGlow)", opacity: 0.6 }, g);
    el("ellipse", { cx: p.x, cy: p.y, rx: W * 0.28, ry: H * 0.28, fill: "none", stroke: "#ffe0a3", "stroke-width": 3.4 }, g);
    el("ellipse", { cx: p.x, cy: p.y, rx: 7, ry: 3.5, fill: "#f3a95f" }, g);
    var pulse = el("g", {}, g);
    var ring = el("ellipse", { cx: p.x, cy: p.y, rx: W * 0.28, ry: H * 0.28, fill: "none", stroke: "#ffe0a3", "stroke-width": 2, opacity: 0 }, pulse);
    return { g: g, glow: glow, pulse: pulse, ring: ring, x: p.x, y: p.y };
  }

  function crystal(parent, c, r, h, tall) {
    var p = iso(c + 0.5, r + 0.5);
    var cy = p.y - h;
    el("polygon", { points: pts([[p.x - 4.5, cy], [p.x, cy - tall], [p.x + 4.5, cy], [p.x, cy + 3]]), fill: "url(#crystal)" }, parent);
    el("polygon", { points: pts([[p.x, cy - tall], [p.x + 4.5, cy], [p.x, cy + 3]]), fill: "rgba(120,100,210,.45)" }, parent);
  }

  function defs(svg) {
    var d = el("defs", {}, svg);
    var rg = el("radialGradient", { id: "tgGlow" }, d);
    el("stop", { offset: "0", "stop-color": "#ffe0a3", "stop-opacity": "0.95" }, rg);
    el("stop", { offset: "0.45", "stop-color": "#ffb347", "stop-opacity": "0.45" }, rg);
    el("stop", { offset: "1", "stop-color": "#ffb347", "stop-opacity": "0" }, rg);
    var lg = el("linearGradient", { id: "crystal", x1: "0", y1: "0", x2: "0", y2: "1" }, d);
    el("stop", { offset: "0", "stop-color": "#ffffff" }, lg);
    el("stop", { offset: "1", "stop-color": "#b9aef5" }, lg);
  }

  /*
   * Bàn cờ: COLS x ROWS ô, viền là tường. Nhân vật ở (1,2), thùng ở (2,2),
   * ô đích ở (5,2) — đẩy sang phải 3 lần là xong, đúng 3 nước tối ưu.
   * Một thùng khác đã nằm sẵn trên ô đích ở (6,1) để khoe hình "đã giải".
   */
  function buildBoard(svg, opts) {
    var COLS = opts.cols, ROWS = opts.rows;
    defs(svg);

    // Đế bàn cờ: một khối dày bên dưới, như trong game.
    var eA = iso(0, ROWS), dA = iso(COLS, ROWS), bA = iso(COLS, 0), T = 22;
    el("polygon", { points: pts([[eA.x, eA.y], [dA.x, dA.y], [dA.x, dA.y + T], [eA.x, eA.y + T]]), fill: PAL.plinth.left }, svg);
    el("polygon", { points: pts([[dA.x, dA.y], [bA.x, bA.y], [bA.x, bA.y + T], [dA.x, dA.y + T]]), fill: PAL.plinth.right }, svg);

    var floor = el("g", {}, svg);
    for (var r = 1; r < ROWS - 1; r++) {
      for (var c = 1; c < COLS - 1; c++) {
        el("polygon", { points: pts(diamond(c, r, 0, 0)), fill: (c + r) % 2 ? PAL.floorA : PAL.floorB, stroke: "rgba(0,0,0,.22)", "stroke-width": 1 }, floor);
      }
    }

    var isWall = function (c, r) { return c === 0 || r === 0 || c === COLS - 1 || r === ROWS - 1; };
    var back = [], front = [];
    for (r = 0; r < ROWS; r++) for (c = 0; c < COLS; c++) {
      if (!isWall(c, r)) continue;
      (r === 0 || c === 0 ? back : front).push([c, r]);
    }
    var bySum = function (a, b) { return (a[0] + a[1]) - (b[0] + b[1]); };
    back.sort(bySum); front.sort(bySum);

    var WALL_H = 22;
    function wall(parent, c, r) {
      box(parent, c, r, WALL_H, 0, PAL.wall);
      el("polygon", { points: pts(diamond(c, r, WALL_H, 0.17)), fill: PAL.wall.inner, stroke: "rgba(80,64,170,.55)", "stroke-width": 1 }, parent);
    }

    var backG = el("g", {}, svg);
    back.forEach(function (w) { wall(backG, w[0], w[1]); });
    (opts.crystals || []).forEach(function (cr) { crystal(backG, cr[0], cr[1], WALL_H, cr[2]); });

    var targets = el("g", {}, svg);
    (opts.targets || []).forEach(function (tg) { target(targets, tg[0], tg[1]); });
    var goal = opts.goal ? target(targets, opts.goal[0], opts.goal[1]) : null;

    // Vệt chấm từ thùng tới ô đích: nhìn một giây là hiểu luật chơi.
    var path = null;
    if (opts.path && opts.crate && opts.goal) {
      var from = iso(opts.crate[0] + 1.5, opts.crate[1] + 0.5), to = iso(opts.goal[0] + 0.1, opts.goal[1] + 0.5);
      path = el("g", { opacity: 0.85 }, svg);
      var line = el("line", { x1: from.x, y1: from.y, x2: to.x, y2: to.y, stroke: "#ffe0a3", "stroke-width": 2.6, "stroke-linecap": "round", "stroke-dasharray": "0.1 9" }, path);
      var ux = (to.x - from.x), uy = (to.y - from.y), len = Math.hypot(ux, uy); ux /= len; uy /= len;
      var tip = [to.x + ux * 4, to.y + uy * 4], wing = 7;
      el("polyline", { points: pts([[tip[0] - ux * wing - uy * wing * 0.8, tip[1] - uy * wing + ux * wing * 0.8], tip, [tip[0] - ux * wing + uy * wing * 0.8, tip[1] - uy * wing - ux * wing * 0.8]]), fill: "none", stroke: "#ffe0a3", "stroke-width": 2.6, "stroke-linecap": "round", "stroke-linejoin": "round" }, path);
      path.line = line;
    }

    var objects = el("g", {}, svg);
    (opts.solved || []).forEach(function (s) { crate(objects, s[0], s[1], PAL.solved, true); });
    var hero = opts.player ? player(objects, opts.player[0], opts.player[1]) : null;
    var box1 = opts.crate ? crate(objects, opts.crate[0], opts.crate[1], PAL.crate, false) : null;

    var frontG = el("g", {}, svg);
    front.forEach(function (w) { wall(frontG, w[0], w[1]); });

    // Khung nhìn vừa khít bàn cờ + chỗ cho tinh thể và đế.
    var minX = iso(0, ROWS).x - 6, maxX = iso(COLS, 0).x + 6;
    var minY = -WALL_H - 40, maxY = iso(COLS, ROWS).y + T + 8;
    svg.setAttribute("viewBox", [minX, minY, maxX - minX, maxY - minY].join(" "));
    return { player: hero, crate: box1, goal: goal, path: path };
  }

  // ------------------------------------------------------------------ hero
  var stage = document.querySelector(".stage");
  if (!stage) return;
  var svg = el("svg", { class: "board", role: "img", "aria-hidden": "true" });
  var fallback = stage.querySelector(".stage-fallback");
  if (fallback) fallback.replaceWith(svg); else stage.appendChild(svg);

  var scene = buildBoard(svg, {
    // 8 cột: ô đích (5,2) cách tường phải một ô, để tường không che mất nó.
    cols: 8, rows: 5, path: true,
    player: [1, 2], crate: [2, 2], goal: [5, 2],
    // Thùng đã giải đứng ở (6,1), cạnh chỗ thùng kia dừng (5,2) chứ không
    // thẳng hàng sau nó — thẳng hàng thì hai thùng trông như chồng lên nhau.
    targets: [[6, 1]], solved: [[6, 1]],
    crystals: [[2, 0, 26], [4, 0, 18], [0, 3, 22]],
  });

  var hud = stage.querySelector(".hud");
  var hint = stage.querySelector(".hint");
  if (hud) hud.hidden = false;

  // Lịch "câu đố hôm nay" hiện đúng ngày hôm nay, theo ngôn ngữ đang chọn.
  function paintCalendar() {
    var m = document.getElementById("cal-month"), d = document.getElementById("cal-day");
    if (!m || !d) return;
    var now = new Date(), lang = document.documentElement.lang || "vi";
    m.textContent = now.toLocaleDateString(lang === "en" ? "en-US" : "vi-VN", { month: "short" });
    d.textContent = String(now.getDate());
  }
  paintCalendar();
  document.addEventListener("pushit:lang", paintCalendar);

  // Bàn cờ nhỏ trong ô "Vuốt, bước, đẩy": nhân vật, thùng, ô đích, không có gì thừa.
  var miniSvg = document.getElementById("mini-board");
  var mini = miniSvg ? buildBoard(miniSvg, { cols: 6, rows: 3, player: [1, 1], crate: [2, 1], goal: [4, 1] }) : null;

  var gsap = window.gsap;
  if (!gsap) { document.documentElement.classList.remove("js-motion"); return; } // bàn cờ đứng yên, trang vẫn đọc được
  if (!window.ScrollTrigger) document.documentElement.classList.remove("js-motion");
  var ST = window.ScrollTrigger;
  if (ST) gsap.registerPlugin(ST);

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var movesEl = document.getElementById("hud-moves");
  var stars = stage.querySelectorAll(".star");
  var counter = { v: 0 };
  var STEP = { x: W / 2, y: H / 2 }; // một ô sang phải trên màn hình

  // ---- Chuỗi hoạt ảnh chính: 3 nước đẩy rồi màn giải ----
  var tl = gsap.timeline({
    paused: true,
    defaults: { ease: "power2.inOut" },
    onUpdate: function () { if (movesEl) movesEl.textContent = String(Math.round(counter.v)); },
  });
  if (hint) tl.to(hint, { autoAlpha: 0, y: 8, duration: 0.3 }, 0);
  if (scene.path) tl.to(scene.path, { opacity: 0, duration: 0.3 }, 0.15);
  for (var i = 0; i < 3; i++) {
    var t0 = 0.2 + i * 0.8;
    tl.to(scene.player.outer, { x: "+=" + STEP.x, y: "+=" + STEP.y, duration: 0.5 }, t0)
      .to(scene.crate.g, { x: "+=" + STEP.x, y: "+=" + STEP.y, duration: 0.5 }, t0 + 0.06)
      .to(scene.player.bob, { y: -8, duration: 0.25, ease: "sine.out", yoyo: true, repeat: 1 }, t0)
      .to(counter, { v: i + 1, duration: 0.01, ease: "none" }, t0 + 0.35);
  }
  tl.addLabel("solved", 2.65)
    .to(scene.goal.pulse, { opacity: 0, duration: 0.2 }, "solved")
    .to(scene.crate.top, { attr: { fill: PAL.solved.top, stroke: PAL.solved.edge }, duration: 0.35, ease: "power1.out" }, "solved")
    .to(scene.crate.left, { attr: { fill: PAL.solved.left }, duration: 0.35, ease: "power1.out" }, "solved")
    .to(scene.crate.right, { attr: { fill: PAL.solved.right }, duration: 0.35, ease: "power1.out" }, "solved")
    .to(scene.crate.planks, { opacity: 0, duration: 0.2 }, "solved")
    .fromTo(scene.crate.check, { opacity: 0, scale: 0.4, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2.4)" }, "solved+=0.15")
    .fromTo(scene.goal.glow, { attr: { rx: W * 0.5, ry: H * 0.5 }, opacity: 0.6 }, { attr: { rx: W * 1.6, ry: H * 1.6 }, opacity: 0, duration: 0.8, ease: "power2.out" }, "solved")
    .fromTo(stars,
      { color: "rgba(167,157,196,0.35)", textShadow: "0 0 0 rgba(255,194,77,0)", scale: 0.5 },
      { color: "#ffc24d", textShadow: "0 0 10px rgba(255,194,77,0.75)", scale: 1, duration: 0.3, ease: "back.out(3)", stagger: 0.18 },
      "solved+=0.25")
    // Tween biến CSS trên h1 chứ không phải .lit: đổi ngôn ngữ sẽ thay .lit bằng phần tử mới.
    .to(".hero h1", { "--g": 1, duration: 0.5, ease: "power1.out" }, "solved+=0.1")
    .to({}, { duration: 0.6 }); // đứng yên một nhịp ở trạng thái đã giải

  if (reduce) {
    tl.progress(1);
  } else {
    gsap.to(scene.player.idle, { y: -2.5, duration: 1.3, ease: "sine.inOut", yoyo: true, repeat: -1 });
    gsap.fromTo(scene.goal.ring,
      { attr: { rx: W * 0.28, ry: H * 0.28 }, opacity: 0.9 },
      { attr: { rx: W * 0.7, ry: H * 0.7 }, opacity: 0, duration: 1.8, ease: "power1.out", repeat: -1, repeatDelay: 0.4 });
    if (scene.path) gsap.to(scene.path.line, { attr: { "stroke-dashoffset": -18 }, duration: 0.9, ease: "none", repeat: -1 });

    var mm = gsap.matchMedia();
    mm.add("(min-width: 901px)", function () {
      if (hint) hint.hidden = false;
      if (!ST) { tl.play(); return; }
      // Bắt đầu khi đỉnh hero chạm MÉP DƯỚI thanh điều hướng dính, không phải
      // đỉnh màn hình: hero nằm dưới thanh đó, nên "top top" bắt người dùng cuộn
      // hết chiều cao thanh điều hướng rồi hoạt ảnh mới chạy. Là hàm để tính lại
      // khi thay đổi kích thước (ScrollTrigger gọi lại lúc refresh).
      var navHeight = function () { var bar = document.querySelector(".bar-shell"); return bar ? bar.offsetHeight : 0; };
      var st = ST.create({
        trigger: ".hero",
        start: function () { return "top " + navHeight(); },
        end: "+=650",
        pin: true,
        scrub: 0.7,
        animation: tl,
      });
      return function () { st.kill(); tl.progress(0).pause(); };
    });
    mm.add("(max-width: 900px)", function () {
      tl.repeat(-1).repeatDelay(1.8).restart(true);
      return function () { tl.repeat(0).progress(0).pause(); };
    });

    // Bàn cờ nhỏ: nhân vật đẩy thùng một nước rồi lùi lại, lặp chậm.
    if (mini) {
      gsap.timeline({ repeat: -1, repeatDelay: 1.2, defaults: { ease: "power2.inOut", duration: 0.5 } })
        .to(mini.player.outer, { x: "+=" + STEP.x, y: "+=" + STEP.y }, 0.6)
        .to(mini.crate.g, { x: "+=" + STEP.x, y: "+=" + STEP.y }, 0.66)
        .to(mini.player.bob, { y: -7, duration: 0.25, ease: "sine.out", yoyo: true, repeat: 1 }, 0.6)
        .to([mini.player.outer, mini.crate.g], { x: 0, y: 0, duration: 0.6 }, "+=1.2");
    }

    // Bụi sáng lơ lửng như nền trong game.
    var sky = document.querySelector(".sky");
    if (sky) {
      for (var m = 0; m < 26; m++) {
        var d = document.createElement("span");
        d.className = "mote";
        d.style.left = gsap.utils.random(0, 100) + "%";
        d.style.top = gsap.utils.random(0, 100) + "%";
        var s = gsap.utils.random(1.5, 3.5);
        d.style.width = d.style.height = s + "px";
        sky.appendChild(d);
        gsap.to(d, {
          x: gsap.utils.random(-40, 40), y: gsap.utils.random(-60, 20),
          opacity: gsap.utils.random(0.2, 0.9),
          duration: gsap.utils.random(6, 12), ease: "sine.inOut", yoyo: true, repeat: -1, delay: gsap.utils.random(0, 4),
        });
      }
    }

    if (ST) {
      // Chữ và khối hiện lên khi cuộn tới. from() chỉ chạy lúc vào khung nhìn,
      // nên không có JS thì mọi thứ vẫn hiện đầy đủ.
      // Trạng thái ẩn đã có sẵn từ CSS (.js-motion) ngay khung hình đầu tiên, nên
      // ở đây chỉ việc đi TỚI trạng thái hiện. Dùng from() thì phần tử đang hiện
      // bị tắt phụt đi rồi mới hiện dần — đó là cái nháy.
      gsap.set(".reveal", { autoAlpha: 0, y: 28 });
      ST.batch(".reveal", {
        start: "top 88%",
        once: true,
        onEnter: function (els) {
          gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.08, overwrite: true });
        },
      });

      // Thanh độ khó mọc ra từ số nước nhỏ nhất của mỗi thế giới.
      ST.create({
        trigger: ".curve",
        start: "top 80%",
        once: true,
        onEnter: function () {
          gsap.fromTo(".range", { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, duration: 1, ease: "power3.out", stagger: 0.09 });
        },
      });

      // Năm máy xếp chồng rồi xoè ra hình quạt khi cuộn (máy tính).
      mm.add("(min-width: 901px)", function () {
        var fan = document.getElementById("fan");
        if (!fan) return;
        var figs = gsap.utils.toArray("#fan figure");
        fan.classList.add("fanned");
        var mid = (figs.length - 1) / 2;
        gsap.set(figs, { x: 0, rotation: 0, y: 30, zIndex: function (i) { return 10 - Math.abs(i - mid); } });
        var caps = gsap.utils.toArray("#fan figcaption");
        // Chú thích chỉ hiện khi các máy đã xoè ra — lúc xếp chồng chúng đè lên nhau.
        var t = gsap.timeline({ scrollTrigger: { trigger: fan, start: "top 85%", end: "top 30%", scrub: 0.8 } })
          .to(figs, {
            x: function (i) { return (i - mid) * 220; },
            rotation: function (i) { return (i - mid) * 4; },
            y: function (i) { return Math.abs(i - mid) * 22; },
            ease: "none", duration: 1,
          }, 0)
          .fromTo(caps, { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.25 }, 0.75);
        return function () { t.scrollTrigger && t.scrollTrigger.kill(); t.kill(); gsap.set(figs.concat(caps), { clearProps: "all" }); fan.classList.remove("fanned"); };
      });

      document.fonts && document.fonts.ready.then(function () { ST.refresh(); });
    }
  }

  // Thanh điều hướng có viền khi đã cuộn khỏi đầu trang.
  var shell = document.querySelector(".bar-shell");
  if (shell) {
    var onScroll = function () { shell.classList.toggle("scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
})();
