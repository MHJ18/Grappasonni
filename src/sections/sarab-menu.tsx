"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import {
  HeartIcon,
  XIcon,
  BookOpenIcon,
  ArrowRightIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";
import { menu, categories } from "@/data/menu";
import { sarabCopy } from "@/data/sarab";
import { useDining } from "@/components/sarab-experience";
import { dishImage, foodCategoryImages } from "@/data/dish-images";
import { DishPrice } from "@/components/dish-price";
import { useAppearance } from "@/components/appearance-provider";
import type { Locale } from "@/i18n/routing";

export function SarabCategories({ locale }: { locale: Locale }) {
  const c = sarabCopy[locale];
  const dining = useDining();
  const { hero } = useAppearance();
  const [offset, setOffset] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const ordered = [...categories.slice(offset), ...categories.slice(0, offset)];
  const rotate = (direction: number) => {
    setOffset(
      (value) => (value + direction + categories.length) % categories.length,
    );
    track.current?.scrollTo({ left: 0, behavior: "instant" });
  };
  return (
    <>
      <div
        className="mqsec"
        role="img"
        aria-label={categories.map((cat) => cat[locale]).join(", ")}
      >
        <div className="mqtrack" aria-hidden>
          {[0, 1, 2].flatMap((n) =>
            categories.map((cat) => (
              <div className="mqitem" key={`${n}-${cat.id}`}>
                <span className="sarab-mq-dot" />
                {cat[locale]}
              </div>
            )),
          )}
        </div>
      </div>
      <section
        id="category"
        className="food-discovery"
        aria-labelledby="food-discovery-title"
      >
        <div className="container">
          <div className="food-discovery-heading">
            <h2 id="food-discovery-title">
              {locale === "it"
                ? "Di cosa hai voglia?"
                : "What are you craving?"}
            </h2>
            <div className="food-discovery-controls">
              <a
                href="#menu"
                onClick={() => {
                  dining.setCategory("all");
                  dining.setQuery("");
                }}
              >
                {locale === "it" ? "Tutto il menù" : "View menu"}
                <CaretRightIcon size={18} />
              </a>
              <button
                onClick={() => rotate(-1)}
                aria-label={
                  locale === "it"
                    ? "Categorie precedenti"
                    : "Previous categories"
                }
              >
                <CaretLeftIcon size={24} weight="bold" />
              </button>
              <button
                onClick={() => rotate(1)}
                aria-label={
                  locale === "it" ? "Categorie successive" : "Next categories"
                }
              >
                <CaretRightIcon size={24} weight="bold" />
              </button>
            </div>
          </div>
          <div className="food-category-track" ref={track}>
            {ordered.map((cat) => (
              <a
                className={`food-category${dining.category === cat.id ? " active" : ""}`}
                key={cat.id}
                data-food-category={cat.id}
                href="#menu"
                onClick={() => {
                  dining.setCategory(cat.id);
                  dining.setQuery("");
                }}
              >
                <span className="food-category-image">
                  <Image
                    src={
                      cat.id === "primi" && hero === "cinematic"
                        ? "/images/hero-carbonara.webp"
                        : foodCategoryImages[cat.id]
                    }
                    alt=""
                    fill
                    loading={cat.id === "primi" ? "eager" : "lazy"}
                    sizes="(max-width:639px) 132px, (max-width:991px) 155px, 185px"
                  />
                </span>
                <span className="food-category-name">{cat[locale]}</span>
              </a>
            ))}
          </div>
          <p className="food-discovery-note">{c.categoriesDescription}</p>
        </div>
      </section>
    </>
  );
}

const selection = [
  "alici",
  "burrata",
  "amatriciana",
  "ravioli-ricotta",
  "straccetti",
  "patate",
  "tiramisu",
  "sbriciolata",
];

