import assert from "node:assert/strict";
import test from "node:test";
import {
  getInquiryEmailConfig,
  inquiryEmail,
  validateInquiry,
} from "./inquiries.ts";

const newsletter = {
  kind: "newsletter",
  email: "guest@example.com",
  consent: true,
  website: "",
  locale: "it",
};
const contact = {
  ...newsletter,
  kind: "contact",
  name: "Mario Rossi",
  subject: "Una domanda",
  message: "Vorrei alcune informazioni.",
};

test("contact and update requests validate required fields and explicit consent", () => {
  assert.equal(validateInquiry(contact).success, true);
  assert.equal(validateInquiry(newsletter).success, true);
  for (const patch of [
    { consent: false },
    { consent: "true" },
    { email: "bad-email" },
    { email: "a".repeat(255) },
    { website: "spam" },
    { locale: "fr" },
    { subscribed: true },
  ]) {
    assert.equal(validateInquiry({ ...newsletter, ...patch }).success, false);
  }
  for (const patch of [
    { name: "A" },
    { name: "a\nBcc: recipient@example.com" },
    { subject: "" },
    { message: "tiny" },
    { message: "x".repeat(4001) },
    { message: "Text\u0000content" },
  ]) {
    assert.equal(validateInquiry({ ...contact, ...patch }).success, false);
  }
});

test("notification copy never claims the newsletter request activated a subscription", () => {
  const email = inquiryEmail(
    validateInquiry(newsletter).data,
    "request-reference",
  );
  assert.match(email.text, /ISCRIZIONE NON ATTIVATA/);
  assert.match(email.text, /non aggiunge il contatto a una lista/);
  assert.match(email.text, /request-reference/);
  const message = inquiryEmail(
    validateInquiry({ ...contact, subject: "<b>Question</b>" }).data,
    "message-reference",
  );
  assert.ok(!message.subject.includes("<b>"));
  assert.match(message.text, /Oggetto: <b>Question<\/b>/);
});

test("missing notification configuration stays unavailable", () => {
  const fields = [
    "RESEND_API_KEY",
    "RESERVATION_FROM_EMAIL",
    "RESERVATION_TO_EMAIL",
  ];
  const prior = Object.fromEntries(
    fields.map((field) => [field, process.env[field]]),
  );
  try {
    for (const field of fields) delete process.env[field];
    assert.equal(getInquiryEmailConfig(), null);
    process.env.RESEND_API_KEY = "test-key";
    process.env.RESERVATION_FROM_EMAIL = "sender@example.com";
    process.env.RESERVATION_TO_EMAIL = "owner@example.com";
    assert.ok(getInquiryEmailConfig());
    process.env.RESERVATION_FROM_EMAIL =
      "sender@example.com\nBcc: attacker@example.com";
    assert.equal(getInquiryEmailConfig(), null);
  } finally {
    for (const field of fields) {
      if (prior[field] === undefined) delete process.env[field];
      else process.env[field] = prior[field];
    }
  }
});
