"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { sarabContactCopy } from "@/data/sarab-contact";
import Image from "next/image";
import { ArrowRightIcon, CircleNotchIcon } from "@phosphor-icons/react";
import { restaurant } from "@/data/content";
import type { Locale } from "@/i18n/routing";

type Field = "name" | "email" | "phone" | "subject" | "message" | "consent";
type Status =
  | "idle"
  | "submitting"
  | "pending"
  | "validation"
  | "notConfigured"
  | "unavailable"
  | "rateLimited";
type Errors = Partial<Record<Field, string>>;
const cardStyle = {
  background: "#fff",
  borderRadius: 18,
  padding: 32,
  boxShadow: "0 6px 30px rgba(0,0,0,.08)",
  position: "relative" as const,
};

function useInquiry(kind: "contact" | "newsletter", locale: Locale) {
  const c = sarabContactCopy[locale];
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [version, setVersion] = useState(0);
  const requestRef = useRef<AbortController | null>(null);
  useEffect(() => () => requestRef.current?.abort("unmounted"), []);
  const fieldId = (field: Field) =>
    kind === "newsletter" && field === "email" ? "nlEmail" : kind + "-" + field;
  const showErrors = (next: Errors) => {
    setErrors(next);
    setStatus("validation");
    const first = (
      ["name", "email", "phone", "subject", "message", "consent"] as Field[]
    ).find((field) => next[field]);
    if (first)
      requestAnimationFrame(() =>
        document.getElementById(fieldId(first))?.focus(),
      );
  };
  const clear = (field: Field) => {
    setErrors((current) => ({ ...current, [field]: undefined }));
    if (status !== "submitting" && status !== "pending") setStatus("idle");
  };
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (requestRef.current || status === "pending") return;
    const values = new FormData(event.currentTarget);
    const text = (name: string) => String(values.get(name) ?? "").trim();
    const email = text("email");
    const consent = values.get("consent") === "on";
    const next: Errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
      next.email = c.contact.errors.email;
    if (!consent)
      next.consent =
        kind === "contact" ? c.contact.errors.consent : c.newsletter.validation;
    let contactValues:
      { name: string; subject: string; message: string } | undefined;
    if (kind === "contact") {
      const name = text("name"),
        subject = text("subject"),
        message = text("message"),
        phone = text("phone");
      if (
        name.length < 2 ||
        name.length > 100 ||
        /[\u0000-\u001f\u007f]/.test(name)
      )
        next.name = c.contact.errors.name;
      if (
        subject.length < 2 ||
        subject.length > 120 ||
        /[\u0000-\u001f\u007f]/.test(subject)
      )
        next.subject = c.contact.errors.subject;
      if (
        message.length < 5 ||
        message.length > 3900 ||
        /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(message)
      )
        next.message = c.contact.errors.message;
      if (phone && (!/^[+\d\s().-]{6,32}$/.test(phone) || !/\d/.test(phone)))
        next.phone = c.contact.errors.phone;
      contactValues = {
        name,
        subject,
        message: phone
          ? c.contact.phonePrefix + ": " + phone + "\n\n" + message
          : message,
      };
    }
    if (Object.keys(next).length) {
      showErrors(next);
      return;
    }
    const payload = {
      kind,
      email,
      consent,
      website: text("website"),
      locale,
      ...contactValues,
    };
    setErrors({});
    setStatus("submitting");
    const controller = new AbortController();
    requestRef.current = controller;
    const timeout = window.setTimeout(
      () => controller.abort("timeout"),
      20_000,
    );
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const result: {
        ok?: boolean;
        status?: string;
        code?: string;
        fieldErrors?: Record<string, unknown>;
      } = await response.json().catch(() => ({}));
      if (response.status === 202 && result.ok && result.status === "pending")
        setStatus("pending");
      else if (response.status === 503 && result.code === "NOT_CONFIGURED")
        setStatus("notConfigured");
      else if (response.status === 429) setStatus("rateLimited");
      else if (response.status === 400 && result.fieldErrors) {
        const serverErrors: Errors = {};
        for (const field of [
          "name",
          "email",
          "subject",
          "message",
          "consent",
        ] as Field[])
          if (result.fieldErrors[field])
            serverErrors[field] = c.contact.errors[field];
        if (Object.keys(serverErrors).length) showErrors(serverErrors);
        else setStatus("unavailable");
      } else setStatus("unavailable");
    } catch {
      if (controller.signal.reason !== "unmounted") setStatus("unavailable");
    } finally {
      window.clearTimeout(timeout);
      if (requestRef.current === controller) requestRef.current = null;
    }
  }
  return {
    status,
    errors,
    version,
    clear,
    submit,
    busy: status === "submitting",
    locked: status === "submitting" || status === "pending",
    reset: () => {
      setVersion((value) => value + 1);
      setErrors({});
      setStatus("idle");
      requestAnimationFrame(() =>
        document
          .getElementById(fieldId(kind === "contact" ? "name" : "email"))
          ?.focus(),
      );
    },
  };
}

