"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import {
  XIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  MinusIcon,
  PlusIcon,
  CalendarDotsIcon,
  ClipboardIcon,
} from "@phosphor-icons/react";
import {
  menu,
  categories,
  type MenuCategory,
  type MenuItem,
} from "@/data/menu";
import { sarabCopy } from "@/data/sarab";
import type { Locale } from "@/i18n/routing";
import { DishPrice } from "./dish-price";
import { DishDetailsDialog } from "./dish-details-dialog";
import { dishImage, foodCategoryImages } from "@/data/dish-images";
type DiningState = {
  category: MenuCategory | "all";
  setCategory: (category: MenuCategory | "all") => void;
  query: string;
  setQuery: (q: string) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  selection: Record<string, number>;
  add: (id: string) => void;
  remove: (id: string) => void;
  changeQuantity: (id: string, delta: number) => void;
  openDish: (id: string) => void;
  openSearch: () => void;
  openSelection: () => void;
};
const DiningContext = createContext<DiningState | null>(null);
export function useDining() {
  const value = useContext(DiningContext);
  if (!value) throw new Error("DiningProvider missing");
  return value;
}
export function DiningProvider({
  children,
  locale,
}: {
  children: ReactNode;
  locale: Locale;
}) {
  const c = sarabCopy[locale];
  const [category, setCategory] = useState<MenuCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selection, setSelection] = useState<Record<string, number>>({});
  const [dish, setDish] = useState<string | null>(null);
  const [search, setSearch] = useState(false);
  const [selected, setSelected] = useState(false);
  const [ready, setReady] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("grappasonni-dining") || "{}",
      );
      if (Array.isArray(saved.favorites))
        setFavorites(
          saved.favorites.filter(
            (id: unknown) =>
              typeof id === "string" && menu.some((item) => item.id === id),
          ),
        );
      if (saved.selection && typeof saved.selection === "object")
        setSelection(
          Object.fromEntries(
            Object.entries(saved.selection)
              .filter(
                ([id, n]) =>
                  menu.some((item) => item.id === id) &&
                  Number.isInteger(n) &&
                  Number(n) > 0 &&
                  Number(n) <= 20,
              )
              .slice(0, menu.length),
          ) as Record<string, number>,
        );
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem(
          "grappasonni-dining",
          JSON.stringify({ favorites, selection }),
        );
      } catch {}
    }
  }, [favorites, selection, ready]);
  const toggleFavorite = (id: string) =>
    setFavorites((old) =>
      old.includes(id) ? old.filter((x) => x !== id) : [...old, id],
    );
  const add = (id: string) =>
    setSelection((old) => ({ ...old, [id]: Math.min((old[id] || 0) + 1, 20) }));
  const remove = (id: string) =>
    setSelection((old) => {
      const next = { ...old };
      delete next[id];
      return next;
    });
  const changeQuantity = (id: string, delta: number) =>
    setSelection((old) => ({
      ...old,
      [id]: Math.max(1, Math.min((old[id] || 1) + delta, 20)),
    }));
  const item = menu.find((x) => x.id === dish);
  const formatPrice = (price: number | null) =>
    price === null
      ? c.unconfirmed
      : new Intl.NumberFormat(locale === "it" ? "it-IT" : "en-GB", {
          style: "currency",
          currency: "EUR",
        }).format(price);
  const matches = menu.filter((item) =>
    [
      item.name[locale],
      item.description?.[locale] || "",
      ...(item.mainIngredients?.[locale] || []),
    ]
      .join(" ")
      .toLocaleLowerCase(locale)
      .includes(query.toLocaleLowerCase(locale)),
  );
  const value = {
    category,
    setCategory,
    query,
    setQuery,
    favorites,
    toggleFavorite,
    selection,
    add,
    remove,
    changeQuantity,
    openDish: setDish,
    openSearch: () => setSearch(true),
    openSelection: () => {
      setSelected(true);
      setCopyStatus("");
    },
  };
  return (
    <DiningContext.Provider value={value}>
      {children}
      <Dialog
        open={search}
        onClose={() => setSearch(false)}
        maxWidth="md"
        fullWidth
        aria-labelledby="dish-search-title"
      >
        <DialogTitle id="dish-search-title">
          {c.searchTitle}
          <IconButton
            onClick={() => setSearch(false)}
            aria-label={c.close}
            sx={{ position: "absolute", right: 12, top: 12 }}
          >
            <XIcon size={23} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <div className="sarab-search-input">
            <MagnifyingGlassIcon size={23} />
            <input
              autoFocus
              aria-label={c.search}
              placeholder={c.searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <IconButton onClick={() => setQuery("")} aria-label={c.clear}>
                <XIcon size={19} />
              </IconButton>
            )}
          </div>
          <div className="sarab-search-cats">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setCategory(cat.id);
                  setQuery("");
                  setSearch(false);
                  document.querySelector("#menu")?.scrollIntoView({
                    behavior: window.matchMedia(
                      "(prefers-reduced-motion:reduce)",
                    ).matches
                      ? "auto"
                      : "smooth",
                  });
                }}
              >
                <Image
                  src={foodCategoryImages[cat.id]}
                  width={42}
                  height={42}
                  alt=""
                />
                {cat[locale]}
              </button>
            ))}
          </div>
          <p className="sarab-dialog-label">
            {c.searchResults} · {matches.length}
          </p>
          <div className="sarab-search-results">
            {matches.slice(0, 8).map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setDish(item.id);
                  setSearch(false);
                }}
              >
                <span className="search-dish-identity">
                  <Image src={dishImage(item)} alt="" width={48} height={48} />
                  <span>{item.name[locale]}</span>
                </span>
                <b>
                  <DishPrice item={item} locale={locale} />
                </b>
              </button>
            ))}
          </div>
          {matches.length === 0 && <p>{c.emptyResults}</p>}
        </DialogContent>
      </Dialog>
      <DishDetailsDialog
        item={item}
        locale={locale}
        saved={Boolean(item && favorites.includes(item.id))}
        count={item ? selection[item.id] || 0 : 0}
        onClose={() => setDish(null)}
        onSave={() => {
          if (item) toggleFavorite(item.id);
        }}
        onAdd={() => {
          if (item) add(item.id);
        }}
      />
      <Dialog
        open={selected}
        onClose={() => setSelected(false)}
        maxWidth="sm"
        fullWidth
        aria-labelledby="selection-title"
      >
        <DialogTitle id="selection-title" sx={{ pr: 8 }}>
          {c.selection}
          <IconButton
            onClick={() => setSelected(false)}
            aria-label={c.close}
            sx={{ position: "absolute", right: 12, top: 12 }}
          >
            <XIcon size={23} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <p className="sdesc mb-4">{c.selectionNote}</p>
          {Object.keys(selection).length === 0 ? (
            <p>{c.emptySelection}</p>
          ) : (
            <>
              {Object.entries(selection).map(([id, n]) => {
                const dish = menu.find((item) => item.id === id);
                return dish ? (
                  <div className="selection-row" key={id}>
                    <div>
                      <strong>{dish.name[locale]}</strong>
                      <span>
                        <DishPrice item={dish} locale={locale} />
                      </span>
                    </div>
                    <div className="selection-quantity">
                      <IconButton
                        aria-label={`${c.quantity} − ${dish.name[locale]}`}
                        onClick={() => changeQuantity(id, -1)}
                      >
                        <MinusIcon size={16} />
                      </IconButton>
                      <span>{n}</span>
                      <IconButton
                        aria-label={`${c.quantity} + ${dish.name[locale]}`}
                        onClick={() => changeQuantity(id, 1)}
                      >
                        <PlusIcon size={16} />
                      </IconButton>
                      <IconButton
                        onClick={() => remove(id)}
                        aria-label={`${c.remove} ${dish.name[locale]}`}
                      >
                        <XIcon size={18} />
                      </IconButton>
                    </div>
                  </div>
                ) : null;
              })}
              <button
                className="btn-red mt-4"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      Object.entries(selection)
                        .map(
                          ([id, n]) =>
                            `${n} × ${menu.find((item) => item.id === id)?.name[locale]}`,
                        )
                        .join("\n"),
                    );
                    setCopyStatus(c.copied);
                  } catch {
                    setCopyStatus(c.copyUnavailable);
                  }
                }}
              >
                <ClipboardIcon size={20} />
                {c.copy}
              </button>
              <p className="verification-note mt-3" role="status">
                {copyStatus}
              </p>
              <a
                className="sarab-reservation-link"
                href="#reservation"
                onClick={() => setSelected(false)}
              >
                <CalendarDotsIcon size={20} />
                {c.book}
              </a>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DiningContext.Provider>
  );
}
