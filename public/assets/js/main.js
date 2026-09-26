/* ReviewCrew — interactions & scroll animation */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const money = (n) => Math.round(n).toLocaleString("en-US");
  let lenis = null;

  initCheckoutBanner();
  initNav();
  initForm();

  const hasGsap = window.gsap && window.ScrollTrigger && window.SplitText;
  if (!hasGsap || reduceMotion) {
    root.classList.add("rc-fallback");
    showStaticLedger();
    return;
  }
  window.__rcReady = true;

  gsap.registerPlugin(ScrollTrigger, SplitText);
  lenis = initSmoothScroll();

  heroIntro();
  scrollProgress();
  heroParallax();
  headlineReveals();
  simpleReveals();
  cardBatches();
  ledger();
  starFill();
  chartDraw();
  howSlider();
  replyDemo();
  magneticButtons();

  // Recalculate positions once fonts settle (heading heights change).
  document.fonts?.ready.then(() => ScrollTrigger.refresh());

  /* ---------------- Checkout Banner ---------------- */
  function initCheckoutBanner() {
    const params = new URLSearchParams(location.search);
    if (!params.has("checkout") || params.get("checkout") !== "success") return;
    
    const banner = $("[data-checkout-banner]");
    const close = $("[data-checkout-close]");
    if (!banner) return;
    
    banner.hidden = false;
    
    close?.addEventListener("click", () => {
      banner.style.animation = "slideUp .4s cubic-bezier(0.22, 1, 0.36, 1)";
      setTimeout(() => banner.hidden = true, 400);
    });
    
    const style = document.createElement("style");
    style.textContent = "@keyframes slideUp { to { transform: translateY(-100%); opacity: 0; } }";
    document.head.append(style);
  }

  /* ---------------- Smooth scroll ---------------- */
  function initSmoothScroll() {
    if (!window.Lenis) return null;
    const l = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    l.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => l.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    return l;
  }

  /* ---------------- Nav ---------------- */
  function initNav() {
    const nav = $("[data-nav]");
    const bar = document.createElement("div");
    bar.className = "progress";
    bar.setAttribute("aria-hidden", "true");
    bar.dataset.progress = "";
    document.body.prepend(bar);

    let lastY = scrollY;
    const onScroll = () => {
      const y = scrollY;
      nav.classList.toggle("is-solid", y > 40);
      nav.classList.toggle("is-hidden", y > lastY && y > 700);
      lastY = y;
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Anchor links: smooth scroll (via Lenis when present) + plan preselect.
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const plan = a.dataset.plan;
      if (plan) $("[data-plan-field]").value = plan;
      const id = a.getAttribute("href");
      const target = id === "#top" || id === "#" ? 0 : $(id);
      if (target === null) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -60, duration: 1.4 });
      else (target === 0 ? root : target).scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      if (id === "#audit") setTimeout(() => $("#name")?.focus({ preventScroll: true }), 900);
    });
  }

  function scrollProgress() {
    gsap.to("[data-progress]", {
      scaleX: 1, ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
    });
  }

  /* ---------------- Hero ---------------- */
  function heroIntro() {
    const title = $(".hero__title");
    const fontsOrTimeout = Promise.race([
      document.fonts ? document.fonts.ready : Promise.resolve(),
      new Promise((r) => setTimeout(r, 1200)),
    ]);
    fontsOrTimeout.then(() => {
      gsap.set(title, { autoAlpha: 1 });
      const split = SplitText.create(title, { type: "lines,words", mask: "lines" });
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.from(split.words, { yPercent: 115, duration: 1.2, stagger: 0.07 })
        .fromTo("[data-hero-in]", { y: 26, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, stagger: 0.09 }, 0.35)
        .fromTo("[data-hero-device]", { y: 80, autoAlpha: 0, rotate: 3 }, { y: 0, autoAlpha: 1, rotate: 0, duration: 1.4 }, 0.25)
        .add(mapPack, 1.1);
    });
  }

  // The "you climb the map pack" loop inside the phone.
  function mapPack() {
    const pack = $("[data-pack]");
    const you = $("[data-you]");
    const rivals = $$(".pack__item:not([data-you])", pack);
    const ratingEl = $("[data-you-rating]");
    const countEl = $("[data-you-count]");
    const stats = { rating: 4.2, count: 37 };
    const render = () => {
      ratingEl.textContent = stats.rating.toFixed(1);
      countEl.textContent = Math.round(stats.count);
    };

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6 });
    tl.fromTo(pack, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 0)
      .fromTo(you, { "--r": 3 }, { "--r": 3, duration: 0.01 }, 0)
      .fromTo(rivals, { "--r": (i) => i }, { "--r": (i) => i, duration: 0.01 }, 0)
      .fromTo('[data-toast="b"]', { autoAlpha: 0, y: 14, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(2)" }, 0.5)
      .fromTo(stats, { rating: 4.2, count: 37 }, { rating: 4.9, count: 126, duration: 2.6, ease: "power2.inOut", onUpdate: render }, 0.9)
      .fromTo('[data-toast="a"]', { autoAlpha: 0, y: 14, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(2)" }, 2.1)
      .to(you, { "--r": 0, duration: 1.2, ease: "power3.inOut" }, 3.6)
      .to(rivals, { "--r": (i) => i + 1, duration: 1.2, ease: "power3.inOut", stagger: 0.05 }, 3.6)
      .fromTo(you, { scale: 1 }, { scale: 1.035, duration: 0.3, yoyo: true, repeat: 1, ease: "power1.inOut" }, 4.8)
      .to("[data-toast]", { autoAlpha: 0, y: -10, duration: 0.4, stagger: 0.1 }, 7.2)
      .to(pack, { autoAlpha: 0, duration: 0.4 }, 7.8);
  }

  function heroParallax() {
    const st = { trigger: ".hero", start: "top top", end: "bottom top", scrub: true };
    gsap.to(".hero__device", { yPercent: -10, ease: "none", scrollTrigger: st });
    gsap.to(".hero__copy", { yPercent: 8, autoAlpha: 0.2, ease: "none", scrollTrigger: st });
    gsap.to(".hero__glow", { yPercent: 30, scale: 1.2, ease: "none", scrollTrigger: st });
  }

  /* ---------------- Reveals ---------------- */
  function headlineReveals() {
    $$(".h2[data-reveal], .pledge__title[data-reveal], .ledger__punch[data-reveal]").forEach((el) => {
      el.removeAttribute("data-reveal");
      SplitText.create(el, {
        type: "lines", mask: "lines", autoSplit: true,
        onSplit: (self) => gsap.from(self.lines, {
          yPercent: 110, duration: 1.1, stagger: 0.1, ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 86%", once: true },
        }),
      });
    });
  }

  function simpleReveals() {
    $$("[data-reveal]").forEach((el) => {
      gsap.from(el, {
        y: 36, autoAlpha: 0, duration: 1, ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    });
  }

  function cardBatches() {
    gsap.set("[data-card]", { y: 60, autoAlpha: 0 });
    ScrollTrigger.batch("[data-card]", {
      start: "top 88%", once: true,
      onEnter: (batch) => gsap.to(batch, { y: 0, autoAlpha: 1, duration: 1.1, stagger: 0.12, ease: "expo.out" }),
    });
  }

  /* ---------------- Ledger: the lead bill ---------------- */
  function setBooked(n) {
    $("[data-booked]").textContent = n;
    $("[data-booked-label]").textContent = n === 1 ? "job" : "jobs";
  }

  function ledger() {
    const rows = $$("[data-ledger] .row");
    const meterEl = $("[data-meter]");
    const meter = { v: 0 };
    let total = 0;
    let booked = 0;
    const tweenMeter = () => gsap.to(meter, {
      v: total, duration: 0.9, ease: "power2.out", overwrite: true,
      onUpdate: () => { meterEl.textContent = money(meter.v); },
    });

    gsap.set(rows, { autoAlpha: 0, x: 60 });
    rows.forEach((row) => {
      const cost = Number(row.dataset.cost);
      const good = row.hasAttribute("data-good");
      ScrollTrigger.create({
        trigger: row, start: "top 78%",
        onEnter: () => {
          gsap.to(row, { autoAlpha: 1, x: 0, duration: 0.8, ease: "expo.out" });
          total += cost; if (good) booked += 1;
          setBooked(booked); tweenMeter();
        },
        onLeaveBack: () => {
          gsap.to(row, { autoAlpha: 0, x: 60, duration: 0.4, ease: "power2.in" });
          total -= cost; if (good) booked -= 1;
          setBooked(booked); tweenMeter();
        },
      });
    });
  }

  function showStaticLedger() {
    const rows = $$("[data-ledger] .row");
    const total = rows.reduce((s, r) => s + Number(r.dataset.cost), 0);
    $("[data-meter]").textContent = money(total);
    setBooked(rows.filter((r) => r.hasAttribute("data-good")).length);
    $$("[data-star-fill] svg").forEach((s) => (s.style.fill = "#FFB020"));
  }

  /* ---------------- Stars fill in ---------------- */
  function starFill() {
    gsap.fromTo("[data-star-fill] svg",
      { fill: "#2A3450", scale: 0.85 },
      {
        fill: "#FFB020", scale: 1, stagger: 0.2, ease: "back.out(3)",
        scrollTrigger: { trigger: ".silent", start: "top 75%", end: "top 20%", scrub: 0.6 },
      });
  }

  /* ---------------- Compounding chart ---------------- */
  function chartDraw() {
    const st = { trigger: "[data-chart]", start: "top 80%", end: "bottom 55%", scrub: 0.8 };
    $$("[data-chart] [data-draw]").forEach((path) => {
      const len = path.getTotalLength();
      gsap.fromTo(path, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, ease: "none", scrollTrigger: st });
    });
    gsap.fromTo("[data-dot]", { scale: 0, transformOrigin: "50% 50%" }, {
      scale: 1, ease: "back.out(3)",
      scrollTrigger: { trigger: "[data-chart]", start: "bottom 58%", end: "bottom 50%", scrub: true },
    });
  }

  /* ---------------- How it works: horizontal slide ---------------- */
  function howSlider() {
    const pin = $("[data-how-pin]");
    const track = $("[data-how-track]");
    const bar = $("[data-how-bar]");
    const mm = gsap.matchMedia();

    mm.add("(min-width: 901px)", () => {
      const dist = () => Math.max(0, track.scrollWidth - root.clientWidth);
      const slide = gsap.to(track, {
        x: () => -dist(), ease: "none",
        scrollTrigger: {
          trigger: pin, start: "top top", end: () => "+=" + dist(),
          pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
        },
      });
      gsap.fromTo(bar, { scaleX: 0 }, {
        scaleX: 1, ease: "none",
        scrollTrigger: { trigger: pin, start: "top top", end: () => "+=" + dist(), scrub: true, invalidateOnRefresh: true },
      });
      $$(".slide", track).forEach((s) => {
        const mock = $(".mock", s);
        gsap.from([s.querySelector("h3"), s.querySelector("p")], {
          y: 30, autoAlpha: 0, stagger: 0.08, duration: 0.8, ease: "expo.out",
          scrollTrigger: { trigger: s, containerAnimation: slide, start: "left 88%" },
        });
        if (mock) gsap.from(mock, {
          y: 50, rotate: 2, autoAlpha: 0, duration: 1, ease: "expo.out",
          scrollTrigger: { trigger: s, containerAnimation: slide, start: "left 80%" },
        });
      });
    });

    mm.add("(max-width: 900px)", () => {
      const onScroll = () => {
        const max = track.scrollWidth - track.clientWidth;
        bar.style.transform = `scaleX(${max > 0 ? track.scrollLeft / max : 0})`;
      };
      track.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      return () => track.removeEventListener("scroll", onScroll);
    });
  }

  /* ---------------- 1-star reply demo ---------------- */
  function replyDemo() {
    const convo = $("[data-convo]");
    const steps = $$("[data-step]", convo);
    const typed = $("[data-type]", convo);
    const full = typed.textContent.trim();

    gsap.set(steps, { autoAlpha: 0, y: 24 });
    const caret = document.createElement("span");
    caret.className = "caret";

    const tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
    tl.to(steps[0], { autoAlpha: 1, y: 0, duration: 0.8 })
      .to(steps[1], { autoAlpha: 1, y: 0, duration: 0.6 }, "+=0.5")
      .to(steps[2], { autoAlpha: 1, y: 0, duration: 0.6 }, "+=0.5")
      .call(() => {
        typed.style.minHeight = typed.offsetHeight + "px"; // hold the space while typing
        typed.textContent = "";
        typed.append(caret);
      })
      .to({ p: 0 }, {
        p: 1, duration: full.length * 0.018, ease: "none",
        onUpdate() {
          typed.textContent = full.slice(0, Math.round(this.targets()[0].p * full.length));
          typed.append(caret);
        },
      })
      .call(() => caret.remove())
      .to(steps[3], { autoAlpha: 1, y: 0, duration: 0.6 }, "+=0.2");

    ScrollTrigger.create({ trigger: convo, start: "top 65%", once: true, onEnter: () => tl.play() });
  }

  /* ---------------- Magnetic primary buttons ---------------- */
  function magneticButtons() {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    $$(".btn--gold").forEach((btn) => {
      const xTo = gsap.quickTo(btn, "x", { duration: 0.5, ease: "power3" });
      const yTo = gsap.quickTo(btn, "y", { duration: 0.5, ease: "power3" });
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.18);
        yTo((e.clientY - r.top - r.height / 2) * 0.3);
      });
      btn.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
    });
  }

  /* ---------------- Audit form ---------------- */
  function initForm() {
    const form = $("[data-audit-form]");
    if (!form) return;
    const errEl = $("[data-form-error]", form);
    const submit = $("[data-submit]", form);
    const done = $("[data-form-done]");
    const submitHTML = submit.innerHTML;

    form.addEventListener("input", (e) => {
      if (e.target.getAttribute("aria-invalid") === "true" && e.target.checkValidity()) {
        e.target.removeAttribute("aria-invalid");
      }
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      errEl.textContent = "";
      const fields = $$("input[required], select[required]", form);
      const bad = fields.filter((f) => !f.value.trim() || !f.checkValidity());
      fields.forEach((f) => (bad.includes(f) ? f.setAttribute("aria-invalid", "true") : f.removeAttribute("aria-invalid")));
      if (bad.length) {
        errEl.textContent = "Please fill in the highlighted fields.";
        bad[0].focus();
        return;
      }

      submit.disabled = true;
      submit.textContent = "Sending…";
      try {
        const res = await fetch("/api/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(new FormData(form))),
        });
        if (!res.ok) throw new Error(String(res.status));
        form.hidden = true;
        done.hidden = false;
        if (window.gsap && !reduceMotion) gsap.from(done, { y: 20, autoAlpha: 0, duration: 0.8, ease: "expo.out" });
      } catch {
        errEl.textContent = "Something went wrong sending your request. Please try again in a minute.";
        submit.disabled = false;
        submit.innerHTML = submitHTML;
      }
    });
  }
})();
