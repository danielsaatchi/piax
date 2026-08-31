/**
 * typing.js
 * PIAX — Posthumanism Institute of AI & Xenobiotechnology (PIAX)
 * ──────────────────────────────────────────────────────
 * 1. themeToggle()   — switches dark/light, re-tunes rain colours
 * 2. matrixRain()    — vertical column rain, theme-aware
 * 3. floatingWords() — topic words drifting upward
 * 4. typeSequence()  — orchestrated typewriter reveal
 */

"use strict";

/* ═══════════════════════════════════════════
   1.  THEME TOGGLE
═══════════════════════════════════════════ */
const THEME = (() => {
  const html = document.documentElement;

  // Exposed so matrixRain can read current theme each frame
  let current = "dark";

  function set(t) {
    current = t;
    html.setAttribute("data-theme", t);
  }

  function toggle() {
    set(current === "dark" ? "light" : "dark");
  }

  function get() { return current; }

  // Wire up the toggle widget
  document.addEventListener("DOMContentLoaded", () => {
    const widget = document.getElementById("theme-toggle");
    if (widget) widget.addEventListener("click", toggle);
  });

  return { toggle, get };
})();


/* ═══════════════════════════════════════════
   PAGE ROUTER
═══════════════════════════════════════════ */
(function pageRouter() {
  function navigate(pageId) {
    // Hide all pages
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));

    // Show target page
    const target = document.getElementById("page-" + pageId);
    if (target) target.classList.add("active");

    // Highlight nav link
    const link = document.querySelector(`.nav-link[data-page="${pageId}"]`);
    if (link) link.classList.add("active");

    // Rain + floating words always run in background — no need to touch canvas
  }

  document.addEventListener("DOMContentLoaded", () => {
    // Wire nav links
    document.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", e => {
        e.preventDefault();
        navigate(link.dataset.page);
      });
    });

    // Default: home active
    navigate("home");
  });
})();


(function matrixRain() {
  const canvas = document.getElementById("matrix-canvas");
  const ctx    = canvas.getContext("2d");

  // ── Character sets ──────────────────────────────────────
  const KATAKANA =
    "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";

  const KOREAN =
    "가나다라마바사아자차카타파하" +
    "갈달말발살알잘찰칼탈팔할" +
    "강당망방상앙장창캉탕팡항" +
    "겨녀려며벼셔여져쳐켜텨펴혀" +
    "고노도로모보소오조초코토포호" +
    "구누두루무부수우주추쿠투푸후" +
    "긴닌딘린민빈신인진친킨틴핀힌";

  const PERSIAN =
    "ابتثجحخدذرزسشصضطظعغفقکگلمنوهی" +
    "آءأؤإئةىپچژ" +
    "الماهوبهدرازبرکهشداندر";

  const MISC =
    "αβΣΔΩ∞≠≈±√∂∫ψφξηθλμπρσ" +
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ23456789";

  // Music notes + binary → always red in both themes
  const NOTES    = "♩♪♫♬𝅝𝅗𝅥𝅘𝅥𝅯";
  const RED_POOL = ("01" + NOTES).repeat(12);
  const CHARS    = KATAKANA + KOREAN + PERSIAN + MISC + RED_POOL;
  const RED_SET  = new Set([..."01♩♪♫♬𝅝𝅗𝅥𝅘𝅥𝅯"]);

  const FONT_SIZE = 14;
  let cols, drops;

  // Bright red palette — same in both themes
  const REDS = ["#ff1a1a","#ff3300","#ff4422","#ff2244","#ff0000","#ff5500"];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    cols  = Math.floor(canvas.width / FONT_SIZE);
    drops = Array.from({ length: cols }, () => Math.random() * -100 | 0);
  }

  function draw() {
    const isDark = THEME.get() === "dark";

    // Fade layer — black for dark, warm off-white for light
    ctx.fillStyle = isDark
      ? "rgba(0,0,0,0.055)"
      : "rgba(232,228,223,0.065)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = FONT_SIZE + "px 'Cascadia Code', 'Cascadia Mono', 'Courier New', monospace";

    drops.forEach((y, i) => {
      const char = CHARS[Math.random() * CHARS.length | 0];
      const x    = i * FONT_SIZE;

      if (RED_SET.has(char)) {
        // Bright flashy red — identical in both themes
        ctx.fillStyle = REDS[Math.random() * REDS.length | 0];
        if (Math.random() < 0.12) ctx.fillStyle = "#ff8888";
      } else if (isDark) {
        // Dark theme: silver-grey glyphs
        const v = 80 + Math.random() * 120 | 0;
        ctx.fillStyle = y > 1
          ? `rgba(${v},${v + 3 | 0},${v + 8 | 0},0.85)`
          : "#e8eaed";
        if (Math.random() < 0.018) ctx.fillStyle = "#ffffff";
      } else {
        // Light theme: dark charcoal glyphs on warm white
        const v = 30 + Math.random() * 90 | 0;
        ctx.fillStyle = y > 1
          ? `rgba(${v},${v - 4 | 0},${v - 8 | 0},0.72)`
          : "#1a1714";
        if (Math.random() < 0.018) ctx.fillStyle = "#000000";
      }

      ctx.fillText(char, x, y * FONT_SIZE);

      if (y * FONT_SIZE > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    });
  }

  resize();
  window.addEventListener("resize", resize);
  setInterval(draw, 38);
})();


