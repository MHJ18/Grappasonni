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
const shared = {
  email: z.string().trim().max(254).email(),
  consent: z.literal(true),
  website: z.string().max(0).default(""),
  locale: z.enum(["it", "en"]),
};
const inquirySchema = z.discriminatedUnion("kind", [
  z
    .object({
      ...shared,
      kind: z.literal("contact"),
      name: singleLine(2, 100),
      subject: singleLine(2, 120),
      message: z
        .string()
        .trim()
        .min(5)
        .max(4000)
        .refine(
          (value) =>
            !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value),
          "Remove unsupported characters.",
        ),
    })
    .strict(),
  z.object({ ...shared, kind: z.literal("newsletter") }).strict(),
]);

export type InquiryInput = z.infer<typeof inquirySchema>;

export function validateInquiry(value: unknown) {
  const parsed = inquirySchema.safeParse(value);
  if (!parsed.success)
    return {
      success: false as const,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  return { success: true as const, data: parsed.data };
}

export function getInquiryEmailConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESERVATION_FROM_EMAIL?.trim();
  const to = process.env.RESERVATION_TO_EMAIL?.trim();
  if (!apiKey || !from || !to || /[\r\n]/.test(from + to)) return null;
  return { apiKey, from, to };
}

export function inquiryEmail(input: InquiryInput, requestId: string) {
  const newsletter = input.kind === "newsletter";
  return {
    subject: newsletter
      ? "Grappasonni — richiesta di aggiornamenti"
      : "Grappasonni — nuovo messaggio dal sito",
    text: [
      newsletter
        ? "RICHIESTA DI AGGIORNAMENTI — ISCRIZIONE NON ATTIVATA"
        : "NUOVO MESSAGGIO DAL SITO",
      `Riferimento: ${requestId}`,
      `Email: ${input.email}`,
      `Lingua: ${input.locale}`,
      ...(input.kind === "contact"
        ? [
            `Nome: ${input.name}`,
            `Oggetto: ${input.subject}`,
            "",
            input.message,
          ]
        : []),
      "",
      input.kind === "contact"
        ? "L'ospite ha acconsentito al trattamento dei dati per gestire questo messaggio."
        : "L'ospite ha chiesto di ricevere aggiornamenti e ha fornito il consenso. Questa notifica non aggiunge il contatto a una lista e non attiva un'iscrizione. Gestire la richiesta secondo l'informativa e il sistema di consenso del ristorante.",
      "Questa email non conferma alcuna prenotazione.",
    ].join("\n"),
  };
}
