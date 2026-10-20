/* Flashfuse Labs — behaviour. No dependencies. */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  $("#year").textContent = new Date().getFullYear();

  /* ---------- Theme ---------- */
  const themeBtn = $("#themeBtn");
  const isDark = () => root.dataset.theme ? root.dataset.theme === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  const label = () => themeBtn.setAttribute("aria-label", isDark() ? "Switch to light theme" : "Switch to dark theme");
  label();
  themeBtn.addEventListener("click", () => {
    root.dataset.theme = isDark() ? "light" : "dark";
    try { localStorage.setItem("ff-theme", root.dataset.theme); } catch (e) {}
    label();
  });

  /* ---------- Nav ---------- */
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const burger = $("#burger"), menu = $("#menu");
  const setMenu = open => {
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.hidden = !open;
  };
  burger.addEventListener("click", () => setMenu(menu.hidden));
  $$("a", menu).forEach(a => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !menu.hidden) { setMenu(false); burger.focus(); } });

  const links = $$(".nav__links a");
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle("is-current", a.getAttribute("href") === "#" + e.target.id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  ["apps", "why", "pricing", "faq", "about"].forEach(id => { const el = document.getElementById(id); if (el) spy.observe(el); });

  /* ---------- Hero: page-load sequence + fuse spark ---------- */
  if (document.visibilityState === "hidden") root.classList.add("no-anim");
  requestAnimationFrame(() => root.classList.add("is-ready"));

  const path = $("#fusePath"), spark = $("#spark"), visual = $(".hero__visual");
  if (path && spark && !reduce) {
    const svg = path.ownerSVGElement;
    const len = path.getTotalLength();
    const DURATION = 2600;
    const run = () => {
      const start = performance.now();
      spark.style.opacity = "1";
      const step = now => {
        const t = Math.min((now - start) / DURATION, 1);
        const eased = 1 - Math.pow(1 - t, 2);
        const p = path.getPointAtLength(eased * len);
        const box = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
        const x = (p.x / vb.width) * box.width, y = (p.y / vb.height) * box.height;
        spark.style.transform = `translate(${x}px, ${y}px)`;
        // burnt fuse: dashes behind the spark fade out
        path.style.strokeDashoffset = "0";
        if (t < 1) requestAnimationFrame(step);
        else { spark.animate([{ opacity: 1, scale: 1 }, { opacity: 0, scale: 3 }], { duration: 500, easing: "ease-out", fill: "forwards" }); setTimeout(() => (spark.style.opacity = "0"), 520); }
      };
      requestAnimationFrame(step);
    };
    if (document.visibilityState === "visible") setTimeout(run, 500);
    else document.addEventListener("visibilitychange", function once() { if (document.visibilityState === "visible") { document.removeEventListener("visibilitychange", once); setTimeout(run, 400); } });
    // Re-light the fuse when the visual is clicked/tapped
    visual.addEventListener("click", run);
  }

  /* ---------- Copy email ---------- */
  const copyBtn = $("#copyEmail"), status = $("#copyStatus");
  copyBtn?.addEventListener("click", async () => {
    const email = copyBtn.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
      status.textContent = "Copied " + email;
      copyBtn.textContent = "Copied";
      setTimeout(() => { copyBtn.textContent = "Copy email address"; status.textContent = email; }, 2200);
    } catch {
      status.textContent = "Couldn't copy. The address is " + email;
    }
  });

  /* ---------- Scroll reveals ---------- */
  $$(".head, .product, .tile, .step, .table-wrap, .plan, .faq__list, .about, .cta__card").forEach(el => el.classList.add("reveal"));
  if (reduce || !("IntersectionObserver" in window) || document.visibilityState === "hidden") { $$(".reveal").forEach(el => el.classList.add("is-in")); return; }
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
  }), { rootMargin: "0px 0px -8% 0px", threshold: .06 });
  $$(".reveal").forEach(el => io.observe(el));
})();
