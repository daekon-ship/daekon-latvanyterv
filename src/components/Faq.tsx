import { useState } from "react";
import { FAQ } from "../content";
import { Words } from "./ui";
import { Scramble } from "./fx";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="gyik" className="section faq" aria-labelledby="gyik-title">
      <div className="wrap faq__grid">
        <div className="section-head faq__head">
          <p className="label"><Scramble text="Gyakori kérdések" /></p>
          <h2 id="gyik-title">
            <Words text="Amit az első egyeztetés előtt érdemes tudni" />
          </h2>
        </div>
        <ul className="faq__list">
          {FAQ.map((f, i) => {
            const isOpen = open === i;
            return (
              <li key={f.q} className={`faq__item${isOpen ? " is-open" : ""}`} data-reveal style={{ "--d": i * 50 } as React.CSSProperties}>
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-${i}`}
                    id={`faq-q-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    <span>{f.q}</span>
                    <span className="faq__icon" aria-hidden="true" />
                  </button>
                </h3>
                <div id={`faq-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className="faq__a">
                  <div>
                    <p>{f.a}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
