import { sectionCopy } from "@/data/sections";
import type { Locale } from "@/i18n/routing";
export function Marquee({ locale }: { locale: Locale }) {
  const text = sectionCopy[locale].marquee;
  return (
    <div className="marquee" role="img" aria-label={text}>
      <div className="marquee-track" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span key={i}>
            {text} <i>✳</i>{" "}
          </span>
        ))}
      </div>
    </div>
  );
}