export function SarabMenu({ locale }: { locale: Locale }) {
  const c = sarabCopy[locale];
  const d = useDining();
  const [expanded, setExpanded] = useState(false);
  const [scan, setScan] = useState(false);
  const reducedMotion = useReducedMotion();
  const appearance = useAppearance();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const filtered = menu.filter(
    (item) =>
      (d.category === "all" || item.category === d.category) &&
      [
        item.name[locale],
        item.description?.[locale] || "",
        ...(item.mainIngredients?.[locale] || []),
      ]
        .join(" ")
        .toLocaleLowerCase(locale)
        .includes(d.query.toLocaleLowerCase(locale)),
  );
  const visible =
    d.category === "all" && !d.query && !expanded
      ? selection
          .map((id) => menu.find((item) => item.id === id)!)
          .filter(Boolean)
      : filtered;
  const filters = [
    { id: "all" as const, label: c.all },
    ...categories.map((cat) => ({ id: cat.id, label: cat[locale] })),
  ];
  const chooseFilter = (id: typeof d.category) => {
    d.setCategory(id);
    d.setQuery("");
  };
  return (
    <section
      id="menu"
      className="tasting-menu"
      aria-labelledby="tasting-menu-title"
    >
      <div className="container">
        <header className="tasting-menu-heading">
          <span className="tasting-menu-label">{c.menuLabel}</span>
          <h2 id="tasting-menu-title">
            {locale === "it"
              ? "A tavola, il gusto di Roma."
              : "A taste of Rome, at your table."}
          </h2>
        </header>
        <div
          className="tasting-menu-filters"
          role="tablist"
          aria-label={c.menuTitle.join(" ")}
        >
          {filters.map((filter, index) => (
            <button
              key={filter.id}
              id={`menu-tab-${filter.id}`}
              role="tab"
              aria-selected={d.category === filter.id}
              aria-controls="mgrid"
              tabIndex={d.category === filter.id ? 0 : -1}
              onClick={() => chooseFilter(filter.id)}
              onKeyDown={(event) => {
                let next = index;
                if (event.key === "ArrowRight")
                  next = (index + 1) % filters.length;
                else if (event.key === "ArrowLeft")
                  next = (index - 1 + filters.length) % filters.length;
                else if (event.key === "Home") next = 0;
                else if (event.key === "End") next = filters.length - 1;
                else return;
                event.preventDefault();
                chooseFilter(filters[next].id);
                document
                  .getElementById(`menu-tab-${filters[next].id}`)
                  ?.focus();
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>
        {d.query && (
          <div className="tasting-search">
            <span>{d.query}</span>
            <button onClick={() => d.setQuery("")}>
              {c.clear}
              <XIcon size={16} />
            </button>
          </div>
        )}
        {d.category === "vini" && (
          <p className="tasting-wine-note">
            {locale === "it"
              ? "Vini italiani al calice e in bottiglia. Chiedi la selezione del giorno al personale."
              : "Italian wines by the glass and bottle. Ask the team for today’s selection."}
          </p>
        )}
        <motion.div
          key={`${d.category}-${d.query}-${expanded}`}
          initial={
            mounted && !reducedMotion && appearance.motion ? "hidden" : false
          }
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren:
                  reducedMotion || !appearance.motion ? 0 : 0.045,
              },
            },
          }}
          className="tasting-menu-grid menu-panel"
          id="mgrid"
          role="tabpanel"
          aria-labelledby={`menu-tab-${d.category}`}
          tabIndex={0}
        >
          {visible.map((item) => (
            <motion.article
              className="tasting-dish"
              key={item.id}
              variants={{
                hidden: { opacity: 0, y: 18, filter: "blur(3px)" },
                visible: {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  transition: {
                    duration: reducedMotion || !appearance.motion ? 0 : 0.32,
                    ease: "easeOut",
                  },
                },
              }}
            >
              <button
                className="tasting-dish-photo"
                onClick={() => d.openDish(item.id)}
                aria-label={`${c.details}: ${item.name[locale]}`}
              >
                <Image
                  src={dishImage(item)}
                  alt=""
                  fill
                  sizes="(max-width:639px) 68px, 88px"
                />
              </button>
              <div className="tasting-dish-body">
                <div className="tasting-dish-line">
                  <button
                    className="tasting-dish-name"
                    onClick={() => d.openDish(item.id)}
                  >
                    {item.name[locale]}
                  </button>
                  <span className="tasting-dish-leader" aria-hidden />
                  <span className="tasting-dish-price">
                    <DishPrice item={item} locale={locale} tag />
                  </span>
                </div>
                <div className="tasting-dish-description">
                  <p>
                    {item.description?.[locale] ||
                      categories.find((cat) => cat.id === item.category)?.[
                        locale
                      ]}
                  </p>
                  <button
                    className="tasting-favorite"
                    aria-label={`${d.favorites.includes(item.id) ? c.unfavorite : c.favorite}: ${item.name[locale]}`}
                    aria-pressed={d.favorites.includes(item.id)}
                    onClick={() => d.toggleFavorite(item.id)}
                  >
                    <HeartIcon
                      size={18}
                      weight={
                        d.favorites.includes(item.id) ? "fill" : "regular"
                      }
                    />
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
          {visible.length === 0 && (
            <div className="sarab-empty-menu tasting-empty">
              <BookOpenIcon size={40} />
              <h3>
                {d.category === "vini" ? categories[5][locale] : c.emptyResults}
              </h3>
              <p>{d.category === "vini" ? c.menuEmpty : c.emptyResults}</p>
            </div>
          )}
        </motion.div>
        <div className="tasting-menu-actions">
          {d.category === "all" && !d.query && (
            <button
              className="tasting-primary"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? c.less : c.more}
              <ArrowRightIcon size={18} />
            </button>
          )}
          <button className="tasting-secondary" onClick={() => setScan(true)}>
            <BookOpenIcon size={19} />
            {c.scan}
          </button>
        </div>
      </div>
      <Dialog
        open={scan}
        onClose={() => setScan(false)}
        maxWidth="md"
        fullWidth
        aria-labelledby="menu-scan-title"
      >
        <DialogTitle id="menu-scan-title" sx={{ pr: 8 }}>
          {c.scanTitle}
          <IconButton
            onClick={() => setScan(false)}
            aria-label={c.close}
            sx={{ position: "absolute", right: 10, top: 12 }}
          >
            <XIcon size={22} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <p className="sdesc mb-3">{c.scanCredit}</p>
          {["menu-02", "menu-01"].map((name) => (
            <Image
              key={name}
              src={`/images/${name}.webp`}
              alt={c.scanTitle}
              width={1127}
              height={1400}
              sizes="90vw"
              style={{ width: "100%", height: "auto", marginBottom: 20 }}
            />
          ))}
        </DialogContent>
      </Dialog>
    </section>
  );
}
