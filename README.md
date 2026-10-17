# DAEKON 2026 — „Tervlap” látványterv

Működő, interaktív látványterv a daekon.hu új változatához. **Nem az éles oldal.** A daekon.hu-t és a `daekon-ship/daekon` repót nem módosítja.

- **Előnézet:** https://daekon-ship.github.io/daekon-latvanyterv/
- **A három kreatív irány és a döntés:** https://daekon-ship.github.io/daekon-latvanyterv/iranyok.html
- **Átadás (tokenek, animációk, komponensek, könyvtárak):** [`ATADAS.md`](ATADAS.md)
- **Korábbi, sötét Three.js-es változat:** `v1-cinematic` címke

## Koncepció

Az oldal egy rajzkészlet: kilenc számozott lap, a fejlécben élő lapszám-jelzővel.

| Lap | Tartalom | Megoldás |
|---|---|---|
| 01 Kiindulás | Cím, lead, CTA | A Split D a márkakönyv geometriájából szerkesztődik meg, méretvonalakkal. CAD-célkereszt illesztéssel. Görgetésre a lap hátradől, a jel szétnyílik. |
| 02 Rendszerkép | KIOSZ Pizza | Sötét lap, CSS 3D robbantott rétegrend (weboldal → rendelés → fiók/hűség → konyha/admin). Görgetésre rögzül, és rétegenként „lehántja” a rendszert. |
| 03 Rajzjegyzék | 8 további éles oldal | Rajzjegyzék-táblázat és sematikus részletrajz a projekt jellemző funkciójáról: húzható csúszka, lapozó anyagminták, a vendégház saját fotója. |
| 04 Műszaki leírás | 6 szolgáltatás | Számozott tételek a szolgáltatási aloldalak linkjeivel. |
| 05 Ütemterv | Folyamat | Gantt-szerű sávok, végigfutó „most”-kurzorral. |
| 06 Jóváhagyások | Facebook-ajánlások | Hat valódi vélemény aláírássorral és forráslinkkel. |
| 07 Revíziótörténet | Rólam | A → B → C: játékosnév → CubeDAEKON 2011 → DAEKON. Üres, jelölt fotóhely. |
| 08 Kérdések | GYIK | Lenyitható sorok. |
| 09 Megrendelőlap | Ajánlatkérő | Az élő daekon.hu 5 lépéses űrlapja, tapadó összefoglalóval. |

## Futtatás

A látványterv build nélküli, nincs `npm install`.

```bash
cd site && python3 -m http.server 4173          # http://localhost:4173/
# tesztek (a /daekon-latvanyterv/ útvonal miatt):
mkdir -p /tmp/srv && ln -sfn "$PWD/site" /tmp/srv/daekon-latvanyterv
(cd /tmp/srv && python3 -m http.server 4173 &)
pip install playwright pillow && python -m playwright install chromium
python3 tests/e2e.py http://localhost:4173/daekon-latvanyterv/ shots
```

URL-paraméterek: `?mozgas=1` bekapcsolja a mozgást csökkentett mozgás mellett is, `?mozgas=0` kikapcsolja.

## Publikálás

Minden `main` push után a `.github/workflows/pages.yml` lefuttatja a böngészős teszteket. A teszteredmény és a képek a `ci-eredmenyek` ágra kerülnek. Sikeres teszt után a `site/` mappa a `gh-pages` ágra kerül.

## Források

- **Logó, színek:** `daekon-ship/daekon` → `brand/svg`. A világos változat: tinta `#14161B`, kék `#1636E7`.
- **Betűk:** Archivo (változó) és IBM Plex Mono, OFL, helyben.
- **Fotók:** a KIOSZ Pizza és a Nefelejcs Vendégház saját képei. Az eredetik a `scripts/src-img/` mappában vannak; az újragenerálás: `cd scripts && npm i && node images.mjs`.
- **Tartalom (`site/assets/js/content.js`):** a daekon.hu szövegei és adatai. Kitalált ügyfél, vélemény, szám vagy ár nincs.
