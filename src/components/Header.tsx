import { useEffect, useRef, useState } from "react";
import { NAV } from "../content";
import { MarkSvg, WordmarkSvg } from "../brand/Logo";
import { magnetic } from "../lib/motion";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => (ctaRef.current ? magnetic(ctaRef.current, 0.18) : undefined), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Aktív menüpont a látható szakasz alapján
  useEffect(() => {
    const ids = NAV.map((n) => n.id);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  // Mobilmenü: görgetés zárolása, Esc, fókusz a menübe és vissza
  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", open);
    if (!open) return;
    const first = menuRef.current?.querySelector<HTMLElement>("a");
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}${open ? " is-open" : ""}`}>
      <div className="wrap site-header__inner">
        <a className="brand" href="#top" aria-label="DAEKON — vissza az oldal tetejére">
          <MarkSvg className="brand__mark" />
          <WordmarkSvg className="brand__word" />
        </a>

        <nav className="site-nav" aria-label="Fő navigáció">
          <ul>
            {NAV.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} aria-current={active === n.id ? "true" : undefined}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <a ref={ctaRef} className="btn btn--primary btn--sm header-cta" href="#kapcsolat">
          Ajánlatkérés
        </a>

        <button
          ref={toggleRef}
          className="menu-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="mobilmenu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? "Menü bezárása" : "Menü megnyitása"}</span>
          <span className="menu-toggle__bars" aria-hidden="true">
            <i />
            <i />
          </span>
        </button>
      </div>

      <div id="mobilmenu" ref={menuRef} className="mobile-menu" hidden={!open}>
        <nav aria-label="Mobil navigáció">
          <ol>
            {NAV.map((n, i) => (
              <li key={n.id} style={{ "--i": i } as React.CSSProperties}>
                <a href={`#${n.id}`} onClick={() => setOpen(false)}>
                  <span className="mobile-menu__no">0{i + 1}</span>
                  {n.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="mobile-menu__foot">
          <a className="btn btn--primary" href="#kapcsolat" onClick={() => setOpen(false)}>
            Projekt egyeztetése
          </a>
          <a href="tel:+36304539346" className="mobile-menu__tel">
            +36 30 453 9346
          </a>
        </div>
      </div>
    </header>
  );
}
