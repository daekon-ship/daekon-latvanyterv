import { useRef, useState } from "react";
import { CONTACT } from "../content";
import { MARK_BOWL, MARK_STEM } from "../brand/paths";
import { Arrow, Words } from "./ui";

const TYPES = [
  "Weboldal",
  "Webalkalmazás",
  "Rendelési rendszer",
  "Foglalási rendszer",
  "Webáruház",
  "Automatizálás",
  "Még nem tudom",
];

type Errors = Partial<Record<"name" | "contact" | "message", string>>;

/* Az élő daekon.hu ajánlatkérése e-mailen keresztül működik, háttérrendszer
   nélkül. A prototípus ugyanezt teszi: előre kitöltött levelet nyit, és nem
   állítja, hogy az üzenet megérkezett — azt a levelezőprogram küldi el. */
export function Contact() {
  const [types, setTypes] = useState<string[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "opened">("idle");
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);

  const toggle = (t: string) =>
    setTypes((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "").trim();
    const contact = String(fd.get("contact") || "").trim();
    const message = String(fd.get("message") || "").trim();
    const errs: Errors = {};
    if (name.length < 2) errs.name = "Kérlek, add meg a neved.";
    if (!/^\S+@\S+\.\S+$/.test(contact) && contact.replace(/[^\d]/g, "").length < 8)
      errs.contact = "Adj meg egy e-mail-címet vagy telefonszámot, hogy válaszolni tudjak.";
    if (message.length < 10) errs.message = "Írj pár mondatot a projektedről (legalább 10 karakter).";
    setErrors(errs);
    if (Object.keys(errs).length) {
      const first = Object.keys(errs)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    const subject = `Projekt egyeztetése — ${name}`;
    const body = [
      `Név: ${name}`,
      `Elérhetőség: ${contact}`,
      types.length ? `Projekt típusa: ${types.join(", ")}` : null,
      "",
      message,
    ]
      .filter((x) => x !== null)
      .join("\n");
    window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setState("opened");
    window.setTimeout(() => statusRef.current?.focus(), 50);
  };

  return (
    <section id="kapcsolat" className="section contact" aria-labelledby="kapcsolat-title">
      <div className="contact__glow" aria-hidden="true" />
      <div className="wrap contact__grid">
        <div className="contact__copy">
          <p className="label">Kapcsolat</p>
          <h2 id="kapcsolat-title" className="contact__title">
            <Words text="Van egy ötleted? Megvalósítom." focus={["Megvalósítom"]} />
          </h2>
          <p className="contact__sub" data-reveal>
            Mesélj a projektedről. Elég nagy vonalakban — a részleteket együtt tisztázzuk.
          </p>

          <ul className="contact__direct">
            <li data-reveal style={{ "--d": 80 } as React.CSSProperties}>
              <span className="label label--plain">E-mail</span>
              <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            </li>
            <li data-reveal style={{ "--d": 140 } as React.CSSProperties}>
              <span className="label label--plain">Telefon</span>
              <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>
            </li>
            <li data-reveal style={{ "--d": 200 } as React.CSSProperties}>
              <span className="label label--plain">Facebook</span>
              <a href={CONTACT.facebook} target="_blank" rel="noopener">
                DAEKON oldal <Arrow diagonal />
              </a>
            </li>
          </ul>
          <p className="contact__fine" data-reveal style={{ "--d": 240 } as React.CSSProperties}>
            {CONTACT.place}, Magyarország · általában egy munkanapon belül válaszolok.
          </p>
        </div>

        <div className="contact__panel" data-reveal="fade">
          {state === "opened" ? (
            <div className="hello" role="status">
              <svg className="hello__mark" viewBox="0 0 200 200" aria-hidden="true">
                <path className="hello__stem" d={MARK_STEM} />
                <path className="hello__bowl" d={MARK_BOWL} />
              </svg>
              <p ref={statusRef} tabIndex={-1} className="hello__title">
                Megnyílt a levelezőprogramod.
              </p>
              <p className="hello__text">
                Az előre kitöltött levél akkor érkezik meg hozzám, ha ott elküldöd. Ha nem nyílt meg
                semmi, írj közvetlenül a{" "}
                <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> címre, vagy hívj:{" "}
                <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>.
              </p>
              <button type="button" className="btn btn--ghost" onClick={() => setState("idle")}>
                Vissza az űrlaphoz
              </button>
            </div>
          ) : (
            <form ref={formRef} className="form" noValidate onSubmit={submit} aria-describedby="form-note">
              <div className={`field${errors.name ? " has-err" : ""}`}>
                <label htmlFor="f-name">Neved</label>
                <input id="f-name" name="name" autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? "e-name" : undefined} />
                {errors.name && (
                  <p id="e-name" className="field__err">
                    {errors.name}
                  </p>
                )}
              </div>
              <div className={`field${errors.contact ? " has-err" : ""}`}>
                <label htmlFor="f-contact">E-mail-cím vagy telefonszám</label>
                <input id="f-contact" name="contact" autoComplete="email" aria-invalid={!!errors.contact} aria-describedby={errors.contact ? "e-contact" : undefined} />
                {errors.contact && (
                  <p id="e-contact" className="field__err">
                    {errors.contact}
                  </p>
                )}
              </div>
              <fieldset className="field field--chips">
                <legend>Miről lenne szó? (nem kötelező)</legend>
                <div className="chips">
                  {TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`chip${types.includes(t) ? " is-on" : ""}`}
                      aria-pressed={types.includes(t)}
                      onClick={() => toggle(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className={`field${errors.message ? " has-err" : ""}`}>
                <label htmlFor="f-msg">A projekted pár mondatban</label>
                <textarea id="f-msg" name="message" rows={5} aria-invalid={!!errors.message} aria-describedby={errors.message ? "e-msg" : undefined} />
                {errors.message && (
                  <p id="e-msg" className="field__err">
                    {errors.message}
                  </p>
                )}
              </div>
              <div className="form__foot">
                <button type="submit" className="btn btn--primary btn--ring">
                  Levél megírása <Arrow />
                </button>
                <p id="form-note" className="form__note">
                  A gomb a levelezőprogramodat nyitja meg előre kitöltött levéllel — adatot ez az oldal
                  nem tárol.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
