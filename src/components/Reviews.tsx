import { CONTACT, REVIEWS } from "../content";
import { Arrow, Words } from "./ui";
import { Scramble, Tilt } from "./fx";

export function Reviews() {
  return (
    <section id="velemenyek" className="section reviews" aria-labelledby="vel-title">
      <div className="wrap">
        <div className="reviews__head">
          <div className="section-head">
            <p className="label"><Scramble text="Vélemények" /></p>
            <h2 id="vel-title">
              <Words text="Akik már engem választottak." focus={["engem"]} />
            </h2>
          </div>
          <p className="reviews__src" data-reveal>
            Facebook-ajánlások, szó szerint. A Facebookon 7 ajánlás érhető el, ebből 6 olvasható itt.
            <a className="link-arrow" href={CONTACT.reviews} target="_blank" rel="noopener">
              Összes ajánlás a Facebookon <Arrow diagonal />
            </a>
          </p>
        </div>

        <ul className="rv">
          {REVIEWS.map((r, i) => (
            <li key={r.name} className="rv__li" data-reveal style={{ "--d": (i % 3) * 90 + Math.floor(i / 3) * 60 } as React.CSSProperties}>
              <Tilt className="rv__card" max={3}>
              <figure>
                <blockquote>
                  <p>{r.text}</p>
                </blockquote>
                <figcaption>
                  <span className="rv__name">{r.name}</span>
                  <span className="rv__meta">
                    Facebook-ajánlás · {r.date}
                  </span>
                </figcaption>
              </figure>
              <a className="rv__src" href={CONTACT.reviews} target="_blank" rel="noopener" aria-label={`${r.name} eredeti értékelése a Facebookon`}>
                Eredeti értékelés <Arrow diagonal />
              </a>
              </Tilt>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
