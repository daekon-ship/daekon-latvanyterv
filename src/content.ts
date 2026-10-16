/* =========================================================================
   Tartalom — kizárólag valós adatok a daekon.hu-ról (2026. október 16.).
   Nincs kitalált ügyfél, vélemény, statisztika vagy díj.
   ========================================================================= */

export const CONTACT = {
  email: "hello@daekon.hu",
  phone: "+36 30 453 9346",
  phoneHref: "tel:+36304539346",
  place: "Csévharaszt",
  facebook: "https://www.facebook.com/profile.php?id=61593734641713",
  reviews: "https://www.facebook.com/profile.php?id=61593734641713&sk=reviews",
  privacy: "https://daekon.hu/adatkezeles.html",
  imprint: "https://daekon.hu/impresszum.html",
};

export const NAV = [
  { id: "munkak", label: "Munkák" },
  { id: "szolgaltatasok", label: "Szolgáltatások" },
  { id: "rolam", label: "Rólam" },
  { id: "kapcsolat", label: "Kapcsolat" },
];

export const KIOSZ = {
  name: "KIOSZ Pizza Napoletana",
  place: "Monor",
  url: "https://kioszpizza.hu/",
  caseStudy: "https://daekon.hu/referenciak/kiosz-pizza/",
  lead:
    "Saját online rendelési rendszer egy nápolyi pizzériának — külső platform és rendelésenkénti jutalék nélkül.",
  layers: [
    {
      key: "rendeles",
      title: "Online rendelés",
      text:
        "Elvitel és kiszállítás egy helyen. Az árakat és a kiszállítási zónákat a szerver számolja, így a vendég mindig a valós végösszeget látja.",
      tags: ["Elvitel", "Kiszállítás", "Szerveroldali árazás", "Zónák"],
    },
    {
      key: "kovetes",
      title: "Rendelések kezelése",
      text:
        "A rendelés állapota valós időben követhető, a vendégnek nem kell telefonon érdeklődnie, hol tart a pizzája.",
      tags: ["Valós idejű követés", "Állapotok"],
    },
    {
      key: "konyha",
      title: "Konyhai felület",
      text:
        "Külön konyhai nézet riasztással: az új rendelés azonnal megjelenik ott, ahol a pizza készül.",
      tags: ["Konyhai nézet", "Riasztás"],
    },
    {
      key: "admin",
      title: "Egyedi adminisztráció",
      text:
        "Saját adminfelület a rendelésekhez és az eseményekhez — a pizzéria működéséhez szabva, nem egy dobozos rendszerhez igazítva.",
      tags: ["Admin", "Eseménykezelés"],
    },
    {
      key: "husegprogram",
      title: "Hűségprogram és kuponok",
      text:
        "Vásárlói fiókok, hűségprogram és saját kuponmotor, hogy a visszatérő vendégek a saját rendszerben rendeljenek újra.",
      tags: ["Vásárlói fiók", "Hűségprogram", "Kuponmotor"],
    },
  ],
  note: "Az asztalfoglalási modul jelenleg szünetel.",
};

export interface Project {
  name: string;
  client?: string;
  sector: string;
  url: string;
  domain: string;
  summary: string;
  built: string[];
  status?: string;
  image?: { base: string; alt: string };
}

