export const sarabEditorialImages = {
  about: "/images/hero-interior.webp",
  aboutDetail: "/images/interior.webp",
  special: "/images/guest-dish-04.webp",
  blogs: [
    "/images/guest-dish-04.webp",
    "/images/terrace.webp",
    "/images/detail.webp",
  ],
  chefs: [
    "/sarab/chefs/1.jpg",
    "/sarab/chefs/2.jpg",
    "/sarab/chefs/3.jpg",
    "/sarab/chefs/4.jpg",
  ],
} as const;

export const sarabEditorial = {
  it: {
    close: "Chiudi",
    about: {
      eyebrow: "La nostra storia",
      title: ["Ti aspettiamo a Roma,", "da Grappasonni"],
      description:
        "Grappasonni, dal 1908. Un nome e un indirizzo in Via Appia Nuova: il piacere di ritrovarsi e condividere il tempo della tavola.",
      badge: "1908",
      badgeLines: ["Una storia", "romana"],
      imageAlt:
        "La sala di Grappasonni, con tavoli in legno e scaffali di vino",
      detailAlt: "La veranda di Grappasonni, con tavoli, piante e tende chiare",
      features: [
        {
          title: "Dal 1908",
          body: "La data che accompagna il nome Grappasonni. Le storie di famiglia [DA CONFERMARE].",
        },
        {
          title: "Via Appia Nuova",
          body: "Ci trovi a Roma, al civico 858–860. Un indirizzo da ritrovare.",
        },
        {
          title: "Il tuo prossimo tavolo",
          body: "Invia una richiesta. Il tavolo sarà confermato soltanto dopo la risposta del ristorante.",
        },
      ],
      action: "Scopri il menù",
    },
    special: {
      tag: "Grappasonni dal 1908",
      title: ["Un buon motivo", "per ritrovarsi", "A tavola."],
      description:
        "Una pausa, una conversazione, un altro assaggio. Scegli il tuo momento a Roma e scopri le proposte fotografate del menù.",
      facts: [
        { value: "1908", label: "Dal" },
        { value: "Roma", label: "La città" },
        { value: "Appia", label: "La strada" },
      ],
      action: "Scegli il tuo tavolo",
      badgeLabel: "Dal",
      badgeValue: "1908",
      imageAlt: "Un piatto di pasta fotografato da un ospite di Grappasonni",
      imageNote:
        "Foto dalla galleria TheFork. Identità del piatto [DA CONFERMARE].",
    },
    history: {
      eyebrow: "Il nostro percorso",
      title: ["Una storia", "romana"],
      description:
        "Dal 1908 a oggi. Le tappe, i ricordi e le persone che hanno accompagnato Grappasonni saranno raccontati dopo la loro conferma.",
      items: [
        {
          year: "1908",
          title: "Il nostro punto di partenza",
          body: "È la data che accompagna il nome Grappasonni: l’inizio di questa storia romana.",
        },
        {
          year: "[DA CONFERMARE]",
          title: "I ricordi di famiglia",
          body: "Date, protagonisti e racconti di questo capitolo [DA CONFERMARE].",
        },
        {
          year: "[DA CONFERMARE]",
          title: "Le tappe del percorso",
          body: "Le trasformazioni del ristorante e i momenti da ricordare [DA CONFERMARE].",
        },
        {
          year: "Oggi",
          title: "Ci ritroviamo a tavola",
          body: "Grappasonni, Via Appia Nuova 858–860, Roma. La storia continua da questo indirizzo.",
        },
      ],
    },
    chefs: {
      eyebrow: "Le persone in cucina",
      title: ["La squadra di", "Grappasonni"],
      note: "Ritratti dimostrativi del modello: non rappresentano lo staff di Grappasonni. Nomi, ruoli e profili [DA CONFERMARE].",
      name: "Nome [DA CONFERMARE]",
      role: "Ruolo [DA CONFERMARE]",
      caption: "Ritratto illustrativo",
      imageAlt:
        "Ritratto dimostrativo di uno chef; non identifica un membro dello staff di Grappasonni",
      networks: ["Instagram", "Facebook", "Twitter"],
      profileLabel: (network: string) =>
        `${network}: profilo dello staff da confermare`,
      dialogTitle: "I profili della squadra",
      dialogBody:
        "Questo ritratto appartiene al modello grafico e ha solo una funzione illustrativa. I nomi, i ruoli e i collegamenti social dello staff di Grappasonni non sono ancora stati confermati.",
    },
    blog: {
      eyebrow: "Uno sguardo a Grappasonni",
      title: ["Prima di", "ritrovarci"],
      read: "Scopri di più",
      posts: [
        {
          number: "01",
          badge: "Menù",
          category: "A tavola",
          title: "Il menù, nelle fotografie degli ospiti",
          imageAlt: "Un piatto di pasta fotografato a Grappasonni",
          metadata: ["Le proposte", "Da confermare"],
          paragraphs: [
            "Il menù in anteprima raccoglie proposte e prezzi trascritti da fotografie pubblicate su TheFork. La data di una fotografia non ne garantisce la validità attuale.",
            "Disponibilità, prezzi e informazioni sugli allergeni [DA CONFERMARE]. Per esigenze particolari, chiedi al personale del ristorante.",
          ],
          action: "Vai al menù",
          href: "#menu",
        },
        {
          number: "02",
          badge: "Spazi",
          category: "L’atmosfera",
          title: "Un angolo per fermarsi, a Roma",
          imageAlt: "Il giardino di Grappasonni, tra piante e sedute",
          metadata: ["La galleria", "Foto TheFork"],
          paragraphs: [
            "La sala, la veranda e il giardino: le fotografie della galleria TheFork offrono uno sguardo agli spazi di Grappasonni.",
            "Le immagini appartengono a questa anteprima del sito. Crediti e diritti di riutilizzo sono da verificare prima della pubblicazione.",
          ],
          action: "Guarda la galleria",
          href: "#gallery",
        },
        {
          number: "03",
          badge: "Roma",
          category: "Dove siamo",
          title: "Ci trovi in Via Appia Nuova",
          imageAlt:
            "Una lunga tavola apparecchiata nella veranda di Grappasonni",
          metadata: ["Via Appia Nuova", "858–860"],
          paragraphs: [
            "L’indirizzo è Via Appia Nuova 858–860, 00178 Roma. Qui comincia il prossimo incontro a tavola.",
            "Orari di apertura, parcheggio e indicazioni sui trasporti [DA CONFERMARE]. Le richieste di prenotazione attendono sempre la risposta del ristorante.",
          ],
          action: "Trova il ristorante",
          href: "#hours",
        },
      ],
    },
  },
  en: {
    close: "Close",
    about: {
      eyebrow: "Our story",
      title: ["Join us in Rome,", "at Grappasonni"],
      description:
        "Grappasonni, since 1908. A name and an address on Via Appia Nuova: the pleasure of getting together and sharing time around a table.",
      badge: "1908",
      badgeLines: ["A Roman", "story"],
      imageAlt:
        "Grappasonni’s dining room, with wooden tables and wine shelves",
      detailAlt:
        "Grappasonni’s veranda, with tables, plants and light curtains",
      features: [
        {
          title: "Since 1908",
          body: "The date that accompanies the Grappasonni name. Family stories [TO BE CONFIRMED].",
        },
        {
          title: "Via Appia Nuova",
          body: "Find us in Rome, at numbers 858–860. An address to rediscover.",
        },
        {
          title: "Your next table",
          body: "Send a request. Your table is confirmed only after the restaurant replies.",
        },
      ],
      action: "Explore the menu",
    },
    special: {
      tag: "Grappasonni since 1908",
      title: ["A good reason", "to get together", "At the table."],
      description:
        "A pause, a conversation, another taste. Choose your moment in Rome and explore the photographed menu.",
      facts: [
        { value: "1908", label: "Since" },
        { value: "Rome", label: "The city" },
        { value: "Appia", label: "The road" },
      ],
      action: "Choose your table",
      badgeLabel: "Since",
      badgeValue: "1908",
      imageAlt: "A pasta dish photographed by a guest at Grappasonni",
      imageNote:
        "Photo from TheFork’s gallery. Dish identity [TO BE CONFIRMED].",
    },
    history: {
      eyebrow: "Our journey",
      title: ["A", "Roman story"],
      description:
        "From 1908 to today. Grappasonni’s milestones, memories and people will be shared once their details have been confirmed.",
      items: [
        {
          year: "1908",
          title: "Our starting point",
          body: "The date that accompanies the Grappasonni name: the beginning of this Roman story.",
        },
        {
          year: "[TO BE CONFIRMED]",
          title: "Family memories",
          body: "The dates, people and stories of this chapter [TO BE CONFIRMED].",
        },
        {
          year: "[TO BE CONFIRMED]",
          title: "Milestones along the way",
          body: "Changes to the restaurant and moments to remember [TO BE CONFIRMED].",
        },
        {
          year: "Today",
          title: "Together around a table",
          body: "Grappasonni, Via Appia Nuova 858–860, Rome. The story continues at this address.",
        },
      ],
    },
    chefs: {
      eyebrow: "The people in the kitchen",
      title: ["The team at", "Grappasonni"],
      note: "Demonstration portraits from the template: they do not depict Grappasonni’s staff. Names, roles and profiles [TO BE CONFIRMED].",
      name: "Name [TO BE CONFIRMED]",
      role: "Role [TO BE CONFIRMED]",
      caption: "Illustrative portrait",
      imageAlt:
        "Demonstration portrait of a chef; not a member of Grappasonni’s staff",
      networks: ["Instagram", "Facebook", "Twitter"],
      profileLabel: (network: string) =>
        `${network}: staff profile to be confirmed`,
      dialogTitle: "The team’s profiles",
      dialogBody:
        "This portrait comes from the graphic template and is illustrative only. The names, roles and social profiles of Grappasonni’s staff have not yet been confirmed.",
    },
    blog: {
      eyebrow: "A look at Grappasonni",
      title: ["Before we", "meet"],
      read: "Find out more",
      posts: [
        {
          number: "01",
          badge: "Menu",
          category: "At the table",
          title: "The menu, photographed by guests",
          imageAlt: "A pasta dish photographed at Grappasonni",
          metadata: ["The dishes", "To be confirmed"],
          paragraphs: [
            "The preview menu contains dishes and prices transcribed from photographs posted on TheFork. A photograph’s date does not establish current menu validity.",
            "Availability, prices and allergen information [TO BE CONFIRMED]. Please ask the restaurant team about any particular requirements.",
          ],
          action: "Go to the menu",
          href: "#menu",
        },
        {
          number: "02",
          badge: "Spaces",
          category: "The atmosphere",
          title: "A corner to pause in Rome",
          imageAlt: "Grappasonni’s garden, with plants and seating",
          metadata: ["The gallery", "TheFork photos"],
          paragraphs: [
            "The dining room, veranda and garden: photographs from TheFork’s gallery offer a glimpse of Grappasonni’s spaces.",
            "These images are used in this site preview. Credits and reuse rights must be checked before publication.",
          ],
          action: "View the gallery",
          href: "#gallery",
        },
        {
          number: "03",
          badge: "Rome",
          category: "Find us",
          title: "Find us on Via Appia Nuova",
          imageAlt: "A long table set in Grappasonni’s veranda",
          metadata: ["Via Appia Nuova", "858–860"],
          paragraphs: [
            "The address is Via Appia Nuova 858–860, 00178 Rome. Your next gathering around a table begins here.",
            "Opening hours, parking and public transport information [TO BE CONFIRMED]. Reservation requests always await a reply from the restaurant.",
          ],
          action: "Find the restaurant",
          href: "#hours",
        },
      ],
    },
  },
} as const;
