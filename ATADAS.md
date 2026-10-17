# DAEKON „Tervlap” — átadási dokumentáció (Claude Code)

**Előnézet:** https://daekon-ship.github.io/daekon-latvanyterv/
**A három irány és a döntés:** https://daekon-ship.github.io/daekon-latvanyterv/iranyok.html
**Korábbi változat:** `v1-cinematic` ág (React + Three.js, sötét).

Ez a dokumentum a látványterv éles daekon.hu-ba való átültetéséhez készült. A látványterv build nélküli HTML/CSS/JS. Az éles oldal saját keretrendszerébe (SSR, `#ssr-*` szakaszok) komponensenként vihető át.

---

## 1. Koncepció egy mondatban

Az oldal egy **rajzkészlet**: minden szekció egy számozott rajzlap. A DAEKON jel a márkakönyv geometriájából szerkesztődik meg, a munkák rajzjegyzékként jelennek meg, a cégtörténet revíziótáblaként, a lábléc rajzi szövegmezőként.

Az üzenet: *előbb terv, aztán kód — és mindvégig egyetlen ember dolgozik rajta.*

## 2. Fájlszerkezet

```
site/
  index.html            — a teljes oldal, statikus tartalommal (JS nélkül is olvasható)
  iranyok.html          — ügyfélnek szóló koncepcióoldal (3 irány, döntés)
  favicon.svg           — világos változat: tinta szár + #1636E7 ív
  assets/css/base.css   — tokenek, tipó, gombok, lapfejléc
  assets/css/layout.css — fejléc, mobil dokk, hero + rajz
  assets/css/sections.css — Lap 02–09, lábléc
  assets/js/content.js  — MINDEN változó adat (projektek, vélemények, ajánlatkérő opciói)
  assets/js/drawings.js — 8 részletrajz (SVG-sablonok)
  assets/js/quote.js    — ajánlatkérő (5 lépés + összefoglaló)
  assets/js/main.js     — interakciók és mozgás
  assets/vendor/        — GSAP 3.12.5 + ScrollTrigger (helyben)
  assets/fonts/         — Archivo változó (wght 100–900, wdth 62–125) + IBM Plex Mono, OFL
  assets/img/           — KIOSZ és Nefelejcs saját fotói, AVIF + WebP
tests/e2e.py            — Playwright-ellenőrzés (CI is ezt futtatja)
```

## 3. Színtokenek

| Token | Érték | Használat |
|---|---|---|
| `--paper` | `#eeede8` | oldal háttere (meleg-semleges papír) |
| `--paper-2` | `#e6e5df` | rajzmező, fotóhely |
| `--paper-3` | `#f6f5f1` | kártya/űrlapmező, jóváhagyó lap |
| `--ink` | `#14161b` | szöveg, márka tinta (márkakönyv) |
| `--ink-2` | `#464b54` | másodlagos szöveg (7,9:1) |
| `--ink-3` | `#6b707a` | jegyzet, címke (4,6:1) |
| `--line` / `--line-2` | tinta 13% / 28% | hajszálvonalak |
| `--blue` | `#1636e7` | DAEKON kék **világos alapon** (márkakönyv) — CTA, aktív állapot |
| `--blue-ink` | `#0f2ab8` | kék hover |
| `--night` | `#14161b` | sötét lap (Lap 02 KIOSZ) |
| `--blue-night` | `#2b50ff` | DAEKON kék **sötét alapon** (márkakönyv) |

Szabály: egyetlen akcentusszín van, a kék. Színátmenet, lila, lime nincs.

## 4. Tipográfia

- **Archivo** (márkabetű): címek 580-as vastagság, `-0.012em` betűköz. A **címkék** 125%-os szélességűek, nagybetűsek, `0.09em` betűközzel (a márkakönyv plakátjairól).
- **IBM Plex Mono**: rajzi jegyzetek, lapszámok, méretek (12 px).
- Skála, szándékosan mérsékelt:

