"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { Tab, Tabs } from "@mui/material";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  PauseIcon,
  PlayIcon,
  StarIcon,
} from "@phosphor-icons/react";
import { reviewExcerpts, sectionCopy } from "@/data/sections";
import {
  googleRestaurantLink,
  sarabMediaCopy,
  theForkReviewSnapshot,
} from "@/data/sarab-media";
import type { ReviewsResult } from "@/lib/server/reviews";
import type { Locale } from "@/i18n/routing";
import { useAppearance } from "@/components/appearance-provider";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}
const avatarStyle = {
  width: 46,
  height: 46,
  borderRadius: "50%",
  border: "3px solid var(--primary)",
  background: "var(--cream2)",
  color: "var(--primary)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  fontSize: 14,
  fontWeight: 600,
};

function Stars({
  rating,
  maximum = 5,
  label,
}: {
  rating: number;
  maximum?: number;
  label: string;
}) {
  const stars = (rating / maximum) * 5;
  return (
    <div
      className="tess"
      style={{ display: "flex", gap: 3 }}
      role="img"
      aria-label={`${label}: ${rating}/${maximum}`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <StarIcon
          key={index}
          size={14}
          weight={index < Math.round(stars) ? "fill" : "regular"}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export function SarabReviews({ locale }: { locale: Locale }) {
  const appearance = useAppearance();
  const c = sectionCopy[locale];
  const m = sarabMediaCopy[locale];
  const id = useId();
  const [source, setSource] = useState<"fork" | "google">("fork");
  const [position, setPosition] = useState<number>(reviewExcerpts.length);
  const [sliding, setSliding] = useState(false);
  const moving = useRef(false);
  const [perView, setPerView] = useState(1);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [visible, setVisible] = useState(true);
  const [result, setResult] = useState<ReviewsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<"config" | "unavailable" | null>(null);
  const [retry, setRetry] = useState(0);
  const section = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const index = position % reviewExcerpts.length;

  const move = useCallback((amount: number) => {
    if (moving.current) return;
    moving.current = true;
    setSliding(true);
    setPosition((current) => current + amount);
  }, []);

  useEffect(() => {
    const element = section.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) =>
      setInView(entry.isIntersecting),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!moving.current) return;
    const timer = setTimeout(
      () => {
        setSliding(false);
        setPosition(
          (current) =>
            reviewExcerpts.length +
            (((current % reviewExcerpts.length) + reviewExcerpts.length) %
              reviewExcerpts.length),
        );
        moving.current = false;
      },
      reduced || !appearance.motion ? 0 : 440,
    );
    return () => clearTimeout(timer);
  }, [position, reduced, appearance.motion]);

  useEffect(() => {
    const desktop = matchMedia("(min-width: 1024px)");
    const tablet = matchMedia("(min-width: 640px)");
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setPerView(desktop.matches ? 3 : tablet.matches ? 2 : 1);
      setReduced(motion.matches);
    };
    const visibility = () => setVisible(document.visibilityState === "visible");
    update();
    visibility();
    desktop.addEventListener("change", update);
    tablet.addEventListener("change", update);
    motion.addEventListener("change", update);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      desktop.removeEventListener("change", update);
      tablet.removeEventListener("change", update);
      motion.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  useEffect(() => {
    if (
      source !== "fork" ||
      !appearance.motion ||
      reduced ||
      paused ||
      hovering ||
      focused ||
      !visible ||
      !inView
    )
      return;
    const timer = setInterval(() => move(1), 4000);
    return () => clearInterval(timer);
  }, [
    source,
    reduced,
    paused,
    hovering,
    focused,
    visible,
    inView,
    move,
    appearance.motion,
  ]);

  useEffect(() => {
    if (source !== "google") return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setResult(null);
    fetch(`/api/reviews?locale=${locale}`, { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok)
          throw new Error(
            data.code === "NOT_CONFIGURED" ? "config" : "unavailable",
          );
        if (data?.source !== "google") throw new Error("unavailable");
        return data as ReviewsResult;
      })
      .then(setResult)
      .catch((reason: unknown) => {
        if (!controller.signal.aborted)
          setError(
            reason instanceof Error && reason.message === "config"
              ? "config"
              : "unavailable",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [source, locale, retry]);

  const step = (amount: number) => {
    setPaused(true);
    move(amount);
  };
  // The duplicate cycles only make the loop seamless; hidden copies leave the accessibility tree.
  const displayed = [...reviewExcerpts, ...reviewExcerpts, ...reviewExcerpts];
  const panelStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${perView}, minmax(0, 1fr))`,
    gap: 22,
  };

  return (
    <section id="testimonials" className="sarab-reviews" ref={section}>
      <span id="recensioni" className="sarab-anchor" aria-hidden="true" />
      <div className="container">
        <div className="text-center mb-5">
          <span className="slbl">{m.reviewLabel}</span>
          <h2 className="stitle">
            {m.reviewHeading[0]} <span>{m.reviewHeading[1]}</span>
          </h2>
          <div className="sline" />
          <p className="sdesc">{c.reviewsSubtitle}</p>
        </div>
        <Tabs
          value={source}
          onChange={(_, value: "fork" | "google") => {
            setSource(value);
            if (value === "google") setLoading(true);
          }}
          aria-label={m.reviewSources}
          centered
          sx={{
            mb: 3,
            "& .MuiTab-root": { color: "#666" },
            "& .MuiTab-root.Mui-selected": { color: "var(--primary)" },
            "& .MuiTabs-indicator": { backgroundColor: "var(--primary)" },
          }}
        >
          <Tab
            value="fork"
            label={c.forkLabel}
            id={`${id}-fork-tab`}
            aria-controls={`${id}-fork-panel`}
          />
          <Tab
            value="google"
            label={c.googleLabel}
            id={`${id}-google-tab`}
            aria-controls={`${id}-google-panel`}
          />
        </Tabs>
        {source === "fork" ? (
          <div
            id={`${id}-fork-panel`}
            role="tabpanel"
            aria-labelledby={`${id}-fork-tab`}
          >
            <div className="sarab-review-summary">
              <strong>
                {theForkReviewSnapshot.rating.toLocaleString(locale)}
                <small>/10</small>
              </strong>
              <span>{c.reviewsCount}</span>
              <span>{c.snapshot}</span>
            </div>
            <div
              className="swiper tesSwiper"
              style={{ overflow: "hidden", width: "100%" }}
              aria-roledescription="carousel"
              aria-label={c.forkLabel}
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
              onFocusCapture={() => setFocused(true)}
              onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget))
                  setFocused(false);
              }}
            >
              <div
                className="sarab-testimonial-track"
                style={{
                  display: "flex",
                  gap: 22,
                  transform: `translateX(calc(-${(position * 100) / perView}% - ${(position * 22) / perView}px))`,
                  transition:
                    sliding && !reduced
                      ? "transform 400ms var(--ease-out)"
                      : "none",
                }}
                aria-live={paused ? "polite" : "off"}
              >
                {displayed.map((review, slide) => (
                  <article
                    key={`${slide}-${review.author}`}
                    className="tescard"
                    aria-roledescription="slide"
                    aria-label={`${(slide % reviewExcerpts.length) + 1} / ${reviewExcerpts.length}`}
                    aria-hidden={
                      slide < position || slide >= position + perView
                        ? true
                        : undefined
                    }
                    style={{
                      flex: `0 0 calc(${100 / perView}% - ${((perView - 1) * 22) / perView}px)`,
                      minHeight: 250,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <span className="tesq" aria-hidden="true">
                      “
                    </span>
                    <Stars
                      rating={review.rating}
                      maximum={10}
                      label={m.rating}
                    />
                    <blockquote className="testxt" lang="it">
                      {review.text}
                    </blockquote>
                    <div className="tesauth" style={{ marginTop: "auto" }}>
                      <span
                        className="tesavatar"
                        aria-hidden="true"
                        style={avatarStyle}
                      >
                        {initials(review.author)}
                      </span>
                      <div>
                        <div className="tesnm">{review.author}</div>
                        <div className="tesrl">
                          {review.rating}/10 · {review.source}
                        </div>
                      </div>
                    </div>
                    <a
                      className="sarab-review-source"
                      href={theForkReviewSnapshot.source}
                      target="_blank"
                      rel="noreferrer"
                      tabIndex={
                        slide >= position && slide < position + perView ? 0 : -1
                      }
                    >
                      {c.reviewExcerpt}{" "}
                      <ArrowUpRightIcon size={13} aria-hidden="true" />
                    </a>
                  </article>
                ))}
              </div>
              <div className="sarab-review-controls">
                <button
                  type="button"
                  className="sarab-carousel-arrow"
                  aria-label={m.previousReview}
                  onClick={() => step(-1)}
                >
                  <ArrowLeftIcon size={18} />
                </button>
                <div
                  className="swiper-pagination"
                  style={{
                    position: "static",
                    width: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {reviewExcerpts.map((review, target) => (
                    <button
                      key={review.author}
                      type="button"
                      className="sarab-carousel-dot"
                      style={{
                        width: 44,
                        height: 44,
                        border: 0,
                        padding: 0,
                        background: "transparent",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      aria-label={`${m.goToReview} ${target + 1}: ${review.author}`}
                      aria-current={target === index ? "true" : undefined}
                      onClick={() => {
                        setPaused(true);
                        moving.current = false;
                        setSliding(false);
                        setPosition(reviewExcerpts.length + target);
                      }}
                    >
                      <span
                        aria-hidden="true"
                        className={`swiper-pagination-bullet${target === index ? " swiper-pagination-bullet-active" : ""}`}
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background:
                            target === index ? "var(--primary)" : "#bbb",
                          opacity: 1,
                          margin: 0,
                        }}
                      />
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="sarab-carousel-arrow"
                  aria-label={m.nextReview}
                  onClick={() => step(1)}
                >
                  <ArrowRightIcon size={18} />
                </button>
                {!reduced && (
                  <button
                    type="button"
                    className="sarab-carousel-arrow"
                    aria-label={paused ? m.playReviews : m.pauseReviews}
                    onClick={() => setPaused((value) => !value)}
                  >
                    {paused ? <PlayIcon size={17} /> : <PauseIcon size={17} />}
                  </button>
                )}
              </div>
            </div>
            <p className="sarab-review-credit">
              <a
                href={theForkReviewSnapshot.source}
                target="_blank"
                rel="noreferrer"
              >
                {c.reviewsRead}{" "}
                <ArrowUpRightIcon size={15} aria-hidden="true" />
              </a>
            </p>
          </div>
        ) : (
          <div
            id={`${id}-google-panel`}
            role="tabpanel"
            aria-labelledby={`${id}-google-tab`}
            aria-live="polite"
            aria-busy={loading}
          >
            {loading ? (
              <p className="text-center sdesc">{c.googleLoading}</p>
            ) : result ? (
              <>
                <div className="sarab-review-summary">
                  <strong>
                    {result.place.rating?.toLocaleString(locale) ?? "—"}
                    <small>/5</small>
                  </strong>
                  {result.place.count !== null && (
                    <span>
                      {result.place.count.toLocaleString(locale)}{" "}
                      {locale === "it" ? "recensioni" : "reviews"}
                    </span>
                  )}
                  <span>{c.googleOrder}</span>
                </div>
                <div
                  className="sarab-testimonial-grid sarab-google-review-grid"
                  style={panelStyle}
                >
                  {result.reviews.map((review) => (
                    <article className="tescard" key={review.id}>
                      <span className="tesq" aria-hidden="true">
                        “
                      </span>
                      <Stars rating={review.rating} label={m.rating} />
                      <blockquote className="testxt">{review.text}</blockquote>
                      <div className="tesauth">
                        {review.photoUri ? (
                          <Image
                            src={review.photoUri}
                            alt=""
                            width={46}
                            height={46}
                            unoptimized
                            loading="lazy"
                          />
                        ) : (
                          <span
                            className="tesavatar"
                            aria-hidden="true"
                            style={avatarStyle}
                          >
                            {initials(review.author)}
                          </span>
                        )}
                        <div>
                          <a
                            className="tesnm"
                            href={review.authorUrl ?? review.googleMapsUri}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {review.author}
                          </a>
                          <div className="tesrl">
                            {review.rating}/5 · Google Maps
                          </div>
                        </div>
                      </div>
                      <a
                        className="sarab-review-source"
                        href={review.googleMapsUri}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Google Maps{" "}
                        <ArrowUpRightIcon size={13} aria-hidden="true" />
                      </a>
                    </article>
                  ))}
                </div>
                {result.reviews.length === 0 && (
                  <p className="text-center sdesc">{m.noGoogleReviews}</p>
                )}
                {result.photos.some((photo) => photo.googleMapsUri) && (
                  <div className="sarab-google-photos row g-3">
                    {result.photos
                      .filter((photo) => photo.googleMapsUri)
                      .slice(0, 2)
                      .map((photo) => (
                        <figure className="col-md-6" key={photo.name}>
                          <Image
                            src={`/api/place-photo?name=${encodeURIComponent(photo.name)}`}
                            alt={c.googlePhotoAlt}
                            width={photo.widthPx}
                            height={photo.heightPx}
                            sizes="(max-width:767px) 100vw, 45vw"
                            unoptimized
                            loading="lazy"
                            style={{
                              width: "100%",
                              height: "auto",
                              borderRadius: 14,
                            }}
                          />
                          <figcaption>
                            {photo.authorAttributions.map(
                              (author, position) => (
                                <span key={`${author.displayName}-${position}`}>
                                  {author.uri ? (
                                    <a
                                      href={author.uri}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      {author.displayName}
                                    </a>
                                  ) : (
                                    author.displayName
                                  )}{" "}
                                </span>
                              ),
                            )}
                            <a
                              href={photo.googleMapsUri}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {c.googlePhotoSource} ↗
                            </a>
                          </figcaption>
                        </figure>
                      ))}
                  </div>
                )}
                <p className="sarab-review-credit">
                  <a
                    href={result.place.googleMapsUri ?? googleRestaurantLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {c.googleAttribution}{" "}
                    <ArrowUpRightIcon size={15} aria-hidden="true" />
                  </a>
                  <span>
                    {m.GoogleSnapshot}{" "}
                    {new Date(result.fetchedAt).toLocaleDateString(locale, {
                      timeZone: "Europe/Rome",
                    })}
                  </span>
                </p>
              </>
            ) : (
              <div className="sarab-google-empty text-center">
                <h3>Google Maps</h3>
                <p className="sdesc">
                  {error === "config" ? c.googleEmpty : c.googleUnavailable}
                </p>
                {error !== "config" && (
                  <button
                    type="button"
                    className="btn-red"
                    onClick={() => setRetry((value) => value + 1)}
                  >
                    {c.googleRetry}
                  </button>
                )}
                <a
                  className="sarab-review-source"
                  href={googleRestaurantLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  {c.googleRead}{" "}
                  <ArrowUpRightIcon size={15} aria-hidden="true" />
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
