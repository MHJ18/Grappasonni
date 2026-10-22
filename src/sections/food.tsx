import { RipplePhoto } from "@/canvas/ripple-photo";
import { SectionHeading } from "@/components/section-heading";
import { sectionCopy } from "@/data/sections";
import type { Locale } from "@/i18n/routing";
export function Food({ locale }: { locale: Locale }) {
  const c = sectionCopy[locale];
  return (
    <section className="section food-section">
      <SectionHeading number="03" title={c.foodTitle} />
      <p className="food-intro">{c.foodBody}</p>
      <div className="food-composition">
        {["dish-01", "dish-03"].map((image, i) => (
          <figure className={`food-figure food-figure-${i + 1}`} key={image}>
            <div className="food-image" data-reveal>
              <RipplePhoto
                src={`/images/${image}.webp`}
                alt={c.foodAlts[i]}
                sizes="(max-width:767px) 100vw, 50vw"
              />
            </div>
            <figcaption>
              <span className="small-label">0{i + 1}</span>
              <h3>{c.foodCaptions[i]}</h3>
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="verification-note">{c.foodNote}</p>
    </section>
  );
}
