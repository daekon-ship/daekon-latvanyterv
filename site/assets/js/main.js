/* ==========================================================================
   DAEKON — „Tervlap” látványterv · interakciók és mozgás
   Függőség: GSAP 3.12 + ScrollTrigger (assets/vendor). Ha hiányzik vagy
   csökkentett mozgás van beállítva, minden végállapotban, statikusan látszik.
   Felülírás: ?mozgas=1 (mozgás bekapcsolása) · ?mozgas=0 (kikapcsolása).
   ========================================================================== */
(function () {
  const doc = document.documentElement;
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [...r.querySelectorAll(s)];
  const param = new URLSearchParams(location.search).get("mozgas");
  const reduce = param === "1" ? false : param === "0" ? true : matchMedia("(prefers-reduced-motion: reduce)").matches;
  const G = window.gsap, ST = window.ScrollTrigger;
  const motion = !reduce && !!G && !!ST;
  const mqDesk = matchMedia("(min-width: 961px)");
  const C = window.DAEKON;
  if (motion) G.registerPlugin(ST);
  doc.classList.toggle("has-motion", motion);

  /* ---------- vonal-kirajzolás segéd ---------- */
  function prepDraw(els) {
    els.forEach((el) => {
      let len = 0;
      try { len = el.getTotalLength(); } catch (_) { len = 0; }
      if (!len) return;
      el.style.strokeDasharray = `${len} ${len}`;
      el.style.strokeDashoffset = String(len);
      el.dataset.len = String(len);
    });
  }
  function drawIn(els, dur = 0.9, stagger = 0.03, delay = 0) {
    if (!motion) return;
    prepDraw(els);
    return G.to(els, { strokeDashoffset: 0, duration: dur, ease: "power2.inOut", stagger, delay,
      onComplete: () => els.forEach((e) => { e.style.strokeDasharray = ""; e.style.strokeDashoffset = ""; }) });
  }

  /* ---------- címek szavakra bontása ---------- */
  qsa("[data-split]").forEach((h) => {
    const text = h.textContent.replace(/\s+/g, " ").trim();
    h.setAttribute("aria-label", text);
    h.innerHTML = h.innerHTML.split(/ (?![^<]*>)/).map((w) => `<span class="split-w" aria-hidden="true"><span>${w}</span></span>`).join(" ");
  });

  /* ---------- fejléc: mobil menü ---------- */
  const menuBtn = qs(".menu-btn"), mnav = qs("#mnav"), dock = qs(".dock");
  function setMenu(open) {
    menuBtn.setAttribute("aria-expanded", String(open));
    mnav.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
    dock.classList.toggle("is-hidden", open);
  }
  menuBtn.addEventListener("click", () => setMenu(menuBtn.getAttribute("aria-expanded") !== "true"));
  mnav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !mnav.hidden) { setMenu(false); menuBtn.focus(); } });

  /* ---------- lapszám-jelző + aktív menüpont ---------- */
  const sheets = qsa("[data-sheet]");
  const noEls = qsa("[data-sheet-no]"), nameEls = qsa("[data-sheet-name]").filter((e) => !e.matches("section"));
  const navLinks = qsa(".nav a");
  const visible = new Map();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => visible.set(en.target, en.intersectionRatio));
    let best = null, bestR = -1;
    sheets.forEach((s) => { const r = visible.get(s) || 0; if (r > bestR) { bestR = r; best = s; } });
    if (!best) return;
    noEls.forEach((e) => (e.textContent = best.dataset.sheet));
    nameEls.forEach((e) => (e.textContent = best.dataset.sheetName));
    navLinks.forEach((a) => a.setAttribute("aria-current", String(a.getAttribute("href") === "#" + best.id)));
  }, { threshold: [0, 0.15, 0.3, 0.5, 0.7, 1], rootMargin: "-64px 0px -30% 0px" });
  sheets.forEach((s) => io.observe(s));

  /* mobil dokk: az űrlapnál elrejtjük, hogy ne takarjon és ne duplázza a CTA-t */
  const form = qs("#ajanlat");
  new IntersectionObserver(([en]) => dock.classList.toggle("is-hidden", en.isIntersecting), { threshold: 0.05 }).observe(form);

  /* ==================== LAP 01 · HERO RAJZ ==================== */
  const draw = qs("[data-draw]");
  const svg = qs(".draw__svg", draw);
  const stemWipe = qs(".stem-wipe", svg), bowlWipe = qs(".bowl-wipe", svg);

  function heroIntro() {
    const guides = qsa(".d-guides path, .d-circles circle", svg);
    const dims = qsa(".d-dims .dim", svg);
    const words = qsa(".hero [data-split] .split-w > span");
    G.set(".d-grid", { opacity: 0 });
    G.set(words, { yPercent: 105 });
    G.set([".hero__lead", ".hero__cta", ".hero__facts"], { opacity: 0, y: 14 });
    G.set(dims, { opacity: 0 });
    G.set(".d-centers", { opacity: 0 });
    stemWipe.setAttribute("y", "200"); stemWipe.setAttribute("height", "0");
    bowlWipe.setAttribute("width", "0"); bowlWipe.setAttribute("x", "77");
    prepDraw(guides);
    doc.classList.remove("intro-pending");

    const tl = G.timeline({ defaults: { ease: "power3.out" } });
    tl.to(words, { yPercent: 0, duration: 0.9, stagger: 0.06 }, 0.1)
      .to(".hero__lead", { opacity: 1, y: 0, duration: 0.7 }, 0.45)
      .to(".hero__cta", { opacity: 1, y: 0, duration: 0.7 }, 0.6)
      .to(".hero__facts", { opacity: 1, y: 0, duration: 0.7 }, 0.75)
      .to(".d-grid", { opacity: 1, duration: 0.6, ease: "none" }, 0)
      .to(guides, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut", stagger: 0.04 }, 0.15)
      .to(".d-centers", { opacity: 1, duration: 0.3 }, 0.9)
      .to(stemWipe, { attr: { y: 0, height: 200 }, duration: 0.8, ease: "power3.inOut" }, 1.0)
      .to(bowlWipe, { attr: { width: 123 }, duration: 0.9, ease: "power3.inOut" }, 1.2)
      .to(dims, { opacity: 1, duration: 0.4, stagger: 0.08 }, 1.6)
      .add(() => guides.forEach((e) => { e.style.strokeDasharray = ""; e.style.strokeDashoffset = ""; }));
    return tl;
  }

  /* CAD-célkereszt illesztési pontokkal */
  const XS = [16, 50, 71, 77, 110, 142, 176], YS = [10, 44, 76, 124, 156, 190];
  const snaps = [];
  XS.forEach((x) => YS.forEach((y) => snaps.push([x, y])));
  const cH = qs(".d-cursor__h", svg), cV = qs(".d-cursor__v", svg), cSnap = qs(".d-cursor__snap", svg);
  const rX = qs("[data-x]", draw), rY = qs("[data-y]", draw), rS = qs("[data-snap]", draw);
  function track(cx, cy) {
    const m = svg.getScreenCTM(); if (!m) return;
    const p = new DOMPoint(cx, cy).matrixTransform(m.inverse());
    let x = p.x, y = p.y, snapped = null, bd = 7;
    snaps.forEach(([sx, sy]) => { const d = Math.hypot(sx - x, sy - y); if (d < bd) { bd = d; snapped = [sx, sy]; } });
    if (snapped) [x, y] = snapped;
    cH.setAttribute("transform", `translate(0 ${y})`);
    cV.setAttribute("transform", `translate(${x} 0)`);
    cSnap.setAttribute("transform", `translate(${x} ${y})`);
    draw.classList.add("is-tracking");
    draw.classList.toggle("is-snapped", !!snapped);
    rX.textContent = "x " + x.toFixed(snapped ? 0 : 1);
    rY.textContent = "y " + y.toFixed(snapped ? 0 : 1);
    rS.textContent = snapped ? "illesztés: metszéspont" : "illesztés: —";
  }
  draw.addEventListener("pointermove", (e) => { if (e.pointerType === "mouse" && !draw.classList.contains("is-exploded")) track(e.clientX, e.clientY); });
  draw.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") track(e.clientX, e.clientY); });
  draw.addEventListener("pointerleave", () => draw.classList.remove("is-tracking", "is-snapped"));

  /* görgetésre a rajz izometrikus nézetbe dől és a jel két része szétnyílik */
  function heroExplode() {
    const tl = G.timeline({ scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 15%", scrub: 0.6,
      onUpdate: (s) => draw.classList.toggle("is-exploded", s.progress > 0.05) } });
    tl.to(".hero__draw", { rotateX: 42, rotateY: -14, rotateZ: 4, scale: 0.9, y: -30, transformOrigin: "50% 70%", ease: "none" }, 0)
      .to('[data-part="stem"]', { x: -14, ease: "none" }, 0)
      .to('[data-part="bowl"]', { x: 14, ease: "none" }, 0)
      .to(".d-dims", { opacity: 0, ease: "none", duration: 0.4 }, 0)
      .to(".d-grid", { opacity: 0.35, ease: "none" }, 0);
  }

  /* ==================== LAP 02 · KIOSZ RÉTEGEK ==================== */
  const iso = qs("[data-iso]");
  const planes = qsa(".plane", iso);
  const tabs = qsa(".layers [role=tab]");
  const panels = qsa(".layer-panel");
  iso.classList.add("is-js");
  let layer = -1, sysST = null;
  function setLayer(i, fromScroll) {
    if (i === layer) return;
    layer = i;
    tabs.forEach((t, k) => { t.setAttribute("aria-selected", String(k === i)); t.tabIndex = k === i ? 0 : -1; });
    panels.forEach((p, k) => { p.hidden = k !== i; p.classList.toggle("is-on", k === i); });
    planes.forEach((p) => p.classList.toggle("is-on", +p.dataset.plane === i));
    if (motion) {
      G.fromTo(panels[i], { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" });
      planes.forEach((p) => {
        const k = +p.dataset.plane;
        // a fölötte lévő rétegek felemelkednek és áttetszővé válnak — „lehántott” robbantott nézet
        const above = k < i;
        G.to(p, { "--lift": above ? "120px" : k === i ? "24px" : "0px", opacity: above ? 0.1 : 1, duration: 0.7, ease: "power3.out" });
      });
    }
    if (!fromScroll && sysST) {
      const y = sysST.start + ((i + 0.5) / 4) * (sysST.end - sysST.start);
      scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
    }
  }
  tabs.forEach((t, k) => {
    t.addEventListener("click", () => setLayer(k, false));
    t.addEventListener("keydown", (e) => {
      const d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
      if (!d) return; e.preventDefault();
      const n = (k + d + tabs.length) % tabs.length; tabs[n].focus(); setLayer(n, false);
    });
  });
  setLayer(0, true);

  function systemScroll() {
    // rétegek összecsukott állapotból nyílnak szét, ahogy a lap beér
    G.fromTo(iso, { "--gap": "14px", "--rz": "-28deg" }, { "--gap": getComputedStyle(iso).getPropertyValue("--gap").trim() || "74px", "--rz": "-38deg", ease: "none",
      scrollTrigger: { trigger: ".system", start: "top 85%", end: "top 15%", scrub: 0.6 } });
    if (!mqDesk.matches) return;
    sysST = ST.create({
      trigger: ".system__pin", start: "center center", end: () => "+=" + innerHeight * 2.2, pin: true, pinSpacing: true,
      onUpdate: (s) => setLayer(Math.min(3, Math.floor(s.progress * 4)), true),
    });
  }

  /* ==================== LAP 03 · RAJZJEGYZÉK ==================== */
  const reg = qs("[data-register]");
  const det = { art: qs("[data-detail-art]"), no: qs("[data-detail-no]"), name: qs("[data-detail-name]"), dom: qs("[data-detail-domain]"), link: qs("[data-detail-link]") };
  const pad = (n) => "A-" + String(n + 1).padStart(2, "0");
  C.projects.forEach((p, i) => {
    const row = document.createElement("div");
    row.className = "reg"; row.setAttribute("role", "listitem"); row.dataset.i = i;
    row.innerHTML = `
      <span class="note">${pad(i)}</span>
      <button type="button" class="reg__name" aria-controls="detail-${i}" aria-pressed="false">${p.name}${p.client ? `<small>${p.client}</small>` : ""}</button>
      <span class="reg__sector">${p.sector}${p.status ? `<span class="reg__status">${p.status}</span>` : ""}</span>
      <span class="reg__built">${p.built.join(" · ")}</span>
      <a class="reg__go" href="${p.url}" target="_blank" rel="noopener" aria-label="${p.domain} megnyitása (új lapon)"><svg><use href="#i-out"/></svg></a>
      <div class="reg__inline" id="detail-${i}"></div>`;
    reg.append(row);
  });
  const rows = qsa(".reg", reg);
  let active = -1;
  function selectWork(i) {
    if (i === active) return;
    active = i;
    const p = C.projects[i];
    rows.forEach((r, k) => { r.classList.toggle("is-on", k === i); qs(".reg__name", r).setAttribute("aria-pressed", String(k === i)); qs(".reg__inline", r).innerHTML = ""; });
    const html = window.DRAWINGS.render(p.drawing);
    let target;
    if (mqDesk.matches) {
      det.art.innerHTML = html; target = det.art;
      det.no.textContent = pad(i); det.name.textContent = p.name; det.dom.textContent = p.domain;
      det.link.href = p.url; det.link.setAttribute("aria-label", `${p.domain} megnyitása (új lapon)`);
    } else {
      const box = qs(".reg__inline", rows[i]);
      box.innerHTML = `<div class="detail__art">${html}</div><div class="detail__foot"><p class="note">Részletrajz · sematikus</p><a class="btn btn--line" href="${p.url}" target="_blank" rel="noopener">${p.domain} <svg><use href="#i-out"/></svg></a></div>`;
      target = box;
    }
    const lines = qsa(".ln, .callout", target);
    if (motion) {
      drawIn(lines, 0.8, 0.012);
      G.from(qsa("text, .fill-blue, .fill-wash, image, .callout-dot", target), { opacity: 0, duration: 0.4, stagger: 0.01, delay: 0.25 });
    }
    wireArt(target);
  }
  let hoverT;
  rows.forEach((r, i) => {
    r.addEventListener("click", (e) => { if (!e.target.closest("a, .reg__inline")) selectWork(i); });
    r.addEventListener("mouseenter", () => { if (!mqDesk.matches) return; clearTimeout(hoverT); hoverT = setTimeout(() => selectWork(i), 120); });
  });
  selectWork(0);
  mqDesk.addEventListener("change", () => { const a = active; active = -1; selectWork(a < 0 ? 0 : a); });

  /* rajzok saját interakciói: előtte–utána csúszka, anyagminta-lapozó */
  function wireArt(root) {
    const sl = qs("[data-slider]", root);
    if (sl) {
      const svgEl = sl.ownerSVGElement, clip = qs("[data-after-clip]", sl), handle = qs("[data-drag]", sl);
      const line = qs("[data-handle-line]", sl), knob = qs("[data-handle]", sl), arr = qs("[data-handle-arrows]", sl);
      const X0 = 26, X1 = 294;
      const setX = (x) => {
        x = Math.max(X0 + 4, Math.min(X1 - 4, x));
        clip.setAttribute("x", x); clip.setAttribute("width", X1 - x);
        line.setAttribute("d", `M${x} 38V176`); knob.setAttribute("cx", x);
        arr.setAttribute("transform", `translate(${x - 160} 0)`);
        handle.setAttribute("aria-valuenow", String(Math.round(((x - X0) / (X1 - X0)) * 100)));
      };
      let drag = false;
      const toX = (e) => new DOMPoint(e.clientX, e.clientY).matrixTransform(svgEl.getScreenCTM().inverse()).x;
      sl.addEventListener("pointerdown", (e) => { drag = true; sl.setPointerCapture(e.pointerId); setX(toX(e)); });
      sl.addEventListener("pointermove", (e) => { if (drag) setX(toX(e)); });
      sl.addEventListener("pointerup", () => (drag = false));
      handle.addEventListener("keydown", (e) => {
        const cur = +clip.getAttribute("x");
        if (e.key === "ArrowLeft") { setX(cur - 12); e.preventDefault(); }
        if (e.key === "ArrowRight") { setX(cur + 12); e.preventDefault(); }
      });
      sl.style.touchAction = "pan-y";
      if (motion) G.fromTo({ v: 160 }, { v: 160 }, { v: 110, duration: 0.7, delay: 0.6, yoyo: true, repeat: 1, ease: "power2.inOut", onUpdate() { setX(this.targets()[0].v); } });
    }
    const sw = qs("[data-swatches]", root);
    if (sw) {
      sw.style.cursor = "pointer";
      sw.addEventListener("click", () => {
        const top = sw.lastElementChild; // a legfelső lap
        if (motion) G.fromTo(top, { opacity: 1 }, { opacity: 0, duration: 0.18, onComplete: () => { sw.prepend(top); G.set(top, { opacity: 1 }); restack(); } });
        else { sw.prepend(top); restack(); }
      });
      function restack() {
        qsa(".sw", sw).forEach((g, k) => {
          const i = 3 - k; // a DOM-ban az utolsó van legfelül
          g.setAttribute("transform", `translate(${70 + i * 16} ${50 + i * 6}) rotate(${-8 + i * 4})`);
        });
      }
    }
  }

  /* ==================== LAP 06 · JÓVÁHAGYÁSOK ==================== */
  const slips = qs("[data-slips]");
  C.reviews.forEach((r) => {
    const el = document.createElement("article");
    el.className = "slip";
    el.innerHTML = `
      <div class="slip__top"><span class="note">Jóváhagyás · Facebook</span><span class="note blue">Ajánlja</span></div>
      <blockquote><p>„${r.text}”</p></blockquote>
      <div class="slip__sig"><b>${r.name}</b><span class="note">${r.date}</span>
        <a class="link note" href="${C.reviewsUrl}" target="_blank" rel="noopener">Eredeti értékelés <svg><use href="#i-out"/></svg><span class="sr-only">(új lapon nyílik)</span></a></div>`;
    slips.append(el);
  });

  /* ==================== MOZGÁS: belépések és görgetés ==================== */
  if (!motion) { doc.classList.remove("intro-pending"); return; }

  heroIntro();
  ST.matchMedia({
    "(min-width: 961px)": () => { heroExplode(); },
  });
  systemScroll();

  // címek a többi lapon: szavanként, egyszer
  qsa("section:not(.hero) [data-split]").forEach((h) => {
    const w = qsa(".split-w > span", h);
    G.set(w, { yPercent: 105 });
    ST.create({ trigger: h, start: "top 88%", once: true, onEnter: () => G.to(w, { yPercent: 0, duration: 0.8, stagger: 0.05, ease: "power3.out" }) });
  });
  // lapfejléc vonalzója: balról kirajzolódik
  qsa(".sheet-rule").forEach((r) => {
    G.fromTo(r, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 1.1, ease: "power3.inOut",
      scrollTrigger: { trigger: r, start: "top 90%", once: true } });
  });
  // műszaki leírás tételei
  qsa(".spec__item").forEach((it) => G.from(it, { opacity: 0, y: 18, duration: 0.7, ease: "power2.out", scrollTrigger: { trigger: it, start: "top 90%", once: true } }));
  // jóváhagyó lapok
  G.from(".slip", { opacity: 0, y: 30, duration: 0.8, stagger: 0.08, ease: "power3.out", scrollTrigger: { trigger: ".slips", start: "top 80%", once: true } });
  // revíziótábla sorai
  G.from(".revtable tbody tr", { opacity: 0, x: -16, duration: 0.6, stagger: 0.12, ease: "power2.out", scrollTrigger: { trigger: ".revtable", start: "top 80%", once: true } });

  // ütemterv: a „most” kurzor végigfut a sávokon
  const gantt = qs("[data-gantt]");
  const cursor = qs(".gantt__cursor", gantt);
  const grows = qsa(".gantt__row", gantt);
  G.set(qsa(".gantt__bar", gantt), { scaleX: 0 });
  ST.matchMedia({
    "(min-width: 961px)": () => {
      gantt.classList.add("is-js");
      const geo = () => { const t = qs(".gantt__track", gantt), g = gantt.getBoundingClientRect(), r = t.getBoundingClientRect(); return { x: r.left - g.left, w: r.width }; };
      const st = ST.create({
        trigger: gantt, start: "top 65%", end: "bottom 55%", scrub: true,
        onUpdate: (s) => {
          const { x, w } = geo(); const p = s.progress;
          cursor.style.left = x + p * w + "px";
          grows.forEach((r, i) => {
            const startP = i * 0.18, endP = startP + 0.28;
            const k = Math.max(0, Math.min(1, (p - startP) / (endP - startP)));
            G.set(qs(".gantt__bar", r), { scaleX: k });
            r.classList.toggle("is-on", p >= startP && p < endP + 0.02 || (i === 4 && p >= 0.98));
          });
        },
      });
      return () => { gantt.classList.remove("is-js"); st.kill(); };
    },
    "(max-width: 960px)": () => {
      grows.forEach((r) => ST.create({ trigger: r, start: "top 80%", once: true, onEnter: () => { G.to(qs(".gantt__bar", r), { scaleX: 1, duration: 0.9, ease: "power3.out" }); r.classList.add("is-on"); } }));
    },
  });

  addEventListener("load", () => ST.refresh());
})();
