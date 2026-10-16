import { useEffect, useRef } from "react";
import { gsap, reducedMotion } from "../lib/motion";

const LINES = ["Egyedi fejlesztés.", "Valódi rendszerek.", "A te vállalkozásodra."];

/** Görgetésre áthaladó, elvékonyított nagybetűs kompozíció.
 *  A sorok ellentétes irányba csúsznak, a fény a sor közepén gyúl ki. */
export function KineticBand() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root || reducedMotion()) return;
    const ctx = gsap.context(() => {
      root.querySelectorAll<HTMLElement>(".kinetic__line").forEach((line, i) => {
        const dir = i % 2 === 0 ? -1 : 1;
        gsap.fromTo(
          line,
          { xPercent: dir * -9 },
          {
            xPercent: dir * 9,
            ease: "none",
            scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: 0.6 },
          },
        );
        gsap.fromTo(
          line,
          { "--lit": "0%" },
          {
            "--lit": "100%",
            ease: "none",
            scrollTrigger: { trigger: line, start: "top 85%", end: "top 35%", scrub: true },
          },
        );
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="kinetic" aria-label="Amit csinálok">
      <p className="sr-only">{LINES.join(" ")}</p>
      <div className="kinetic__lines" aria-hidden="true">
        {LINES.map((l, i) => (
          <div key={l} className={`kinetic__line kinetic__line--${i}`}>
            <span>{l}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
