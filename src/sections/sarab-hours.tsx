import { sarabContactCopy } from "@/data/sarab-contact";
import { restaurant } from "@/data/content";
import type { Locale } from "@/i18n/routing";

export function SarabHours({ locale }: { locale: Locale }) {
  const c = sarabContactCopy[locale];
  const copy = c.hours;
  return (
    <section id="hours" aria-labelledby="hours-title">
      <div className="hrsbg" aria-hidden="true" />
      <div className="container" style={{ position: "relative", zIndex: 2 }}>
        <div className="text-center mb-5" data-aos="fade-up">
          <span className="slbl" style={{ color: "#a5d6bc" }}>
            {copy.eyebrow}
          </span>
          <h2 className="stitle" id="hours-title" style={{ color: "#fff" }}>
            {copy.title[0]}{" "}
            <span style={{ color: "var(--secondary)" }}>{copy.title[1]}</span>
          </h2>
          <div className="sline" />
        </div>
        <div className="row g-4 align-items-start">
          <div className="col-lg-5" data-aos="fade-right">
            <div className="hrscard">
              {copy.days.map((day) => (
                <div className="hrsrow" key={day}>
                  <span className="hrsday">
                    <i
                      className="fas fa-calendar-day me-2"
                      style={{ color: "var(--secondary)" }}
                      aria-hidden="true"
                    />
                    {day}
                  </span>
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="hdot"
                      aria-hidden="true"
                      style={{ background: "var(--secondary)" }}
                    />
                    <span className="hrstime" style={{ fontSize: ".72rem" }}>
                      {c.hoursStatus}
                    </span>
                  </div>
                </div>
              ))}
              <p
                style={{
                  color: "rgba(255,255,255,.65)",
                  fontSize: ".73rem",
                  margin: "14px 0 0",
                }}
              >
                {copy.note}
              </p>
            </div>
          </div>
          <div className="col-lg-3" data-aos="zoom-in">
            <div className="hrscta">
              <i
                className="fas fa-calendar-check fa-2x mb-3"
                style={{ color: "rgba(255,255,255,.8)" }}
                aria-hidden="true"
              />
              <h4>{copy.ctaTitle}</h4>
              <p>{copy.ctaBody}</p>
              <a href="#reservation" className="btnw">
                {copy.cta} <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
          <div className="col-lg-4" data-aos="fade-left">
            <div className="hrscard">
              <h5
                style={{
                  color: "#fff",
                  marginBottom: 18,
                  fontFamily: "Poppins, sans-serif",
                  fontSize: ".95rem",
                  fontWeight: 700,
                }}
              >
                <i
                  className="fas fa-map-marker-alt me-2"
                  style={{ color: "var(--secondary)" }}
                  aria-hidden="true"
                />
                {copy.find}
              </h5>
              <div className="hrsrow">
                <span className="hrsday">
                  <i
                    className="fas fa-location-dot me-2"
                    style={{ color: "var(--secondary)" }}
                    aria-hidden="true"
                  />
                  {c.addressLabel}
                </span>
                <span
                  className="hrstime"
                  style={{ fontSize: ".8rem", textAlign: "right" }}
                >
                  {c.address}
                  <br />
                  {c.city}
                </span>
              </div>
              <div className="hrsrow">
                <span className="hrsday">
                  <i
                    className="fas fa-phone me-2"
                    style={{ color: "var(--secondary)" }}
                    aria-hidden="true"
                  />
                  {c.phoneLabel}
                </span>
                <span
                  className="hrstime"
                  style={{ fontSize: ".8rem", textAlign: "right" }}
                >
                  <a
                    href={"tel:" + restaurant.phone}
                    style={{ color: "inherit" }}
                  >
                    {c.phone}
                  </a>
                  <br />
                  <small>{c.phoneStatus}</small>
                </span>
              </div>
              <div className="hrsrow">
                <span className="hrsday">
                  <i
                    className="fas fa-utensils me-2"
                    style={{ color: "var(--secondary)" }}
                    aria-hidden="true"
                  />
                  {copy.sourceLabel}
                </span>
                <span className="hrstime" style={{ fontSize: ".8rem" }}>
                  <a
                    href={restaurant.theFork}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "inherit" }}
                  >
                    {copy.source} ↗
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