| Token | Méret |
|---|---|
| h1 | 32 → 46 px |
| h2 | 26 → 36 px |
| h3 | 19 → 22 px |
| lead | 17 → 19 px |
| törzs | 16 px / 1,62 |
| kis szöveg | 14 px |
| címke, jegyzet | 12 px |

  Óriás display-szöveg és óriás lábléc-wordmark nincs.
- Fraunces sehol.

## 5. Térköz és rács

- 4-es alap: `--s-1` … `--s-10` = 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 px.
- 12 hasábos rács, legfeljebb 1360 px széles, `--gutter` 20 → 40 px.
- Lapok közti térköz: `--sheet-pad` 64 → 116 px.
- Fejléc: 64 px. Mobil dokk: 64 px + `safe-area`; a `body` alsó paddingje ezt foglalja le, így a dokk nem takar tartalmat.
- Saroklekerekítés: 2 px — a tervlap szinte szögletes.

## 6. Reszponzív viselkedés

| Töréspont | Viselkedés |
|---|---|
| ≥ 1181 | Teljes fejléc lapszám-jelzővel („Lap 04/09 Szolgáltatások”). |
| 961–1180 | Lapszám-jelző nélkül. Minden 3D és rögzített görgetés aktív. |
| ≤ 960 (tablet, mobil) | Hamburgermenü, alsó dokk (lapszám, hívás, Ajánlatkérés). Nincs rögzített görgetés. KIOSZ: a rétegrajz a fülek fölött, a fülek 2×2-es rácsban. Rajzjegyzék: a részletrajz a kiválasztott sor alatt nyílik. Ütemterv: függőleges. |
| ≤ 640 | A vélemények vízszintesen lapozható sávban (scroll-snap). |
| ≤ 520 | A szövegmező (titleblock) 2×2-es. A koordináta-kijelző rejtett. |

Ellenőrizve 360 / 390 / 430 / 768 / 1024 / 1366 / 1440 / 1920 px-en: nincs vízszintes görgetés, nincs konzolhiba (`tests/e2e.py`).

## 7. Animációs szekvenciák

Minden mozgás kikapcsol `prefers-reduced-motion: reduce` esetén, ilyenkor minden azonnal a végállapotában látszik. Felülírás URL-paraméterrel: `?mozgas=1` / `?mozgas=0`. Ha a GSAP nem tölt be, az oldal statikusan, hiánytalanul működik. A fejben lévő szkript legkésőbb 2,5 s után mindenképp feloldja az intro előtti állapotot.

