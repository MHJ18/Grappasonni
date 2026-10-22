import { z } from "zod";

const singleLine = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min)
    .max(max)
    .refine(
      (value) => !/[\u0000-\u001f\u007f]/.test(value),
      "Use a single line of text.",
    );

const reservationSchema = z
  .object({
    name: singleLine(2, 100),
    email: z.string().trim().max(254).email(),
    phone: z
      .string()
      .trim()
      .max(32)
      .optional()
      .default("")
      .refine(
        (value) =>
          !value || (/^[+\d\s().-]{6,32}$/.test(value) && /\d/.test(value)),
        "Enter a valid phone number.",
      ),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    time: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
    guests: z.number().int().min(1).max(20),
    notes: z
      .string()
      .trim()
      .max(2000)
      .refine(
        (value) =>
          !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value),
        "Remove unsupported characters.",
      ),
    consent: z.literal(true),
    website: z.string().max(0).default(""),
    locale: z.enum(["it", "en"]),
  })
  .strict();

export type ReservationInput = z.infer<typeof reservationSchema>;

export function romeDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) =>
    parts.find((entry) => entry.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function validateReservation(value: unknown, now = new Date()) {
  const parsed = reservationSchema.safeParse(value);
  if (!parsed.success) {
    return {
      success: false as const,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const date = new Date(`${parsed.data.date}T00:00:00.000Z`);
  const today = new Date(`${romeDate(now)}T00:00:00.000Z`);
  const dayDistance = (date.getTime() - today.getTime()) / 86_400_000;
  if (
    !Number.isFinite(dayDistance) ||
    date.toISOString().slice(0, 10) !== parsed.data.date ||
    dayDistance < 0 ||
    dayDistance > 180
  ) {
    return {
      success: false as const,
      fieldErrors: {
        date: ["Choose a valid date from today through the next 180 days."],
      },
    };
  }
  return { success: true as const, data: parsed.data };
}

export function getReservationEmailConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESERVATION_FROM_EMAIL?.trim();
  const to = process.env.RESERVATION_TO_EMAIL?.trim();
  if (!apiKey || !from || !to || /[\r\n]/.test(from + to)) return null;
  return { apiKey, from, to };
}

export function reservationEmail(input: ReservationInput, requestId: string) {
  return {
    subject: `Grappasonni — richiesta tavolo ${input.date} ${input.time} (${input.guests})`,
    text: [
      "NUOVA RICHIESTA — TAVOLO NON ANCORA CONFERMATO",
      `Riferimento: ${requestId}`,
      `Nome: ${input.name}`,
      `Email: ${input.email}`,
      `Telefono: ${input.phone || "Non fornito"}`,
      `Data: ${input.date}`,
      `Ora: ${input.time} (Europe/Rome)`,
      `Persone: ${input.guests}`,
      `Lingua ospite: ${input.locale}`,
      "",
      "Note:",
      input.notes || "Nessuna nota.",
      "",
      "L'ospite ha acconsentito al trattamento dei dati per gestire questa richiesta.",
      "Verificare la disponibilità e rispondere all'ospite per confermare o proporre un'alternativa.",
      "Questa email non costituisce una prenotazione confermata.",
    ].join("\n"),
  };
}