export const PROJECTS: Project[] = [
  {
    name: "Mesegombolyag",
    client: "Tóth Johanna",
    sector: "Terápia · foglalási rendszer",
    url: "https://mesegombolyag.hu/",
    domain: "mesegombolyag.hu",
    summary: "Saját foglalás- és programkezelés foglalkozásokhoz, létszámkorláttal.",
    built: ["Foglaláskezelés", "Létszámkorlát", "Mobilbarát admin"],
    status: "A nyilvános online foglalás még nem élő.",
  },
  {
    name: "Nefelejcs Vendégház",
    sector: "Szálláshely · Bakonybél",
    url: "https://nefelejcsbakonybel.hu/",
    domain: "nefelejcsbakonybel.hu",
    summary: "Apartmanbemutató, külön galériaoldal és telefonos foglalás.",
    built: ["Apartmanbemutató", "Galéria", "Telefonos foglalás"],
    image: { base: "nefelejcs-terasz", alt: "A Nefelejcs Vendégház terasza" },
  },
  {
    name: "Diesel Motor Javítás",
    sector: "Dízelmotor-szerviz",
    url: "https://dieselmotorjavitas.hu/",
    domain: "dieselmotorjavitas.hu",
    summary: "Hibabejelentés, egy érintéses hívás és motortípus szerinti felépítés.",
    built: ["Hibabejelentés", "Egy érintéses hívás", "Motortípusok"],
  },
  {
    name: "Épületesmedence",
    client: "K.T BYGG Hungary Kft.",
    sector: "Építőipar · medence",
    url: "https://epuletesmedence.hu/",
    domain: "epuletesmedence.hu",
    summary: "Bemutatkozó weboldal medenceépítéshez.",
    built: ["Weboldal"],
  },
  {
    name: "Tetőjavító Mester",
    client: "Kurtán Károly",
    sector: "Építőipar · tetőjavítás",
    url: "https://tetojavitomester.hu/",
    domain: "tetojavitomester.hu",
    summary: "Bemutatkozó weboldal tetőjavításhoz.",
    built: ["Weboldal"],
  },
  {
    name: "Lapozunk!",
    client: "Selyem Róbert",
    sector: "Építőipar · burkolás",
    url: "https://lapozunk.hu/",
    domain: "lapozunk.hu",
    summary: "Bemutatkozó weboldal burkolási munkákhoz.",
    built: ["Weboldal"],
  },
  {
    name: "GT-Lakásfelújítás",
    sector: "Építőipar · felújítás",
    url: "https://gt-lakasfelujitas.hu/",
    domain: "gt-lakasfelujitas.hu",
    summary: "Bemutatkozó weboldal lakásfelújításhoz.",
    built: ["Weboldal"],
  },
  {
    name: "Rovarirtófiúk",
    sector: "Kártevőirtás",
    url: "https://rovarirtofiuk.hu/",
    domain: "rovarirtofiuk.hu",
    summary: "Bemutatkozó weboldal kártevőirtáshoz.",
    built: ["Weboldal"],
  },
];

export interface Service {
  no: string;
  title: string;
  problem: string;
  solution: string;
  href: string;
}

export const SERVICES: Service[] = [
  {
    no: "01",
    title: "Egyedi weboldalak",
    problem: "A régi vagy sablonos oldal nem hoz érdeklődőt, telefonon nehezen kezelhető.",
    solution:
      "Megtervezem és elkészítem a vállalkozásodra szabott, gyors, mobilon is jól használható weboldalt, ahol egy érintéssel hívhatnak vagy ajánlatot kérhetnek.",
    href: "https://daekon.hu/weboldalkeszites/",
  },
  {
    no: "02",
    title: "Egyedi szoftverfejlesztés",
    problem: "A munkát táblázatokban, papíron és üzenetekben követed, és sok idő megy el rá.",
    solution:
      "Olyan saját webalkalmazást fejlesztek, amely pontosan a te folyamataidat követi, nem fordítva.",
    href: "https://daekon.hu/egyedi-webalkalmazas/",
  },
  {
    no: "03",
    title: "Éttermi rendelési rendszerek",
    problem: "A rendelési platformok minden rendelés után jutalékot vonnak le.",
    solution:
      "Saját online rendelést építek elvitellel, kiszállítással és konyhai nézettel, ahogy a KIOSZ Pizzánál.",
    href: "https://daekon.hu/ettermi-rendelesi-rendszer/",
  },
  {
    no: "04",
    title: "Foglalási rendszerek",
    problem: "Az időpontokat telefonon egyezteted, és könnyen becsúszik egy ütközés.",
    solution:
      "Időpont- és helyfoglalót készítek létszámkorláttal és egyszerű adminnal, hogy a naptárad rendben maradjon.",
    href: "https://daekon.hu/idopontfoglalo-rendszer/",
  },
  {
    no: "05",
    title: "Webáruházak",
    problem: "Szeretnél online is eladni, de nem akarsz egy merev dobozos megoldásba zárva maradni.",
    solution:
      "A termékeidhez és a szállítási módjaidhoz igazított webáruházat fejlesztek.",
    href: "https://daekon.hu/webshop-keszites/",
  },
  {
    no: "06",
    title: "Üzleti automatizálás",
    problem: "Ugyanazokat a lépéseket végzed el kézzel nap mint nap.",
    solution:
      "Automatizálom az ismétlődő feladatokat — értesítéseket, adatátvitelt, kimutatásokat —, így marad időd a munkára.",
    href: "https://daekon.hu/vallalkozasi-automatizalas/",
  },
  {
    no: "07",
    title: "Egyedi adminfelületek",
    problem: "Nem látod egy helyen a rendeléseket, ügyfeleket vagy foglalásokat.",
    solution:
      "Egyedi kezelőfelületet készítek, ahol a tartalmat és az adatokat magad kezelheted, akár telefonról is.",
    href: "https://daekon.hu/egyedi-webalkalmazas/",
  },
];