| # | Mi történik | Kiváltó | Válasz | Átvezetés | Csökkentett mozgás |
|---|---|---|---|---|---|
| 1 | **Hero: a jel megszerkesztése.**<br>Rács beúszik → segédvonalak és szerkesztőkörök kirajzolódnak (`stroke-dashoffset`) → középpontjelek → a szár alulról felfelé, az ív balról jobbra töltődik (`clipPath`) → méretvonalak (55, rés 6, 180, 112, R66, R38).<br>Párhuzamosan a cím szavanként felcsúszik, utána a lead, a CTA és a tényblokk. ~2,2 s | betöltés | — | — | kész rajz |
| 2 | **CAD-célkereszt.** Hajszálkereszt követi az egeret, x/y kijelzés rajzi egységben. 7 egységen belül a szerkesztővonalak metszéspontjára illeszt („illesztés: metszéspont”). | egér (érintésnél koppintás) | valós idejű | görgetéskor kikapcsol | változatlan |
| 3 | **A lap hátradől.** A teljes rajz (szövegmezővel) hátradől (rotateX 42°, rotateY −14°), a szár és az ív 14 egységgel szétnyílik a résnél, a méretek elhalványulnak. | görgetés (scrub), csak ≥ 961 px | a görgetéssel arányos | A hátradőlt lap síkja vezet át a következő lap izometrikus rétegrendjébe. | nincs |
| 4 | **KIOSZ rétegrend nyílása.** A négy sík egymásra csukva érkezik (köz 14 px), majd szétnyílik (86 px), forgás −28° → −38°. | a szakasz beérkezése (scrub) | a görgetéssel arányos | → 5 | nyitott állapot |
| 5 | **Rétegek „lehántása”.** A szakasz rögzül (~2,2 képernyőnyi görgetés), a görgetés lépteti a négy réteget: Weboldal → Online rendelés → Fiók/hűség/kupon → Konyha/admin. Az aktív sík kék keretet kap és 24 px-t emelkedik; a fölötte lévők 120 px-t emelkednek és 10%-ra halványulnak; a szöveg a bal oldalon cserélődik. | görgetés; fülre kattintás | A fül a megfelelő görgetési pontra visz. | A rögzítés feloldásával a sötét lap véget ér, és a papír-lap folytatódik. | fülekkel váltható, azonnal |
| 6 | **Részletrajz kirajzolása.** Sor kiválasztásakor a projekt rajza vonalanként kirajzolódik, a feliratok utána jelennek meg. A csúszka bemutatásként egyszer oda-vissza mozdul. | sorra mutatás (asztali, 120 ms késleltetéssel), kattintás, billentyű | — | — | azonnal |
| 7 | **Rajzokon belüli interakció.** K.T BYGG: húzható előtte–utána csúszka (nyilakkal is). Lapozunk!: kattintásra lapozó anyagminták. | húzás, kattintás, billentyű | valós idejű | — | működik |
| 8 | **Címek szavanként.** | a szakasz 88%-nál | egyszer | — | nincs |
| 9 | **Lapfejléc vonalzója** balról kirajzolódik (`clip-path`). | belépés | egyszer | — | nincs |
| 10 | **Ütemterv „most”-kurzor.** Kék függőleges vonal fut végig a sávokon. A fázissávok a kurzorral nőnek, az aktív fázis kék. A sávok a sorrendet mutatják, nem időtartamot. | görgetés (scrub), asztali; mobilon soronként egyszer | a görgetéssel arányos | — | teljes sávok |
| 11 | **Lapszám-jelző** (fejléc és mobil dokk) a látható lap száma és neve szerint vált. Az aktív menüpont aláhúzott. | IntersectionObserver | valós idejű | — | működik |
| 12 | **Mobil dokk** elrejtése, amikor az ajánlatkérő űrlap látszik vagy a menü nyitva van (ne takarjon, ne duplázza a CTA-t). | IntersectionObserver | 0,35 s csúszás | — | működik |

## 8. Újrahasznosítható komponensek

- `.sheet` + `.sheet-rule` — rajzlap: lapszám, vonalzó, jobb oldali jegyzet.
- `.sheet-head` — 6/5 hasábos cím és lead.
- `.btn`, `.btn--blue`, `.btn--line` — 48 px magas, szögletes. `.link` — aláhúzás, amely hoverre visszahúzódik.
- `.titleblock` — rajzi szövegmező (hero).
- `.cartouche` — lábléc szövegmező.
- `.chip` — mono címke.
- `.reg` + `.detail` — rajzjegyzék sor és részletrajz-panel (`content.js` + `drawings.js`).
- `.iso` + `.plane` — CSS 3D robbantott rétegrend.
  - Változók: `--w`, `--h`, `--gap`, `--rz`, `--lift`.
  - Síkonként `data-plane` (0 a legfelső).
- `.spec` — számozott műszaki leírás tétel (4.1 …).
- `.gantt` — ütemterv sávokkal és mérföldkövekkel.
- `.slip` — jóváhagyó lap (vélemény + aláírássor + forráslink).
- `.revtable` — revíziótábla.
- `.qform` + `.qsum` — ajánlatkérő és tapadó összefoglaló.
- `.tgl` — `aria-pressed` kapcsológomb (44 px).

