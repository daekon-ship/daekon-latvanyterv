import { useEffect, useRef, type ReactNode } from "react";
import { magnetic } from "../lib/motion";
import { IMAGES } from "../assets/img";

/**
 * Szavanként maszkolt felfedés. A magyar szavakat sosem töri szét,
 * a szöveg kijelölhető és a keresők számára egyben olvasható marad.
 */
export function Words({
  text,
  focus = [],
  delay = 0,
  manual = false,
  className = "",
}: {
  text: string;
  focus?: string[];
  delay?: number;
  /** ha true, nem az IntersectionObserver indítja (pl. hero intro) */
  manual?: boolean;
  className?: string;
}) {
  const parts = text.split(" ");
  return (
    <span
      className={`words ${className}`}
      data-words={manual ? undefined : ""}
      style={{ "--d": delay } as React.CSSProperties}
    >
      {parts.map((w, i) => (
        <span key={i}>
          <span className={`w${focus.includes(w.replace(/[.,!?]/g, "")) ? " focus" : ""}`}>
            <span style={{ "--i": i } as React.CSSProperties}>{w}</span>
          </span>
          {i < parts.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}

export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return diagonal ? (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4.5 11.5 11.5 4.5M6 4.5h5.5V10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg className="btn__arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MagneticLink({
  href,
  className,
  children,
  external = false,
  onClick,
}: {
  href: string;
  className: string;
  children: ReactNode;
  external?: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  useEffect(() => (ref.current ? magnetic(ref.current) : undefined), []);
  return (
    <a
      ref={ref}
      href={href}
      className={className}
      onClick={onClick}
      {...(external ? { target: "_blank", rel: "noopener" } : {})}
    >
      {children}
    </a>
  );
}

/** Képforrás AVIF + WebP változatokkal (a bundler hash-elt URL-eket ad). */
export function imgUrl(name: string) {
  return IMAGES[name];
}

export function Picture({
  base,
  widths,
  alt,
  sizes,
  className,
  eager = false,
}: {
  base: string;
  widths: number[];
  alt: string;
  sizes: string;
  className?: string;
  eager?: boolean;
}) {
  const set = (ext: string) => widths.map((w) => `${imgUrl(`${base}-${w}.${ext}`)} ${w}w`).join(", ");
  const largest = widths[widths.length - 1];
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={set("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={set("webp")} sizes={sizes} />
      <img
        src={imgUrl(`${base}-${largest}.webp`)}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        width={largest}
        height={Math.round(largest * 0.66)}
      />
    </picture>
  );
}
