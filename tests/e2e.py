"""
DAEKON „Tervlap” látványterv — böngészős ellenőrzés (Playwright, Chromium).

Használat:
  python3 tests/e2e.py <alap-URL> [képernyőkép-mappa]
  pl. python3 tests/e2e.py http://localhost:4173/daekon-latvanyterv/ shots

Ellenőrzi: konzolhibák, vízszintes túlcsordulás 7 szélességen, lapszám-jelző,
KIOSZ rétegfülek, rajzjegyzék, ajánlatkérő (összefoglaló + validáció),
csökkentett mozgás, a koncepcióoldal és a tartalom hitelessége.
"""
import json
import os
import sys

from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:4173/daekon-latvanyterv/"
SHOTS = sys.argv[2] if len(sys.argv) > 2 else None
WIDTHS = [(360, 760), (390, 844), (430, 932), (768, 1024), (1024, 768), (1366, 800), (1920, 1080)]
results = []


def check(name, ok, detail=""):
    results.append({"nev": name, "ok": bool(ok), "reszlet": detail})
    print(("OK   " if ok else "HIBA ") + name + (f" — {detail}" if detail else ""), flush=True)


def shot(page, name, full=False):
    if SHOTS:
        os.makedirs(SHOTS, exist_ok=True)
        page.screenshot(path=os.path.join(SHOTS, name + ".png"), full_page=full)


def new_page(browser, w, h, **kw):
    ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1, **kw)
    page = ctx.new_page()
    errors, failed = [], []
    page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    page.on("pageerror", lambda e: errors.append(str(e)))
    host = BASE.split("/")[2]
    page.on("response", lambda r: failed.append(f"{r.status} {r.url}") if r.status >= 400 and host in r.url else None)
    return ctx, page, errors, failed


def scroll_through(page):
    h = page.evaluate("document.documentElement.scrollHeight")
    y = 0
    while y < h:
        page.evaluate(f"window.scrollTo(0, {y})")
        page.wait_for_timeout(120)
        y += 500
        h = page.evaluate("document.documentElement.scrollHeight")


