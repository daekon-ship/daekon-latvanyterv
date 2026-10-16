import { useState } from "react";
import { SERVICES } from "../content";
import { Arrow, Words } from "./ui";

/* Kinyíló szolgáltatássorok: a sor jobb oldalán a probléma helyére a
   megoldás úszik be. A sor magassága nem változik → a kurzor alatt nem
   ugrik el a lista. Érintésen koppintásra vált, billentyűzettel fókuszra. */
export function Services() {
  const [active, setActive] = useState(0);

  return (
    <section id="szolgaltatasok" className="section services" aria-labelledby="szolg-title">
      <div className="wrap">
        <div className="section-head">
          <p className="label">Szolgáltatások</p>
          <h2 id="szolg-title">
            <Words text="A weboldaltól a saját rendszerig." focus={["saját", "rendszerig"]} />
          </h2>
          <p data-reveal>
            Nem technológiát árulok, hanem megoldást egy konkrét gondra. Nézd meg, melyik ismerős.
          </p>
        </div>

        <ul className="svc">
          {SERVICES.map((s, i) => (
            <li
              key={s.no}
              className={`svc__item${active === i ? " is-open" : ""}`}
              data-reveal
              style={{ "--d": i * 50 } as React.CSSProperties}
              onPointerEnter={(e) => {
                if (e.pointerType === "mouse") setActive(i);
              }}
              onClick={() => setActive(i)}
              onFocus={() => setActive(i)}
            >
              <span className="svc__no" aria-hidden="true">
                {s.no}
              </span>
              <h3 className="svc__title">{s.title}</h3>
              <div className="svc__swap">
                <p className="svc__problem">
                  <span className="svc__k">A gond</span>
                  {s.problem}
                </p>
                <p className="svc__sol">
                  <span className="svc__k">Amit csinálok</span>
                  {s.solution}
                </p>
              </div>
              <a
                className="svc__more"
                href={s.href}
                target="_blank"
                rel="noopener"
                aria-label={`${s.title} — részletek a daekon.hu-n`}
              >
                <Arrow diagonal />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
