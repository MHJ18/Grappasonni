"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Tabs, Tab } from "@mui/material";
import { ArrowUpRightIcon, StarIcon } from "@phosphor-icons/react";
import { sectionCopy, reviewExcerpts } from "@/data/sections";
import { restaurant } from "@/data/content";
import type { Locale } from "@/i18n/routing";
import type { ReviewsResult } from "@/lib/server/reviews";
const googleLink =
  "https://www.google.com/maps/search/?api=1&query=Ristorante+Grappasonni+dal+1908&query_place_id=ChIJI-vDF-qJJRMRObrY4JlPg_E";
export function Reviews({ locale }: { locale: Locale }) {
  const c = sectionCopy[locale];
  const [source, setSource] = useState("fork");
  const [result, setResult] = useState<ReviewsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<"config" | "unavailable" | null>(null);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (source !== "google") return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetch(`/api/reviews?locale=${locale}`, { signal: controller.signal })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) {
          throw new Error(
            data.code === "NOT_CONFIGURED" ? "config" : "unavailable",
          );
        }
        return data;
      })
      .then((data) => {
        if (data?.source === "google") setResult(data);
      })
      .catch((reason) => {
        if (!controller.signal.aborted) {
          setResult(null);
          setError(reason.message === "config" ? "config" : "unavailable");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => {
      controller.abort();
    };
  }, [source, locale, retry]);
  return (
    <section className="section reviews-section" id="recensioni">
      <div className="reviews-title">
        <span className="small-label">05 /</span>
        <h2>{c.reviewsTitle}</h2>
        <p>{c.reviewsSubtitle}</p>
      </div>
      <Tabs
        value={source}
        onChange={(_, v) => setSource(v)}
        aria-label={
          locale === "it" ? "Fonte delle recensioni" : "Review source"
        }
        sx={{ mb: 5 }}
      >
        <Tab
          value="fork"
          label={c.forkLabel}
          id="review-tab-fork"
          aria-controls="review-panel-fork"
        />
        <Tab
          value="google"
          label={c.googleLabel}
          id="review-tab-google"
          aria-controls="review-panel-google"
        />
      </Tabs>
      {source === "fork" ? (
        <div
          className="reviews-composition"
          role="tabpanel"
          id="review-panel-fork"
          aria-labelledby="review-tab-fork"
        >
          <div className="review-score">
            <p className="score-number">
              9,7<span>/10</span>
            </p>
            <div className="review-stars" role="img" aria-label="9.7 out of 10">
              {Array.from({ length: 5 }, (_, i) => (
                <StarIcon key={i} weight="fill" size={15} />
              ))}
            </div>
            <p>{c.reviewsCount}</p>
            <span className="verification-note">{c.snapshot}</span>
            <a
              href={`${restaurant.theFork}/recensioni`}
              className="text-link"
              target="_blank"
              rel="noreferrer"
            >
              {c.reviewsRead}
              <ArrowUpRightIcon size={17} />
            </a>
          </div>
          <div className="review-quotes">
            {reviewExcerpts.slice(0, 2).map((review) => (
              <figure key={review.author}>
                <blockquote lang="it">“{review.text}…”</blockquote>
                <figcaption>
                  <span>{review.author}</span>
                  <span>{review.rating}/10 · TheFork</span>
                </figcaption>
                <span className="verification-note">{c.reviewExcerpt}</span>
              </figure>
            ))}
          </div>
        </div>
      ) : (
        <div
          className="google-reviews"
          role="tabpanel"
          id="review-panel-google"
          aria-labelledby="review-tab-google"
          aria-live="polite"
        >
          {loading ? (
            <p>{c.googleLoading}</p>
          ) : result ? (
            <>
              <div className="google-score">
                <h3>
                  {result.place.rating?.toLocaleString(locale) ?? "—"}{" "}
                  <span>/ 5</span>
                </h3>
                <p>
                  {result.place.count?.toLocaleString(locale)}{" "}
                  {locale === "it" ? "recensioni" : "reviews"}
                </p>
              </div>
              <p className="verification-note">{c.googleOrder}</p>
              <div className="google-review-list">
                {result.reviews.map((r) => (
                  <figure key={r.id}>
                    <blockquote>{r.text}</blockquote>
                    <figcaption>
                      {r.photoUri && (
                        <Image
                          unoptimized
                          src={r.photoUri}
                          alt=""
                          width={36}
                          height={36}
                          className="review-avatar"
                          loading="lazy"
                        />
                      )}
                      <a
                        href={r.authorUrl ?? r.googleMapsUri}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {r.author}
                      </a>
                      <span>{r.rating}/5</span>
                      <a
                        href={r.googleMapsUri}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Google Maps ↗
                      </a>
                    </figcaption>
                  </figure>
                ))}
              </div>
              {result.photos?.some((photo) => photo.googleMapsUri) && (
                <div className="google-photo-grid">
                  {result.photos
                    .filter((photo) => photo.googleMapsUri)
                    .slice(0, 2)
                    .map((photo) => (
                      <figure key={photo.name}>
                        <Image
                          unoptimized
                          src={`/api/place-photo?name=${encodeURIComponent(photo.name)}`}
                          alt={c.googlePhotoAlt}
                          width={photo.widthPx}
                          height={photo.heightPx}
                          sizes="(max-width:767px) 100vw, 40vw"
                          loading="lazy"
                        />
                        <figcaption>
                          {photo.authorAttributions.map((author, i) => (
                            <span key={`${author.displayName}-${i}`}>
                              {author.uri ? (
                                <a
                                  href={author.uri}
                                  rel="noreferrer"
                                  target="_blank"
                                >
                                  {author.displayName}
                                </a>
                              ) : (
                                author.displayName
                              )}
                            </span>
                          ))}
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
              <a
                className="text-link"
                href={result.place.googleMapsUri ?? googleLink}
                target="_blank"
                rel="noreferrer"
              >
                {c.googleAttribution}
                <ArrowUpRightIcon size={18} />
              </a>
            </>
          ) : (
            <div className="google-empty">
              <h3>Google Maps</h3>
              <p>{error === "config" ? c.googleEmpty : c.googleUnavailable}</p>
              {error !== "config" && (
                <button
                  type="button"
                  className="button"
                  style={{ marginRight: 24 }}
                  onClick={() => setRetry((n) => n + 1)}
                >
                  {c.googleRetry}
                </button>
              )}
              <a
                className="text-link"
                href={googleLink}
                target="_blank"
                rel="noreferrer"
              >
                {c.googleRead}
                <ArrowUpRightIcon size={18} />
              </a>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
