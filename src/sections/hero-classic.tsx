"use client";
import Image from "next/image";
import {
  StarIcon,
  ForkKnifeIcon,
  PlayIcon,
  ClockIcon,
  MapPinIcon,
} from "@phosphor-icons/react";
import { sarabCopy } from "@/data/sarab";
import type { Locale } from "@/i18n/routing";
import { FoodSteam } from "@/components/food-steam";
/** Preserved original circular hero: only the palette and food photograph evolve. */
export function ClassicHero({ locale }: { locale: Locale }) {
  const c = sarabCopy[locale];
  return (
    <section
      id="hero"
      className={`classic-hero locale-${locale}`}
      aria-labelledby="hero-title"
    >
      <div className="hs hs1" aria-hidden />
      <div className="hs hs2" aria-hidden />
      <div className="hbgtxt" aria-hidden>
        1908
      </div>
      <div className="hero-heritage-artifacts" aria-hidden="true">
        <i className="hero-archive-orbit" />
        <i className="hero-archive-line" />
      </div>
      <div className="container">
        <div className="row align-items-center g-5 sarab-hero-row">
          <div className="col-lg-6">
            <div className="hbadge">
              <div className="hbi">
                <StarIcon size={16} weight="fill" />
              </div>
              <span>{c.heroBadge}</span>
            </div>
            <h1 id="hero-title" className="htitle" data-sarab-headline>
              {c.heroTitle[0]} <span className="hl">{c.heroTitle[1]}</span>
              <br />
              {c.heroTitle[2]}
            </h1>
            <p className="hdesc">{c.heroDescription}</p>
            <div className="d-flex flex-wrap gap-3 mb-2">
              <a href="#menu" className="btn-red">
                <ForkKnifeIcon size={19} weight="fill" />
                {c.explore}
              </a>
              <a href="#gallery" className="btn-play">
                <div className="pico">
                  <PlayIcon size={17} weight="fill" />
                </div>
                <span>{c.story}</span>
              </a>
            </div>
            <div className="hstats d-flex gap-3 flex-wrap mt-4">
              {c.stats.map(([value, label], i) => (
                <div className="sarab-stat-group" key={label}>
                  <div className="hstat">
                    <span className="snum">{value}</span>
                    <small>{label}</small>
                  </div>
                  {i < 3 && <div className="sdiv" />}
                </div>
              ))}
            </div>
          </div>
          <div className="col-lg-6">
            <div className="sarab-hero-figure">
              <div className="hero-dish-anchor">
                <div className="hero-dish-object">
                  <div className="hcircle">
                    <Image
                      src="/images/rigatoni-feature.webp"
                      width={560}
                      height={560}
                      alt={
                        locale === "it"
                          ? "Rigatoni all’amatriciana su un piatto in ceramica"
                          : "Rigatoni amatriciana on a ceramic plate"
                      }
                      loading="eager"
                      fetchPriority="high"
                      sizes="(max-width:767px) 300px, 480px"
                    />
                  </div>
                  <FoodSteam />
                </div>
              </div>
              <div className="fcard fc1">
                <div className="fcoi r">
                  <ClockIcon size={18} weight="fill" />
                </div>
                <div>
                  <span className="fcnum">{c.floating[0][0]}</span>
                  <span className="fcsm">{c.floating[0][1]}</span>
                </div>
              </div>
              <div className="fcard fc2">
                <div className="fcoi y">
                  <StarIcon size={18} weight="fill" />
                </div>
                <div>
                  <span className="fcnum">{c.floating[1][0]}</span>
                  <span className="fcsm">{c.floating[1][1]}</span>
                </div>
              </div>
              <div className="fcard fc3">
                <div className="fcoi g">
                  <MapPinIcon size={18} weight="fill" />
                </div>
                <div>
                  <span className="fcnum">{c.floating[2][0]}</span>
                  <span className="fcsm">{c.floating[2][1]}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
