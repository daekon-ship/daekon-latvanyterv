/* ==========================================================================
   Ajánlatkérő — az élő daekon.hu űrlap felépítése (5 lépés + összefoglaló).
   A látványtervben NINCS backend: a küldés előre kitöltött e-mailt nyit,
   és nem állítja, hogy az üzenet megérkezett.
   ========================================================================== */
(function () {
  const form = document.querySelector("[data-quote]");
  if (!form || !window.DAEKON) return;
  const Q = window.DAEKON.quote;
  const state = { type: new Set(), features: new Set(), deadline: null };

  const toggle = (label, group) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "tgl"; b.textContent = label;
    b.setAttribute("aria-pressed", "false"); b.dataset.group = group; b.dataset.value = label;
    return b;
  };

  // 03 típus, 05 határidő
  const typeBox = form.querySelector('[data-group="type"]');
  Q.type.forEach((t) => typeBox.append(toggle(t, "type")));
  const dlBox = form.querySelector('[data-group="deadline"]');
  Q.deadline.forEach((t) => dlBox.append(toggle(t, "deadline")));

  // 04 funkciók csoportokban
  const featBox = form.querySelector("[data-features]");
  Q.features.forEach((g) => {
    const wrap = document.createElement("div"); wrap.className = "qfeat__group";
    const h = document.createElement("span"); h.className = "note"; h.textContent = g.group;
    const row = document.createElement("div"); row.className = "toggles";
    g.items.forEach((t) => row.append(toggle(t, "features")));
    wrap.append(h, row); featBox.append(wrap);
  });
  const more = form.querySelector(".qmore");
  more.addEventListener("click", () => {
    const open = more.getAttribute("aria-expanded") !== "true";
    more.setAttribute("aria-expanded", String(open)); featBox.hidden = !open;
  });

  form.addEventListener("click", (e) => {
    const b = e.target.closest(".tgl"); if (!b) return;
    const { group, value } = b.dataset;
    if (group === "deadline") {
      const was = state.deadline === value;
      form.querySelectorAll('.tgl[data-group="deadline"]').forEach((x) => x.setAttribute("aria-pressed", "false"));
      state.deadline = was ? null : value;
      b.setAttribute("aria-pressed", String(!was));
    } else {
      const set = state[group];
      set.has(value) ? set.delete(value) : set.add(value);
      b.setAttribute("aria-pressed", String(set.has(value)));
    }
    summarize();
  });

  const sumEl = (k) => form.querySelector(`[data-sum="${k}"]`);
  const countEl = form.querySelector("[data-sum-count]");
  function summarize() {
    const put = (k, list, empty) => {
      const el = sumEl(k); const has = list.length > 0;
      el.textContent = has ? list.join(", ") : empty; el.classList.toggle("is-set", has);
    };
    put("type", [...state.type], "Még nincs kiválasztva");
    put("features", [...state.features], "Még nincs kiválasztva");
    put("deadline", state.deadline ? [state.deadline] : [], "—");
    const n = state.type.size + state.features.size + (state.deadline ? 1 : 0);
    countEl.textContent = `${n} kiválasztva`;
  }

  const status = form.querySelector("[data-status]");
  const setStatus = (msg, kind) => { status.textContent = msg; status.className = "qsum__status" + (kind ? " is-" + kind : ""); };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = form.elements;
    if (f.company_site.value) return; // csapda-mező: botoknak
    const name = f.name.value.trim(), email = f.email.value.trim();
    const okMail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    f.name.setAttribute("aria-invalid", String(!name));
    f.email.setAttribute("aria-invalid", String(!okMail));
    if (!name || !okMail) { setStatus("Add meg a neved és egy érvényes e-mail-címet.", "err"); (!name ? f.name : f.email).focus(); return; }
    if (!f.consent.checked) { setStatus("Az elküldéshez fogadd el az adatkezelési tájékoztatót.", "err"); f.consent.focus(); return; }

    const lines = [
      `Név: ${name}`, `E-mail: ${email}`,
      f.phone.value ? `Telefon: ${f.phone.value}` : null, f.company.value ? `Cég: ${f.company.value}` : null,
      f.website.value ? `Jelenlegi weboldal: ${f.website.value}` : null, "",
      "A projekt:", f.message.value.trim() || "—", "",
      `Típus: ${[...state.type].join(", ") || "—"}`,
      `Funkciók: ${[...state.features].join(", ") || "—"}`,
      `Határidő: ${state.deadline || "—"}`,
    ].filter((x) => x !== null);
    const body = lines.join("\n");
    const href = `mailto:${Q.email}?subject=${encodeURIComponent("Ajánlatkérés — " + name)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
    setStatus("Megnyitottam az e-mail-programodat a kitöltött levéllel — onnan tudod elküldeni.", "ok");
  });

  summarize();
})();
