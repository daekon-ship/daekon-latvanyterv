import { MARK_BOWL, MARK_STEM } from "../brand/paths";
import { Words } from "./ui";

const POINTS = [
  {
    t: "Közvetlenül velem egyeztetsz",
    d: "Nincs projektmenedzser és nincs közvetítő. Aki meghallgat, az tervez és fejleszt is.",
  },
  {
    t: "Saját kód, a te működésedre",
    d: "Nem sablont festek át: a rendszer azt csinálja, amire a vállalkozásodnak szüksége van.",
  },
  {
    t: "Az élesítés után is számíthatsz rám",
    d: "Kérésre karbantartom és továbbfejlesztem, ugyanarra a kódbázisra építve.",
  },
];

export function About() {
  return (
    <section id="rolam" className="section about" aria-labelledby="rolam-title">
      <div className="about__mesh" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className="wrap about__grid">
        <div className="about__copy">
          <p className="label">Rólam</p>
          <h2 id="rolam-title">
            <Words text="A DAEKON mögött egyetlen fejlesztő áll." focus={["egyetlen"]} />
          </h2>
          <p className="about__lead" data-reveal>
            Bartalos Roland vagyok, Csévharasztról. A DAEKON az én egyszemélyes vállalkozásom: a
            tervezést, a fejlesztést és az élesítést is személyesen végzem. Így mindig tudod, kivel
            beszélsz, és ki felel azért, hogy a rendszered működjön.
          </p>
          <p className="about__p" data-reveal style={{ "--d": 100 } as React.CSSProperties}>
            Országosan dolgozom: online egyeztetünk, a közelben személyesen is. Segítek eldönteni,
            mire van valóban szükséged — és mire nincs.
          </p>
          <ul className="about__points">
            {POINTS.map((p, i) => (
              <li key={p.t} data-reveal style={{ "--d": 140 + i * 90 } as React.CSSProperties}>
                <span className="about__pt">{p.t}</span>
                <span className="about__pd">{p.d}</span>
              </li>
            ))}
          </ul>
        </div>

        <figure className="about__mark" data-reveal="fade">
          <svg viewBox="-20 -20 240 240" aria-hidden="true" focusable="false">
            <defs>
              <linearGradient id="ab-bowl" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#5b78ff" />
                <stop offset="1" stopColor="#2b50ff" />
              </linearGradient>
            </defs>
            <g className="about__mark-grid">
              {Array.from({ length: 11 }).map((_, i) => (
                <line key={`v${i}`} x1={i * 20} y1="-10" x2={i * 20} y2="210" />
              ))}
              {Array.from({ length: 11 }).map((_, i) => (
                <line key={`h${i}`} x1="-10" y1={i * 20} x2="210" y2={i * 20} />
              ))}
            </g>
            <path className="about__stem" d={MARK_STEM} />
            <path className="about__bowl" d={MARK_BOWL} fill="url(#ab-bowl)" />
            <line className="about__seam" x1="74" y1="0" x2="74" y2="200" />
          </svg>
          <figcaption>
            <span className="label label--plain">Split D</span>
            Szár és nyitott ív, köztük a varrat: egyszerre olvasható D-ként, kapuként és kettévágott
            rendszerként.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
