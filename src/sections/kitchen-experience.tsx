import Image from "next/image";
import {
  ArrowRightIcon,
  ChefHatIcon,
  LeafIcon,
  ForkKnifeIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Locale } from "@/i18n/routing";
import "./kitchen-experience.css";

export function KitchenExperience({ locale }: { locale: Locale }) {
  const it = locale === "it";
  const craft = [
    {
      image: "/kitchen/chef-one.webp",
      title: it ? "Tradizione" : "Tradition",
      text: it ? "Le ricette di Roma" : "Recipes from Rome",
      icon: ChefHatIcon,
    },
    {
      image: "/kitchen/chef-woman.webp",
      title: it ? "Creatività" : "Creativity",
      text: it
        ? "Il piacere di un nuovo assaggio"
        : "The pleasure of a new flavour",
      icon: LeafIcon,
    },
    {
      image: "/kitchen/chef-two.webp",
      title: it ? "Passione" : "Passion",
      text: it ? "La cura di ogni piatto" : "Care in every dish",
      icon: ForkKnifeIcon,
    },
  ];
  return (
    <section
      id="chefs"
      className="kitchen-experience"
      aria-labelledby="kitchen-title"
    >
      <div className="container kitchen-story">
        <div className="kitchen-portrait" data-sarab-reveal>
          <Image
            src="/kitchen/cook.webp"
            alt=""
            width={636}
            height={808}
            sizes="(max-width:767px) 90vw, 50vw"
          />
        </div>
        <div className="kitchen-story-copy" data-sarab-reveal>
          <p className="kitchen-eyebrow">
            {it ? "Il piacere di cucinare" : "The joy of cooking"}
          </p>
          <h2 id="kitchen-title">
            {it
              ? "Il gusto nasce da mani esperte."
              : "Great food starts with expert hands."}
          </h2>
          <p>
            {it
              ? "Dai grandi classici romani alla voglia di assaggiare qualcosa di nuovo: in cucina, il piacere della tavola prende forma un piatto alla volta."
              : "From Roman classics to the pleasure of discovering something new: in the kitchen, a memorable meal takes shape one plate at a time."}
          </p>
          <p>
            {it
              ? "Scegli il tuo prossimo assaggio. Al resto, pensiamo in cucina."
              : "Choose your next favourite. We’ll take care of the rest in the kitchen."}
          </p>
          <a href="#menu" className="kitchen-action">
            {it ? "Esplora la nostra cucina" : "Explore our kitchen"}
            <ArrowRightIcon size={21} />
          </a>
        </div>
        <Image
          className="kitchen-food-art"
          src="/images/rigatoni-feature.webp"
          alt=""
          aria-hidden
          width={230}
          height={230}
          sizes="230px"
        />
      </div>
      <div className="kitchen-team">
        <div className="container">
          <header className="kitchen-team-heading" data-sarab-reveal>
            <p className="kitchen-eyebrow">
              {it ? "Dalla cucina alla tavola" : "From kitchen to table"}
            </p>
            <h3>
              {it
                ? "Il saper fare, in ogni dettaglio."
                : "Craft in every detail."}
            </h3>
          </header>
          <div className="kitchen-team-grid">
            {craft.map(({ image, title, text, icon: Icon }, index) => (
              <article
                className={`kitchen-expert kitchen-expert-${index}`}
                key={title}
                data-sarab-reveal
              >
                <div className="kitchen-expert-portrait">
                  <Image
                    src={image}
                    alt=""
                    width={440}
                    height={480}
                    sizes="(max-width:639px) 75vw, 30vw"
                  />
                  <span className="kitchen-expert-mark" aria-hidden>
                    <Icon size={24} weight="duotone" />
                  </span>
                </div>
                <h4>{title}</h4>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
