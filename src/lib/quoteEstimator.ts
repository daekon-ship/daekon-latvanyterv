/* =========================================================================
   quoteEstimator — a daekon.hu ajánlatkérő asszisztensének becslője
   (átvéve a daekon-ship/daekon repóból, változatlan árakkal).
   honest, keyword-based project estimator.
   Runs entirely in the browser (nothing is sent anywhere): it matches
   feature keywords in the visitor's description and sums realistic HUF
   ranges per feature. Output is an estimate, never a final quote.
   ========================================================================= */

export interface QuoteFeature {
  id: string;
  label: string;
  min: number; // Ft
  max: number; // Ft
  weeksMin: number;
  weeksMax: number;
  recurring?: boolean; // monthly price, not one-off
}

interface CatalogEntry extends QuoteFeature {
  keywords: string[]; // already accent-stripped, lowercase
}

const CATALOG: CatalogEntry[] = [
  {
    id: "web",
    label: "Egyedi weboldal",
    min: 80_000, max: 170_000, weeksMin: 1, weeksMax: 2,
    keywords: ["weboldal", "honlap", "landing", "onepage", "one page", "bemutatkozo", "ceges oldal", "vizitkartya"],
  },
  {
    id: "webshop",
    label: "Webáruház / e-kereskedelem",
    min: 240_000, max: 470_000, weeksMin: 4, weeksMax: 8,
    keywords: ["webshop", "webaruhaz", "e-kereskedelem", "ekereskedelem", "termek", "kosar", "raktar"],
  },
  {
    id: "ordering",
    label: "Rendelési / foglalási rendszer",
    min: 200_000, max: 400_000, weeksMin: 3, weeksMax: 6,
    keywords: ["rendeles", "foglalas", "etterem", "idopont", "asztalfoglalas", "nyomkovetes", "etel", "pincer"],
  },
  {
    id: "app",
    label: "Egyedi app / mobilapp",
    min: 340_000, max: 780_000, weeksMin: 5, weeksMax: 10,
    keywords: ["egyedi app", "mobilapp", "mobil alkalmazas", "ios", "android", "play store", "app store", "sajat app", "alkalmazast"],
  },
  {
    id: "automation",
    label: "Automatizálás / integráció",
    min: 110_000, max: 270_000, weeksMin: 1, weeksMax: 3,
    keywords: ["automatizalas", "automatizalni", "automatikus", "robot", "script", "kuizon kivuli", "n8n", "zapier", "osszekotes", "szamla", "szamlazo", "naptar", "email automata"],
  },
  {
    id: "ai",
    label: "AI-funkció (chatbot, feldolgozás)",
    min: 160_000, max: 400_000, weeksMin: 2, weeksMax: 5,
    keywords: ["ai", "mesterséges intelligencia", "mesterséges", "chatbot", "gpt", "openai", "claude", "kozponti agy", "felismeres", "kép felismeres", "osszefoglalo", "ajanlatgeneralas", "ugyfelszolgalat automata"],
  },
  {
    id: "admin",
    label: "Kezelőfelület / CRM",
    min: 135_000, max: 300_000, weeksMin: 2, weeksMax: 5,
    keywords: ["admin", "kezelofelulet", "tartalomkezeles", "dashboard", "crm", "jogosultsag", "riport"],
  },
  {
    id: "backend",
    label: "Szerveroldal / adatbázis",
    min: 100_000, max: 240_000, weeksMin: 2, weeksMax: 4,
    keywords: ["api", "backend", "szerver", "adatbazis", "integracio", "migracio", "rest", "graphql"],
  },
  {
    id: "auth",
    label: "Belépés / felhasználók",
    min: 55_000, max: 100_000, weeksMin: 1, weeksMax: 2,
    keywords: ["login", "belepes", "regisztracio", "felhasznalo", "profil", "tagok", "szerepkor"],
  },
  {
    id: "payment",
    label: "Online fizetés",
    min: 65_000, max: 135_000, weeksMin: 1, weeksMax: 2,
    keywords: ["fizetes", "bankkartya", "stripe", "paypal", "barion", "otp simple"],
  },
  {
    id: "mobile",
    label: "Mobil / PWA",
    min: 65_000, max: 135_000, weeksMin: 1, weeksMax: 2,
    keywords: ["mobil", "telefon", "pwa", "app", "alkalmazas", "play store", "app store"],
  },
  {
    id: "seo",
    label: "SEO + teljesítmény",
    min: 40_000, max: 80_000, weeksMin: 1, weeksMax: 1,
    keywords: ["seo", "google", "teljesitmeny", "sebesseg", "lighthouse", "core web vitals"],
  },
  {
    id: "design",
    label: "Egyedi látvány / arculat",
    min: 80_000, max: 200_000, weeksMin: 2, weeksMax: 3,
    keywords: ["design", "arculat", "logo", "markazas", "premium", "egyedi megjelenes", "ux", "ui"],
  },
  {
    id: "motion3d",
    label: "3D / egyedi animáció",
    min: 70_000, max: 170_000, weeksMin: 1, weeksMax: 2,
    keywords: ["3d", "animacio", "interaktiv", "kreativ", "efekt", "mozgas", "webgl"],
  },
  {
    id: "blog",
    label: "Blog / tartalomkezelés",
    min: 45_000, max: 95_000, weeksMin: 1, weeksMax: 1,
    keywords: ["blog", "cikk", "hir", "hirlevel", "tartalom"],
  },
  {
    id: "maintenance",
    label: "Karbantartás / üzemeltetés",
    min: 8_000, max: 15_000, weeksMin: 0, weeksMax: 0,
    recurring: true,
    keywords: ["karbantartas", "uzemeltetes", "tamogatas", "frissites", "havi", "rendben tartas"],
  },
];

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export interface QuoteResult {
  features: QuoteFeature[];
  min: number;
  max: number;
  weeksMin: number;
  weeksMax: number;
  recurring?: QuoteFeature;
}

