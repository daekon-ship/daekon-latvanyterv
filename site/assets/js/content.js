/* ==========================================================================
   Tartalom — kizárólag a daekon.hu valós adatai (ellenőrizve: 2026. 10. 17.).
   Nincs kitalált ügyfél, vélemény, szám vagy ár. Szerkesztéskor csak innen.
   ========================================================================== */
window.DAEKON = {
  /* Rajzjegyzék: a daekon.hu „Munkáim” listája (a KIOSZ külön, Lap 02).
     drawing = a drawings.js részletrajzának kulcsa. */
  projects: [
    {
      name: "Mesegombolyag", client: "Tóth Johanna", sector: "Terápia · foglalási rendszer",
      built: ["Program- és eseménykezelés", "Foglalási rendszer (indulás előtt)", "Egyedi adminfelület"],
      url: "https://mesegombolyag.hu/", domain: "mesegombolyag.hu", drawing: "calendar",
      status: "A foglalás indulás előtt",
    },
    {
      name: "Nefelejcs Vendégház", client: "Bakonybél", sector: "Szállás · vendégház",
      built: ["Szállásbemutató oldal", "Képgaléria", "Telefonos foglalás"],
      url: "https://nefelejcsbakonybel.hu/", domain: "nefelejcsbakonybel.hu", drawing: "guesthouse",
    },
    {
      name: "Diesel Motor Javítás", sector: "Szerviz · dízelmotor",
      built: ["Egyedi szervizweboldal", "Hibabejelentés", "Mobilos gyorshívás"],
      url: "https://dieselmotorjavitas.hu/", domain: "dieselmotorjavitas.hu", drawing: "service",
    },
    {
      name: "K.T BYGG Hungary Kft.", client: "epuletesmedence.hu", sector: "Építőipar · medence",
      built: ["Előtte–utána csúszka", "Fázisos galéria", "Kattintható hívás"],
      url: "https://epuletesmedence.hu/", domain: "epuletesmedence.hu", drawing: "slider",
    },
    {
      name: "Kurtán Károly — Tetőjavító Mester", sector: "Építőipar · tető",
      built: ["Szolgáltatások", "Referenciák", "Felmérés kérése"],
      url: "https://tetojavitomester.hu/", domain: "tetojavitomester.hu", drawing: "roof",
    },
    {
      name: "Lapozunk!", client: "Selyem Róbert", sector: "Építőipar · burkolás",
      built: ["Anyagminta-lapozó", "Galéria", "Kattintható hívás"],
      url: "https://lapozunk.hu/", domain: "lapozunk.hu", drawing: "swatches",
    },
    {
      name: "GT-Lakásfelújítás", sector: "Építőipar · felújítás",
      built: ["Szolgáltatások", "Munkafolyamat", "Működési terület"],
      url: "https://gt-lakasfelujitas.hu/", domain: "gt-lakasfelujitas.hu", drawing: "steps",
    },
    {
      name: "Rovarirtófiúk", sector: "Szolgáltatás · kártevőirtás",
      built: ["Szolgáltatások", "GYIK", "Kapcsolat"],
      url: "https://rovarirtofiuk.hu/", domain: "rovarirtofiuk.hu", drawing: "faq",
    },
  ],

  /* A daekon.hu-n olvasható 6 Facebook-ajánlás, szó szerint (7-ből). */
  reviewsUrl: "https://www.facebook.com/profile.php?id=61593734641713&sk=reviews",
  reviews: [
    { name: "Liszkai Rebeka", date: "2026. október", text: "Nagyon jó munkát végzett és tényleg odafigyel minden apróságra. Látom, mennyi időt és energiát fektet bele, hogy minden a lehető legjobban sikerüljön." },
    { name: "András Vilimszky", date: "2026. október", text: "100%-os elégedettség, tökéletesre csiszolta minden elvárásomat a honlapommal kapcsolatban. Csak ajánlani tudom!" },
    { name: "Jenőné Kocsis", date: "2026. október", text: "Roland nagyon kedves, segítőkész volt. A honlapot nagyon hamar elkészítette, és a szükséges változtatásokat is gyorsan megcsinálta. Ajánlom mindenkinek, ha gyorsan igényes honlapot szeretne." },
    { name: "Bense Boglárka", date: "2026. október", text: "Roland nagyon kedves és türelmes volt, minden kérést maximalistán megoldott." },
    { name: "Róbert Selyem", date: "2026. október", text: "Nagyon korrekt, meg bízható és kommunikatív! Csak ajánlani tudom mindenkinek!" },
    { name: "András Halász", date: "2026. október 8.", text: "Nagyon elégedett vagyok az elkészült weboldallal. Gyorsan elkészült, minden úgy lett megcsinálva, ahogy kértem, sőt még jobb is lett, mint amire számítottam. A módosításokkal sem volt semmi probléma. Csak ajánlani tudom!" },
  ],

  /* Ajánlatkérő — az élő daekon.hu űrlapjának opciói, változatlanul. */
  quote: {
    type: ["Weboldal", "Webshop", "Mobilalkalmazás", "Rendelési rendszer", "Foglalási rendszer", "Belső / admin rendszer", "Egyéb"],
    features: [
      { group: "Alap", items: ["Reszponzív design", "SEO alapok", "Blog / hírek", "Galéria", "Kapcsolati űrlap", "Google Térkép", "Többnyelvűség", "GDPR / süti sáv", "Animációk"] },
      { group: "Értékesítés", items: ["Webshop", "Online fizetés", "Kuponok, akciók", "Automatikus számlázás", "Szállítás (GLS, Foxpost)", "Készletkezelés", "Hírlevél"] },
      { group: "Rendszer", items: ["Online rendelés", "Foglalási naptár", "Admin felület", "Felhasználói fiókok", "E-mail / SMS értesítések", "Statisztikák", "Külső rendszer (API)", "Mobil app", "PWA (telepíthető web)"] },
      { group: "Szolgáltatás", items: ["Logó / arculat", "Szövegírás", "Fotók, képek", "Domain + tárhely", "Karbantartás", "Google Ads / közösségi"] },
    ],
    deadline: ["Sürgős (< 1 hó)", "1–2 hónap", "3+ hónap", "Rugalmas"],
    email: "hello@daekon.hu",
  },
};
