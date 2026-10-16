import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

export const reducedMotion = (): boolean =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isTouch = (): boolean =>
  typeof window !== "undefined" && window.matchMedia("(hover: none), (pointer: coarse)").matches;

export const isMobileViewport = (): boolean =>
  typeof window !== "undefined" && window.matchMedia("(max-width: 760px)").matches;

/** Belépő animációk: [data-reveal] és .words elemek, egyszer futnak. */
export function initReveals(root: ParentNode = document): () => void {
  const els = root.querySelectorAll<HTMLElement>("[data-reveal], .words[data-words]");
  if (!("IntersectionObserver" in window) || reducedMotion()) {
    els.forEach((el) => el.setAttribute("data-in", ""));
    return () => {};
  }
  const pending = new Set<Element>();
  const show = (el: Element) => {
    el.setAttribute("data-in", "");
    pending.delete(el);
    io.unobserve(el);
  };
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) if (e.isIntersecting) show(e.target);
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
  );
  els.forEach((el) => {
    if (!el.hasAttribute("data-in")) {
      pending.add(el);
      io.observe(el);
    }
  });
  // Gyors görgetésnél egy elem egyetlen képkocka alatt is átugorhatja a
  // nézetet — ami már a nézet fölött van, az is jelenjen meg.
  let ticking = false;
  const sweep = () => {
    ticking = false;
    const limit = window.innerHeight * 0.92;
    pending.forEach((el) => {
      if (el.getBoundingClientRect().top < limit) show(el);
    });
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(sweep);
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => {
    io.disconnect();
    window.removeEventListener("scroll", onScroll);
  };
}

/** Mágneses vezérlő: enyhe húzás a kurzor felé, stabil kattintási felülettel. */
export function magnetic(el: HTMLElement, strength = 0.22): () => void {
  if (isTouch() || reducedMotion()) return () => {};
  const move = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    el.style.setProperty("--mx", `${(x * strength).toFixed(1)}px`);
    el.style.setProperty("--my", `${(y * strength * 0.8).toFixed(1)}px`);
  };
  const leave = () => {
    el.style.setProperty("--mx", "0px");
    el.style.setProperty("--my", "0px");
  };
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerleave", leave);
  return () => {
    el.removeEventListener("pointermove", move);
    el.removeEventListener("pointerleave", leave);
  };
}