/** Match features against the description; empty input → empty result. */
export function estimate(input: string): QuoteResult {
  const norm = normalize(input);
  if (norm.trim().length === 0) {
    return { features: [], min: 0, max: 0, weeksMin: 0, weeksMax: 0 };
  }
  // rövid kulcsszó (pl. „ai", „3d") csak önálló szóként számít
  const hit = (k: string) =>
    k.length <= 3 ? new RegExp(`(^|[^a-z0-9])${k}([^a-z0-9]|$)`).test(norm) : norm.includes(k);
  const features: QuoteFeature[] = CATALOG.filter((f) => f.keywords.some(hit)).map((entry) => {
    const { keywords: _kw, ...rest } = entry;
    void _kw;
    return rest;
  });

  const oneOff = features.filter((f) => !f.recurring);
  const recurring = features.find((f) => f.recurring);

  const round = (n: number) => Math.round(n / 10_000) * 10_000;
  const min = round(oneOff.reduce((s, f) => s + f.min, 0));
  const max = round(oneOff.reduce((s, f) => s + f.max, 0));
  // some work runs in parallel — the calendar time is less than the sum
  const weeksMin = oneOff.length ? Math.max(...oneOff.map((f) => f.weeksMin)) : 0;
  const weeksMax = oneOff.length
    ? Math.min(20, Math.max(weeksMin + 1, Math.round(oneOff.reduce((s, f) => s + f.weeksMax, 0) * 0.8)))
    : 0;

  return { features, min, max, weeksMin, weeksMax, recurring };
}

/** Look up one catalog feature by id (for quick-add chips). */
export function featureById(id: string): QuoteFeature | undefined {
  const f = CATALOG.find((c) => c.id === id);
  if (!f) return undefined;
  const { keywords: _kw, ...rest } = f;
  void _kw;
  return rest;
}

/** Estimate with user-toggled extra features merged in (dedup by id). */
export function estimateWithExtras(input: string, extraIds: string[]): QuoteResult {
  const base = estimate(input);
  const have = new Set(base.features.map((f) => f.id));
  const extras = extraIds
    .map((id) => featureById(id))
    .filter((f): f is QuoteFeature => !!f && !have.has(f.id));
  if (extras.length === 0) return base;

  const all = [...base.features, ...extras];
  const oneOff = all.filter((f) => !f.recurring);
  const recurring = all.find((f) => f.recurring);
  const round = (n: number) => Math.round(n / 10_000) * 10_000;
  const min = round(oneOff.reduce((s, f) => s + f.min, 0));
  const max = round(oneOff.reduce((s, f) => s + f.max, 0));
  const weeksMin = oneOff.length ? Math.max(...oneOff.map((f) => f.weeksMin)) : 0;
  const weeksMax = oneOff.length
    ? Math.min(20, Math.max(weeksMin + 1, Math.round(oneOff.reduce((s, f) => s + f.weeksMax, 0) * 0.8)))
    : 0;
  return { features: all, min, max, weeksMin, weeksMax, recurring };
}

const fmt = new Intl.NumberFormat("hu-HU");

export function formatFt(n: number): string {
  return fmt.format(n);
}

export function formatWeeks(min: number, max: number): string {
  if (min === 0 && max === 0) return "—";
  if (min === max) return `${min} hét`;
  return `${min}–${max} hét`;
}

/** Pre-filled mail body summarizing the estimate. */
export function mailtoHref(text: string, result: QuoteResult): string {
  const lines = [
    "Szia!",
    "",
    "Szeretnék projektet indítani. Amit elképzelek:",
    "",
    `„${text.trim()}"`,
    "",
  ];
  if (result.features.length) {
    lines.push("Az asszisztens által felismert funkciók:");
    for (const f of result.features) {
      lines.push(`- ${f.label}${f.recurring ? " (havi díjas)" : ""}`);
    }
    lines.push("");
    lines.push(`Becsült ár: ${formatFt(result.min)}–${formatFt(result.max)} Ft`);
    lines.push(`Becsült határidő: ${formatWeeks(result.weeksMin, result.weeksMax)}`);
  }
  lines.push(
    "",
    "(Tudom, hogy ez csak becslés — a végleges árat a részletek egyeztetése után várom.)",
  );
  const subject = encodeURIComponent("Projekt megkeresés — árajánlat");
  const body = encodeURIComponent(lines.join("\n"));
  return `mailto:hello@daekon.hu?subject=${subject}&body=${body}`;
}
