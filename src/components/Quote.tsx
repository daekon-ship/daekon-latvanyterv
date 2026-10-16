import { useEffect, useMemo, useRef, useState } from "react";
import {
  estimateWithExtras,
  featureById,
  formatFt,
  formatWeeks,
  mailtoHref,
  type QuoteResult,
} from "../lib/quoteEstimator";
import { Words } from "./ui";
import { Scramble } from "./fx";

/* =========================================================================
   Ajánlatkérő asszisztens — a daekon.hu meglévő funkciója, új köntösben.
   Teljesen a böngészőben fut: kulcsszavak alapján tájékoztató becslést ad,
   gyorsgombokkal bővíthető, és előre kitöltött e-mailként küldhető el.
   Nem állítja, hogy az ár végleges, és nem állítja, hogy üzenet ment el.
   ========================================================================= */

interface Msg {
  id: number;
  from: "user" | "ai";
  text: string;
  resultFor?: string;
}

const EXAMPLES = [
  "Online rendelés az éttermemnek, konyhai felülettel",
  "Időpontfoglaló a szalonomnak, adminnal",
  "Webáruház bankkártyás fizetéssel",
];
const QUICK_IDS = ["design", "admin", "auth", "payment", "automation", "seo", "mobile", "motion3d", "blog", "maintenance"];
const GREETING =
  "Szia! Írd le egy-két mondatban, mit szeretnél — úgy, ahogy egy kollégának elmesélnéd. Kapsz egy tájékoztató becslést árra és időre. Minden a böngésződben marad.";

export function Quote() {
  const [msgs, setMsgs] = useState<Msg[]>([{ id: 0, from: "ai", text: GREETING }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [extras, setExtras] = useState<string[]>([]);
  const idRef = useRef(1);
  const scroller = useRef<HTMLDivElement>(null);

  const latest = useMemo(() => [...msgs].reverse().find((m) => m.from === "ai" && m.resultFor), [msgs]);
  const result: QuoteResult | null = useMemo(
    () => (latest ? estimateWithExtras(latest.resultFor ?? "", extras) : null),
    [latest, extras],
  );
  const baseIds = useMemo(
    () => (latest ? estimateWithExtras(latest.resultFor ?? "", []).features.map((f) => f.id) : []),
    [latest],
  );
  const quick = QUICK_IDS.filter((id) => !baseIds.includes(id));

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [msgs, typing, extras]);

  const send = (override?: string) => {
    const text = (override ?? input).trim();
    if (!text || typing) return;
    setMsgs((m) => [...m, { id: idRef.current++, from: "user", text }]);
    setInput("");
    setExtras([]);
    setTyping(true);
    window.setTimeout(() => {
      const q = estimateWithExtras(text, []);
      setTyping(false);
      setMsgs((m) => [
        ...m,
        q.features.length
          ? { id: idRef.current++, from: "ai", text: "Ezt látom ki belőle:", resultFor: text }
          : {
              id: idRef.current++,
              from: "ai",
              text: "Ebből még nem tudok számolni. Írj olyasmit, hogy weboldal, webáruház, rendelés, foglalás, adminfelület, fizetés vagy automatizálás.",
            },
      ]);
    }, 650);
  };

  const reset = () => {
    setExtras([]);
    setMsgs([{ id: idRef.current++, from: "ai", text: GREETING }]);
  };

  return (
    <section id="ajanlat" className="section quote" aria-labelledby="ajanlat-title">
      <div className="wrap quote__grid">
        <div className="quote__copy">
          <p className="label"><Scramble text="Ajánlatkérés" /></p>
          <h2 id="ajanlat-title">
            <Words text="Mennyibe kerülne?" focus={["kerülne?"]} />
          </h2>
          <p data-reveal>
            Írd le a projektedet, és az asszisztens azonnal ad egy tájékoztató becslést. A végleges
            ajánlatot a részletek ismeretében én magam írom meg — ez csak egy gyors első kép.
          </p>
          <ul className="quote__facts" data-reveal style={{ "--d": 120 } as React.CSSProperties}>
            <li>A böngésződben fut, semmit nem küld el magától.</li>
            <li>A becslés tájékoztató, nem kötelező érvényű ár vagy határidő.</li>
            <li>Egy gombnyomással elküldheted nekem e-mailben.</li>
          </ul>
        </div>

        <div className="qa" data-reveal="fade">
          <div className="qa__head">
            <span className="qa__dot" aria-hidden="true" />
            <span className="qa__name">DAEKON asszisztens</span>
            <span className="qa__tag">tájékoztató becslés</span>
            <button type="button" className="qa__reset" onClick={reset} aria-label="Új beszélgetés">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M3 8a5 5 0 1 0 1.5-3.6M3 2.5V5h2.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className="qa__scroll" ref={scroller} aria-live="polite">
            {msgs.map((m) => (
              <div key={m.id} className={`qa__row qa__row--${m.from}`}>
                <div className={`qa__bubble qa__bubble--${m.from}`}>
                  <p>{m.text}</p>
                  {m.resultFor && result && m.id === latest?.id && (
                    <div className="qa__est">
                      <div className="qa__amount">
                        {formatFt(result.min)}–{formatFt(result.max)} Ft
                      </div>
                      <div className="qa__time">
                        kb. {formatWeeks(result.weeksMin, result.weeksMax)}
                        {result.recurring
                          ? ` · + ${formatFt(result.recurring.min)}–${formatFt(result.recurring.max)} Ft/hó`
                          : ""}
                      </div>
                      <ul className="qa__feats">
                        {result.features.map((f) => (
                          <li key={f.id}>{f.label}</li>
                        ))}
                      </ul>
                      {quick.length > 0 && (
                        <>
                          <p className="qa__ask">Kell még valami? Koppints rá, és frissítem:</p>
                          <div className="qa__chips">
                            {quick.map((id) => {
                              const f = featureById(id);
                              if (!f) return null;
                              const on = extras.includes(id);
                              return (
                                <button
                                  key={id}
                                  type="button"
                                  className={`qa__chip${on ? " is-on" : ""}`}
                                  aria-pressed={on}
                                  onClick={() => setExtras((e) => (on ? e.filter((x) => x !== id) : [...e, id]))}
                                >
                                  {on ? "✓" : "+"} {f.label}
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                      <p className="qa__note">Tájékoztató becslés — a végleges árat a részletek után adom meg.</p>
                      <a className="btn btn--primary qa__send" href={mailtoHref(m.resultFor, result)}>
                        Elküldöm e-mailben
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="qa__row qa__row--ai">
                <div className="qa__bubble qa__bubble--ai qa__typing" aria-label="Az asszisztens számol">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
            )}
          </div>

          <div className="qa__examples">
            {EXAMPLES.map((ex) => (
              <button key={ex} type="button" className="qa__example" onClick={() => send(ex)}>
                {ex}
              </button>
            ))}
          </div>

          <form
            className="qa__input"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <label htmlFor="qa-in" className="sr-only">
              A projekted leírása
            </label>
            <input
              id="qa-in"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Írd le, mit szeretnél…"
              autoComplete="off"
            />
            <button type="submit" className="btn btn--primary qa__go" disabled={!input.trim() || typing}>
              Küldés
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