with sync_playwright() as p:
    browser = p.chromium.launch(args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader"])

    # 1) Szélességek: hiba, túlcsordulás, látható CTA
    for w, h in WIDTHS:
        ctx, page, errors, failed = new_page(browser, w, h, is_mobile=w < 768, has_touch=w < 768)
        page.goto(BASE + "?mozgas=1", wait_until="networkidle")
        page.wait_for_timeout(2600)
        shot(page, f"{w}-hero")
        scroll_through(page)
        over = page.evaluate("document.documentElement.scrollWidth - window.innerWidth")
        check(f"{w}px: nincs vízszintes görgetés", over <= 0, f"{over}px")
        check(f"{w}px: nincs konzolhiba", not errors, "; ".join(errors[:3]))
        check(f"{w}px: minden saját fájl betölt", not failed, "; ".join(failed[:3]))
        if w < 961:
            vis = page.evaluate("getComputedStyle(document.querySelector('.dock')).display !== 'none'")
            check(f"{w}px: mobil dokk (Ajánlatkérés) elérhető", vis)
        page.evaluate("document.querySelector('#rendszer').scrollIntoView()")
        page.wait_for_timeout(900)
        shot(page, f"{w}-kiosz")
        page.evaluate("document.querySelector('#munkak').scrollIntoView()")
        page.wait_for_timeout(900)
        shot(page, f"{w}-munkak")
        ctx.close()

    # 2) Asztali funkciók
    ctx, page, errors, failed = new_page(browser, 1440, 900)
    page.goto(BASE + "?mozgas=1", wait_until="networkidle")
    page.wait_for_timeout(2800)
    check("Intro után a cím látható", page.evaluate("getComputedStyle(document.querySelector('.hero h1')).opacity") == "1")
    check("Fő cím a tényleges szöveg", page.evaluate("document.querySelector('.hero h1').getAttribute('aria-label')") == "Egyedi szoftverfejlesztés a cégednek.")

    # célkereszt
    box = page.locator(".draw").bounding_box()
    page.mouse.move(box["x"] + box["width"] * 0.5, box["y"] + box["height"] * 0.5)
    page.wait_for_timeout(200)
    check("Rajz: célkereszt követi az egeret", page.evaluate("document.querySelector('.draw').classList.contains('is-tracking')"))

    # lapszám-jelző
    page.evaluate("document.querySelector('#szolgaltatasok').scrollIntoView()")
    page.wait_for_timeout(700)
    sheet = page.evaluate("document.querySelector('.hdr__sheet [data-sheet-no]').textContent")
    check("Lapszám-jelző követi a görgetést", sheet == "04", sheet)

    # KIOSZ rétegek (görgetés + kattintás)
    page.evaluate("document.querySelector('#rendszer').scrollIntoView()")
    page.wait_for_timeout(600)
    page.click("#lt-2")
    page.wait_for_timeout(1500)
    sel = page.evaluate("document.querySelector('#lt-2').getAttribute('aria-selected')")
    on = page.evaluate("document.querySelector('.plane.is-on')?.dataset.plane")
    check("KIOSZ: a fül váltja a réteget", sel == "true" and on == "2", f"{sel} / {on}")
    shot(page, "1440-kiosz-l3")

    # rajzjegyzék
    page.evaluate("document.querySelector('#munkak').scrollIntoView()")
    page.wait_for_timeout(500)
    rows = page.locator(".reg")
    check("Rajzjegyzék: 8 projekt", rows.count() == 8, str(rows.count()))
    rows.nth(3).locator(".reg__name").click()
    page.wait_for_timeout(900)
    name = page.evaluate("document.querySelector('[data-detail-name]').textContent")
    check("Rajzjegyzék: a sor váltja a részletrajzot", name.startswith("K.T BYGG"), name)
    check("Rajzjegyzék: a csúszka megjelenik", page.locator("[data-detail-art] [data-slider]").count() == 1)
    shot(page, "1440-reszletrajz")

    # vélemények
    check("Vélemények: pontosan 6 Facebook-ajánlás", page.locator(".slip").count() == 6)

    # ajánlatkérő
    page.evaluate("document.querySelector('#ajanlat').scrollIntoView()")
    page.click(".tgl[data-value='Rendelési rendszer']")
    page.click(".qmore")
    page.click(".tgl[data-value='Online fizetés']")
    page.click(".tgl[data-value='1–2 hónap']")
    s_type = page.evaluate("document.querySelector('[data-sum=type]').textContent")
    s_cnt = page.evaluate("document.querySelector('[data-sum-count]').textContent")
    check("Ajánlatkérő: összefoglaló frissül", s_type == "Rendelési rendszer" and s_cnt.startswith("3"), f"{s_type} / {s_cnt}")
    page.click(".qsum__send")
    st = page.evaluate("document.querySelector('[data-status]').textContent")
    check("Ajánlatkérő: hiányzó adatnál hibaüzenet", "neved" in st, st)
    check("Ajánlatkérő: 31 funkció", page.locator(".qfeat .tgl").count() == 31)
    shot(page, "1440-ajanlat")
    check("Asztali: nincs konzolhiba", not errors, "; ".join(errors[:3]))
    ctx.close()

    # 3) Csökkentett mozgás: azonnal végállapot
    ctx, page, errors, _ = new_page(browser, 1440, 900, reduced_motion="reduce")
    page.goto(BASE, wait_until="networkidle")
    page.wait_for_timeout(400)
    op = page.evaluate("getComputedStyle(document.querySelector('.d-shape')).opacity")
    check("Csökkentett mozgás: a rajz azonnal teljes", op == "1", op)
    check("Csökkentett mozgás: nincs konzolhiba", not errors, "; ".join(errors[:3]))
    ctx.close()

    # 4) Koncepcióoldal
    ctx, page, errors, failed = new_page(browser, 1440, 900)
    page.goto(BASE + "iranyok.html", wait_until="networkidle")
    check("Koncepcióoldal: 3 irány", page.locator(".dir").count() == 3)
    check("Koncepcióoldal: hiba nélkül", not errors and not failed)
    shot(page, "iranyok", full=True)
    ctx.close()

    browser.close()

bad = [r for r in results if not r["ok"]]
print(f"\n{len(results) - len(bad)}/{len(results)} ellenőrzés rendben.")
if SHOTS:
    with open(os.path.join(SHOTS, "eredmeny.json"), "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
sys.exit(1 if bad else 0)
