import { useEffect, useRef, useState } from "react";
import { KIOSZ } from "../content";
import { Arrow, MagneticLink, Picture, Words } from "./ui";
import { ScrollTrigger, isTouch, reducedMotion } from "../lib/motion";

const PHOTOS = [
  { base: "kiosz-pizza", widths: [640, 1200], alt: "Nápolyi margherita a KIOSZ teraszán" },
  { base: "kiosz-este", widths: [640, 1200], alt: "Esti vendégtér a KIOSZ Pizzában" },
  { base: "kiosz-pizzaiolo", widths: [640, 1200], alt: "A pizzaiolo tésztát dob a vendégek előtt" },
  { base: "kiosz-terem", widths: [640, 1200], alt: "A KIOSZ Pizza mozaikpadlós vendégtere" },
  { base: "kiosz-margherita", widths: [480, 900], alt: "Margherita pizza közelről" },
];

/* Sematikus felületábrák — a KIOSZ-rendszer valós funkcióit szemléltetik,
   nem képernyőképek. Árat, számot, kitalált adatot nem tartalmaznak. */
function Schematic({ k }: { k: string }) {
  switch (k) {
    case "rendeles":
      return (
        <div className="sch sch--order">
          <div className="sch__seg">
            <span className="on">Elvitel</span>
            <span>Kiszállítás</span>
          </div>
          <div className="sch__row">
            <b>Margherita</b>
            <span className="sch__qty">1×</span>
          </div>
          <div className="sch__row sch__row--muted">
            <span>Kiszállítási zóna</span>
            <span className="sch__ok">ellenőrizve</span>
          </div>
          <div className="sch__row sch__row--muted">
            <span>Végösszeg</span>
            <span>szerver számolja</span>
          </div>
          <div className="sch__btn">Rendelés leadása</div>
        </div>
      );
    case "kovetes":
      return (
        <div className="sch sch--track">
          <p className="sch__title">Rendelés állapota</p>
          <ol className="sch__steps">
            <li className="done">Beérkezett</li>
            <li className="done">Elfogadva</li>
            <li className="now">Készül</li>
            <li>Átvehető / úton</li>
          </ol>
          <div className="sch__live">
            <i /> élő frissítés
          </div>
        </div>
      );
    case "konyha":
      return (
        <div className="sch sch--kitchen">
          <div className="sch__alert">
            <i /> Új rendelés
          </div>
          <div className="sch__cols">
            {["Új", "Készül", "Kész"].map((c, ci) => (
              <div key={c} className="sch__col">
                <span className="sch__colh">{c}</span>
                {Array.from({ length: 3 - ci }).map((_, j) => (
                  <span key={j} className={`sch__ticket${ci === 0 && j === 0 ? " is-new" : ""}`} />
                ))}
              </div>
            ))}
          </div>
        </div>
      );
    case "admin":
      return (
        <div className="sch sch--admin">
          <p className="sch__title">Rendelések</p>
          {["Beérkezett", "Készül", "Kiszállítva", "Átvéve"].map((s, i) => (
            <div key={s} className="sch__line">
              <span className="sch__bar" style={{ width: `${62 - i * 9}%` }} />
              <span className={`sch__chip sch__chip--${i}`}>{s}</span>
            </div>
          ))}
          <p className="sch__foot">Eseménynapló · szűrők · export</p>
        </div>
      );
    default:
      return (
        <div className="sch sch--loyal">
          <p className="sch__title">Hűségprogram</p>
          <div className="sch__stamps">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className={i < 5 ? "on" : ""} />
            ))}
          </div>
          <div className="sch__coupon">
            <span>Kupon</span>
            <b>aktiválva</b>
          </div>
        </div>
      );
  }
}

