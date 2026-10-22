import {
  MapPinIcon,
  PhoneIcon,
  ArrowUpRightIcon,
} from "@phosphor-icons/react/dist/ssr";
import { restaurant } from "@/data/content";
import type { Locale } from "@/i18n/routing";

export function RestaurantContact({ locale }: { locale: Locale }) {
  const it = locale === "it";
  return (
    <section
      id="contact-section"
      className="restaurant-contact"
      aria-labelledby="contact-title"
    >
      <span id="dove" />
      <div className="container restaurant-contact-layout">
        <div>
          <p className="kitchen-eyebrow">
            {it ? "Ci vediamo a Roma" : "See you in Rome"}
          </p>
          <h2 id="contact-title">
            {it
              ? "Tutte le strade portano a tavola."
              : "All roads lead to the table."}
          </h2>
        </div>
        <div className="restaurant-contact-links">
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=Via+Appia+Nuova+858+Roma"
            target="_blank"
            rel="noreferrer"
          >
            <MapPinIcon size={24} />
            <span>
              {restaurant.address}
              <small>00178 Roma</small>
            </span>
            <ArrowUpRightIcon size={20} />
          </a>
          <a href={`tel:${restaurant.phone}`}>
            <PhoneIcon size={24} />
            <span>
              {restaurant.phoneDisplay}
              <small>
                {it ? "Chiamaci per informazioni" : "Call us for information"}
              </small>
            </span>
            <ArrowUpRightIcon size={20} />
          </a>
        </div>
      </div>
    </section>
  );
}
