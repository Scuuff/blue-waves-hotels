import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BedDouble,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Lock,
  MapPin,
  Moon,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import logoWhite from "../assets/Images/white_logo.png";
import { getSafeRoomImage } from "../utils/roomMedia";
import { createBooking } from "../services/bookingsApi";
import PaymentMethodSelector from "../Components/PaymentMethodSelector";

const CLEANING_FEE = 100;
const TAXES = 240;

// ---------------------------------------------------------------------------
// Card brand detection — drives the interactive brand chips and the inline
// icon in the card number field. Based on real IIN (BIN) prefixes.
// ---------------------------------------------------------------------------
function detectCardBrand(digits) {
  if (/^4/.test(digits)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "mastercard";
  if (/^3[47]/.test(digits)) return "amex";
  if (/^(6011|65|64[4-9])/.test(digits)) return "discover";
  return null;
}

// Group the card number in blocks of four for readability: 4242 4242 …
const formatCardNumber = (digits) => digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

// Compact vector-style brand marks (no image assets, crisp in both themes).
function BrandMark({ brand }) {
  if (brand === "visa") {
    return <span className="text-[13px] font-black italic tracking-tight text-[#1a1f71]">VISA</span>;
  }
  if (brand === "mastercard") {
    return (
      <span className="flex items-center">
        <span className="h-4 w-4 rounded-full bg-[#eb001b]" />
        <span className="-ml-1.5 h-4 w-4 rounded-full bg-[#f79e1b] mix-blend-multiply" />
      </span>
    );
  }
  if (brand === "amex") {
    return (
      <span className="rounded-[3px] bg-[#2e77bc] px-1 py-0.5 text-[9px] font-extrabold tracking-wide text-white">
        AMEX
      </span>
    );
  }
  return (
    <span className="flex items-center gap-0.5 text-[11px] font-extrabold tracking-tight text-[#4a4a4a]">
      DISC
      <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#f76f20]" />
      VER
    </span>
  );
}

export default function PaymentPage({ room: propsRoom, nights: propsNights, total: propsTotal }) {
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state || {};
  const pendingBooking = useMemo(() => {
    try {
      const raw = sessionStorage.getItem("pendingBooking");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }, []);

  const room = locationState.room || pendingBooking.room || propsRoom || null;
  const nights = locationState.nights || pendingBooking.nights || propsNights || 0;
  const total = locationState.total || pendingBooking.total || propsTotal || 0;
  const checkIn = locationState.checkIn || pendingBooking.checkIn || "";
  const checkOut = locationState.checkOut || pendingBooking.checkOut || "";
  const branch = locationState.branch || pendingBooking.branch || room?.branch || "";
  const guests = locationState.guests || pendingBooking.guests || room?.guests || 1;

  const roomPrice = Number(room?.price) || 0;
  const roomSubtotal = nights > 0 ? nights * roomPrice : 0;

  const [email, setEmail] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState(false);
  const [payMethod, setPayMethod] = useState("card");
  const [bookingRef, setBookingRef] = useState("");

  const detectedBrand = detectCardBrand(cardNumber);

  const handleCardNumber = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 16);
    setCardNumber(value);
    if (value.length > 0 && value.length < 16) {
      setError("Card number must be exactly 16 digits.");
    } else {
      setError("");
    }
  };

  const handleName = (e) => {
    const value = e.target.value;
    setName(value);
    if (/[^a-zA-Z\s]/.test(value)) setError("Name must contain letters only.");
    else setError("");
  };

  const handlePhone = (e) => {
    const rawValue = e.target.value;
    const value = rawValue.replace(/\D/g, "").slice(0, 11);
    setPhone(value);
    if (rawValue.replace(/\D/g, "").length > 11) {
      setPhoneError("Phone number must not exceed 11 digits.");
    } else {
      setPhoneError("");
    }
  };

  const handleExpiry = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length >= 3) value = value.slice(0, 2) + "/" + value.slice(2, 4);
    setExpiry(value);
  };

  const handleCVV = (e) => {
    const rawValue = e.target.value;
    const value = rawValue.replace(/\D/g, "").slice(0, 3);
    setCvv(value);
    if (/[^0-9]/.test(rawValue)) setError("CVV must contain numbers only.");
    else if (rawValue.length > 3) setError("CVV must be exactly 3 digits.");
    else setError("");
  };

  const handlePayment = async () => {
    if (!name || !email || !phone) {
      setError("Please fill in all fields first.");
      return;
    }

    if (phone.length !== 11) {
      setError("Phone number must be exactly 11 digits.");
      return;
    }

    // Card fields only apply when paying by card — wallet methods
    // (Google Pay / Apple Pay / PayPal) skip them.
    if (payMethod === "card") {
      if (!cardNumber || !expiry || !cvv) {
        setError("Please fill in all fields first.");
        return;
      }

      if (cardNumber.length !== 16) {
        setError("Card number must be exactly 16 digits.");
        return;
      }

      if (cvv.length !== 3) {
        setError("CVV must be exactly 3 digits.");
        return;
      }
    }

    try {
      setProcessing(true);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        setError(
          "Authentication token not found. Please login again and make sure to check 'Remember Me' or use the same browser tab."
        );
        return;
      }

      const savedBooking = await createBooking(
        {
          roomId: room?._id || room?.id,
          roomKey: room?._id || room?.id || "",
          paymentMethod: payMethod,
          name,
          email,
          phone,
          roomName: room?.roomName || "Room",
          hotelName: room?.hotelName || "Blue Wave Hotel",
          city: room?.city || "",
          location: room?.location || "",
          image: room?.image || "",
          roomType: room?.type || "",
          beds: room?.beds || 1,
          baths: room?.baths || 1,
          size: room?.size || 1,
          description: room?.description || "",
          amenities: room?.amenities || [],
          price: room?.price || 0,
          nights: nights || 1,
          total: total || 0,
          branch,
          guests,
          checkIn: checkIn || new Date().toISOString(),
          checkOut: checkOut || new Date().toISOString(),
        },
        token
      );

      sessionStorage.removeItem("pendingBooking");
      setBookingRef(savedBooking?.confirmationCode || "");
      setError("");
      setPaid(true);
    } catch (err) {
      const message = err?.message || "Payment failed. Please try again.";
      const isDbTimeout =
        message.includes("buffering timed out") || message.includes("insertOne()");
      setError(
        isDbTimeout
          ? "Booking service is temporarily unavailable. Please try again in a moment."
          : message
      );
      console.error("Payment error:", err);
    } finally {
      setProcessing(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-[#d7e3ef] bg-[#f8fbfe] px-4 py-3.5 text-[#16283c] placeholder:text-[#93a5b8] outline-none transition-all duration-300 focus:border-[#2f6fb3] focus:bg-white focus:ring-4 focus:ring-[#2f6fb3]/10 dark:border-white/10 dark:bg-[#15273f] dark:text-white dark:placeholder:text-white/35 dark:focus:border-[#9fc0ec] dark:focus:bg-[#182c46] dark:focus:ring-[#9fc0ec]/15";

  const labelClass =
    "mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[#5b7aa3] dark:text-[#9fc0ec]/80";

  // Guests can only land here without a room by visiting /payment directly.
  if (!room) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#f2f7fc] px-6 text-center dark:bg-[#0a1420]">
        <CreditCard size={40} className="text-[#2f6fb3] dark:text-[#9fc0ec]" />
        <h1 className="font-serif text-3xl font-semibold text-[#16283c] dark:text-white">
          Nothing to pay for yet
        </h1>
        <p className="max-w-sm text-sm leading-6 text-[#3c5068] dark:text-white/60">
          Pick a room and select your dates first — then you'll be brought here to
          complete your booking.
        </p>
        <Link
          to="/hotels"
          className="rounded-full bg-[#2f6fb3] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#26567E] dark:bg-[#9fc0ec] dark:text-[#0c1828] dark:hover:bg-white"
        >
          Browse Rooms
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef4fb] via-[#f6f9fd] to-[#eef4fb] px-4 py-10 dark:from-[#0a1420] dark:via-[#0d1b2c] dark:to-[#0a1420] md:px-8 md:py-14">
      <div className="mx-auto max-w-6xl">
        {/* Top bar: back link + secure badge */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#3c5068] transition hover:text-[#16283c] dark:text-white/60 dark:hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to booking
          </button>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#2f6fb3]/20 bg-white/70 px-4 py-1.5 text-xs font-semibold text-[#2f6fb3] backdrop-blur-sm dark:border-[#9fc0ec]/20 dark:bg-white/5 dark:text-[#9fc0ec]">
            <Lock size={12} />
            Secure Checkout
          </span>
        </div>

        <div className="grid overflow-hidden rounded-[28px] shadow-[0_30px_90px_rgba(22,40,60,0.18)] ring-1 ring-[#26567E]/10 dark:shadow-[0_30px_90px_rgba(0,0,0,0.55)] dark:ring-white/10 lg:grid-cols-[420px_1fr]">
          {/* ------------------------------------------------------------- */}
          {/* Booking summary — replaces the decorative beach photo with     */}
          {/* the thing the guest actually cares about: what they're paying. */}
          {/* ------------------------------------------------------------- */}
          <aside className="relative flex flex-col bg-gradient-to-br from-[#15273f] via-[#0f1f33] to-[#0a1420] p-7 text-white md:p-9">
            {/* Ambient glow */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#9fc0ec]/10 blur-3xl" />

            <img src={logoWhite} alt="Blue Waves Hotel" className="mb-7 h-11 w-auto self-start object-contain" />

            <div className="relative overflow-hidden rounded-2xl">
              <img
                src={getSafeRoomImage(room)}
                alt={room.roomName}
                onError={(e) => {
                  e.currentTarget.src = getSafeRoomImage({ type: room?.type });
                }}
                className="h-44 w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1420]/80 via-transparent to-transparent" />
              {room.type && (
                <span className="absolute left-3 top-3 rounded-full bg-[#0c1828]/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#9fc0ec] backdrop-blur-sm">
                  {room.type}
                </span>
              )}
            </div>

            <h2 className="mt-5 font-serif text-2xl font-semibold leading-snug">{room.roomName}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-white/60">
              <MapPin size={14} className="text-[#9fc0ec]" />
              {branch || room.location || "Blue Waves Hotel"}
            </p>

            {/* Stay facts */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">Check-in</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                  <CalendarDays size={14} className="text-[#9fc0ec]" />
                  {formatDate(checkIn)}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">Check-out</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                  <CalendarDays size={14} className="text-[#9fc0ec]" />
                  {formatDate(checkOut)}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#9fc0ec]/10 px-3 py-1.5 text-xs font-medium text-[#cfe0f5]">
                <Moon size={12} className="text-[#9fc0ec]" />
                {nights > 0 ? `${nights} night${nights > 1 ? "s" : ""}` : "Dates pending"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#9fc0ec]/10 px-3 py-1.5 text-xs font-medium text-[#cfe0f5]">
                <Users size={12} className="text-[#9fc0ec]" />
                {guests} guest{guests > 1 ? "s" : ""}
              </span>
              {room.beds && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#9fc0ec]/10 px-3 py-1.5 text-xs font-medium text-[#cfe0f5]">
                  <BedDouble size={12} className="text-[#9fc0ec]" />
                  {room.beds} bed{room.beds > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Price breakdown */}
            <div className="mt-6 space-y-2.5 border-t border-white/10 pt-5 text-sm">
              {nights > 0 && (
                <div className="flex justify-between text-white/70">
                  <span>
                    ${roomPrice} × {nights} night{nights > 1 ? "s" : ""}
                  </span>
                  <span>${roomSubtotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-white/70">
                <span>Cleaning fee</span>
                <span>${CLEANING_FEE.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Taxes</span>
                <span>${TAXES.toFixed(2)}</span>
              </div>
              <div className="flex items-baseline justify-between border-t border-white/10 pt-3">
                <span className="font-medium text-white">Total due</span>
                <span className="font-serif text-3xl font-bold text-[#9fc0ec]">
                  ${Number(total || 0).toFixed(2)}
                </span>
              </div>
            </div>

            <p className="mt-auto flex items-start gap-2 pt-6 text-xs leading-5 text-white/45">
              <ShieldCheck size={15} className="mt-0.5 shrink-0 text-[#9fc0ec]/70" />
              Your payment details are encrypted and never stored on our servers. Free
              cancellation up to 48 hours before check-in.
            </p>
          </aside>

          {/* ------------------------------------------------------------- */}
          {/* Payment form                                                   */}
          {/* ------------------------------------------------------------- */}
          <section className="bg-white p-7 dark:bg-[#0f1f33] md:p-11">
            <h1 className="font-serif text-3xl font-semibold text-[#16283c] dark:text-white md:text-4xl">
              Payment Details
            </h1>
            <p className="mt-1.5 text-sm text-[#5b7aa3] dark:text-white/55">
              Complete your booking — it only takes a minute.
            </p>

            {/* Personal information */}
            <div className="mt-8">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-[#16283c] dark:text-white">
                <User size={15} className="text-[#2f6fb3] dark:text-[#9fc0ec]" />
                Personal Information
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Full Name</label>
                  <input type="text" placeholder="As shown on your card" value={name} onChange={handleName} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Phone Number</label>
                  <input
                    type="text"
                    placeholder="01X XXXX XXXX"
                    value={phone}
                    onChange={handlePhone}
                    inputMode="numeric"
                    pattern="[0-9]{11}"
                    className={inputClass}
                  />
                  {phoneError && <p className="mt-1.5 text-xs text-red-500">{phoneError}</p>}
                </div>
              </div>
            </div>

            {/* Payment method — animated selector; the option's name slides in
                beside its icon when selected. */}
            <div className="mt-8">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-[#16283c] dark:text-white">
                <CreditCard size={15} className="text-[#2f6fb3] dark:text-[#9fc0ec]" />
                Payment Method
              </h3>
              <PaymentMethodSelector value={payMethod} onChange={setPayMethod} />
            </div>

            {/* Card details — only when paying by card */}
            {payMethod === "card" ? (
            <div className="mt-7">
              <div className="grid gap-4">
                <div>
                  <label className={labelClass}>Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="0000 0000 0000 0000"
                      value={formatCardNumber(cardNumber)}
                      onChange={handleCardNumber}
                      inputMode="numeric"
                      maxLength={19}
                      className={`${inputClass} pr-16 font-mono tracking-wider`}
                    />
                    {detectedBrand && (
                      <span className="absolute right-3 top-1/2 flex h-7 -translate-y-1/2 items-center rounded-md bg-white px-1.5 shadow-sm ring-1 ring-black/5">
                        <BrandMark brand={detectedBrand} />
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM / YY"
                      value={expiry}
                      onChange={handleExpiry}
                      maxLength={5}
                      className={`${inputClass} font-mono`}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>CVV</label>
                    <input
                      type="password"
                      placeholder="•••"
                      value={cvv}
                      onChange={handleCVV}
                      inputMode="numeric"
                      maxLength={3}
                      className={`${inputClass} font-mono`}
                    />
                  </div>
                </div>
              </div>
            </div>
            ) : (
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#2f6fb3]/20 bg-[#2f6fb3]/[0.06] px-4 py-3.5 text-sm leading-6 text-[#3c5068] dark:border-[#9fc0ec]/20 dark:bg-[#9fc0ec]/10 dark:text-white/70">
                <ShieldCheck size={17} className="mt-0.5 shrink-0 text-[#2f6fb3] dark:text-[#9fc0ec]" />
                <span>
                  You'll authorize this payment with{" "}
                  <span className="font-semibold text-[#16283c] dark:text-white">
                    {payMethod === "google" ? "Google Pay" : payMethod === "apple" ? "Apple Pay" : "PayPal"}
                  </span>{" "}
                  when you confirm — no card details needed here.
                </span>
              </div>
            )}

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-400">
                {error}
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={processing}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2f6fb3] py-4 text-base font-semibold text-white shadow-lg shadow-[#2f6fb3]/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#26567E] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#9fc0ec] dark:text-[#0c1828] dark:shadow-[#9fc0ec]/10 dark:hover:bg-white"
            >
              <Lock size={16} />
              {processing ? "Processing..." : `Pay $${Number(total || 0).toFixed(2)}`}
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-[#93a5b8] dark:text-white/35">
              By confirming, you agree to Blue Waves Hotel's booking terms and
              cancellation policy.
            </p>
          </section>
        </div>
      </div>

      {/* Success overlay — replaces the old alert() */}
      {paid && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#0a1420]/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] bg-white p-9 text-center shadow-2xl dark:bg-[#0f1f33] dark:ring-1 dark:ring-white/10">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-400/15">
              <CheckCircle2 size={34} className="text-emerald-600 dark:text-emerald-400" />
            </span>
            <h2 className="mt-5 font-serif text-3xl font-semibold text-[#16283c] dark:text-white">
              Booking Confirmed
            </h2>
            {bookingRef && (
              <p className="mt-2 inline-block rounded-full border border-[#2f6fb3]/25 bg-[#2f6fb3]/5 px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-[#2f6fb3] dark:border-[#9fc0ec]/25 dark:bg-[#9fc0ec]/10 dark:text-[#9fc0ec]">
                REF · {bookingRef}
              </p>
            )}
            <p className="mt-2 text-sm leading-6 text-[#3c5068] dark:text-white/60">
              {room.roomName} · {nights > 0 ? `${nights} night${nights > 1 ? "s" : ""} · ` : ""}
              ${Number(total || 0).toFixed(2)} paid. A confirmation email has been sent to{" "}
              <span className="font-medium text-[#16283c] dark:text-white">{email}</span>.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => navigate("/profile")}
                className="flex-1 rounded-xl border border-[#2f6fb3]/30 py-3 text-sm font-semibold text-[#2f6fb3] transition hover:bg-[#2f6fb3]/5 dark:border-[#9fc0ec]/30 dark:text-[#9fc0ec] dark:hover:bg-[#9fc0ec]/10"
              >
                View My Bookings
              </button>
              <button
                onClick={() => navigate("/")}
                className="flex-1 rounded-xl bg-[#2f6fb3] py-3 text-sm font-semibold text-white transition hover:bg-[#26567E] dark:bg-[#9fc0ec] dark:text-[#0c1828] dark:hover:bg-white"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
