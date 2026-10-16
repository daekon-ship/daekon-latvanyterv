/* =========================================================================
   Mikrointerakciók — a daekon.hu meglévő eszköztárából átvéve és az új
   arculathoz igazítva: saját kurzor címkével, kattintásszikra, görgetési
   csík, dekódoló (scramble) címkék, 3D-s billenés. Érintőképernyőn és
   csökkentett mozgásnál kikapcsolnak.
   ========================================================================= */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { isTouch, reducedMotion } from "../lib/motion";

const fine = () => !isTouch() && !reducedMotion();

/** Pont + késleltetett gyűrű; linkek fölött nő, [data-cursor] címkét mutat. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!fine() || !dot.current || !ring.current) return;
    const d = dot.current;
    const r = ring.current;
    document.documentElement.classList.add("has-cursor");
    let x = -100, y = -100, rx = x, ry = y, raf = 0;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      d.style.opacity = r.style.opacity = "1";
      const t = e.target as Element | null;
      const label = t?.closest?.<HTMLElement>("[data-cursor]");
      const hot = !!t?.closest?.("a, button, input, textarea, [role=tab]");
      r.classList.toggle("is-hot", hot && !label);
      r.classList.toggle("is-label", !!label);
      r.dataset.label = label?.dataset.cursor ?? "";
    };
    const loop = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      d.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      r.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    const leave = () => (d.style.opacity = r.style.opacity = "0");
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);
  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden="true" />
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
    </>
  );
}

/** Kattintásra rövid szikrakör a márka lime és lila színeivel. */
export function ClickSpark() {
  const layer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = layer.current;
    if (!el || !fine()) return;
    type S = { x: number; y: number; a: number; born: number; node: HTMLSpanElement };
    const sparks: S[] = [];
    let raf = 0;
    const tick = (now: number) => {
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        const t = (now - s.born) / 460;
        if (t >= 1) {
          s.node.remove();
          sparks.splice(i, 1);
          continue;
        }
        const dist = 8 + (1 - (1 - t) ** 3) * 26;
        s.node.style.opacity = String(1 - t);
        s.node.style.transform = `translate3d(${s.x + Math.cos(s.a) * dist}px, ${s.y + Math.sin(s.a) * dist}px, 0) rotate(${s.a}rad) scaleX(${1 - t * 0.7})`;
      }
      raf = sparks.length ? requestAnimationFrame(tick) : 0;
    };
    const down = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      for (let i = 0; i < 8; i++) {
        const node = document.createElement("span");
        node.className = `cspark__p${i % 4 === 0 ? " is-lime" : ""}`;
        el.appendChild(node);
        sparks.push({ x: e.clientX, y: e.clientY, a: (Math.PI * 2 * i) / 8 + 0.2, born: performance.now(), node });
      }
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointerdown", down, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", down);
      cancelAnimationFrame(raf);
      sparks.forEach((s) => s.node.remove());
    };
  }, []);
  return <div ref={layer} className="cspark" aria-hidden="true" />;
}

/** Vékony görgetési csík a fejléc alján. */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let ticking = false;
    const set = () => {
      ticking = false;
      const d = document.documentElement;
      const max = d.scrollHeight - d.clientHeight;
      ref.current?.style.setProperty("--p", String(max > 0 ? d.scrollTop / max : 0));
    };
    const on = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(set);
      }
    };
    set();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, []);
  return <div ref={ref} className="scroll-progress" aria-hidden="true" />;
}

const GLYPHS = "01<>[]{}/\\|=+*#ABCDEFGHIJKLMNOPRSTUVZ";

/** Dekódoló címke: láthatóvá váláskor karakterenként „áll be". */
export function Scramble({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [out, setOut] = useState(text);
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion() || !("IntersectionObserver" in window)) return;
    let timer = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        let frame = 0;
        const run = () => {
          frame++;
          const settled = Math.floor(frame / 1.6);
          let s = "";
          for (let i = 0; i < text.length; i++)
            s += i < settled || text[i] === " " ? text[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
          setOut(s);
          if (settled < text.length) timer = window.setTimeout(run, 28);
          else setOut(text);
        };
        run();
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, [text]);
  return (
    <span ref={ref} className="scramble">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{out}</span>
    </span>
  );
}

/** Finom 3D billenés a kurzor felé, fényfolttal (--gx/--gy). */
export function Tilt({ children, className = "", max = 5 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !fine()) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--gx", `${((px + 0.5) * 100).toFixed(1)}%`);
      el.style.setProperty("--gy", `${((py + 0.5) * 100).toFixed(1)}%`);
      el.style.transform = `perspective(1000px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg)`;
    };
    const leave = () => {
      el.style.transform = "";
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [max]);
  return (
    <div ref={ref} className={`tilt ${className}`.trim()}>
      {children}
    </div>
  );
}
