"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import {
  ArrowRightIcon,
  BookOpenIcon,
  CalendarBlankIcon,
  FacebookLogoIcon,
  ForkKnifeIcon,
  InfoIcon,
  InstagramLogoIcon,
  MapPinIcon,
  TwitterLogoIcon,
  XIcon,
} from "@phosphor-icons/react";
import { sarabEditorial, sarabEditorialImages } from "@/data/sarab-editorial";

type Props = { locale: "it" | "en" };
const featureIcons = [CalendarBlankIcon, MapPinIcon, ForkKnifeIcon];
const networkIcons = [InstagramLogoIcon, FacebookLogoIcon, TwitterLogoIcon];

export function SarabAbout({ locale }: Props) {
  const c = sarabEditorial[locale].about;
  return (
    <section id="about" aria-labelledby="sarab-about-title">
      <span id="storia" aria-hidden="true" />
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-5" data-aos="fade-right">
            <div className="astack">
              <div className="aexp">
                <span className="anum">{c.badge}</span>
                <small>
                  {c.badgeLines[0]}
                  <br />
                  {c.badgeLines[1]}
                </small>
              </div>
              <div className="amain">
                <Image
                  src={sarabEditorialImages.about}
                  alt={c.imageAlt}
                  width={1024}
                  height={576}
                  sizes="(max-width:991px) 100vw, 42vw"
                />
              </div>
              <div className="asm">
                <Image
                  src={sarabEditorialImages.aboutDetail}
                  alt={c.detailAlt}
                  width={170}
                  height={170}
                  sizes="170px"
                />
              </div>
            </div>
          </div>
          <div className="col-lg-7" data-aos="fade-left">
            <span className="slbl">{c.eyebrow}</span>
            <h2 className="stitle text-start" id="sarab-about-title">
              {c.title[0]}
              <br />
              <span>{c.title[1]}</span>
            </h2>
            <div className="sline lft" aria-hidden="true" />
            <p className="sdesc mb-4">{c.description}</p>
            <div className="mb-4">
              {c.features.map((feature, index) => {
                const Icon = featureIcons[index];
                return (
                  <div className="fti" key={feature.title}>
                    <div className={`ftico ${["r", "y", "g"][index]}`}>
                      <Icon size={22} aria-hidden="true" />
                    </div>
                    <div>
                      <h6 aria-level={3}>{feature.title}</h6>
                      <p>{feature.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <a href="#menu" className="btn-red">
              <BookOpenIcon size={18} aria-hidden="true" />
              {c.action}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SarabSpecial({ locale }: Props) {
  const c = sarabEditorial[locale].special;
  return (
    <section id="special" aria-labelledby="sarab-special-title">
      <div className="spbg" aria-hidden="true" />
      <div className="container" style={{ position: "relative", zIndex: 2 }}>
        <div className="row align-items-center g-5">
          <div className="col-lg-6" data-aos="fade-right">
            <div className="sptag">
              <ForkKnifeIcon size={16} className="me-1" aria-hidden="true" />
              {c.tag}
            </div>
            <h2 className="sptitle" id="sarab-special-title">
              {c.title[0]}
              <br />
              {c.title[1]}
              <br />
              <span>{c.title[2]}</span>
            </h2>
            <p className="spdesc">{c.description}</p>
            <div className="cdwrap">
              {c.facts.map((fact) => (
                <div className="cditem" key={fact.label}>
                  <span className="cdnum">{fact.value}</span>
                  <span className="cdlbl">{fact.label}</span>
                </div>
              ))}
            </div>
            <a href="#reservation" className="btn-red">
              <CalendarBlankIcon size={18} aria-hidden="true" />
              {c.action}
            </a>
          </div>
          <div className="col-lg-6" data-aos="fade-left">
            <figure className="spimgw">
              <div className="spglow" aria-hidden="true" />
              <div className="sppbdg">
                <span className="old" style={{ textDecoration: "none" }}>
                  {c.badgeLabel}
                </span>
                <span className="np">{c.badgeValue}</span>
              </div>
              <Image
                src={sarabEditorialImages.special}
                alt={c.imageAlt}
                width={600}
                height={500}
                sizes="(max-width:991px) 90vw, 440px"
                style={{
                  height: "auto",
                  aspectRatio: "6 / 5",
                  objectFit: "cover",
                }}
              />
              <figcaption className="spdesc" style={{ fontSize: ".72rem" }}>
                {c.imageNote}
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SarabHistory({ locale }: Props) {
  const c = sarabEditorial[locale].history;
  return (
    <section id="history" aria-labelledby="sarab-history-title">
      <div className="container">
        <div className="text-center mb-5" data-aos="fade-up">
          <span className="slbl">{c.eyebrow}</span>
          <h2 className="stitle" id="sarab-history-title">
            {c.title[0]} <span>{c.title[1]}</span>
          </h2>
          <div className="sline" aria-hidden="true" />
          <p className="sdesc mx-auto" style={{ maxWidth: 480 }}>
            {c.description}
          </p>
        </div>
        <div className="timeline" data-aos="fade-up">
          {c.items.map((item, index) => (
            <div className="tli" key={index}>
              <div className="tl-left">
                <div className="tlyear">{item.year}</div>
                <h5 aria-level={3}>{item.title}</h5>
                <p>{item.body}</p>
              </div>
              <div className="tl-center" aria-hidden="true">
                <div className="tldot" />
              </div>
              <div className="tl-right">
                <div className="tlyear">{item.year}</div>
                <h5 aria-level={3}>{item.title}</h5>
                <p>{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SarabChefs({ locale }: Props) {
  const c = sarabEditorial[locale].chefs;
  const [notice, setNotice] = useState(false);
  return (
    <section id="chefs" aria-labelledby="sarab-chefs-title">
      <div className="container">
        <div className="text-center mb-5" data-aos="fade-up">
          <span className="slbl">{c.eyebrow}</span>
          <h2 className="stitle" id="sarab-chefs-title">
            {c.title[0]} <span>{c.title[1]}</span>
          </h2>
          <div className="sline" aria-hidden="true" />
          <p
            className="sdesc mx-auto"
            id="chef-illustration-note"
            style={{ maxWidth: 700 }}
          >
            {c.note}
          </p>
        </div>
        <div className="row g-4">
          {sarabEditorialImages.chefs.map((src, index) => (
            <div
              className="col-sm-6 col-lg-3"
              data-aos="fade-up"
              data-aos-delay={index * 80}
              key={src}
            >
              <article
                className="chcard"
                aria-describedby="chef-illustration-note"
              >
                <div className="chimg">
                  <Image
                    src={src}
                    alt={c.imageAlt}
                    width={400}
                    height={400}
                    sizes="(max-width:575px) 100vw, (max-width:991px) 50vw, 25vw"
                  />
                  <div className="chsoc">
                    {c.networks.map((network, networkIndex) => {
                      const Icon = networkIcons[networkIndex];
                      return (
                        <button
                          className="sarab-chef-social"
                          type="button"
                          key={network}
                          aria-label={c.profileLabel(network)}
                          aria-haspopup="dialog"
                          onClick={() => setNotice(true)}
                        >
                          <Icon size={16} aria-hidden="true" />
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="chbody">
                  <div className="chnm" role="heading" aria-level={3}>
                    {c.name}
                  </div>
                  <div className="chrole">{c.role}</div>
                  <div className="chexp">{c.caption}</div>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
      <Dialog
        open={notice}
        onClose={() => setNotice(false)}
        aria-labelledby="sarab-chef-dialog-title"
      >
        <DialogTitle id="sarab-chef-dialog-title" sx={{ pr: 8 }}>
          {c.dialogTitle}
          <IconButton
            aria-label={sarabEditorial[locale].close}
            onClick={() => setNotice(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <XIcon size={22} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <p>{c.dialogBody}</p>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export function SarabBlog({ locale }: Props) {
  const c = sarabEditorial[locale].blog;
  const [active, setActive] = useState<number | null>(null);
  const post = active === null ? null : c.posts[active];
  const resetButton = {
    border: 0,
    background: "none",
    padding: 0,
    textAlign: "left" as const,
    font: "inherit",
    color: "inherit",
  };
  return (
    <section id="blog" aria-labelledby="sarab-blog-title">
      <div className="container">
        <div className="text-center mb-5" data-aos="fade-up">
          <span className="slbl">{c.eyebrow}</span>
          <h2 className="stitle" id="sarab-blog-title">
            {c.title[0]} <span>{c.title[1]}</span>
          </h2>
          <div className="sline" aria-hidden="true" />
        </div>
        <div className="row g-4">
          {c.posts.map((entry, index) => (
            <div
              className="col-md-6 col-lg-4"
              data-aos="fade-up"
              data-aos-delay={index * 80}
              key={entry.number}
            >
              <article className="blcard">
                <div className="blimg">
                  <Image
                    src={sarabEditorialImages.blogs[index]}
                    alt={entry.imageAlt}
                    width={800}
                    height={600}
                    sizes="(max-width:767px) 100vw, (max-width:991px) 50vw, 33vw"
                  />
                  <div className="bldatebdg">
                    <span className="bd">{entry.number}</span>
                    <span className="bm">{entry.badge}</span>
                  </div>
                </div>
                <div className="blbody">
                  <div className="bltag">{entry.category}</div>
                  <div className="bltit" role="heading" aria-level={3}>
                    <button
                      type="button"
                      style={resetButton}
                      aria-haspopup="dialog"
                      onClick={() => setActive(index)}
                    >
                      {entry.title}
                    </button>
                  </div>
                  <div className="blmeta">
                    <span>
                      <BookOpenIcon size={13} aria-hidden="true" />{" "}
                      {entry.metadata[0]}
                    </span>
                    <span>
                      <InfoIcon size={13} aria-hidden="true" />{" "}
                      {entry.metadata[1]}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="blmore"
                    style={{ border: 0, background: "none", padding: 0 }}
                    aria-haspopup="dialog"
                    aria-label={`${c.read}: ${entry.title}`}
                    onClick={() => setActive(index)}
                  >
                    {c.read}
                    <ArrowRightIcon size={14} aria-hidden="true" />
                  </button>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
      <Dialog
        open={post !== null}
        onClose={() => setActive(null)}
        aria-labelledby="sarab-blog-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        {post && (
          <>
            <DialogTitle id="sarab-blog-dialog-title" sx={{ pr: 8 }}>
              {post.title}
              <IconButton
                aria-label={sarabEditorial[locale].close}
                onClick={() => setActive(null)}
                sx={{ position: "absolute", right: 8, top: 8 }}
              >
                <XIcon size={22} />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pb: 4 }}>
              {post.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  style={{ lineHeight: 1.8, marginBottom: 16 }}
                >
                  {paragraph}
                </p>
              ))}
              <a
                href={post.href}
                className="btn-red"
                onClick={() => setActive(null)}
              >
                {post.action}
                <ArrowRightIcon size={17} aria-hidden="true" />
              </a>
            </DialogContent>
          </>
        )}
      </Dialog>
    </section>
  );
}
