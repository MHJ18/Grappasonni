"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useAppearance } from "./appearance-provider";
import {
  CalendarCheckIcon,
  CalendarDotsIcon,
  ClockIcon,
  UsersIcon,
  CookieIcon,
  ArrowRightIcon,
  XIcon,
  TrashIcon,
  CheckCircleIcon,
  DeviceMobileIcon,
} from "@phosphor-icons/react";
import {
  BOOKING_KEY,
  readBookings,
  type SavedBooking,
  type BookingStatus,
} from "@/lib/bookings";
import type { Locale } from "@/i18n/routing";

type BookingInput = Pick<SavedBooking, "name" | "date" | "time" | "guests">;
type GuestState = {
  bookings: SavedBooking[];
  saveBooking: (input: BookingInput) => string;
  updateBooking: (id: string, status: BookingStatus) => void;
  openBookings: () => void;
  showCookies: () => void;
};
const GuestContext = createContext<GuestState | null>(null);
export function useGuest() {
  const value = useContext(GuestContext);
  if (!value) throw new Error("GuestProvider missing");
  return value;
}

export function GuestProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const it = locale === "it";
  const appearance = useAppearance();
  const reducedMotion = useReducedMotion();
  const records = useRef<SavedBooking[]>([]);
  const [bookings, setBookings] = useState<SavedBooking[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [cookieBanner, setCookieBanner] = useState(false);
  const [persistent, setPersistent] = useState(true);
  useEffect(() => {
    const refresh = () => {
      try {
        records.current = readBookings(localStorage.getItem(BOOKING_KEY));
        setBookings(records.current);
      } catch {
        setPersistent(false);
      }
    };
    refresh();
    setCookieBanner(
      !/(?:^|; )grappasonni-consent=v1%3A(?:all|essential)(?:;|$)/.test(
        document.cookie,
      ),
    );
    const sync = (event: StorageEvent) => {
      if (event.key === BOOKING_KEY || event.key === null) refresh();
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  function commit(next: SavedBooking[]) {
    records.current = readBookings(JSON.stringify(next));
    setBookings(records.current);
    try {
      localStorage.setItem(BOOKING_KEY, JSON.stringify(records.current));
      setPersistent(true);
    } catch {
      setPersistent(false);
    }
  }
  function saveBooking(input: BookingInput) {
    const id = crypto.randomUUID();
    commit([
      { id, ...input, status: "saved", savedAt: Date.now() },
      ...records.current,
    ]);
    return id;
  }
  function updateBooking(id: string, status: BookingStatus) {
    commit(
      records.current.map((booking) =>
        booking.id === id ? { ...booking, status } : booking,
      ),
    );
  }
  function accept(choice: "all" | "essential") {
    const attributes = `; Max-Age=15552000; Path=/; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
    document.cookie = `grappasonni-consent=${encodeURIComponent("v1:" + choice)}${attributes}`;
    if (choice === "all")
      document.cookie = `grappasonni-language=${locale}${attributes}`;
    else
      document.cookie =
        "grappasonni-language=; Max-Age=0; Path=/; SameSite=Lax";
    setCookieBanner(false);
  }
  const labels: Record<BookingStatus, string> = it
    ? {
        saved: "Salvata sul dispositivo",
        pending: "In attesa del ristorante",
        "not-sent": "Richiesta non inviata",
        unknown: "Invio da verificare",
      }
    : {
        saved: "Saved on this device",
        pending: "Awaiting the restaurant",
        "not-sent": "Request not sent",
        unknown: "Delivery not verified",
      };
  return (
    <GuestContext.Provider
      value={{
        bookings,
        saveBooking,
        updateBooking,
        openBookings: () => setHistoryOpen(true),
        showCookies: () => setCookieBanner(true),
      }}
    >
      {children}
      <AnimatePresence>
        {cookieBanner && (
          <motion.aside
            key="cookie-banner"
            style={{ x: "-50%" }}
            initial={{ opacity: 0, y: 25, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 26, scale: 0.97 }}
            transition={{
              duration: reducedMotion || !appearance.motion ? 0 : 0.32,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="cookie-banner"
            role="region"
            aria-labelledby="cookie-title"
          >
            <span className="cookie-emblem">
              <CookieIcon size={30} weight="duotone" />
            </span>
            <div className="cookie-copy">
              <h2 id="cookie-title">
                {it
                  ? "Un piccolo cookie, una visita migliore."
                  : "A little cookie, a better visit."}
              </h2>
              <p>
                {it
                  ? "Usiamo memoria locale per le tue selezioni e richieste di prenotazione. Accetta per ricordare anche la lingua. Nessun cookie pubblicitario."
                  : "Local storage keeps your selections and booking requests. Accept to also remember your language. No advertising cookies."}
              </p>
              <div className="cookie-actions">
                <button onClick={() => accept("all")}>
                  <CheckCircleIcon size={17} />
                  {it ? "Accetta" : "Accept"}
                </button>
                <button onClick={() => accept("essential")}>
                  {it ? "Solo necessari" : "Necessary only"}
                  <ArrowRightIcon size={16} />
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
      <Dialog
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        fullWidth
        maxWidth="sm"
        aria-labelledby="my-bookings-title"
        slotProps={{ paper: { className: "bookings-dialog" } }}
      >
        <DialogTitle id="my-bookings-heading" tabIndex={-1} sx={{ pr: 8 }}>
          <CalendarCheckIcon size={25} />
          <span id="my-bookings-title">
            {it ? "Le mie prenotazioni" : "My bookings"}
          </span>
          <IconButton
            onClick={() => setHistoryOpen(false)}
            aria-label={it ? "Chiudi" : "Close"}
            sx={{ position: "absolute", top: 12, right: 12, color: "inherit" }}
          >
            <XIcon size={22} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <p className="booking-storage-note">
            <DeviceMobileIcon size={18} />
            {persistent
              ? it
                ? "Le richieste restano su questo dispositivo per 180 giorni. La conferma arriva dal ristorante."
                : "Requests stay on this device for 180 days. Confirmation comes from the restaurant."
              : it
                ? "Memoria locale non disponibile. Le richieste restano visibili solo durante questa visita."
                : "Device storage is unavailable. Requests are visible during this visit only."}
          </p>
          {bookings.length === 0 ? (
            <div className="bookings-empty">
              <CalendarDotsIcon size={52} weight="duotone" />
              <h3>
                {it
                  ? "Il prossimo incontro comincia qui."
                  : "Your next visit starts here."}
              </h3>
              <p>
                {it
                  ? "Le tue richieste di prenotazione appariranno in questo spazio."
                  : "Your saved reservation requests will appear here."}
              </p>
              <a href="#reservation" onClick={() => setHistoryOpen(false)}>
                {it ? "Trova il tuo tavolo" : "Find your table"}
                <ArrowRightIcon size={18} />
              </a>
            </div>
          ) : (
            <div className="saved-booking-list">
              {bookings.map((booking) => (
                <article className="saved-booking" key={booking.id}>
                  <div className="saved-booking-date">
                    <strong>{booking.date.slice(8)}</strong>
                    <span>
                      {new Intl.DateTimeFormat(locale, {
                        month: "short",
                        timeZone: "Europe/Rome",
                      }).format(new Date(booking.date + "T12:00:00Z"))}
                    </span>
                  </div>
                  <div className="saved-booking-info">
                    <h3>{booking.name}</h3>
                    <p>
                      <ClockIcon size={14} />
                      {booking.time}
                      <UsersIcon size={14} />
                      {booking.guests} {it ? "persone" : "guests"}
                    </p>
                    <span
                      className={`booking-status booking-status-${booking.status}`}
                    >
                      {labels[booking.status]}
                    </span>
                    <small>
                      {booking.date.slice(0, 4)} · #{booking.id.slice(0, 8)}
                    </small>
                  </div>
                  <button
                    className="booking-remove"
                    onClick={() => {
                      commit(
                        records.current.filter(
                          (record) => record.id !== booking.id,
                        ),
                      );
                      requestAnimationFrame(() => {
                        const next =
                          document.querySelector<HTMLButtonElement>(
                            ".bookings-dialog .booking-remove",
                          ) || document.getElementById("my-bookings-heading");
                        next?.focus();
                      });
                    }}
                    aria-label={`${it ? "Rimuovi dal dispositivo" : "Remove from device"}: ${booking.date} ${booking.time}`}
                  >
                    <TrashIcon size={18} />
                  </button>
                </article>
              ))}
            </div>
          )}
          {bookings.length > 0 && (
            <p className="booking-removal-note">
              {it
                ? "Rimuovere una richiesta qui cancella solo la copia sul dispositivo. Per modificarla, chiama il ristorante."
                : "Removing a request deletes only its device copy. To change a reservation, call the restaurant."}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </GuestContext.Provider>
  );
}
