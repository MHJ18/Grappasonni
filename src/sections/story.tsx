import { sectionCopy } from "@/data/sections";
import { copy, restaurant } from "@/data/content";
import { SectionHeading } from "@/components/section-heading";
import type { Locale } from "@/i18n/routing";

export function Story({ locale }: { locale: Locale }) {
  const c = sectionCopy[locale];
  return (
    <section id="storia" className="section story-section">
      <SectionHeading number="01" title={c.storyTitle} />
      <div className="story-editorial">
        <div className="story-year">
          <span className="small-label">{copy[locale].since}</span>
          <span className="story-year-number">{restaurant.since}</span>
        </div>
        <div className="story-editorial-copy">
          <h3>{c.storyIntro}</h3>
          <p>{c.storyBody}</p>
          <div className="story-markers">
            <span>
              <b>{restaurant.since}</b>
              {c.storyStart}
            </span>
            <span>{c.storyNow}</span>
          </div>
          <p className="verification-note">{c.storyNote}</p>
        </div>
      </div>
    </section>
  );
}
