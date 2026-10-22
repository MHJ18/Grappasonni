export const reservationCopy = {
  it: {
    guest: (count: number) => `${count} ${count === 1 ? "ospite" : "ospiti"}`,
    eyebrow: "06 — Prenota",
    title: ["Ci vediamo", "a tavola."],
    description:
      "Scegli il giorno, l’ora e la compagnia. Invia una richiesta: il tavolo sarà confermato soltanto dopo la risposta del ristorante.",
    required: "I campi con * sono obbligatori.",
    labels: {
      name: "Nome e cognome",
      email: "Email",
      phone: "Telefono · facoltativo",
      date: "Data",
      time: "Ora desiderata",
      guests: "Persone",
      notes: "Note · facoltative",
      website: "Lascia vuoto questo campo",
    },
    dateHelp: "Da oggi ai prossimi 180 giorni.",
    timeHelp: "Ora di Roma.",
    notesHelp: "Fino a 2.000 caratteri.",
    consent:
      "Acconsento al trattamento dei dati inseriti per gestire questa richiesta di prenotazione.",
    privacy: "",
    submit: "Richiedi un tavolo",
    submitting: "Invio della richiesta…",
    newRequest: "Invia un’altra richiesta",
    theFork: "Prenota con TheFork",
    external: "Si apre in una nuova scheda.",
    phoneLabel: "Telefono pubblicato",
    phoneNumber: "+39 06 718 8701",
    phoneStatus: "",
    serviceNote: "La richiesta non garantisce la disponibilità del tavolo.",
    pending:
      "Richiesta inviata. Il tavolo è in attesa di conferma: aspetta la risposta del ristorante prima di considerare la prenotazione confermata.",
    validation: "Controlla i campi indicati e invia di nuovo la richiesta.",
    notConfigured:
      "Il servizio di richiesta tavoli non è ancora configurato. La richiesta non è stata inviata. Puoi riprovare oppure prenotare con TheFork.",
    unavailable:
      "Non è stato possibile verificare l’invio della richiesta. Il tavolo non è confermato. Riprova tra poco oppure usa TheFork.",
    rateLimited:
      "Sono arrivate troppe richieste. Attendi qualche minuto prima di riprovare, oppure usa TheFork.",
    errors: {
      name: "Inserisci nome e cognome, da 2 a 100 caratteri.",
      email: "Inserisci un indirizzo email valido.",
      phone:
        "Inserisci un numero di telefono valido oppure lascia il campo vuoto.",
      date: "Scegli una data valida da oggi ai prossimi 180 giorni.",
      time: "Inserisci un’ora valida.",
      guests: "Scegli un numero di persone da 1 a 20.",
      notes: "Usa testo semplice, fino a 2.000 caratteri.",
      consent: "Il consenso è necessario per gestire la richiesta.",
    },
  },
  en: {
    guest: (count: number) => `${count} ${count === 1 ? "guest" : "guests"}`,
    eyebrow: "06 — Reservations",
    title: ["See you", "at the table."],
    description:
      "Choose a day, a time and your company. Send a request: your table is confirmed only after the restaurant replies.",
    required: "Fields marked * are required.",
    labels: {
      name: "Full name",
      email: "Email",
      phone: "Phone · optional",
      date: "Date",
      time: "Preferred time",
      guests: "Guests",
      notes: "Notes · optional",
      website: "Leave this field empty",
    },
    dateHelp: "From today through the next 180 days.",
    timeHelp: "Rome time.",
    notesHelp: "Up to 2,000 characters.",
    consent:
      "I consent to the processing of the information entered to manage this reservation request.",
    privacy: "",
    submit: "Request a table",
    submitting: "Sending your request…",
    newRequest: "Send another request",
    theFork: "Book with TheFork",
    external: "Opens in a new tab.",
    phoneLabel: "Published phone number",
    phoneNumber: "+39 06 718 8701",
    phoneStatus: "",
    serviceNote: "A request does not guarantee table availability.",
    pending:
      "Request sent. Your table is awaiting confirmation: wait for the restaurant’s reply before considering your booking confirmed.",
    validation: "Check the highlighted fields and send your request again.",
    notConfigured:
      "The table request service has not been configured yet. Your request was not sent. You can retry or book with TheFork.",
    unavailable:
      "We could not verify that your request was sent. Your table is not confirmed. Please retry shortly or use TheFork.",
    rateLimited:
      "Too many requests have been received. Please wait a few minutes before retrying, or use TheFork.",
    errors: {
      name: "Enter your full name, between 2 and 100 characters.",
      email: "Enter a valid email address.",
      phone: "Enter a valid phone number or leave this field empty.",
      date: "Choose a valid date from today through the next 180 days.",
      time: "Enter a valid time.",
      guests: "Choose between 1 and 20 guests.",
      notes: "Use plain text, up to 2,000 characters.",
      consent: "Consent is required to manage your request.",
    },
  },
} as const;
