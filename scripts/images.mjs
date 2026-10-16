// Képoptimalizálás: scripts/src-img → src/assets/img (WebP + AVIF, több szélesség).
// Futtatás: npm run images  (a kész fájlok be vannak commitolva, a build nem igényli)
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const SRC = new URL("./src-img/", import.meta.url).pathname;
const OUT = new URL("../src/assets/img/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const jobs = [
  { in: "kiosz-01.jpg", name: "kiosz-pizza", widths: [640, 1200] },
  { in: "kiosz-02.jpg", name: "kiosz-terem", widths: [640, 1200] },
  { in: "kiosz-03.jpg", name: "kiosz-este", widths: [640, 1200] },
  { in: "kiosz-04.jpg", name: "kiosz-pizzaiolo", widths: [640, 1200] },
  { in: "kiosz-05-margherita.jpg", name: "kiosz-margherita", widths: [480, 900] },
  { in: "kiosz-logo.jpg", name: "kiosz-logo", widths: [300] },
  { in: "terasz.webp", name: "nefelejcs-terasz", widths: [640, 1200] },
  { in: "kert-kilatas.webp", name: "nefelejcs-kert", widths: [640, 1200] },
];

for (const j of jobs) {
  for (const w of j.widths) {
    const base = sharp(join(SRC, j.in)).resize({ width: w, withoutEnlargement: true });
    await base.clone().webp({ quality: 74 }).toFile(join(OUT, `${j.name}-${w}.webp`));
    await base.clone().avif({ quality: 52, effort: 4 }).toFile(join(OUT, `${j.name}-${w}.avif`));
  }
  console.log("kész:", j.name);
}

// Statikus import-térkép (Vite és más bundlerek alatt is működik).
import { readdirSync, writeFileSync } from "node:fs";
const files = readdirSync(OUT).filter((f) => /\.(webp|avif)$/.test(f)).sort();
const id = (f) => "i_" + f.replace(/[^a-z0-9]/gi, "_");
writeFileSync(
  join(OUT, "index.ts"),
  "// Generált fájl — scripts/images.mjs\n" +
    files.map((f) => `import ${id(f)} from "./${f}";`).join("\n") +
    "\n\nexport const IMAGES: Record<string, string> = {\n" +
    files.map((f) => `  "${f}": ${id(f)},`).join("\n") +
    "\n};\n",
);