export function Kiosz() {
  const [active, setActive] = useState(0);
  const root = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const stRef = useRef<ScrollTrigger | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const n = KIOSZ.layers.length;

  // Asztalon: rögzített jelenet, a görgetés lépteti a rétegeket.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px) and (min-height: 640px)");
    const setup = () => {
      stRef.current?.kill();
      stRef.current = null;
      if (!mq.matches || reducedMotion() || !pinRef.current || !root.current) return;
      stRef.current = ScrollTrigger.create({
        trigger: pinRef.current,
        start: "top top+=72",
        end: () => `+=${window.innerHeight * 0.55 * n}`,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          const i = Math.min(n - 1, Math.floor(self.progress * n * 0.999));
          setActive((prev) => (prev === i ? prev : i));
          root.current?.style.setProperty("--kp", self.progress.toFixed(3));
        },
      });
    };
    setup();
    mq.addEventListener("change", setup);
    return () => {
      mq.removeEventListener("change", setup);
      stRef.current?.kill();
    };
  }, [n]);

  // Finom perspektíva az egérre (érintésen kikapcsolva)
  useEffect(() => {
    const el = stageRef.current;
    if (!el || isTouch() || reducedMotion()) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--rx", `${(((e.clientY - r.top) / r.height - 0.5) * -6).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${(((e.clientX - r.left) / r.width - 0.5) * 8).toFixed(2)}deg`);
    };
    const leave = () => {
      el.style.removeProperty("--rx");
      el.style.removeProperty("--ry");
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  const choose = (i: number) => {
    const st = stRef.current;
    if (st) {
      const y = st.start + ((st.end - st.start) * (i + 0.5)) / n;
      window.scrollTo({ top: y, behavior: reducedMotion() ? "auto" : "smooth" });
    } else setActive(i);
  };

  return (
    <section id="kiosz" ref={root} className="section kiosz" aria-labelledby="kiosz-title">
      <div ref={pinRef} className="kiosz__pin">
        <div className="wrap kiosz__grid">
          <div className="kiosz__copy">
            <p className="label">Kiemelt munka · {KIOSZ.place}</p>
            <h2 id="kiosz-title" className="kiosz__title">
              <Words text={KIOSZ.name} focus={["KIOSZ"]} />
            </h2>
            <p className="kiosz__lead" data-reveal style={{ "--d": 120 } as React.CSSProperties}>
              {KIOSZ.lead}
            </p>

            <div className="kiosz__layers" role="tablist" aria-label="A rendszer rétegei">
              {KIOSZ.layers.map((l, i) => (
                <button
                  key={l.key}
                  role="tab"
                  id={`kiosz-tab-${l.key}`}
                  aria-selected={active === i}
                  aria-controls="kiosz-panel"
                  className={`kl${active === i ? " is-on" : ""}`}
                  onClick={() => choose(i)}
                  type="button"
                >
                  <span className="kl__no">0{i + 1}</span>
                  <span className="kl__title">{l.title}</span>
                </button>
              ))}
            </div>

            <div
              id="kiosz-panel"
              role="tabpanel"
              aria-labelledby={`kiosz-tab-${KIOSZ.layers[active].key}`}
              className="kiosz__detail"
              aria-live="polite"
            >
              <p key={active} className="kiosz__detail-text">
                {KIOSZ.layers[active].text}
              </p>
              <ul className="tags" key={`t${active}`}>
                {KIOSZ.layers[active].tags.map((t, i) => (
                  <li key={t} style={{ "--i": i } as React.CSSProperties}>
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="kiosz__ctas">
              <MagneticLink href={KIOSZ.url} className="btn btn--primary" external>
                A kioszpizza.hu megnyitása <Arrow />
              </MagneticLink>
              <a className="link-arrow" href={KIOSZ.caseStudy} target="_blank" rel="noopener">
                Teljes esettanulmány <Arrow diagonal />
              </a>
            </div>
          </div>

          <div className="kiosz__stage" ref={stageRef}>
            <div className="kiosz__frame">
              {PHOTOS.map((p, i) => (
                <div
                  key={i}
                  className={`kiosz__photo${active === i ? " is-on" : ""}`}
                  aria-hidden={active !== i}
                >
                  <Picture
                    base={p.base}
                    widths={p.widths}
                    alt={active === i ? p.alt : ""}
                    sizes="(min-width: 1024px) 46vw, 92vw"
                  />
                </div>
              ))}
              <div className="kiosz__shade" aria-hidden="true" />
              <div className="kiosz__progress" aria-hidden="true">
                {KIOSZ.layers.map((_, i) => (
                  <span key={i} className={i <= active ? "on" : ""} />
                ))}
              </div>
            </div>
            <div className="kiosz__ui" aria-hidden="true">
              <div key={active} className="kiosz__ui-card">
                <Schematic k={KIOSZ.layers[active].key} />
              </div>
              <span className="kiosz__ui-cap">Sematikus ábra — a valódi felület a kioszpizza.hu-n</span>
            </div>
          </div>
        </div>
        <p className="wrap kiosz__note">{KIOSZ.note}</p>
      </div>
    </section>
  );
}
