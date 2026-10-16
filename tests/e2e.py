"""
DAEKON látványterv — böngészős ellenőrzés (Playwright, Chromium).

Használat:
  python3 tests/e2e.py <alap-URL> [képernyőkép-mappa]
  pl. python3 -I tests/e2e.py http://localhost:4173/daekon-latvanyterv/ shots

A WebGL szoftveres (SwiftShader) rendereléssel fut, így fej nélküli gépen is
valódi 3D-s jelenetet ellenőriz.
"""
import json
import os
import sys
import time

from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:4173/daekon-latvanyterv/"
SHOTS = sys.argv[2] if len(sys.argv) > 2 else None
WIDTHS = [(360, 760), (390, 844), (430, 932), (768, 1024), (1280, 800), (1440, 900)]

results = []


def check(name, ok, detail=""):
    results.append((name, bool(ok), detail))
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
    page.on(
        "response",
        lambda r: failed.append(f"{r.status} {r.url}") if r.status >= 400 and BASE.split("/")[2] in r.url else None,
    )
    return ctx, page, errors, failed


def wait_intro(page, timeout=25000):
    page.wait_for_function("document.documentElement.dataset.intro === 'done'", timeout=timeout)


with sync_playwright() as p:
    browser = p.chromium.launch(
        args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]
    )

    # 1) Asztali betöltés, intro, WebGL, konzol, assetek
    ctx, page, errors, failed = new_page(browser, 1440, 900)
    t0 = time.time()
    page.goto(BASE, wait_until="domcontentloaded")
    check("az oldal betölt, a cím helyes", "DAEKON" in page.title(), page.title())
    page.wait_for_timeout(700)
    shot(page, "01-intro-0.7s")
    page.wait_for_timeout(900)
    shot(page, "02-intro-1.6s")
    wait_intro(page)
    check("az intro véget ér és a tartalom megjelenik", True, f"{time.time() - t0:.1f} s")
    page.wait_for_timeout(1200)
    shot(page, "03-hero-kesz")
    has_canvas = page.evaluate(
        "(() => { const c = document.querySelector('.hero__canvas'); if (!c) return false;"
        " return c.width > 0 && !!(c.getContext('webgl2') || c.getContext('webgl')); })()"
    )
    check("a 3D-jelenet WebGL-vásznon fut", has_canvas)
    # a vászon tényleg rajzol: a felirat sávjában világos (fehér/kék) pixelek
    import io
    from PIL import Image

    img = Image.open(io.BytesIO(page.screenshot(clip={"x": 200, "y": 180, "width": 1040, "height": 300}))).convert("RGB")
    px = sum(1 for r, g, b in img.get_flattened_data() if (r > 180 and g > 180 and b > 180) or (b > 160 and r < 120))
    check("a WebGL-jelenet látható 3D-s feliratot és emblémát rajzol", px > 8000, f"{px} világos pixel")
    h1 = page.inner_text("h1")
    check("a főcím olvasható", "Egyedi szoftverfejlesztés a cégednek." in h1.replace("\n", " "), h1)
    vis = page.evaluate("getComputedStyle(document.querySelector('.hero__ctas')).opacity")
    check("a CTA-k láthatók az intro után", float(vis) > 0.95, vis)
    check("a fő CTA a kapcsolathoz visz", page.get_attribute(".hero__ctas a.btn--primary", "href") == "#kapcsolat")

    # egér-parallax: a kép változik
    a = page.screenshot(clip={"x": 700, "y": 150, "width": 400, "height": 260})
    page.mouse.move(1300, 200, steps=8)
    page.wait_for_timeout(900)
    b = page.screenshot(clip={"x": 700, "y": 150, "width": 400, "height": 260})
    check("egérmozgásra finom perspektívaváltás történik", a != b)

    # teljes oldal görgetése (ScrollTrigger, reveal-ek)
    total = page.evaluate("document.documentElement.scrollHeight")
    for y in range(0, total, 500):
        page.mouse.wheel(0, 500)
        page.wait_for_timeout(110)
    page.wait_for_timeout(800)
    hidden = page.evaluate(
        "Array.from(document.querySelectorAll('[data-reveal]')).filter(e => !e.hasAttribute('data-in') && e.offsetParent).map(e => e.className.split(' ')[0])"
    )
    check("görgetés után minden belépő elem megjelent", not hidden, ", ".join(hidden))
    shot(page, "04-oldal-alja")
    check("nincs JavaScript-hiba a konzolban", not errors, " | ".join(errors[:4]))
    check("nincs 404-es asset", not failed, " | ".join(failed[:4]))

    # logó-folytonosság: a 3D embléma a fejléc logójának helyére száll
    check(
        "görgetés után a 3D embléma a fejléc logójává válik",
        page.evaluate("document.documentElement.dataset.mark") == "landed"
        and page.evaluate("getComputedStyle(document.querySelector('.site-header .brand__mark')).opacity") == "1",
    )

    # 2) Navigáció
    page.evaluate("window.scrollTo(0, 0)")
    page.wait_for_timeout(600)
    for target in ["munkak", "szolgaltatasok", "rolam", "kapcsolat"]:
        page.click(f".site-nav a[href='#{target}']")
        try:
            page.wait_for_function(
                f"Math.abs(document.getElementById('{target}').getBoundingClientRect().top - 80) < 60", timeout=8000
            )
        except Exception:
            pass
        top = page.evaluate(f"document.getElementById('{target}').getBoundingClientRect().top")
        check(f"menü: #{target} a nézetbe kerül", -40 < top < 200, f"top={top:.0f}")

    # 3) KIOSZ: görgetésre lépő rétegek (rögzített jelenet)
    page.evaluate("document.getElementById('kiosz').scrollIntoView({behavior: 'instant'})")
    page.wait_for_timeout(600)
    seen = set()
    for _ in range(14):
        page.mouse.wheel(0, 260)
        page.wait_for_timeout(260)
        seen.add(page.inner_text(".kl.is-on .kl__title"))
    check("KIOSZ: görgetésre végigléptet a rétegeken", len(seen) >= 4, ", ".join(sorted(seen)))
    page.evaluate("document.getElementById('kiosz').scrollIntoView({behavior: 'instant'})")
    page.wait_for_timeout(900)
    shot(page, "05-kiosz")

    # 4) Munkák reflektorfény
    page.evaluate("document.getElementById('munkak').scrollIntoView({behavior: 'instant'})")
    page.wait_for_timeout(500)
    page.hover(".wl >> nth=1")
    page.wait_for_timeout(500)
    name = page.inner_text(".works__stage .work-meta__name")
    check("Munkák: hoverre a kiválasztott projekt kerül fókuszba", "Nefelejcs" in name, name)
    shot(page, "06-munkak")

    # 5) Szolgáltatások + GYIK + vélemények
    page.evaluate("document.getElementById('szolgaltatasok').scrollIntoView({behavior: 'instant'})")
    page.wait_for_timeout(400)
    page.hover(".svc__item >> nth=2")
    page.wait_for_timeout(700)
    check(
        "Szolgáltatások: hoverre a sor kinyílik (megoldás beúszik)",
        "is-open" in (page.get_attribute(".svc__item >> nth=2", "class") or ""),
    )
    shot(page, "07-szolgaltatasok")
    cards = page.evaluate(
        "Array.from(document.querySelectorAll('.rv__card')).map(c => { const r = c.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top)]; })"
    )
    cols = len({c[0] for c in cards})
    rows = len({c[1] for c in cards})
    check("Vélemények: 6 kártya, 3 oszlop × 2 sor asztalon", len(cards) == 6 and cols == 3 and rows == 2, f"{cols}×{rows}")
    page.evaluate("document.getElementById('velemenyek').scrollIntoView({behavior: 'instant'})")
    page.wait_for_timeout(900)
    shot(page, "08-velemenyek")
    page.evaluate("document.getElementById('gyik').scrollIntoView({behavior: 'instant'})")
    page.click(".faq__item >> nth=2 >> button")
    page.wait_for_timeout(600)
    check("GYIK: a kérdés kinyílik", page.get_attribute(".faq__item >> nth=2 >> button", "aria-expanded") == "true")
    shot(page, "09-gyik")

    # 5b) Ajánlatkérő asszisztens (a daekon.hu meglévő funkciója)
    page.evaluate("document.getElementById('ajanlat').scrollIntoView({behavior: 'instant'})")
    page.wait_for_timeout(600)
    page.fill("#qa-in", "Webáruház bankkártyás fizetéssel és adminnal")
    page.click(".qa__go")
    page.wait_for_selector(".qa__amount", timeout=4000)
    amount = page.inner_text(".qa__amount")
    check("Asszisztens: leírásra tájékoztató becslést ad", "Ft" in amount, amount)
    page.click(".qa__chip >> nth=0")
    page.wait_for_timeout(300)
    amount2 = page.inner_text(".qa__amount")
    check("Asszisztens: gyorsgombra frissül a becslés", amount2 != amount, f"{amount} → {amount2}")
    href = page.get_attribute(".qa__send", "href") or ""
    check("Asszisztens: e-mailként küldhető (hello@daekon.hu)", href.startswith("mailto:hello@daekon.hu"))
    shot(page, "10a-asszisztens")

    # 6) Űrlap: hibák, majd előre kitöltött levél (mailto)
    page.evaluate("document.getElementById('kapcsolat').scrollIntoView({behavior: 'instant'})")
    page.wait_for_timeout(700)
    page.click(".form button[type=submit]")
    errs = page.locator(".field__err").count()
    check("Űrlap: üres beküldésre érthető hibaüzenetek", errs == 3, f"{errs} hiba")
    shot(page, "10-urlap-hibak")
    page.fill("#f-name", "Teszt Elek")
    page.fill("#f-contact", "teszt@example.hu")
    page.click(".chip >> nth=0")
    page.fill("#f-msg", "Egy foglalási rendszerről szeretnék egyeztetni.")
    page.click(".form button[type=submit]")
    page.wait_for_timeout(1200)
    status = page.locator(".hello__title").count()
    check("Űrlap: siker helyett őszinte visszajelzés (levelezőprogram)", status == 1)
    shot(page, "11-urlap-kesz")
    ctx.close()

    # 7) Szélességek: nincs vízszintes túlcsordulás
    for w, h in WIDTHS:
        ctx, page, errors, failed = new_page(browser, w, h, has_touch=w < 800, is_mobile=w < 800)
        page.goto(BASE, wait_until="domcontentloaded")
        wait_intro(page)
        page.wait_for_timeout(900)
        shot(page, f"w{w}-hero")
        over = page.evaluate("document.documentElement.scrollWidth - window.innerWidth")
        total = page.evaluate("document.documentElement.scrollHeight")
        for y in range(0, total, 700):
            page.mouse.wheel(0, 700)
            page.wait_for_timeout(60)
        page.wait_for_timeout(400)
        over2 = page.evaluate("document.documentElement.scrollWidth - window.innerWidth")
        small = page.evaluate(
            """Array.from(document.querySelectorAll('a.btn, button.btn, .menu-toggle, .chip, .kl, .faq__item button'))
               .filter(e => e.offsetParent && getComputedStyle(e).visibility !== 'hidden')
               .map(e => e.getBoundingClientRect()).filter(r => r.width > 0 && r.height < 40).length"""
        )
        check(f"{w}px: nincs vízszintes túlcsordulás", over <= 0 and over2 <= 0, f"{over}/{over2}")
        check(f"{w}px: nincs 40 px-nél alacsonyabb érintési cél", small == 0, f"{small} db")
        check(f"{w}px: nincs JS-hiba / 404", not errors and not failed, " | ".join((errors + failed)[:3]))
        if w == 390:
            page.evaluate("window.scrollTo(0, 0)")
            page.wait_for_timeout(500)
            page.click(".menu-toggle")
            page.wait_for_timeout(700)
            shot(page, "w390-menu")
            check("mobil: a menü megnyílik", page.is_visible("#mobilmenu"))
            page.click("#mobilmenu a[href='#szolgaltatasok']")
            page.wait_for_timeout(1400)
            check("mobil: menüpontra zár és odagörget", not page.is_visible("#mobilmenu") and page.evaluate("window.scrollY") > 500)
            page.evaluate("document.getElementById('kiosz').scrollIntoView({behavior: 'instant'})")
            page.click(".kl >> nth=2")
            page.wait_for_timeout(700)
            check("mobil: KIOSZ réteg érintésre vált", "Konyhai" in page.inner_text(".kl.is-on"))
            shot(page, "w390-kiosz")
            page.evaluate("document.getElementById('munkak').scrollIntoView({behavior: 'instant'})")
            page.wait_for_timeout(700)
            shot(page, "w390-munkak")
        ctx.close()

    # 8) WebGL nélkül: tartalék nézet
    ctx, page, errors, failed = new_page(browser, 1280, 800)
    page.goto(BASE + "?nowebgl", wait_until="domcontentloaded")
    wait_intro(page)
    page.wait_for_timeout(1400)
    check("WebGL nélkül: tartalék logókompozíció jelenik meg", page.is_visible(".hero__fallback .hero__fb-word"))
    check("WebGL nélkül: a CTA-k használhatók", page.is_visible(".hero__ctas a.btn--primary"))
    check("WebGL nélkül: nincs hiba", not errors, " | ".join(errors[:3]))
    shot(page, "12-fallback")
    ctx.close()

    # 9) WebGL-kontextus elvesztése futás közben
    ctx, page, errors, failed = new_page(browser, 1280, 800)
    page.goto(BASE, wait_until="domcontentloaded")
    wait_intro(page)
    page.evaluate(
        "(() => { const c = document.querySelector('.hero__canvas'); const gl = c.getContext('webgl2') || c.getContext('webgl'); gl.getExtension('WEBGL_lose_context').loseContext(); })()"
    )
    page.wait_for_timeout(800)
    check("kontextusvesztés után a tartalék nézet veszi át", page.is_visible(".hero__fallback"))
    ctx.close()

    # 10) Csökkentett mozgás
    ctx, page, errors, failed = new_page(browser, 1280, 800, reduced_motion="reduce")
    t0 = time.time()
    page.goto(BASE, wait_until="domcontentloaded")
    wait_intro(page, 5000)
    check("prefers-reduced-motion: azonnal használható", time.time() - t0 < 4, f"{time.time() - t0:.1f} s")
    ctx.close()

    # 11) Billentyűzet: skip link és fókusz
    ctx, page, errors, failed = new_page(browser, 1280, 800)
    page.goto(BASE, wait_until="domcontentloaded")
    wait_intro(page)
    page.keyboard.press("Tab")
    check("billentyűzet: első Tab a „tartalomra ugrás” link", page.evaluate("document.activeElement.className") == "skip-link")
    ctx.close()

    browser.close()

bad = [r for r in results if not r[1]]
print(f"\n{len(results) - len(bad)}/{len(results)} ellenőrzés sikeres")
if SHOTS:
    with open(os.path.join(SHOTS, "eredmeny.json"), "w") as f:
        json.dump([{"nev": n, "ok": o, "reszlet": d} for n, o, d in results], f, ensure_ascii=False, indent=1)
sys.exit(1 if bad else 0)
