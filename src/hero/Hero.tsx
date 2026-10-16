import { useEffect, useRef, useState } from "react";
import { MagneticLink, Words, Arrow } from "../components/ui";
import { MarkSvg, WordmarkSvg } from "../brand/Logo";
import { isMobileViewport, reducedMotion } from "../lib/motion";
import type { HeroScene } from "./HeroScene";
import { webglAvailable } from "./webgl";

type Mode = "webgl" | "fallback";
type Phase = "running" | "copy" | "done";

const SEEN_KEY = "daekon-intro-latta";

function setPhase(p: Phase) {
  document.documentElement.dataset.intro = p;
}

export function Hero() {
  const [mode, setMode] = useState<Mode>(() => (webglAvailable() ? "webgl" : "fallback"));
  const [skippable, setSkippable] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const sceneRef = useRef<HeroScene | null>(null);

  // Intro + WebGL jelenet
  useEffect(() => {
    const reduced = reducedMotion();
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* privát mód: nincs tárolás, teljes intro */
    }
    const revealCopy = () => {
      titleRef.current?.querySelector(".words")?.setAttribute("data-in", "");
      setPhase("copy");
    };
    const finish = () => {
      revealCopy();
      setPhase("done");
      setSkippable(false);
    };
    // Biztonsági háló: a tartalom semmiképp nem maradhat rejtve.
    const safety = window.setTimeout(finish, 6500);

    if (mode === "fallback") {
      setPhase(reduced ? "done" : "running");
      const t = window.setTimeout(revealCopy, reduced ? 0 : 450);
      const t2 = window.setTimeout(finish, reduced ? 0 : 1400);
      return () => {
        window.clearTimeout(t);
        window.clearTimeout(t2);
        window.clearTimeout(safety);
      };
    }

    setPhase(reduced ? "done" : "running");
    let disposed = false;
    // A Three.js csak itt töltődik be → az első képernyő nem vár rá.
    import("./HeroScene")
      .then(({ HeroScene }) => {
        if (disposed || !canvasRef.current) return;
        try {
          sceneRef.current = new HeroScene({
            canvas: canvasRef.current,
            mobile: isMobileViewport(),
            reducedMotion: reduced,
            shortIntro: seen,
            onIntroCopy: revealCopy,
            onIntroDone: () => {
              window.clearTimeout(safety);
              finish();
            },
            onFail: () => setMode("fallback"),
          });
          if (!reduced) setSkippable(true);
        } catch {
          setMode("fallback");
        }
      })
      .catch(() => setMode("fallback"));

    return () => {
      disposed = true;
      window.clearTimeout(safety);
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [mode]);

  // Görgetés → kamera; láthatóság → renderelés szüneteltetése
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const p = Math.min(1, Math.max(0, window.scrollY / (hero.offsetHeight * 0.9)));
        hero.style.setProperty("--hs", p.toFixed(4));
        sceneRef.current?.setScroll(p);
        if (p > 0.04 && document.documentElement.dataset.intro === "running") sceneRef.current?.skipIntro();
      });
    };
    const io = new IntersectionObserver(([e]) => sceneRef.current?.setVisible(e.isIntersecting), {
      threshold: 0,
    });
    io.observe(hero);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [mode]);

  const skip = () => {
    sceneRef.current?.skipIntro();
    setSkippable(false);
  };

  return (
    <section id="top" ref={heroRef} className={`hero hero--${mode}`} aria-labelledby="hero-title">
      <div className="hero__atmo" aria-hidden="true" />

      {mode === "webgl" ? (
        <canvas ref={canvasRef} className="hero__canvas" aria-hidden="true" />
      ) : (
        <div className="hero__fallback" aria-hidden="true">
          <div className="hero__fb-stage">
            <WordmarkSvg className="hero__fb-word" />
            <MarkSvg className="hero__fb-mark" />
          </div>
        </div>
      )}

      <div className="wrap hero__content">
        <p className="label hero__kicker">Bartalos Roland · DAEKON</p>
        <h1 id="hero-title" className="hero__title">
          <span ref={titleRef}>
            <Words manual text="Egyedi szoftverfejlesztés a cégednek." focus={["szoftverfejlesztés"]} />
          </span>
        </h1>
        <p className="hero__lead">
          Egyedi weboldalakat, webalkalmazásokat, rendelési és foglalási rendszereket fejlesztek
          vállalkozásoknak.
        </p>
        <div className="hero__ctas">
          <MagneticLink href="#kapcsolat" className="btn btn--primary btn--ring">
            Projekt egyeztetése <Arrow />
          </MagneticLink>
          <MagneticLink href="#munkak" className="btn btn--ghost">
            Munkáim megtekintése
          </MagneticLink>
        </div>
      </div>

      <div className="wrap hero__foot">
        <p className="hero__note">
          Egyszemélyes fejlesztő vállalkozás — közvetlenül velem egyeztetsz.
        </p>
        <a className="scroll-key" href="#kiosz" aria-label="Görgetés a kiemelt munkához">
          <span className="scroll-key__cap" aria-hidden="true">
            <span className="scroll-key__dot" />
          </span>
          <span className="scroll-key__txt" aria-hidden="true">
            Görgess
          </span>
        </a>
      </div>

      {skippable && (
        <button type="button" className="hero__skip" onClick={skip}>
          Intro kihagyása
        </button>
      )}
    </section>
  );
}
