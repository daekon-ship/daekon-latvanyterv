# DAEKON 2026 — látványterv-prototípus

Működő, interaktív látványterv a daekon.hu új változatához. **Nem az éles oldal** — a daekon.hu-t és a `daekon-ship/daekon` repót nem módosítja.

**Előnézet:** https://daekon-ship.github.io/daekon-latvanyterv/

## Mi van benne

| Szakasz | Megoldás |
|---|---|
| Hero | Three.js-jelenet: a Split D embléma extrudált, fémes 3D-objektumként érkezik a ködös térből, a márkakönyv vektoraiból épített 3D-s DAEKON-felirat **mögött** halad el, majd elé fordul (valódi mélységpuffer-takarás). A betűk vágósík alól emelkednek (maszkolt alapvonal). Fénycsík a fémen, ritka porszemcsék, amelyek a kurzor elől kitérnek. Egérre finom perspektíva, görgetésre kamera-hátrálás. Kihagyható intro, mobilon és ismételt látogatáskor rövidebb. |
| Kinetikus sáv | „Egyedi fejlesztés. / Valódi rendszerek. / A te vállalkozásodra.” — görgetésre ellentétes irányba csúszó, kigyúló sorok (GSAP ScrollTrigger). |
| KIOSZ Pizza | Asztalon rögzített jelenet: a görgetés lépteti az 5 réteget (rendelés, követés, konyha, admin, hűségprogram), a fotók clip-path-szal váltanak, a sematikus felületkártyák kaszkádban lépnek be. Mobilon érintéssel váltható fülek. |
| Munkák | Asztalon reflektorfényes lista + aktív projekt; mobilon függőleges kártyák. Csak valós referenciák, élő linkkel. |
| Szolgáltatások | 7 sor „a gond → amit csinálok” cserével, állandó sormagassággal. |
| Vélemények | A daekon.hu 6 Facebook-ajánlása szó szerint, 3×2 rácsban, forráslinkkel. |
| Rólam | Egyes szám első személy; a Split D jel szétnyíló varrattal, nagyon lassú háttér-mesh. |
| Folyamat | Görgetésre töltődő idővonal, 5 lépés. |
| GYIK, Kapcsolat | A daekon.hu kérdései; az űrlap előre kitöltött e-mailt nyit (mint az élő oldal), és nem állítja, hogy az üzenet megérkezett. |

**Színállapot:** egyetlen, változatlan paletta (grafit-éj, lila atmoszféra, DAEKON fénykék `#2B50FF`, lime csak jelzésre). A háttér CSS-ből jön, a WebGL-vászon átlátszó → betöltés, hidratálás és intro alatt sincs lila→kék váltás.

**Teljesítmény, hozzáférhetőség:** a Three.js külön, késleltetve töltődő csomag; shader-előfordítás; DPR-korlát; automatikus minőségcsökkentés lassú gépen; renderelés szüneteltetése, ha a hero nem látszik vagy a lap háttérben van; WebGL-kontextusvesztésnél és WebGL nélkül SVG-alapú tartalék nézet (`?nowebgl` paraméterrel kipróbálható); `prefers-reduced-motion`; AVIF/WebP képek több méretben; skip link, fókuszállapotok, ARIA a füleken és lenyitókon.

## Futtatás

```bash
npm install
npm run dev         # fejlesztői szerver
npm run typecheck
npm run lint
npm run build       # → dist/, base: /daekon-latvanyterv/
npx vite preview --port 4173 &
npm run test:e2e    # Playwright (Python): pip install playwright pillow
```

`npm run images` újragenerálja a képeket a `scripts/src-img/` eredetikből (sharp).

## Publikálás

A `main` ágra érkező minden push után a `.github/workflows/pages.yml` lefuttatja a típusellenőrzést, a lintet, a Vite-buildet és a böngészős teszteket, majd a kész `dist/`-et a `gh-pages` ágra teszi. GitHub Pages forrása: **gh-pages ág, gyökér**.

## Források

- Logók, színek: `daekon-ship/daekon` → `brand/svg/` (Split D, kivont Archivo wordmark).
- Betűk: Archivo (változó, OFL) és IBM Plex Mono (OFL), helyben, magyar karakterkészletre szűkítve — `src/assets/fonts/`.
- Fotók: KIOSZ Pizza és Nefelejcs Vendégház saját képei a `daekon-ship/daekon` repóból.
- Tartalom (`src/content.ts`): a daekon.hu 2026. október 16-i szövegei; kitalált ügyfél, vélemény vagy szám nincs.