## 9. Könyvtárak — mi van benne és mi nincs

| Technika | Állapot |
|---|---|
| **GSAP 3.12.5 + ScrollTrigger** | **Benne van**, helyben (`assets/vendor`). Az éles oldalon npm-ből (`gsap`). A GSAP 3.12 a GreenSock Standard License alatt ingyenes. |
| CSS 3D (`preserve-3d`) | Benne van — a hero dőlése és a KIOSZ rétegrend. |
| SVG `stroke-dashoffset` / `clipPath` | Benne van — szerkesztés, részletrajzok. |
| Three.js / WebGL | **Szándékosan nincs.** A koncepció CSS 3D-vel teljes, könnyebb és hozzáférhetőbb. Ha később kell: a hero rajzsíkja WebGL-papírként hajolhatna (vertex-hajlítás); ez opcionális. |
| React Bits | **Nincs beépítve.** Átültetéskor lehetséges hely: a címek szavankénti felúszása (pl. SplitText-szerű komponens). A mostani saját megoldás elég. |
| Aceternity UI | **Nincs beépítve**, és nem is javasolt: a stílusa (fénykártyák, üveghatás) ütközik a Tervlappal. |
| Licencelt HorizonX-komponens | **Nincs beépítve, nem is volt elérhető.** Nem állítom, hogy bármelyik benne lenne. Ha licencelve van, legfeljebb a rajzjegyzék részletrajz-váltásához adhat átmenetet; *licenc szükséges / megvalósítandó*. |

## 10. Valós és helyettesítő elemek

**Valós**
- **Márka:** minden szöveg az élő daekon.hu-ról származik (2026. október 16–17.). A logó a `daekon-ship/daekon` → `brand/svg` vektoraiból készült.
- **Fotók:** a KIOSZ Pizza és a Nefelejcs Vendégház saját képei.
- **Vélemények:** az élő oldal hat Facebook-ajánlása szó szerint, forráslinkkel.
- **KIOSZ-adatok:** a daekon.hu esettanulmányából (technológia, funkciók, szüneteltetett asztalfoglalás).
- **Ajánlatkérő:** az élő űrlap 5 lépése és 31 funkciója változatlanul.

**Helyettesítő, egyértelműen jelölve**
- **Portré:** üres, áthúzott fotóhely („Roland saját portréja kerül ide”). Stock- vagy AI-kép nincs.
- **Részletrajzok:** *sematikus* rajzok a referenciák valódi funkcióiról, nem képernyőképek. A rajzokon nincs kitalált szám.
- **Ajánlatkérő küldése:** a látványtervben előre kitöltött e-mailt nyit. Az éles oldalon a meglévő daekon.hu ajánlatkérő-backendre kell kötni (mezőnevek: `name`, `email`, `phone`, `company`, `company_site` – csapda, `website`, `message`, `consent`, a választások pedig: típus, funkciók, határidő).

## 11. Élesítés előtt ellenőrizendő

1. A Facebook-ajánlások száma és szövege — a „7 ajánlás / 100%” felirat dátumát frissíteni kell.
2. Roland portréja: kell-e, és melyik fotó.
3. A KIOSZ-szakasz állításai (szerveroldali árazás, kétszintű hűségprogram, kuponfajták) egyeznek-e az esettanulmány aktuális szövegével.
4. Mesegombolyag: a „Foglalási rendszer (indulás előtt)” állapot még érvényes-e.
5. Adatkezelési tájékoztató: az ajánlatkérő mezőinek összhangja.

## 12. Nyitott kérdések Rolandnak

- **Gyorshívás:** maradjon-e a mobil dokkban a hívás gomb az Ajánlatkérés mellett (most igen)?
- **Mester Plus:** a `daekon` repóban van egy Mester Plus alkalmazás (`apps/mester-plus`). Ha nyilvános, a rajzjegyzékbe saját termékként felvehető. Most nincs benne, mert az élő oldalon nem szerepel.
