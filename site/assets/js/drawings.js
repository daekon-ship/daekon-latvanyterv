/* ==========================================================================
   Részletrajzok — minden referencia jellemző funkciója vonalrajzként.
   viewBox 0 0 320 220. A .ln vonalak rajzolódnak ki (stroke-dashoffset).
   Szándékosan sematikus: nem képernyőkép, nem állít valótlan adatot.
   ========================================================================== */
(function () {
  const callout = (x1, y1, x2, y2, label, anchor = "start") =>
    `<g class="co"><circle class="callout-dot" cx="${x1}" cy="${y1}" r="2.2"/><path class="callout" d="M${x1} ${y1} L${x2} ${y2} H${anchor === "start" ? x2 + 14 : x2 - 14}"/><text class="callout-t" x="${anchor === "start" ? x2 + 18 : x2 - 18}" y="${y2 + 3}" text-anchor="${anchor}">${label}</text></g>`;
  const browser = (x, y, w, h, domain) =>
    `<rect class="ln" x="${x}" y="${y}" width="${w}" height="${h}" rx="2"/><path class="ln" d="M${x} ${y + 14}H${x + w}"/><circle class="ln" cx="${x + 8}" cy="${y + 7}" r="1.6"/><circle class="ln" cx="${x + 14}" cy="${y + 7}" r="1.6"/><text x="${x + 24}" y="${y + 10}">${domain}</text>`;
  const phone = (x, y, w, h) =>
    `<rect class="ln" x="${x}" y="${y}" width="${w}" height="${h}" rx="9"/><path class="ln" d="M${x + w / 2 - 9} ${y + 6}h18"/>`;

  const D = {
    /* Mesegombolyag — program- és eseménynaptár, létszám, foglalás gomb */
    calendar: () => `
      ${browser(18, 14, 228, 186, "mesegombolyag.hu")}
      <text class="t-strong" x="30" y="48">Programok</text>
      ${[0, 1, 2, 3, 4].map((c) => `<text x="${34 + c * 42}" y="66">${["H", "K", "Sze", "Cs", "P"][c]}</text>`).join("")}
      ${[0, 1, 2].map((r) => [0, 1, 2, 3, 4].map((c) => `<rect class="ln" x="${30 + c * 42}" y="${72 + r * 34}" width="38" height="30" rx="1"/>`).join("")).join("")}
      <rect class="fill-wash" x="72" y="72" width="38" height="30"/><path class="ln" d="M76 82h22M76 90h14"/>
      <rect class="fill-wash" x="156" y="106" width="38" height="30"/><path class="ln" d="M160 116h22M160 124h14"/>
      <rect class="fill-blue" x="72" y="178" width="80" height="16" rx="1"/><text class="t-inv" x="82" y="189">Foglalás</text>
      ${callout(110, 87, 262, 62, "esemény")}
      ${callout(194, 121, 262, 112, "létszám-")}
      <text class="callout-t" x="280" y="124">korlát</text>
      ${callout(152, 186, 262, 176, "indulás")}
      <text class="callout-t" x="280" y="188">előtt</text>`,

    /* Nefelejcs — valódi fotó + galéria + telefonos foglalás */
    guesthouse: () => `
      <defs><clipPath id="cp-nef"><rect x="24" y="22" width="150" height="176" rx="1"/></clipPath></defs>
      <image href="assets/img/nefelejcs-terasz-640.webp" x="24" y="22" width="150" height="200" preserveAspectRatio="xMidYMid slice" clip-path="url(#cp-nef)"/>
      <rect class="ln" x="24" y="22" width="150" height="176" rx="1"/>
      ${[0, 1, 2].map((i) => `<rect class="ln" x="${186}" y="${22 + i * 44}" width="54" height="38" rx="1"/><path class="ln-soft" d="M${186} ${22 + i * 44}l54 38M${240} ${22 + i * 44}l-54 38"/>`).join("")}
      <rect class="ln" x="186" y="156" width="54" height="42" rx="1"/>
      <path class="ln" d="M203 170h4l2 5-2 1.5a10 10 0 0 0 5 5l1.5-2 5 2v4a3 3 0 0 1-3 3 17 17 0 0 1-15-15 3 3 0 0 1 3-3.5Z"/>
      ${callout(240, 60, 262, 52, "galéria")}
      ${callout(240, 177, 262, 168, "hívás")}
      <text class="callout-t" x="280" y="180">foglalás</text>
      ${callout(100, 120, 262, 112, "saját fotó")}`,

    /* Diesel Motor Javítás — mobil: egy érintéses hívás + hibabejelentés */
    service: () => `
      ${phone(40, 10, 104, 200)}
      <text class="t-strong" x="52" y="40">Dízelmotor-</text><text class="t-strong" x="52" y="52">javítás</text>
      <rect class="fill-blue" x="52" y="64" width="80" height="22" rx="2"/><text class="t-inv" x="64" y="78">Hívás most</text>
      <text x="52" y="104">Hibabejelentés</text>
      <rect class="ln" x="52" y="110" width="80" height="14" rx="1"/>
      <rect class="ln" x="52" y="130" width="80" height="14" rx="1"/>
      <rect class="ln" x="52" y="150" width="80" height="30" rx="1"/>
      <rect class="ln" x="52" y="186" width="80" height="14" rx="1"/><text x="72" y="196">Küldés</text>
      ${callout(132, 75, 180, 58, "egy érintés: hívás")}
      ${callout(132, 117, 180, 112, "típus, tünet")}
      ${callout(132, 165, 180, 160, "hibaleírás")}`,

    /* K.T BYGG — előtte–utána csúszka (húzható) */
    slider: () => `
      ${browser(14, 12, 292, 196, "epuletesmedence.hu")}
      <g data-slider>
        <rect class="fill-paper" x="26" y="38" width="268" height="138"/>
        <g class="before">
          <path class="ln-soft" d="M26 140 Q 90 120 160 132 T 294 126"/>
          <path class="ln" d="M60 150h70l10-26h-90Z"/><text x="62" y="168">ELŐTTE · üres telek</text>
        </g>
        <g class="after" clip-path="url(#cp-after)">
          <rect class="fill-wash" x="26" y="38" width="268" height="138"/>
          <path class="ln" d="M150 160h120v-28h-120Z"/><path class="ln" d="M150 140h120"/><rect class="fill-blue" x="156" y="142" width="108" height="14" opacity=".55"/>
          <path class="ln" d="M180 132v-30h70v30M178 104l37-24 37 24"/><text x="190" y="72">UTÁNA · medence, épület</text>
        </g>
        <defs><clipPath id="cp-after"><rect data-after-clip x="160" y="38" width="134" height="138"/></clipPath></defs>
        <g data-drag tabindex="0" role="slider" aria-label="Előtte–utána csúszka" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">
          <path class="callout" data-handle-line d="M160 38V176" stroke-width="1.4"/>
          <circle data-handle cx="160" cy="107" r="11" fill="var(--paper-3)" stroke="var(--blue)" stroke-width="1.4"/>
          <path data-handle-arrows d="M155 103l-4 4 4 4M165 103l4 4-4 4" fill="none" stroke="var(--blue)" stroke-width="1.2"/>
        </g>
      </g>
      <text class="callout-t" x="26" y="196">↔ húzd a csúszkát</text>
      <text x="170" y="196">fázisos galéria · kattintható hívás</text>`,

    /* Tetőjavító Mester — tetőprofil + felmérés kérése */
    roof: () => `
      ${browser(14, 12, 292, 196, "tetojavitomester.hu")}
      <path class="ln" d="M40 120 L110 62 L180 120"/><path class="ln" d="M52 110V170H168V110"/>
      <path class="ln-soft" d="M70 98 L110 66 L150 98"/>
      ${[0, 1, 2, 3, 4].map((i) => `<path class="ln-soft" d="M${58 + i * 10} ${113 - i * 8.3}h${104 - i * 20}"/>`).join("")}
      <rect class="ln" x="196" y="52" width="96" height="128" rx="1"/>
      <text class="t-strong" x="206" y="70">Felmérés kérése</text>
      <rect class="ln" x="206" y="80" width="76" height="14" rx="1"/><rect class="ln" x="206" y="100" width="76" height="14" rx="1"/>
      <rect class="ln" x="206" y="120" width="76" height="26" rx="1"/>
      <rect class="fill-blue" x="206" y="154" width="76" height="16" rx="1"/><text class="t-inv" x="220" y="165">Elküldöm</text>
      ${callout(110, 62, 140, 36, "szolgáltatások, referenciák")}`,

    /* Lapozunk! — anyagminta-lapozó (kattintásra lapoz) */
    swatches: () => `
      ${browser(14, 12, 292, 196, "lapozunk.hu")}
      <g data-swatches>
        ${[3, 2, 1, 0].map((i) => `<g class="sw" data-sw="${i}" transform="translate(${70 + i * 16} ${50 + i * 6}) rotate(${-8 + i * 4})">
          <rect x="0" y="0" width="110" height="120" rx="2" fill="var(--paper-3)" stroke="var(--ink)" stroke-width="1.1"/>
          <g>${i % 2 === 0
            ? [0, 1, 2, 3].map((r) => [0, 1, 2].map((c) => `<rect x="${8 + c * 32}" y="${10 + r * 22}" width="28" height="18" fill="none" stroke="var(--ink-3)" stroke-width=".7"/>`).join("")).join("")
            : [0, 1, 2, 3, 4, 5].map((r) => `<path d="M8 ${14 + r * 15}h94" stroke="var(--ink-3)" stroke-width=".7"/>`).join("")}</g>
          <text x="8" y="112">minta ${4 - i}/4</text></g>`).join("")}
      </g>
      <text class="callout-t" x="214" y="80">kattints:</text>
      <text class="callout-t" x="214" y="92">lapozás</text>
      <text x="214" y="150">galéria ·</text><text x="214" y="162">kattintható</text><text x="214" y="174">hívás</text>`,

    /* GT-Lakásfelújítás — munkafolyamat + működési terület */
    steps: () => `
      ${browser(14, 12, 292, 196, "gt-lakasfelujitas.hu")}
      <text class="t-strong" x="28" y="50">Munkafolyamat</text>
      ${[0, 1, 2, 3].map((i) => `<circle class="ln" cx="${44 + i * 46}" cy="78" r="11"/><text x="${41 + i * 46}" y="81">${i + 1}</text>${i < 3 ? `<path class="ln" d="M${55 + i * 46} 78h24"/>` : ""}`).join("")}
      <text class="t-strong" x="28" y="122">Működési terület</text>
      <circle class="fill-wash" cx="100" cy="164" r="34"/><circle class="ln" cx="100" cy="164" r="34"/>
      <circle class="callout-dot" cx="100" cy="164" r="3"/>
      <path class="ln-soft" d="M30 150 Q 70 130 110 150 T 190 140"/><path class="ln-soft" d="M40 190 Q 90 170 150 186 T 200 176"/>
      <text x="218" y="60">szolgáltatások</text>
      ${[0, 1, 2, 3].map((i) => `<path class="ln" d="M218 ${74 + i * 20}h70"/>`).join("")}
      ${callout(134, 164, 218, 164, "terület")}`,

    /* Rovarirtófiúk — szolgáltatások, GYIK, kapcsolat */
    faq: () => `
      ${browser(14, 12, 292, 196, "rovarirtofiuk.hu")}
      <text class="t-strong" x="28" y="50">Gyakori kérdések</text>
      <rect class="ln" x="28" y="60" width="170" height="50" rx="1"/><path class="ln" d="M184 70h8"/>
      ${[116, 144, 172].map((y) => `<rect class="ln" x="28" y="${y}" width="170" height="22" rx="1"/><path class="ln" d="M184 ${y + 11}h8M188 ${y + 7}v8"/>`).join("")}
      <path class="ln-soft" d="M36 80h140M36 90h110M36 100h124"/>
      <rect class="ln" x="214" y="60" width="78" height="120" rx="1"/><text class="t-strong" x="222" y="76">Kapcsolat</text>
      <rect class="ln" x="222" y="84" width="62" height="12"/><rect class="ln" x="222" y="102" width="62" height="12"/>
      <rect class="fill-blue" x="222" y="156" width="62" height="16" rx="1"/><text class="t-inv" x="234" y="167">Hívás</text>
      <text class="callout-t" x="36" y="204">nyitott kérdés · gyors hívás</text>`,
  };

  /* SVG-be csomagolás; a rajzoló animációt a main.js indítja. */
  window.DRAWINGS = {
    render(key) {
      const body = (D[key] || D.faq)();
      return `<svg class="art" viewBox="0 0 320 220" aria-hidden="true" focusable="false">${body}</svg>`;
    },
  };
})();