export interface Review {
  name: string;
  date: string;
  text: string;
}

/** A daekon.hu-n megjelenő, Facebookon ellenőrizhető ajánlások (6 / 7). */
export const REVIEWS: Review[] = [
  {
    name: "Liszkai Rebeka",
    date: "2026. október",
    text:
      "Nagyon jó munkát végzett és tényleg odafigyel minden apróságra. Látom, mennyi időt és energiát fektet bele, hogy minden a lehető legjobban sikerüljön.",
  },
  {
    name: "András Vilimszky",
    date: "2026. október",
    text:
      "100%-os elégedettség, tökéletesre csiszolta minden elvárásomat a honlapommal kapcsolatban. Csak ajánlani tudom!",
  },
  {
    name: "Roland Kovács",
    date: "2026. október",
    text:
      "Nagyon igényes, modern és látványos weboldal! Különösen tetszik a letisztult megjelenés és az apró részletekre fordított figyelem. Az egész oldal profi, átgondolt benyomást kelt. Szerintem érdemes megnézni a munkáikat, szép referenciákat mutatnak be!",
  },
  {
    name: "Jenőné Kocsis",
    date: "2026. október",
    text:
      "Roland nagyon kedves, segítőkész volt. A honlapot nagyon hamar elkészítette, és a szükséges változtatásokat is gyorsan megcsinálta. Ajánlom mindenkinek, ha gyorsan igényes honlapot szeretne.",
  },
  {
    name: "Róbert Selyem",
    date: "2026. október",
    text: "Nagyon korrekt, meg bízható és kommunikatív! Csak ajánlani tudom mindenkinek!",
  },
  {
    name: "András Halász",
    date: "2026. október 8.",
    text:
      "Nagyon elégedett vagyok az elkészült weboldallal. Gyorsan elkészült, minden úgy lett megcsinálva, ahogy kértem, sőt még jobb is lett, mint amire számítottam. A módosításokkal sem volt semmi probléma. Csak ajánlani tudom!",
  },
];

export const PROCESS = [
  {
    title: "Egyeztetés",
    text: "Átbeszéljük az ötletedet, és megnézzük, hol vész el ma idő vagy ügyfél a vállalkozásodban.",
  },
  {
    title: "Tervezés",
    text: "Elkészítem a látványtervet és a működési tervet, hogy a fejlesztés előtt lásd, mit kapsz.",
  },
  {
    title: "Fejlesztés",
    text: "Mérföldkövekben fejlesztek, a haladást menet közben is látod.",
  },
  {
    title: "Tesztelés",
    text: "Telefonon és számítógépen is végigpróbálom a kritikus folyamatokat: rendelést, foglalást, űrlapokat, admint.",
  },
  {
    title: "Élesítés",
    text: "Élesítem a rendszert, és kérésre később is karbantartom, továbbfejlesztem ugyanarra a kódbázisra építve.",
  },
];

export const FAQ = [
  {
    q: "Mennyibe kerül egy weboldal vagy egyedi rendszer?",
    a: "Az ár a terjedelemtől és a funkcióktól függ, ezért nincs fix árlistám. Egy rövid egyeztetés után írásos ajánlatot küldök.",
  },
  {
    q: "Mennyi idő alatt készül el?",
    a: "Ez a projekt méretétől függ. Az ajánlatban mérföldkövekre bontott ütemtervet is kapsz.",
  },
  {
    q: "Kivel fogok egyeztetni?",
    a: "Közvetlenül velem. A DAEKON egyszemélyes vállalkozás: a tervezést, a fejlesztést és az élesítést is én végzem, közvetítő nélkül.",
  },
  {
    q: "Csak a környéken vállalsz munkát?",
    a: "Nem, országosan dolgozom. Online egyeztetünk, a közelben személyesen is.",
  },
  {
    q: "A tartalmat magam is tudom majd kezelni?",
    a: "Igen, ha szükséged van rá. A kezelőfelületet ehhez igazítom.",
  },
  {
    q: "Mi történik az élesítés után?",
    a: "Kérésre folyamatos felügyeletet és karbantartást vállalok, és a későbbi fejlesztések ugyanarra a kódbázisra épülnek.",
  },
];
