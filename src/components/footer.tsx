"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { ArrowUpRightIcon, ArrowUpIcon, XIcon } from "@phosphor-icons/react";
import { sectionCopy } from "@/data/sections";
import type { Locale } from "@/i18n/routing";
export function Footer({ locale }: { locale: Locale }) {
  const c = sectionCopy[locale];
  const [legal, setLegal] = useState<string | null>(null);
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <p>{c.footerLine}</p>
        <a className="text-link" href="#main">
          {c.backTop}
          <ArrowUpIcon size={18} />
        </a>
      </div>
      <div className="footer-wordmark" aria-hidden>
        grappasonni
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} {c.copyright}
        </span>
        <a
          href="https://www.facebook.com/p/Ristorante-Grappasonni-dal-1908-100045436339809/"
          target="_blank"
          rel="noreferrer"
        >
          {c.facebook}
          <ArrowUpRightIcon size={15} />
        </a>
        <button onClick={() => setLegal(c.privacy)}>{c.privacy}</button>
        <button onClick={() => setLegal(c.legal)}>{c.legal}</button>
        <span>ROMA · DAL 1908</span>
      </div>
      <p className="footer-credits">{c.photoRights}</p>
      <Dialog
        open={legal !== null}
        onClose={() => setLegal(null)}
        aria-labelledby="legal-title"
      >
        <DialogTitle
          id="legal-title"
          sx={{ pr: 8, fontFamily: "var(--font-cormorant)", fontSize: 36 }}
        >
          {legal}
          <IconButton
            onClick={() => setLegal(null)}
            aria-label={c.close}
            sx={{ position: "absolute", right: 8, top: 12 }}
          >
            <XIcon size={24} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pb: 4 }}>
          <p>{c.legalText}</p>
        </DialogContent>
      </Dialog>
    </footer>
  );
}
