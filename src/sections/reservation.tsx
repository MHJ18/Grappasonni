"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  CalendarCheckIcon,
  CalendarDotsIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  PhoneIcon,
  CaretDownIcon,
  CheckIcon,
  ClockIcon,
  UsersIcon,
  MinusIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { reservationCopy } from "@/data/reservation-copy";
import { restaurant } from "@/data/content";
import { useGuest } from "@/components/guest-experience";
import { useAppearance } from "@/components/appearance-provider";
import {
  bookingSlots,
  availableRequestedTime,
  bookingDateBounds,
  isRequestedDate,
} from "@/data/booking-slots";
import "./booking-polish.css";
type Locale = "it" | "en";
type Field = keyof (typeof reservationCopy)["it"]["errors"];
type FieldErrors = Partial<Record<Field, string>>;
type Status =
  | "idle"
  | "submitting"
  | "pending"
  | "validation"
  | "notConfigured"
  | "unavailable"
  | "rateLimited";
type Payload = {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  notes: string;
  consent: boolean;
  website: string;
  locale: Locale;
};
const fieldOrder: Field[] = [
  "name",
  "email",
  "date",
  "time",
  "guests",
  "phone",
  "notes",
  "consent",
];
function invalidFields(payload: Payload, locale: Locale): FieldErrors {
  const errors: FieldErrors = {};
  const copy = reservationCopy[locale].errors;
  const bounds = bookingDateBounds();
  if (
    payload.name.length < 2 ||
    payload.name.length > 100 ||
    /[\u0000-\u001f\u007f]/.test(payload.name)
  )
    errors.name = copy.name;
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email) ||
    payload.email.length > 254
  )
    errors.email = copy.email;
  if (
    payload.phone &&
    (!/^[+\d\s().-]{6,32}$/.test(payload.phone) || !/\d/.test(payload.phone))
  )
    errors.phone = copy.phone;
  const parsedDate = new Date(`${payload.date}T00:00:00.000Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(payload.date) ||
    !Number.isFinite(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== payload.date ||
    payload.date < bounds.min ||
    payload.date > bounds.max
  )
    errors.date = copy.date;
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(payload.time))
    errors.time = copy.time;
  if (
    !Number.isInteger(payload.guests) ||
    payload.guests < 1 ||
    payload.guests > 20
  )
    errors.guests = copy.guests;
  if (
    payload.notes.length > 2000 ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(payload.notes)
  )
    errors.notes = copy.notes;
  if (!payload.consent) errors.consent = copy.consent;
  return errors;
}

export function Reservation({ locale }: { locale: Locale }) {
  const it = locale === "it";
  const copy = reservationCopy[locale];
  const guest = useGuest();
  const appearance = useAppearance();
  const reduced = useReducedMotion();
  const requestRef = useRef<AbortController | null>(null);
  const savedRequestRef = useRef<{ signature: string; id: string } | null>(
    null,
  );
  const titleRef = useRef<HTMLHeadingElement>(null);
  const extrasRef = useRef<HTMLDetailsElement>(null);
  const focusStep = useRef(false);
  const [step, setStep] = useState(0);
  const [furthestStep, setFurthestStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [bounds, setBounds] = useState({ min: "", max: "" });
  const [nowTime, setNowTime] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState(2);
  const [meal, setMeal] = useState<"lunch" | "dinner">("dinner");
  const [details, setDetails] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
    consent: false,
    website: "",
  });
  const busy = status === "submitting";
  const duration = reduced || !appearance.motion ? 0 : 0.28;
  useEffect(() => {
    const refresh = () => {
      const next = bookingDateBounds();
      setBounds(next);
      setDate((current) =>
        current && current >= next.min ? current : next.min,
      );
      setNowTime(
        new Intl.DateTimeFormat("en-GB", {
          timeZone: "Europe/Rome",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date()),
      );
    };
    refresh();
    window.addEventListener("focus", refresh);
    const timer = window.setInterval(refresh, 60000);
    return () => {
      window.removeEventListener("focus", refresh);
      window.clearInterval(timer);
      requestRef.current?.abort("unmounted");
    };
  }, []);
  const validDate = isRequestedDate(date, bounds.min);
  const validTime =
    validDate && availableRequestedTime(date, time, bounds.min, nowTime);
  const days = bounds.min
    ? Array.from({ length: 7 }, (_, index) => {
        const day = new Date(bounds.min + "T12:00:00Z");
        day.setUTCDate(day.getUTCDate() + index);
        return day.toISOString().slice(0, 10);
      })
    : [];
  const dateLabel = validDate
    ? new Intl.DateTimeFormat(locale, {
        weekday: "short",
        day: "numeric",
        month: "short",
        timeZone: "Europe/Rome",
      }).format(new Date(date + "T12:00:00Z"))
    : "";
  const fullDateLabel = (day: string) =>
    new Intl.DateTimeFormat(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "Europe/Rome",
    }).format(new Date(day + "T12:00:00Z"));
  const remainingSlots = bookingSlots[meal].filter((slot) =>
    availableRequestedTime(date, slot, bounds.min, nowTime),
  );
  const dinnerStillPossible = bookingSlots.dinner.some((slot) =>
    availableRequestedTime(date, slot, bounds.min, nowTime),
  );
  const selectDate = (nextDate: string) => {
    setDate(nextDate);
    if (!availableRequestedTime(nextDate, time, bounds.min, nowTime))
      setTime("");
    setErrors({});
  };
  const selectMeal = (nextMeal: "lunch" | "dinner") => {
    if (nextMeal !== meal) setTime("");
    setMeal(nextMeal);
    setErrors({});
  };
  const focusInvalid = (nextErrors: FieldErrors) => {
    if ((nextErrors.phone || nextErrors.notes) && extrasRef.current)
      extrasRef.current.open = true;
    requestAnimationFrame(() =>
      document
        .getElementById(
          "reservation-" + fieldOrder.find((field) => nextErrors[field]),
        )
        ?.focus(),
    );
  };
  const changeStep = (next: number) => {
    if (busy || (next > 0 && !validTime)) return;
    focusStep.current = true;
    setDirection(next >= step ? 1 : -1);
    setStep(next);
    setFurthestStep((current) => Math.max(current, next));
    setErrors({});
    if (status !== "pending") setStatus("idle");
  };
  function advance() {
    if (step === 0) {
      if (!validTime) {
        setErrors({
          ...(validDate ? {} : { date: copy.errors.date }),
          ...(!validTime
            ? {
                time: it
                  ? "Scegli un orario per la tua visita."
                  : "Choose a time for your visit.",
              }
            : {}),
        });
        return;
      }
      changeStep(1);
    } else if (step === 1) changeStep(2);
  }
  const update = (
    field: "name" | "email" | "phone" | "notes",
    value: string,
  ) => {
    setDetails((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    if (!busy) setStatus("idle");
  };
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step < 2) {
      advance();
      return;
    }
    if (requestRef.current || status === "pending") return;
    const payload: Payload = {
      ...details,
      name: details.name.trim(),
      email: details.email.trim(),
      phone: details.phone.trim(),
      notes: details.notes.trim(),
      date,
      time,
      guests,
      locale,
    };
    const nextErrors = invalidFields(payload, locale);
    if (!validTime)
      nextErrors.time = it
        ? "Scegli un orario futuro."
        : "Choose a future time.";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setStatus("validation");
      if (nextErrors.date || nextErrors.time) {
        setStep(0);
        focusStep.current = true;
      } else if (nextErrors.guests) {
        setStep(1);
        focusStep.current = true;
      } else focusInvalid(nextErrors);
      return;
    }
    setErrors({});
    setStatus("submitting");
    const signature = JSON.stringify([payload.name, date, time, guests]);
    const id =
      savedRequestRef.current?.signature === signature &&
      guest.bookings.some((booking) => booking.id === savedRequestRef.current?.id)
        ? savedRequestRef.current.id
        : guest.saveBooking({ name: payload.name, date, time, guests });
    savedRequestRef.current = { signature, id };
    guest.updateBooking(id, "saved");
    const controller = new AbortController();
    requestRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort("timeout"), 20000);
    try {
      const response = await fetch("/api/reservations", {
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
      if (response.status === 202 && result.ok && result.status === "pending") {
        setStatus("pending");
        guest.updateBooking(id, "pending");
        focusStep.current = true;
      } else if (response.status === 400 && result.fieldErrors) {
        const validation: FieldErrors = {};
        for (const field of fieldOrder)
          if (result.fieldErrors[field]) validation[field] = copy.errors[field];
        setErrors(validation);
        setStatus("validation");
        guest.updateBooking(id, "not-sent");
        if (validation.date || validation.time) {
          setDirection(-1);
          setStep(0);
          focusStep.current = true;
        } else if (validation.guests) {
          setDirection(-1);
          setStep(1);
          focusStep.current = true;
        } else focusInvalid(validation);
      } else if (response.status === 503 && result.code === "NOT_CONFIGURED") {
        setStatus("notConfigured");
        guest.updateBooking(id, "not-sent");
      } else if (response.status === 429) {
        setStatus("rateLimited");
        guest.updateBooking(id, "not-sent");
      } else {
        setStatus("unavailable");
        guest.updateBooking(id, "unknown");
      }
    } catch {
      if (controller.signal.reason !== "unmounted") {
        setStatus("unavailable");
        guest.updateBooking(id, "unknown");
      }
    } finally {
      window.clearTimeout(timeout);
      if (requestRef.current === controller) requestRef.current = null;
    }
  }
  const message =
    status === "idle" || status === "submitting" || status === "validation"
      ? ""
      : copy[status];
  const stepLabels = it
    ? ["Quando", "Quanti", "Prenota"]
    : ["When", "Guests", "Book"];
  const input = (
    field: "name" | "email" | "phone",
    type: string,
    required: boolean,
  ) => (
    <div className="wizard-field">
      <label htmlFor={"reservation-" + field}>
        {copy.labels[field]}
        {required ? " *" : ""}
      </label>
      <input
        id={"reservation-" + field}
        name={field}
        type={type}
        required={required}
        value={details[field]}
        onChange={(event) => update(field, event.target.value)}
        disabled={busy}
        autoComplete={
          field === "name" ? "name" : field === "email" ? "email" : "tel"
        }
        maxLength={field === "name" ? 100 : field === "email" ? 254 : 32}
        aria-invalid={Boolean(errors[field])}
        aria-describedby={"reservation-" + field + "-help"}
      />
      <p className="wizard-error" id={"reservation-" + field + "-help"}>
        {errors[field]}
      </p>
    </div>
  );
  return (
    <section
      id="reservation"
      className="compact-booking booking-experience"
      aria-labelledby="reservation-title"
    >
      <span id="prenota" aria-hidden />
      <div className="container booking-layout">
        <aside className="booking-intro">
          <p className="booking-kicker">
            {it ? "Il prossimo incontro" : "Your next visit"}
          </p>
          <h2 id="reservation-title">
            {it ? "Un posto" : "A place"}
            <br />
            <em>{it ? "a tavola." : "at the table."}</em>
          </h2>
          <p>
            {it
              ? "Scegli il momento, la compagnia, e lascia il resto a noi."
              : "Choose your moment, your company, and leave the rest to us."}
          </p>
          <a className="booking-phone" href={`tel:${restaurant.phone}`}>
            <PhoneIcon size={19} />
            {restaurant.phoneDisplay}
          </a>
          <button
            className="booking-history-button"
            onClick={guest.openBookings}
          >
            <CalendarCheckIcon size={20} />
            {it ? "Le mie prenotazioni" : "My bookings"}
            {guest.bookings.length > 0 && <span>{guest.bookings.length}</span>}
            <ArrowRightIcon size={17} />
          </button>
          <small>
            {it
              ? "Le richieste restano salvate su questo dispositivo."
              : "Requests stay saved on this device."}
          </small>
        </aside>
        <form
          className="reservation-form booking-wizard booking-polished"
          onSubmit={submit}
          noValidate
          aria-busy={busy}
        >
          <nav
            className="wizard-progress"
            aria-label={it ? "Passaggi della prenotazione" : "Booking steps"}
          >
            {stepLabels.map((label, index) => (
              <button
                type="button"
                key={label}
                aria-current={step === index ? "step" : undefined}
                disabled={
                  index > furthestStep ||
                  (index > 0 && !validTime) ||
                  busy ||
                  status === "pending"
                }
                onClick={() => changeStep(index)}
              >
                <span>
                  {step > index ? (
                    <CheckIcon size={14} />
                  ) : (
                    String(index + 1).padStart(2, "0")
                  )}
                </span>
                {label}
              </button>
            ))}
          </nav>
          <div className="wizard-progress-track" aria-hidden>
            <motion.span
              animate={{ scaleX: status === "pending" ? 1 : (step + 1) / 3 }}
              transition={{ duration }}
            />
          </div>
          <span className="visually-hidden" role="status">
            {busy ? copy.submitting : ""}
          </span>
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={status === "pending" ? "success" : step}
              className="wizard-stage"
              custom={direction}
              variants={{
                enter: (travel: number) => ({
                  opacity: 0,
                  x: duration ? travel * 18 : 0,
                }),
                visible: { opacity: 1, x: 0 },
                leave: (travel: number) => ({
                  opacity: 0,
                  x: duration ? travel * -12 : 0,
                }),
              }}
              initial="enter"
              animate="visible"
              exit="leave"
              transition={{ duration, ease: "easeOut" }}
              onAnimationComplete={() => {
                if (focusStep.current) {
                  titleRef.current?.focus();
                  focusStep.current = false;
                }
              }}
            >
              {status === "pending" ? (
                <div className="wizard-success">
                  <CalendarCheckIcon size={58} weight="duotone" />
                  <h3 ref={titleRef} tabIndex={-1}>
                    {it
                      ? "La richiesta è partita."
                      : "Your request is on its way."}
                  </h3>
                  <p>{copy.pending}</p>
                  <div className="wizard-receipt">
                    <CalendarDotsIcon size={17} />
                    {dateLabel}
                    <ClockIcon size={17} />
                    {time}
                    <UsersIcon size={17} />
                    {guests}
                  </div>
                  <button
                    type="button"
                    className="wizard-next"
                    onClick={guest.openBookings}
                  >
                    {it ? "Vedi la tua prenotazione" : "View your request"}
                    <ArrowRightIcon size={18} />
                  </button>
                  <button
                    type="button"
                    className="wizard-text-button"
                    onClick={() => {
                      setTime("");
                      setDetails({
                        name: "",
                        email: "",
                        phone: "",
                        notes: "",
                        consent: false,
                        website: "",
                      });
                      setStatus("idle");
                      setFurthestStep(0);
                      savedRequestRef.current = null;
                      changeStep(0);
                    }}
                  >
                    {copy.newRequest}
                  </button>
                </div>
              ) : (
                <>
                  <div className="wizard-stage-heading">
                    <span>
                      {it
                        ? "Una tavola, una bella serata."
                        : "A table. A lovely evening."}
                    </span>
                    <h3 ref={titleRef} tabIndex={-1}>
                      {step === 0
                        ? it
                          ? "Quando ci vediamo?"
                          : "When shall we meet?"
                        : step === 1
                          ? it
                            ? "Chi viene a tavola?"
                            : "Who is joining you?"
                          : it
                            ? "Piacere di conoscerti."
                            : "Lovely to meet you."}
                    </h3>
                  </div>
                  {step > 0 && (
                    <div className="wizard-summary">
                      <button
                        type="button"
                        onClick={() => changeStep(0)}
                        disabled={busy}
                        aria-label={`${it ? "Modifica giorno e ora" : "Change day and time"}: ${dateLabel}, ${time}`}
                      >
                        <CalendarDotsIcon size={16} />
                        {dateLabel}
                        <span>· {time}</span>
                        <span className="wizard-summary-edit">
                          {it ? "Modifica" : "Edit"}
                        </span>
                      </button>
                      {step === 2 && (
                        <button
                          type="button"
                          onClick={() => changeStep(1)}
                          disabled={busy}
                          aria-label={`${it ? "Modifica persone" : "Change guests"}: ${copy.guest(guests)}`}
                        >
                          <UsersIcon size={16} />
                          {copy.guest(guests)}
                        </button>
                      )}
                    </div>
                  )}
                  {step === 0 && (
                    <>
                      <div
                        className="booking-day-rail"
                        role="group"
                        aria-label={it ? "Scegli il giorno" : "Choose a day"}
                        onKeyDown={(event) => {
                          if (
                            ![
                              "ArrowLeft",
                              "ArrowRight",
                              "Home",
                              "End",
                            ].includes(event.key)
                          )
                            return;
                          const buttons = Array.from(
                            event.currentTarget.querySelectorAll("button"),
                          );
                          const index = buttons.indexOf(
                            document.activeElement as HTMLButtonElement,
                          );
                          if (index < 0) return;
                          event.preventDefault();
                          const next =
                            event.key === "Home"
                              ? 0
                              : event.key === "End"
                                ? buttons.length - 1
                                : (index +
                                    (event.key === "ArrowRight" ? 1 : -1) +
                                    buttons.length) %
                                  buttons.length;
                          buttons[next]?.focus();
                          buttons[next]?.click();
                        }}
                      >
                        {days.map((day, index) => (
                          <button
                            type="button"
                            key={day}
                            aria-pressed={date === day}
                            aria-label={fullDateLabel(day)}
                            onClick={() => selectDate(day)}
                          >
                            <small>
                              {index === 0
                                ? it
                                  ? "Oggi"
                                  : "Today"
                                : index === 1
                                  ? it
                                    ? "Domani"
                                    : "Tomorrow"
                                  : new Intl.DateTimeFormat(locale, {
                                      weekday: "short",
                                      timeZone: "Europe/Rome",
                                    }).format(new Date(day + "T12:00:00Z"))}
                            </small>
                            <strong>{day.slice(8)}</strong>
                          </button>
                        ))}
                      </div>
                      <div className="wizard-custom-date">
                        <CalendarDotsIcon size={17} />
                        <label htmlFor="reservation-date">
                          {it ? "Un altro giorno" : "Another date"}
                        </label>
                        <input
                          id="reservation-date"
                          name="date"
                          type="date"
                          value={date}
                          min={bounds.min || undefined}
                          max={bounds.max || undefined}
                          onChange={(event) => {
                            selectDate(event.target.value);
                          }}
                          aria-invalid={Boolean(errors.date)}
                          aria-describedby="reservation-schedule-help reservation-date-range"
                        />
                      </div>
                      <p
                        className="wizard-date-range"
                        id="reservation-date-range"
                      >
                        {validDate ? fullDateLabel(date) : copy.dateHelp}
                      </p>
                      <div
                        className="booking-meal-tabs"
                        role="group"
                        aria-label={
                          it ? "Momento della giornata" : "Time of day"
                        }
                      >
                        <button
                          type="button"
                          aria-pressed={meal === "lunch"}
                          onClick={() => selectMeal("lunch")}
                        >
                          {it ? "Pranzo" : "Lunch"}
                          <small>12:30 – 14:00</small>
                        </button>
                        <button
                          type="button"
                          aria-pressed={meal === "dinner"}
                          onClick={() => selectMeal("dinner")}
                        >
                          {it ? "Cena" : "Dinner"}
                          <small>19:30 – 21:30</small>
                        </button>
                      </div>
                      <fieldset
                        className="booking-time-grid"
                        aria-describedby="reservation-schedule-help"
                      >
                        <legend className="visually-hidden">
                          {it ? "Orario desiderato" : "Preferred time"}
                        </legend>
                        {bookingSlots[meal].map((slot) => (
                          <label className="booking-time-slot" key={slot}>
                            <input
                              type="radio"
                              name="time"
                              value={slot}
                              checked={time === slot}
                              disabled={
                                !validDate ||
                                !availableRequestedTime(
                                  date,
                                  slot,
                                  bounds.min,
                                  nowTime,
                                )
                              }
                              onChange={() => {
                                setTime(slot);
                                setErrors({});
                              }}
                            />
                            <span>
                              <ClockIcon size={15} />
                              {slot}
                              {time === slot && <CheckIcon size={14} />}
                            </span>
                          </label>
                        ))}
                      </fieldset>
                      {validDate && remainingSlots.length === 0 && (
                        <div className="wizard-no-times" role="status">
                          <ClockIcon size={20} />
                          <div>
                            <p>
                              {it
                                ? "Questi orari sono già passati."
                                : "These seating times have already passed."}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                if (meal === "lunch" && dinnerStillPossible)
                                  selectMeal("dinner");
                                else if (days[1]) selectDate(days[1]);
                              }}
                            >
                              {meal === "lunch" && dinnerStillPossible
                                ? it
                                  ? "Scopri gli orari per cena"
                                  : "See dinner times"
                                : it
                                  ? "Scegli domani"
                                  : "Choose tomorrow"}
                              <ArrowRightIcon size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                      <p
                        className="wizard-error"
                        id="reservation-schedule-help"
                        role="status"
                      >
                        {errors.date || errors.time}
                      </p>
                      <p className="wizard-help">
                        {it
                          ? "Scegli l’orario che preferisci. La disponibilità viene verificata dal ristorante."
                          : "Choose your preferred time. The restaurant will check availability."}
                      </p>
                    </>
                  )}
                  {step === 1 && (
                    <>
                      <div className="party-scene" aria-hidden>
                        <div className="party-table">
                          <AnimatePresence mode="wait" initial={false}>
                            <motion.strong
                              key={guests}
                              initial={{ opacity: 0, y: duration ? 8 : 0 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: duration ? -8 : 0 }}
                              transition={{ duration: duration / 2 }}
                            >
                              {guests}
                            </motion.strong>
                          </AnimatePresence>
                          <span>{it ? "a tavola" : "at the table"}</span>
                          {Array.from(
                            { length: Math.min(guests, 8) },
                            (_, index) => (
                              <i
                                key={index}
                                style={{
                                  transform: `rotate(${index * (360 / Math.min(guests, 8))}deg) translateY(-95px)`,
                                }}
                              />
                            ),
                          )}
                        </div>
                      </div>
                      <fieldset className="booking-party-grid">
                        <legend className="visually-hidden">
                          {it ? "Numero di persone" : "Number of guests"}
                        </legend>
                        {[1, 2, 3, 4, 5, 6, 8, 10].map((count) => (
                          <label className="booking-party-option" key={count}>
                            <input
                              type="radio"
                              name="guests"
                              value={count}
                              checked={guests === count}
                              onChange={() => setGuests(count)}
                            />
                            <span>
                              {count}
                              <small>
                                {count === 1
                                  ? it
                                    ? "ospite"
                                    : "guest"
                                  : it
                                    ? "ospiti"
                                    : "guests"}
                              </small>
                            </span>
                          </label>
                        ))}
                      </fieldset>
                      <div className="party-stepper">
                        <span>
                          {it
                            ? "Un numero diverso?"
                            : "A different party size?"}
                        </span>
                        <button
                          type="button"
                          disabled={guests <= 1}
                          onClick={() =>
                            setGuests((value) => Math.max(1, value - 1))
                          }
                          aria-label={
                            it ? "Una persona in meno" : "One fewer guest"
                          }
                        >
                          <MinusIcon size={15} />
                        </button>
                        <output aria-live="polite">{guests}</output>
                        <button
                          type="button"
                          disabled={guests >= 20}
                          onClick={() =>
                            setGuests((value) => Math.min(20, value + 1))
                          }
                          aria-label={
                            it ? "Una persona in più" : "One more guest"
                          }
                        >
                          <PlusIcon size={15} />
                        </button>
                      </div>
                      {errors.guests && (
                        <p className="wizard-error" role="status">
                          {errors.guests}
                        </p>
                      )}
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <div className="wizard-contact-fields">
                        {input("name", "text", true)}
                        {input("email", "email", true)}
                      </div>
                      <details className="wizard-extras" ref={extrasRef}>
                        <summary>
                          {it
                            ? "Telefono e richieste particolari"
                            : "Phone and special requests"}
                          <CaretDownIcon size={16} />
                        </summary>
                        {input("phone", "tel", false)}
                        <div className="wizard-field">
                          <label htmlFor="reservation-notes">
                            {copy.labels.notes}
                          </label>
                          <textarea
                            id="reservation-notes"
                            name="notes"
                            rows={2}
                            maxLength={2000}
                            value={details.notes}
                            disabled={busy}
                            onChange={(event) =>
                              update("notes", event.target.value)
                            }
                            aria-invalid={Boolean(errors.notes)}
                            aria-describedby="reservation-notes-help"
                          />
                          <p
                            className="wizard-error"
                            id="reservation-notes-help"
                          >
                            {errors.notes}
                          </p>
                        </div>
                      </details>
                      <div hidden aria-hidden>
                        <label htmlFor="reservation-website">
                          {copy.labels.website}
                        </label>
                        <input
                          id="reservation-website"
                          name="website"
                          tabIndex={-1}
                          autoComplete="off"
                          value={details.website}
                          onChange={(event) =>
                            setDetails((current) => ({
                              ...current,
                              website: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="booking-consent">
                        <input
                          id="reservation-consent"
                          name="consent"
                          type="checkbox"
                          checked={details.consent}
                          required
                          disabled={busy}
                          onChange={(event) => {
                            setDetails((current) => ({
                              ...current,
                              consent: event.target.checked,
                            }));
                            setErrors((current) => ({
                              ...current,
                              consent: undefined,
                            }));
                          }}
                          aria-invalid={Boolean(errors.consent)}
                          aria-describedby="reservation-consent-help"
                        />
                        <label htmlFor="reservation-consent">
                          {copy.consent}
                        </label>
                      </div>
                      <p className="wizard-error" id="reservation-consent-help">
                        {errors.consent}
                      </p>
                      {message && (
                        <div role="status" className="booking-form-feedback">
                          {message}
                          <button type="button" onClick={guest.openBookings}>
                            {it
                              ? "Vedi la richiesta salvata"
                              : "View saved request"}
                            <ArrowRightIcon size={15} />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                  <div className="wizard-navigation">
                    {step > 0 ? (
                      <button
                        type="button"
                        className="wizard-back"
                        onClick={() => changeStep(step - 1)}
                        disabled={busy}
                      >
                        <ArrowLeftIcon size={17} />
                        {it ? "Indietro" : "Back"}
                      </button>
                    ) : (
                      <span className="wizard-timezone">
                        {it ? "Ora di Roma" : "Rome time"}
                      </span>
                    )}
                    {step < 2 ? (
                      <button
                        type="button"
                        className="wizard-next"
                        onClick={advance}
                        disabled={step === 0 && !validTime}
                      >
                        {it ? "Continua" : "Continue"}
                        <ArrowRightIcon size={18} />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        id="resBtn"
                        className="wizard-next"
                        disabled={busy}
                      >
                        <CalendarCheckIcon size={18} />
                        {busy ? copy.submitting : copy.submit}
                        <ArrowRightIcon size={18} />
                      </button>
                    )}
                  </div>
                  {step === 2 && (
                    <p className="wizard-help">{copy.serviceNote}</p>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </form>
      </div>
    </section>
  );
}
