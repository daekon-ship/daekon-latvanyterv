import { useEffect, useRef } from "react";
import { PROCESS } from "../content";
import { Words } from "./ui";
import { gsap, reducedMotion } from "../lib/motion";
import { Scramble } from "./fx";

export function Process() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (reducedMotion()) {
      root.style.setProperty("--pp", "1");
      root.querySelectorAll(".pr__step").forEach((s) => s.classList.add("is-on"));
      return;
    }
    const steps = Array.from(root.querySelectorAll<HTMLElement>(".pr__step"));
    const ctx = gsap.context(() => {
      gsap.to(root, {
        "--pp": 1,
        ease: "none",
        scrollTrigger: {
          trigger: root.querySelector(".pr__list"),
          start: "top 78%",
          end: "bottom 55%",
          scrub: 0.4,
          onUpdate: (self) => {
            steps.forEach((s, i) => s.classList.toggle("is-on", self.progress >= i / steps.length + 0.02));
          },
        },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="folyamat" ref={ref} className="section process" aria-labelledby="folyamat-title">
      <div className="wrap">
        <div className="section-head">
          <p className="label"><Scramble text="Folyamat" /></p>
          <h2 id="folyamat-title">
            <Words text="Így dolgozom" />
          </h2>
          <p data-reveal>Öt lépés, átlátható mérföldkövekkel — mindig tudod, hol tart a projekt.</p>
        </div>
        <div className="pr__list">
          <span className="pr__rail" aria-hidden="true">
            <span className="pr__fill" />
          </span>
          <ol className="pr__steps">
          {PROCESS.map((s, i) => (
            <li key={s.title} className="pr__step">
              <span className="pr__node" aria-hidden="true" />
              <span className="pr__no">0{i + 1}</span>
              <h3 className="pr__title">{s.title}</h3>
              <p className="pr__text">{s.text}</p>
            </li>
          ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
