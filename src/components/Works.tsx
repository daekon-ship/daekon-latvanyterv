import { useEffect, useRef, useState } from "react";
import { PROJECTS, type Project } from "../content";
import { Arrow, Picture, Words } from "./ui";
import { Scramble, Tilt } from "./fx";
import { reducedMotion } from "../lib/motion";

/* Projektenként egyedi, de rendszeren belüli „lemez": a domain neve
   rácsra írva — nem kitalált képernyőkép. Ahol van valódi ügyfélfotó,
   az kerül a lemezre. */
function hueOf(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 997;
  return h;
}

function Plate({ p, eager = false }: { p: Project; eager?: boolean }) {
  const h = hueOf(p.domain);
  const angle = 18 + (h % 50);
  return (
    <a
      className="plate"
      href={p.url}
      target="_blank"
      rel="noopener"
      data-cursor="Megnyitás"
      aria-label={`${p.name} — ${p.domain} megnyitása új lapon`}
      style={{ "--pa": `${angle}deg`, "--px": `${20 + (h % 60)}%` } as React.CSSProperties}
    >
      <div className="plate__bar" aria-hidden="true">
        <span className="plate__lock" />
        <span className="plate__url">{p.domain}</span>
      </div>
      <div className="plate__body">
        {p.image ? (
          <Picture
            className="plate__img"
            base={p.image.base}
            widths={[640, 1200]}
            alt={p.image.alt}
            sizes="(min-width: 1024px) 52vw, 92vw"
            eager={eager}
          />
        ) : (
          <div className="plate__type" aria-hidden="true">
            <span className="plate__big">{p.name}</span>
            <span className="plate__grid" />
          </div>
        )}
      </div>
    </a>
  );
}

function Meta({ p }: { p: Project }) {
  return (
    <div className="work-meta">
      <p className="work-meta__sector">{p.sector}</p>
      <h3 className="work-meta__name">
        {p.name}
        {p.client ? <span className="work-meta__client"> — {p.client}</span> : null}
      </h3>
      <p className="work-meta__sum">{p.summary}</p>
      <ul className="tags">
        {p.built.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      {p.status ? <p className="work-meta__status">{p.status}</p> : null}
      <a className="link-arrow" href={p.url} target="_blank" rel="noopener">
        {p.domain} megnyitása <Arrow diagonal />
      </a>
    </div>
  );
}

/* Liquid Glass váltás: projektváltáskor a lemez egy rövid, folyékony
   fénytörésen megy át (SVG displacement), majd kitisztul. Csak itt. */
function useLiquid(key: number) {
  const disp = useRef<SVGFEDisplacementMapElement>(null);
  const turb = useRef<SVGFETurbulenceElement>(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reducedMotion() || !disp.current) return;
    const t0 = performance.now();
    let raf = 0;
    const seed = Math.random() * 100;
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / 750);
      const k = Math.sin(Math.PI * Math.min(1, t * 1.25)) * (1 - t);
      disp.current?.setAttribute("scale", (k * 46).toFixed(2));
      turb.current?.setAttribute("seed", String(seed));
      turb.current?.setAttribute("baseFrequency", `${(0.008 + t * 0.006).toFixed(4)} ${(0.02 - t * 0.008).toFixed(4)}`);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [key]);
  return { disp, turb };
}

export function Works() {
  const [active, setActive] = useState(0);
  const p = PROJECTS[active];
  const { disp, turb } = useLiquid(active);

  return (
    <section id="munkak" className="section works" aria-labelledby="munkak-title">
      <div className="wrap">
        <div className="section-head">
          <p className="label"><Scramble text="Munkák" /></p>
          <h2 id="munkak-title">
            <Words text="Éles rendszerek, valódi ügyfeleknek." focus={["valódi"]} />
          </h2>
          <p data-reveal>
            Minden itt látható oldal él és dolgozik egy vállalkozásnak. Kattints rá, és nézd meg
            élőben.
          </p>
        </div>

        {/* Asztali nézet: lista + reflektorfényben az aktív projekt */}
        <div className="works__spot">
          <ol className="works__list" aria-label="Referenciák">
            {PROJECTS.map((x, i) => (
              <li key={x.domain}>
                <button
                  type="button"
                  className={`wl${active === i ? " is-on" : ""}`}
                  aria-pressed={active === i}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                >
                  <span className="wl__no">{String(i + 1).padStart(2, "0")}</span>
                  <span className="wl__name">{x.name}</span>
                  <span className="wl__sector">{x.sector}</span>
                </button>
              </li>
            ))}
          </ol>

          <div className="works__stage" aria-live="polite">
            <svg className="sr-only" aria-hidden="true" focusable="false">
              <filter id="liquid" x="-10%" y="-10%" width="120%" height="120%">
                <feTurbulence ref={turb} type="fractalNoise" baseFrequency="0.008 0.02" numOctaves="2" seed="3" />
                <feDisplacementMap ref={disp} in="SourceGraphic" scale="0" xChannelSelector="R" yChannelSelector="B" />
              </filter>
            </svg>
            <div key={active} className="works__card">
              <Tilt className="works__tilt" max={4}>
                <div className="works__glass">
                  <Plate p={p} />
                </div>
              </Tilt>
              <Meta p={p} />
            </div>
          </div>
        </div>

        {/* Mobil: függőleges, kényelmesen görgethető kártyák */}
        <ol className="works__stack" aria-label="Referenciák">
          {PROJECTS.map((x, i) => (
            <li key={x.domain} className="works__item" data-reveal style={{ "--d": (i % 2) * 80 } as React.CSSProperties}>
              <Plate p={x} />
              <Meta p={x} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
