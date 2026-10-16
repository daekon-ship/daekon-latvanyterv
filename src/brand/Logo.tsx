/* Az eredeti DAEKON logórendszer (brand/svg) — sötét háttérre szánt változat:
   világos szár + DAEKON fénykék (#2B50FF) bowl, kivont Archivo wordmark. */
import { MARK_BOWL, MARK_STEM, WORDMARK_PATHS } from "./paths";

export function MarkSvg({ className = "", title }: { className?: string; title?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      <path d={MARK_STEM} fill="#F2F3F8" />
      <path d={MARK_BOWL} fill="#2B50FF" />
    </svg>
  );
}

export function WordmarkSvg({ className = "", fill = "#F2F3F8" }: { className?: string; fill?: string }) {
  return (
    <svg className={className} viewBox="-8 -8 720.93 116" aria-hidden="true" focusable="false">
      {WORDMARK_PATHS.map((d, i) => (
        <path key={i} d={d} fill={fill} />
      ))}
    </svg>
  );
}
