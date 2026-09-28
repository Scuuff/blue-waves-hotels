import nodemailer from "nodemailer";

// Credentials are read from the environment so no secrets live in the codebase:
//   MAIL_USER  – the Gmail address that sends the mail
//   MAIL_PASS  – a Gmail "App Password" (NOT the normal account password)
//   MAIL_FROM  – optional display sender, e.g. "Blue Waves Hotel <you@gmail.com>"
let cachedTransporter = null;

export function isMailConfigured() {
  return Boolean(process.env.MAIL_USER && process.env.MAIL_PASS);
}

function getTransporter() {
  if (!isMailConfigured()) return null;
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }
  return cachedTransporter;
}

const PAYMENT_METHOD_LABELS = {
  card: "Credit Card",
  google: "Google Pay",
  apple: "Apple Pay",
  paypal: "PayPal",
};

const formatMailDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
};

const money = (value) => `$${Number(value || 0).toFixed(2)}`;

// Sent automatically after a booking is paid and saved. Renders a branded,
// inline-styled HTML confirmation (email clients ignore stylesheets).
export async function sendBookingConfirmationEmail(booking) {
  const transporter = getTransporter();
  if (!transporter) throw new Error("Email service is not configured.");

  const from =
    process.env.MAIL_FROM || `Blue Waves Hotel <${process.env.MAIL_USER}>`;

  const reference = booking.confirmationCode || String(booking._id).slice(-8).toUpperCase();
  const paymentLabel =
    PAYMENT_METHOD_LABELS[booking.paymentMethod] || "Credit Card";
  const nights = Number(booking.nights) || 1;
  const roomSubtotal = (Number(booking.price) || 0) * nights;

  const row = (label, value, opts = {}) => `
    <tr>
      <td style="padding:9px 0;color:#5b7aa3;font-size:13px;">${label}</td>
      <td style="padding:9px 0;color:${opts.accent ? "#26567e" : "#16283c"};font-size:13px;font-weight:${opts.bold ? "700" : "600"};text-align:right;">${value}</td>
    </tr>`;

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#eef4fb;padding:32px 16px;">
    <div style="max-width:600px;margin:0 auto;">

      <!-- Header -->
      <div style="background:linear-gradient(160deg,#15273f,#0a1420);border-radius:20px 20px 0 0;padding:34px 36px;text-align:center;">
        <p style="margin:0;color:#9fc0ec;font-size:12px;letter-spacing:4px;text-transform:uppercase;">Blue Waves Hotel</p>
        <h1 style="margin:12px 0 6px;color:#ffffff;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:600;">
          Your booking is confirmed 🌊
        </h1>
        <p style="margin:0;color:#cfe0f5;font-size:14px;">
          Thank you, ${booking.name || "Guest"} — we can't wait to welcome you.
        </p>
        <div style="display:inline-block;margin-top:18px;background:rgba(159,192,236,0.12);border:1px solid rgba(159,192,236,0.35);border-radius:999px;padding:8px 22px;">
          <span style="color:#9fc0ec;font-size:12px;letter-spacing:2px;">BOOKING REF</span>
          <span style="color:#ffffff;font-size:15px;font-weight:bold;letter-spacing:2px;">&nbsp; ${reference}</span>
        </div>
      </div>

      <!-- Body -->
      <div style="background:#ffffff;padding:30px 36px;border-left:1px solid #dbe6f2;border-right:1px solid #dbe6f2;">
        <h2 style="margin:0 0 2px;color:#16283c;font-family:Georgia,serif;font-size:21px;">${booking.roomName || "Your Room"}</h2>
        <p style="margin:0 0 20px;color:#5b7aa3;font-size:13px;">
          ${booking.hotelName || "Blue Wave Hotel"} · ${booking.branch || booking.city || "Egypt"}
        </p>

        <!-- Stay dates -->
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:10px 0;margin:0 -10px 22px;">
          <tr>
            <td width="50%" style="background:#f2f7fc;border:1px solid #dbe6f2;border-radius:12px;padding:14px 16px;">
              <p style="margin:0;color:#5b7aa3;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Check-in</p>
              <p style="margin:6px 0 0;color:#16283c;font-size:14px;font-weight:bold;">${formatMailDate(booking.checkIn)}</p>
              <p style="margin:3px 0 0;color:#8aa0ba;font-size:12px;">From 2:00 PM</p>
            </td>
            <td width="50%" style="background:#f2f7fc;border:1px solid #dbe6f2;border-radius:12px;padding:14px 16px;">
              <p style="margin:0;color:#5b7aa3;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Check-out</p>
              <p style="margin:6px 0 0;color:#16283c;font-size:14px;font-weight:bold;">${formatMailDate(booking.checkOut)}</p>
              <p style="margin:3px 0 0;color:#8aa0ba;font-size:12px;">Until 12:00 PM</p>
            </td>
          </tr>
        </table>

        <!-- Details -->
        <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e7eef7;">
          ${row("Guest", booking.name || "—")}
          ${row("Room type", booking.roomType || "—")}
          ${row("Nights", `${nights} night${nights > 1 ? "s" : ""}`)}
          ${row("Guests", `${booking.guests || 1} guest${(booking.guests || 1) > 1 ? "s" : ""}`)}
          ${row("Payment method", paymentLabel)}
        </table>

        <!-- Price breakdown -->
        <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e7eef7;margin-top:4px;">
          ${roomSubtotal > 0 ? row(`${money(booking.price)} × ${nights} night${nights > 1 ? "s" : ""}`, money(roomSubtotal)) : ""}
          ${row("Cleaning fee", money(100))}
          ${row("Taxes", money(240))}
          <tr>
            <td style="padding:14px 0 4px;color:#16283c;font-size:15px;font-weight:bold;border-top:1px solid #e7eef7;">Total paid</td>
            <td style="padding:14px 0 4px;color:#26567e;font-size:22px;font-weight:bold;text-align:right;border-top:1px solid #e7eef7;">${money(booking.total)}</td>
          </tr>
        </table>
      </div>

      <!-- Footer -->
      <div style="background:#f2f7fc;border:1px solid #dbe6f2;border-top:0;border-radius:0 0 20px 20px;padding:22px 36px;">
        <p style="margin:0 0 6px;color:#5b7aa3;font-size:12px;line-height:1.7;">
          Free cancellation up to 48 hours before check-in. Please present this
          confirmation and a valid ID at reception. Questions? Just reply to this email.
        </p>
        <p style="margin:10px 0 0;color:#8aa0ba;font-size:11px;">
          Blue Waves Hotel · Cairo · Alexandria · Sharm El Sheikh · Ain El Sokhna · Marsa Alam
        </p>
      </div>
    </div>
  </div>`;

  const text = [
    `Your Blue Waves Hotel booking is confirmed!`,
    ``,
    `Booking reference: ${reference}`,
    `Guest: ${booking.name}`,
    `Room: ${booking.roomName} (${booking.roomType}) — ${booking.branch}`,
    `Check-in: ${formatMailDate(booking.checkIn)} (from 2:00 PM)`,
    `Check-out: ${formatMailDate(booking.checkOut)} (until 12:00 PM)`,
    `Nights: ${nights} · Guests: ${booking.guests || 1}`,
    `Payment method: ${paymentLabel}`,
    `Total paid: ${money(booking.total)}`,
    ``,
    `Free cancellation up to 48 hours before check-in.`,
  ].join("\n");

  return transporter.sendMail({
    from,
    to: booking.email,
    subject: `Booking confirmed — ${reference} · Blue Waves Hotel`,
    text,
    html,
  });
}

export async function sendWelcomeEmail(toEmail) {
  const transporter = getTransporter();
  if (!transporter) throw new Error("Email service is not configured.");

  const from =
    process.env.MAIL_FROM || `Blue Waves Hotel <${process.env.MAIL_USER}>`;

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#0a1420;padding:32px;color:#e6eefb;">
    <div style="max-width:520px;margin:0 auto;background:linear-gradient(160deg,#15273f,#0c1828);border:1px solid rgba(159,192,236,0.2);border-radius:20px;padding:32px;">
      <h1 style="margin:0 0 8px;color:#9fc0ec;font-size:24px;">Welcome to Blue Waves Hotel 🌊</h1>
      <p style="margin:0 0 18px;color:#cfe0f5;font-size:15px;line-height:1.6;">
        Thanks for subscribing! You're now on the list for our latest travel deals,
        seasonal offers, and updates from our branches across Egypt.
      </p>
      <p style="margin:0 0 24px;color:#9fb3d1;font-size:14px;line-height:1.6;">
        We'll only email you the good stuff — and you can unsubscribe anytime.
      </p>
      <a href="#" style="display:inline-block;background:#9fc0ec;color:#0c1828;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:999px;font-size:14px;">
        Explore our branches →
      </a>
      <p style="margin:26px 0 0;color:#6f88a8;font-size:12px;">
        Blue Waves Hotel · Cairo · Sharm El Sheikh · Ain El Sokhna · Marsa Alam
      </p>
    </div>
  </div>`;

  return transporter.sendMail({
    from,
    to: toEmail,
    subject: "Welcome to Blue Waves Hotel ✨",
    text: "Thanks for subscribing to Blue Waves Hotel! You'll now receive our latest travel deals and updates. You can unsubscribe anytime.",
    html,
  });
}
