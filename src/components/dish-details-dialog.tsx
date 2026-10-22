"use client";
import Image from "next/image";
import { Dialog, IconButton } from "@mui/material";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  XIcon,
  HeartIcon,
  PlusIcon,
  CheckIcon,
  ArrowRightIcon,
  ForkKnifeIcon,
  WineIcon,
} from "@phosphor-icons/react";
import { categories, type MenuItem } from "@/data/menu";
import { dishImage } from "@/data/dish-images";
import { dishDetailCopy } from "@/data/dish-details";
import { sarabCopy } from "@/data/sarab";
import { menuPrice } from "@/data/promotions";
import { useAppearance } from "./appearance-provider";
import { DishPrice } from "./dish-price";
import type { Locale } from "@/i18n/routing";

export function DishDetailsDialog({
  item,
  locale,
  saved,
  count,
  onClose,
  onSave,
  onAdd,
}: {
  item?: MenuItem;
  locale: Locale;
  saved: boolean;
  count: number;
  onClose: () => void;
  onSave: () => void;
  onAdd: () => void;
}) {
  const p = useAppearance();
  const reduced = useReducedMotion();
  const c = sarabCopy[locale];
  const d = dishDetailCopy[locale];
  const it = locale === "it";
  const price = item ? menuPrice(item, p.offers) : null;
  const ingredients = item?.mainIngredients?.[locale] || [];
  return (
    <Dialog
      open={Boolean(item)}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="dish-detail-title"
      slotProps={{
        paper: { className: "dish-experience-dialog" },
        backdrop: { className: "dish-experience-backdrop" },
      }}
    >
      <IconButton
        className="dish-experience-close"
        aria-label={c.close}
        onClick={onClose}
      >
        <XIcon size={22} />
      </IconButton>
      {item && (
        <div className="dish-experience-layout">
          <div className={`dish-experience-image dish-image-${item.category}`}>
            <Image
              src={dishImage(item)}
              alt={item.name[locale]}
              fill
              sizes="(max-width:639px) 90vw, 460px"
              loading="eager"
            />
            <span className="dish-image-caption">
              <span>{it ? "Un assaggio di" : "A taste of"}</span>Grappasonni
            </span>
            {Boolean(price?.discount) && (
              <span className="dish-image-offer">
                <strong>−{price!.discount}%</strong>
                <small>
                  {it ? "Benvenuto a tavola" : "A welcome to the table"}
                </small>
              </span>
            )}
          </div>
          <div className="dish-experience-content">
            <p className="dish-category-label">
              {item.category === "vini" ? (
                <WineIcon size={17} />
              ) : (
                <ForkKnifeIcon size={17} />
              )}{" "}
              {
                categories.find((category) => category.id === item.category)?.[
                  locale
                ]
              }
            </p>
            <h2 id="dish-detail-title">{item.name[locale]}</h2>
            {item.description?.[locale] && (
              <p className="dish-experience-description">
                {item.description[locale]}
              </p>
            )}
            <div className="dish-experience-price">
              <div>
                <small>{price?.discount ? d.offerPrice : d.regularPrice}</small>
                <DishPrice item={item} locale={locale} />
              </div>
              {Boolean(price?.discount) && (
                <span className="dish-special-price">{d.offer}</span>
              )}
            </div>
            {ingredients.length > 0 && (
              <section
                className="dish-ingredients"
                aria-labelledby="dish-ingredients-title"
              >
                <h3 id="dish-ingredients-title">
                  {item.ingredientBasis === "traditional"
                    ? d.traditionalIngredients
                    : d.ingredients}
                </h3>
                <motion.ul
                  initial={false}
                  animate="shown"
                  variants={{
                    shown: {
                      transition: {
                        staggerChildren: reduced || !p.motion ? 0 : 0.035,
                      },
                    },
                  }}
                >
                  {ingredients.map((ingredient) => (
                    <motion.li
                      key={ingredient}
                      initial={
                        reduced || !p.motion ? false : { opacity: 0, y: 7 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      {ingredient}
                    </motion.li>
                  ))}
                </motion.ul>
              </section>
            )}
            {item.category === "vini" && (
              <p className="dish-wine-note">{d.askWine}</p>
            )}
            <div className="dish-experience-actions">
              <motion.button
                className="dish-add-action"
                onClick={onAdd}
                whileTap={reduced || !p.motion ? undefined : { scale: 0.97 }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={count > 0 ? "selected" : "add"}
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    transition={{ duration: reduced || !p.motion ? 0 : 0.15 }}
                  >
                    {count ? <CheckIcon size={20} /> : <PlusIcon size={20} />}
                  </motion.span>
                </AnimatePresence>
                {count ? `${c.selected} (${count})` : c.add}
                <ArrowRightIcon size={18} />
              </motion.button>
              <button
                className="dish-save-action"
                onClick={onSave}
                aria-pressed={saved}
              >
                <HeartIcon size={20} weight={saved ? "fill" : "regular"} />
                {saved ? c.unfavorite : c.favorite}
              </button>
            </div>
            {count > 0 && (
              <p className="dish-selection-feedback" role="status">
                {it
                  ? "Il piatto è nella tua selezione per la visita."
                  : "This dish is in your selection for your visit."}
              </p>
            )}
          </div>
        </div>
      )}
    </Dialog>
  );
}
