import NewsletterSubscriber from "../models/NewsletterSubscriber.js";
import { sendWelcomeEmail, isMailConfigured } from "../utils/mailer.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribeNewsletter(req, res) {
  try {
    const email = String(req.body?.email ?? "").trim().toLowerCase();

    if (!EMAIL_REGEX.test(email)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid email address." });
    }

    // Save the subscriber (idempotent — a repeat signup won't duplicate).
    const result = await NewsletterSubscriber.updateOne(
      { email },
      { $setOnInsert: { email, subscribedAt: new Date() } },
      { upsert: true }
    );
    const isNew = Boolean(result.upsertedCount);

    // If mail isn't configured yet, still succeed — just say we stored it.
    if (!isMailConfigured()) {
      return res.status(200).json({
        message: "You're subscribed! (Welcome email delivery isn't set up yet.)",
        emailed: false,
        isNew,
      });
    }

    try {
      await sendWelcomeEmail(email);
      return res.status(200).json({
        message: "Subscribed! Check your inbox for a welcome email.",
        emailed: true,
        isNew,
      });
    } catch (mailError) {
      // Subscription was saved; surface the email failure without losing the signup.
      return res.status(502).json({
        message:
          "You're subscribed, but we couldn't send the welcome email right now.",
        emailed: false,
        error: mailError.message,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Could not complete your subscription. Please try again.",
      error: error.message,
    });
  }
}
