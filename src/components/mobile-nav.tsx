"use client";
import { useState } from "react";
import { Box, Drawer, IconButton } from "@mui/material";
import { ListIcon, XIcon, ArrowUpRightIcon } from "@phosphor-icons/react";
import { copy } from "@/data/content";
import type { Locale } from "@/i18n/routing";
export function MobileNav({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const c = copy[locale];
  return (
    <>
      <IconButton
        className="mobile-nav-trigger"
        onClick={() => setOpen(true)}
        aria-label={locale === "it" ? "Apri la navigazione" : "Open navigation"}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? "mobile-navigation-dialog" : undefined}
        sx={{
          color: "primary.main",
          display: { xs: "inline-flex", lg: "none" },
          width: 44,
          height: 44,
        }}
      >
        <ListIcon size={23} weight="light" />
      </IconButton>
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          paper: {
            id: "mobile-navigation-dialog",
            "aria-label":
              locale === "it" ? "Navigazione principale" : "Main navigation",
            sx: {
              width: "min(88vw,400px)",
              p: { xs: 3, sm: 4 },
              backgroundColor: "background.paper",
              color: "text.primary",
              display: "flex",
            },
          },
        }}
      >
        <Box
          className="mobile-nav-top"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box
            component="span"
            className="mobile-brand"
            sx={{
              fontFamily: "var(--font-cormorant), serif",
              fontSize: 31,
              lineHeight: 1,
              letterSpacing: "-.05em",
              color: "text.primary",
            }}
          >
            grappasonni
          </Box>
          <IconButton
            onClick={() => setOpen(false)}
            aria-label={
              locale === "it" ? "Chiudi la navigazione" : "Close navigation"
            }
            sx={{
              width: 44,
              height: 44,
              color: "text.primary",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <XIcon size={24} />
          </IconButton>
        </Box>
        <nav
          className="mobile-navigation"
          aria-label={
            locale === "it" ? "Navigazione mobile" : "Mobile navigation"
          }
        >
          {c.nav.map((label, i) => (
            <a
              key={label}
              onClick={() => setOpen(false)}
              href={["#storia", "#menu", "#atmosfera", "#dove"][i]}
            >
              {label}
              <ArrowUpRightIcon size={23} weight="light" aria-hidden="true" />
            </a>
          ))}
          <a href="#prenota" className="button" onClick={() => setOpen(false)}>
            {c.reserve}
            <ArrowUpRightIcon size={20} aria-hidden="true" />
          </a>
        </nav>
        <Box
          component="p"
          className="small-label"
          sx={{ mt: "auto", pt: 5, color: "text.secondary", lineHeight: 1.8 }}
        >
          {locale === "it"
            ? "Roma, Via Appia Nuova · Dal 1908"
            : "Rome, Via Appia Nuova · Since 1908"}
        </Box>
      </Drawer>
    </>
  );
}