/* ═══════════════════════════════════════════
   3.  FLOATING TOPIC WORDS
═══════════════════════════════════════════ */
(function floatingWords() {
  const TOPICS = [
    // English
    "Artificial Intelligence",
    "Superintelligence Threats",
    "Bio-inspired Robotics",
    "Transhuman Biotechnology",
    "Chimera Concept",
    "Brain Interface",
    "Metamaterial Machines",
    "Post-Biological Ethics",
    "Xenobiology",
    "Synthetic Cognition",
    "Neural Augmentation",
    "Alien Morphology",
    "Transpecies Rights",
    "Exo-consciousness",
    "Recursive Self-Improvement",
    "Wetware Integration",
    // Korean
    "인공지능",
    "초지능 위협",
    "생체 로봇공학",
    "트랜스휴먼 생명공학",
    "키메라 개념",
    "뇌 인터페이스",
    "메타물질 기계",
    "외계 형태학",
    "비인간 행위성",
    "인지 기질",
    // Persian
    "هوش مصنوعی",
    "تهدیدات فراهوش",
    "رباتیک زیست‌الهام",
    "بیوتکنولوژی فراانسان",
    "مفهوم کیمرا",
    "رابط مغزی",
    "ماشین‌های فراماده",
    "هشیاری بیرونی",
    "ادغام نرم‌افزار زیستی",
    "ریخت‌شناسی بیگانه",
  ];

  const container = document.getElementById("floating-words");

  function spawnWord() {
    const text  = TOPICS[Math.random() * TOPICS.length | 0];
    const size  = (0.45 + Math.random() * 0.95).toFixed(2);
    const left  = (Math.random() * 96).toFixed(1);
    const top   = (52 + Math.random() * 43).toFixed(1);
    const dur   = (12 + Math.random() * 18).toFixed(1);
    const delay = (Math.random() * 4).toFixed(2);

    const el = document.createElement("span");
    el.className   = "float-word";
    el.textContent = text;
    el.style.cssText = [
      `font-size: ${size}rem`,
      `left: ${left}%`,
      `top: ${top}%`,
      `animation-duration: ${dur}s`,
      `animation-delay: ${delay}s`,
      `opacity: 0`,
    ].join(";");

    container.appendChild(el);
    const totalMs = (parseFloat(dur) + parseFloat(delay)) * 1000 + 500;
    setTimeout(() => el.remove(), totalMs);
  }

  for (let i = 0; i < 20; i++) setTimeout(spawnWord, i * 320);
  setInterval(spawnWord, 1700);
})();


/* ═══════════════════════════════════════════
   4.  TYPEWRITER SEQUENCE
═══════════════════════════════════════════ */
(function typeSequence() {

  function typeInto(el, text, speed = 55) {
    return new Promise(resolve => {
      let i = 0;
      el.textContent = "";
      const cur = document.createElement("span");
      cur.className = "cursor";
      el.appendChild(cur);

      const tick = setInterval(() => {
        if (i < text.length) {
          el.insertBefore(document.createTextNode(text[i]), cur);
          i++;
        } else {
          clearInterval(tick);
          if (cur.parentNode) cur.remove();
          resolve();
        }
      }, speed + Math.random() * 22);
    });
  }

  function pause(ms) { return new Promise(r => setTimeout(r, ms)); }

  function expandDivider() {
    return new Promise(r => {
      document.querySelector(".divider").classList.add("expanded");
      setTimeout(r, 1300);
    });
  }

  async function run() {
    const eyebrow   = document.getElementById("eyebrow-type");
    const title     = document.getElementById("piat-title");
    const establish = document.getElementById("establish-type");
    const org       = document.getElementById("org-type");
    const tagline   = document.getElementById("tagline-type");

    await pause(800);
    await typeInto(eyebrow, ">/ Loading ...", 22);
    await pause(300);
    await typeInto(title,
      "Posthumanism Institute of\nAI & Xenobiotechnology (PIAX)", 38);
    await pause(300);
    // Red subtitle line
    const subtitle = document.getElementById("piax-subtitle");
    if (subtitle) await typeInto(subtitle, "[4] XENO-Economy", 30);
    await pause(700);
    await expandDivider();
    await typeInto(establish, "2027 ESTABLISHMENT & UNDERDEVELOPMENT BY", 22);
    await pause(200);
    await typeInto(org, "DANIEL SAATCHI DESIGNS AND TECHNOLOGIES (DSDT)", 22);
    await pause(300);
    await typeInto(tagline,
      "WHERE TRANSHUMANS USE BRAIN INTERFACE INTELLIGENT METAMATERIALS", 28);

    const idleCursor = document.createElement("span");
    idleCursor.className = "cursor";
    tagline.appendChild(idleCursor);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
