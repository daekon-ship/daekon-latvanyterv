import { CONTACT, NAV } from "../content";
import { MarkSvg, WordmarkSvg } from "../brand/Logo";

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer__grid">
        <a className="footer__brand" href="#top" aria-label="DAEKON — vissza az oldal tetejére">
          <MarkSvg className="footer__mark" />
          <WordmarkSvg className="footer__word" />
        </a>
        <nav aria-label="Lábléc navigáció">
          <ul className="footer__nav">
            {NAV.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`}>{n.label}</a>
              </li>
            ))}
            <li>
              <a href="#gyik">Gyakori kérdések</a>
            </li>
          </ul>
        </nav>
        <ul className="footer__contact">
          <li>
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          </li>
          <li>
            <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>
          </li>
          <li>{CONTACT.place}</li>
        </ul>
      </div>
      <div className="wrap footer__legal">
        <p>© 2026 DAEKON · Bartalos Roland</p>
        <p>
          <a href={CONTACT.privacy} target="_blank" rel="noopener">
            Adatkezelés
          </a>
          <span aria-hidden="true"> · </span>
          <a href={CONTACT.imprint} target="_blank" rel="noopener">
            Impresszum
          </a>
        </p>
        <p className="footer__proto">
          Látványterv-prototípus. Az éles oldal: <a href="https://daekon.hu/">daekon.hu</a>
        </p>
      </div>
    </footer>
  );
}