export function SarabContact({ locale }: { locale: Locale }) {
  const c = sarabContactCopy[locale];
  const copy = c.contact;
  const form = useInquiry("contact", locale);
  const [map, setMap] = useState(false);
  const field = (name: Exclude<Field, "consent">) => ({
    id: "contact-" + name,
    name,
    className: "fctrl",
    disabled: form.locked,
    onChange: () => form.clear(name),
    "aria-invalid": Boolean(form.errors[name]),
    "aria-describedby": "contact-" + name + "-help",
  });
  const help = (name: Exclude<Field, "consent">) => (
    <p
      id={"contact-" + name + "-help"}
      style={{ fontSize: ".75rem", color: "#b32318", margin: "6px 0 0" }}
    >
      {form.errors[name]}
    </p>
  );
  const feedback =
    form.status === "idle" || form.status === "submitting"
      ? ""
      : copy[form.status];
  return (
    <section id="contact-section" aria-labelledby="contact-title">
      <span id="dove" aria-hidden="true" />
      <div className="container">
        <div className="text-center mb-5" data-aos="fade-up">
          <span className="slbl">{copy.eyebrow}</span>
          <h2 className="stitle" id="contact-title">
            {copy.title[0]} <span>{copy.title[1]}</span>
          </h2>
          <div className="sline" />
          <p className="sdesc mx-auto" style={{ maxWidth: 480 }}>
            {copy.description}
          </p>
        </div>
        <div className="row g-4">
          <div className="col-lg-4" data-aos="fade-right">
            <div className="ctdark">
              <h4>{copy.infoTitle}</h4>
              <p className="ctsub">{copy.infoBody}</p>
              <div className="ctitem">
                <div className="cticon">
                  <i className="fas fa-map-marker-alt" aria-hidden="true" />
                </div>
                <div className="ctinfo">
                  <strong>{c.addressLabel}</strong>
                  <span>
                    {c.address}
                    <br />
                    {c.city}
                  </span>
                </div>
              </div>
              <div className="ctitem">
                <div className="cticon">
                  <i className="fas fa-phone-alt" aria-hidden="true" />
                </div>
                <div className="ctinfo">
                  <strong>{c.phoneLabel}</strong>
                  <span>
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
              </div>
              <div className="ctitem">
                <div className="cticon">
                  <i className="fas fa-calendar-check" aria-hidden="true" />
                </div>
                <div className="ctinfo">
                  <strong>{c.bookingLabel}</strong>
                  <span>
                    <a
                      href={restaurant.theFork}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "inherit" }}
                    >
                      {c.bookingLink} ↗
                    </a>
                  </span>
                </div>
              </div>
              <div className="ctitem">
                <div className="cticon">
                  <i className="fas fa-clock" aria-hidden="true" />
                </div>
                <div className="ctinfo">
                  <strong>{c.hoursLabel}</strong>
                  <span>{c.hoursStatus}</span>
                </div>
              </div>
              <div className="ctsocrow">
                <a href={"tel:" + restaurant.phone} aria-label={c.phoneLabel}>
                  <i className="fas fa-phone-alt" aria-hidden="true" />
                </a>
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=Via+Appia+Nuova+858+Roma"
                  target="_blank"
                  rel="noreferrer"
                  aria-label={c.directions}
                >
                  <i className="fas fa-location-dot" aria-hidden="true" />
                </a>
                <a href="#reservation" aria-label={c.bookingLabel}>
                  <i className="fas fa-calendar-check" aria-hidden="true" />
                </a>
                <a
                  href={restaurant.theFork}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={c.bookingLink}
                >
                  <i className="fas fa-utensils" aria-hidden="true" />
                </a>
              </div>
              <button
                type="button"
                className="btnw mt-4"
                onClick={() => setMap(true)}
                aria-expanded={map}
                aria-controls={map ? "contact-map" : undefined}
              >
                {c.mapLoad}
              </button>
              <p
                style={{
                  color: "rgba(255,255,255,.55)",
                  fontSize: ".73rem",
                  marginTop: 10,
                  marginBottom: 0,
                }}
              >
                {c.mapNote}
              </p>
            </div>
          </div>
          <div className="col-lg-8" data-aos="fade-left">
            <form
              key={form.version}
              onSubmit={form.submit}
              noValidate
              className="sarab-form-card contact-form"
              style={cardStyle}
              aria-busy={form.busy}
            >
              <p
                style={{ fontSize: ".75rem", color: "#777", marginBottom: 16 }}
              >
                {copy.required}
              </p>
              <div className="row g-3">
                <div className="col-sm-6">
                  <label className="flbl" htmlFor="contact-name">
                    {copy.titleName} *
                  </label>
                  <input
                    {...field("name")}
                    type="text"
                    required
                    maxLength={100}
                    autoComplete="name"
                    placeholder={copy.namePlaceholder}
                  />
                  {help("name")}
                </div>
                <div className="col-sm-6">
                  <label className="flbl" htmlFor="contact-email">
                    {copy.titleEmail} *
                  </label>
                  <input
                    {...field("email")}
                    type="email"
                    required
                    maxLength={254}
                    autoComplete="email"
                    placeholder={copy.emailPlaceholder}
                  />
                  {help("email")}
                </div>
                <div className="col-sm-6">
                  <label className="flbl" htmlFor="contact-phone">
                    {copy.titlePhone}
                  </label>
                  <input
                    {...field("phone")}
                    type="tel"
                    maxLength={32}
                    autoComplete="tel"
                    placeholder={copy.phonePlaceholder}
                  />
                  {help("phone")}
                </div>
                <div className="col-sm-6">
                  <label className="flbl" htmlFor="contact-subject">
                    {copy.titleSubject} *
                  </label>
                  <select
                    {...field("subject")}
                    required
                    defaultValue={copy.subjects[0]}
                  >
                    {copy.subjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                  {help("subject")}
                </div>
                <div className="col-12">
                  <label className="flbl" htmlFor="contact-message">
                    {copy.titleMessage} *
                  </label>
                  <textarea
                    {...field("message")}
                    rows={5}
                    required
                    maxLength={3900}
                    placeholder={copy.messagePlaceholder}
                  />
                  {help("message")}
                </div>
                <div hidden aria-hidden="true">
                  <label htmlFor="contact-website">{c.honeypot}</label>
                  <input
                    id="contact-website"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>
                <div className="col-12">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      id="contact-consent"
                      name="consent"
                      className="form-check-input"
                      required
                      disabled={form.locked}
                      onChange={() => form.clear("consent")}
                      aria-invalid={Boolean(form.errors.consent)}
                      aria-describedby="contact-consent-help"
                    />
                    <label
                      className="form-check-label"
                      htmlFor="contact-consent"
                      style={{
                        fontSize: ".78rem",
                        color: "var(--dark)",
                        lineHeight: 1.6,
                      }}
                    >
                      {copy.consent} *
                    </label>
                  </div>
                  <p
                    id="contact-consent-help"
                    style={{
                      color: form.errors.consent ? "#b32318" : "#777",
                      fontSize: ".75rem",
                      margin: "6px 0 0",
                    }}
                  >
                    {form.errors.consent || copy.privacy}
                  </p>
                </div>
                <div className="col-12" aria-live="polite" aria-atomic="true">
                  {feedback && (
                    <div
                      role="status"
                      className={
                        "alert " +
                        (form.status === "pending"
                          ? "alert-success"
                          : form.status === "notConfigured"
                            ? "alert-warning"
                            : "alert-danger")
                      }
                      style={{ marginBottom: 0, fontSize: ".85rem" }}
                    >
                      {feedback}
                    </div>
                  )}
                </div>
                <div className="col-12">
                  {form.status === "pending" ? (
                    <button
                      type="button"
                      className="btn-red"
                      onClick={form.reset}
                    >
                      {copy.newRequest}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      id="ctcBtn"
                      className="btn-red"
                      disabled={form.busy}
                    >
                      <i className="fas fa-paper-plane" aria-hidden="true" />
                      {form.busy ? copy.submitting : copy.submit}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
        {map && (
          <div
            className="mt-4"
            id="contact-map"
            style={{ height: 320, borderRadius: 18, overflow: "hidden" }}
          >
            <iframe
              title={c.mapTitle}
              src={
                "https://maps.google.com/maps?q=Via%20Appia%20Nuova%20858%20Roma&t=&z=15&ie=UTF8&iwloc=&output=embed&hl=" +
                locale
              }
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        )}
      </div>
    </section>
  );
}

export function SarabNewsletter({ locale }: { locale: Locale }) {
  const c = sarabContactCopy[locale];
  const copy = c.newsletter;
  const form = useInquiry("newsletter", locale);
  const feedback =
    form.status === "idle" || form.status === "submitting"
      ? ""
      : copy[form.status];
  const it = locale === "it";
  return (
    <section
      id="newsletter"
      className="kitchen-newsletter"
      aria-labelledby="newsletter-title"
    >
      <div className="container">
        <div className="kitchen-newsletter-card">
          <div className="kitchen-newsletter-content">
            <p className="newsletter-kicker">NEWSLETTER</p>
            <h2 id="newsletter-title">
              {it ? "Iscriviti alla nostra" : "Subscribe to our"}
              <br />
              newsletter.
            </h2>
            <form
              key={form.version}
              onSubmit={form.submit}
              noValidate
              aria-busy={form.busy}
            >
              <div className="kitchen-newsletter-field">
                <label htmlFor="nlEmail" className="visually-hidden">
                  {copy.emailLabel}
                </label>
                <input
                  type="email"
                  id="nlEmail"
                  name="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                  placeholder={
                    it
                      ? "@ inserisci il tuo indirizzo email"
                      : "@ enter your email address"
                  }
                  disabled={form.locked}
                  onChange={() => form.clear("email")}
                  aria-invalid={Boolean(form.errors.email)}
                  aria-describedby="newsletter-feedback"
                />
                {form.status === "pending" ? (
                  <button
                    type="button"
                    onClick={form.reset}
                    aria-label={copy.newRequest}
                  >
                    <ArrowRightIcon size={27} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    id="nlBtn"
                    disabled={form.busy}
                    aria-label={form.busy ? copy.submitting : copy.submit}
                  >
                    {form.busy ? (
                      <CircleNotchIcon
                        size={27}
                        className="newsletter-spinner"
                      />
                    ) : (
                      <ArrowRightIcon size={27} />
                    )}
                  </button>
                )}
              </div>
              <div hidden aria-hidden>
                <label htmlFor="newsletter-website">{c.honeypot}</label>
                <input
                  id="newsletter-website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>
              <div className="kitchen-newsletter-consent">
                <input
                  type="checkbox"
                  id="newsletter-consent"
                  name="consent"
                  required
                  disabled={form.locked}
                  onChange={() => form.clear("consent")}
                  aria-invalid={Boolean(form.errors.consent)}
                  aria-describedby="newsletter-feedback"
                />
                <label htmlFor="newsletter-consent">{copy.consent}</label>
              </div>
              <div
                id="newsletter-feedback"
                aria-live="polite"
                aria-atomic="true"
              >
                {feedback && <p role="status">{feedback}</p>}
              </div>
            </form>
          </div>
          <Image
            className="newsletter-dish-art"
            src="/kitchen/soup.webp"
            alt=""
            aria-hidden
            width={620}
            height={620}
            sizes="(max-width:767px) 210px, 450px"
          />
          <Image
            className="newsletter-lettuce-art"
            src="/kitchen/lettuce.webp"
            alt=""
            aria-hidden
            width={180}
            height={180}
            sizes="130px"
          />
          <Image
            className="newsletter-onion-art"
            src="/kitchen/onion.webp"
            alt=""
            aria-hidden
            width={180}
            height={180}
            sizes="150px"
          />
          <span className="newsletter-yellow-dot" aria-hidden />
          <span className="newsletter-blue-dot" aria-hidden />
        </div>
      </div>
    </section>
  );
}
