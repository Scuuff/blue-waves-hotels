import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Clock,
  AlertCircle,
  User,
  AtSign,
  FileText,
  Headphones,
  Globe,
  Sparkles,
  Check,
  X,
  ChevronDown,
} from "lucide-react";
import FAQAccordion from "../Components/FAQAccordion";
import { apiGet, apiPost } from "../services/apiClient";
import { useAuth } from "../Context/AuthContext";

const EASE = [0.22, 1, 0.36, 1];

const INQUIRY_TYPES = [
  "General Inquiry",
  "Booking Assistance",
  "Cancellation / Refund",
  "Room Upgrade Request",
  "Event Planning",
  "Lost & Found",
  "Complaint / Feedback",
];

const MAX_MESSAGE_LENGTH = 1000;

const staggerGrid = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const riseIn = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

function normalizeBranch(hotel = {}) {
  return {
    name: hotel.name || "Branch",
    address: hotel.address || "Address not available",
    phone: hotel.phone || "Phone not available",
    email: hotel.email || "Email not available",
    hours:
      hotel.status === "Active" ? "24 / 7 Front Desk" : "Currently unavailable",
  };
}

// ── Toast ──
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === "success";

  return (
    <motion.div
      initial={{ opacity: 0, x: 80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 80 }}
      transition={{ duration: 0.35, ease: EASE }}
      className={`fixed right-6 top-24 z-50 flex items-center gap-3 rounded-2xl px-6 py-3.5 text-white shadow-2xl ${
        isSuccess ? "bg-emerald-600" : "bg-red-600"
      }`}
    >
      {isSuccess ? <Check size={18} /> : <X size={18} />}
      <span className="text-sm font-medium">{message}</span>
    </motion.div>
  );
}

// ── Section heading (matches the search page language) ──
function SectionHeading({ eyebrow, title }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-gold-600 dark:text-gold-300">
        <span className="h-px w-8 bg-gold-400/70" />
        {eyebrow}
      </p>
      <h2 className="mt-3 font-serif text-4xl font-semibold text-[#1d3252] dark:text-white">
        {title}
      </h2>
    </motion.div>
  );
}

function FieldLabel({ icon, children, optional }) {
  return (
    <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-[#6a83a6] dark:text-gold-300/80">
      {icon}
      {children}
      {optional && (
        <span className="ml-1 font-medium normal-case tracking-normal text-[#8fa3bd] dark:text-white/40">
          (optional)
        </span>
      )}
    </label>
  );
}

function FieldError({ error }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -4, height: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="mt-1.5 flex items-center gap-1 overflow-hidden text-xs font-medium text-red-500"
        >
          <AlertCircle size={12} /> {error}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

// ── Main component ──
export default function ContactHelp() {
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    branch: "",
    inquiryType: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [branches, setBranches] = useState([]);

  const faqRef = useRef(null);
  const contactRef = useRef(null);
  const branchesRef = useRef(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type, key: Date.now() });
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadBranches = async () => {
      try {
        const data = await apiGet("/hotels");
        if (!isMounted) return;

        const hotelBranches = Array.isArray(data?.hotels)
          ? data.hotels
              .filter((hotel) => hotel?.status !== "Inactive")
              .map(normalizeBranch)
          : [];

        setBranches(hotelBranches);
      } catch (error) {
        if (isMounted) {
          setBranches([]);
          showToast(
            error.message || "Unable to load branch data right now.",
            "error"
          );
        }
      }
    };

    loadBranches();
    return () => {
      isMounted = false;
    };
  }, [showToast]);

  // ── Validation ──
  function validate() {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required.";
    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address.";
    }
    if (!form.message.trim()) newErrors.message = "Message cannot be empty.";
    return newErrors;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "message" && value.length > MAX_MESSAGE_LENGTH) return;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!isAuthenticated) {
      showToast("Please log in first to send a message.", "error");
      return;
    }

    const v = validate();
    if (Object.keys(v).length > 0) {
      setErrors(v);
      showToast("Please fix the highlighted fields.", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      await apiPost("/contact-messages", form);
      showToast(
        "Your message has been sent! We'll get back to you within 24 hours."
      );
      setForm({
        name: "",
        email: "",
        phone: "",
        branch: "",
        inquiryType: "",
        message: "",
      });
      setErrors({});
    } catch (error) {
      showToast(error.message || "Could not send your message right now.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Section quick-nav ──
  const sections = [
    { key: "faq", label: "FAQ", icon: <Sparkles size={15} />, ref: faqRef },
    {
      key: "contact",
      label: "Contact Us",
      icon: <Send size={15} />,
      ref: contactRef,
    },
    {
      key: "branches",
      label: "Our Branches",
      icon: <MapPin size={15} />,
      ref: branchesRef,
    },
  ];

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ── Helper: input class ──
  function inputClass(field) {
    return `w-full rounded-2xl border ${
      errors[field]
        ? "border-red-400 ring-1 ring-red-300/60"
        : "border-[#dfe8f2] dark:border-white/10"
    } bg-white/80 px-4 py-3.5 text-[15px] text-[#1d3252] placeholder-[#8fa3bd] outline-none transition-colors duration-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/30 dark:bg-white/[0.04] dark:text-white dark:placeholder-white/35`;
  }

  const selectClass = (field) =>
    `${inputClass(field)} appearance-none pr-11 dark:[color-scheme:dark]`;

  const cardShell =
    "rounded-[28px] border border-[#e9eff6] bg-white shadow-[0_10px_30px_rgba(20,40,70,0.06)] dark:border-white/10 dark:bg-[#0f1f33] dark:shadow-none";

  return (
    <div className="min-h-screen bg-[#f6f9fc] pt-28 dark:bg-[#0a1420]">
      <Navbar />

      <AnimatePresence>
        {toast && (
          <Toast
            key={toast.key}
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* ── Hero ── */}
        <motion.div
          variants={staggerGrid}
          initial="hidden"
          animate="show"
          className="mb-12 text-center"
        >
          <motion.div
            variants={riseIn}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-gold-600 dark:text-gold-300"
          >
            <Headphones size={14} />
            Support &amp; Assistance
          </motion.div>
          <motion.h1
            variants={riseIn}
            className="mb-4 font-serif text-5xl font-semibold text-[#1d3252] dark:text-white sm:text-6xl"
          >
            Help Center
          </motion.h1>
          <motion.p
            variants={riseIn}
            className="mx-auto max-w-xl text-lg leading-8 text-slate-500 dark:text-white/60"
          >
            Have a question or need assistance? Our dedicated team is ready to
            help you around the clock.
          </motion.p>
        </motion.div>

        {/* ── Quick-info cards ── */}
        <motion.div
          variants={staggerGrid}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {[
            {
              icon: <Phone size={20} />,
              title: "Call Us",
              detail: "+20 3 480 1234",
              sub: "Toll-free · 24 / 7",
            },
            {
              icon: <Mail size={20} />,
              title: "Email",
              detail: "support@bluewavehotel.com",
              sub: "Response within 24 h",
            },
            {
              icon: <Clock size={20} />,
              title: "Working Hours",
              detail: "Mon – Sun",
              sub: "Front desk open 24 / 7",
            },
          ].map((card) => (
            <motion.div
              key={card.title}
              variants={riseIn}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className={`${cardShell} flex items-start gap-4 p-5`}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1d3252] text-gold-300 dark:bg-gold-400/15">
                {card.icon}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#6a83a6] dark:text-gold-300/80">
                  {card.title}
                </p>
                <p className="mt-1 truncate font-semibold text-[#1d3252] dark:text-white">
                  {card.detail}
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-white/50">
                  {card.sub}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Section quick-nav ── */}
        <div className="mb-12 flex justify-center gap-2">
          {sections.map((section) => (
            <motion.button
              key={section.key}
              onClick={() => scrollToSection(section.ref)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 420, damping: 22 }}
              className="flex items-center gap-2 rounded-full border border-[#dfe8f2] bg-white px-5 py-2.5 text-sm font-semibold text-[#1d3252] shadow-sm transition-colors hover:border-gold-400/50 hover:text-gold-600 dark:border-white/10 dark:bg-[#0f1f33] dark:text-white dark:hover:text-gold-300"
            >
              <span className="text-gold-500">{section.icon}</span>
              {section.label}
            </motion.button>
          ))}
        </div>

        {/* ══════════════════════════ FAQ ══════════════════════════ */}
        <section ref={faqRef} className="scroll-mt-32">
          <SectionHeading eyebrow="Quick Answers" title="Frequently Asked Questions" />
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: EASE }}
            className={`${cardShell} mt-8 p-6 sm:p-8`}
          >
            <FAQAccordion />
          </motion.div>
        </section>

        {/* ══════════════════════════ CONTACT ══════════════════════════ */}
        <section ref={contactRef} className="mt-20 scroll-mt-32">
          <SectionHeading eyebrow="Get In Touch" title="Send Us a Message" />

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-5">
            {/* Form — 3 cols */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease: EASE }}
              className={`${cardShell} p-6 sm:p-8 lg:col-span-3`}
            >
              <p className="mb-6 text-sm text-slate-500 dark:text-white/55">
                Fill out the form and we'll respond within 24 hours.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* Name + Email */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <FieldLabel
                      icon={<User size={13} className="mr-1 inline -mt-0.5" />}
                    >
                      Full Name
                    </FieldLabel>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. Ali Mohammed"
                      className={inputClass("name")}
                    />
                    <FieldError error={errors.name} />
                  </div>
                  <div>
                    <FieldLabel
                      icon={
                        <AtSign size={13} className="mr-1 inline -mt-0.5" />
                      }
                    >
                      Email Address
                    </FieldLabel>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="ali@example.com"
                      className={inputClass("email")}
                    />
                    <FieldError error={errors.email} />
                  </div>
                </div>

                {/* Phone + Branch */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <FieldLabel
                      icon={<Phone size={13} className="mr-1 inline -mt-0.5" />}
                      optional
                    >
                      Phone
                    </FieldLabel>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+20 1XX XXX XXXX"
                      className={inputClass("phone")}
                    />
                  </div>
                  <div>
                    <FieldLabel
                      icon={
                        <MapPin size={13} className="mr-1 inline -mt-0.5" />
                      }
                      optional
                    >
                      Branch
                    </FieldLabel>
                    <div className="relative">
                      <select
                        name="branch"
                        value={form.branch}
                        onChange={handleChange}
                        className={selectClass("branch")}
                      >
                        <option value="">Select a branch…</option>
                        {branches.map((b) => (
                          <option key={b.name} value={b.name}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gold-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Inquiry type */}
                <div>
                  <FieldLabel
                    icon={
                      <FileText size={13} className="mr-1 inline -mt-0.5" />
                    }
                    optional
                  >
                    Inquiry Type
                  </FieldLabel>
                  <div className="relative">
                    <select
                      name="inquiryType"
                      value={form.inquiryType}
                      onChange={handleChange}
                      className={selectClass("inquiryType")}
                    >
                      <option value="">Select a topic…</option>
                      {INQUIRY_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gold-500"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <FieldLabel>Your Message</FieldLabel>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Describe how we can help you…"
                    className={`${inputClass("message")} resize-none`}
                  />
                  <div className="mt-1 flex justify-between">
                    {errors.message ? (
                      <FieldError error={errors.message} />
                    ) : (
                      <span />
                    )}
                    <p
                      className={`text-xs ${
                        form.message.length > MAX_MESSAGE_LENGTH * 0.9
                          ? "text-red-500"
                          : "text-slate-400 dark:text-white/40"
                      }`}
                    >
                      {form.message.length}/{MAX_MESSAGE_LENGTH}
                    </p>
                  </div>
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ y: isSubmitting ? 0 : -2 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.97 }}
                  transition={{ type: "spring", stiffness: 420, damping: 22 }}
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-br from-[#28415f] to-[#182c46] py-4 font-semibold tracking-wide text-white shadow-[0_14px_30px_rgba(24,44,70,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gold-300/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
                  {isSubmitting ? (
                    <>
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send size={18} className="text-gold-300" />
                      Send Message
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>

            {/* Sidebar — 2 cols */}
            <motion.div
              variants={staggerGrid}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              className="space-y-6 lg:col-span-2"
            >
              {/* WhatsApp card (replaces the dead Live Chat button) */}
              <motion.div variants={riseIn} className={`${cardShell} p-6`}>
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1d3252] text-gold-300 dark:bg-gold-400/15">
                    <MessageSquare size={19} />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-[#1d3252] dark:text-white">
                      WhatsApp Us
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-white/50">
                      Fastest way to reach us
                    </p>
                  </div>
                </div>
                <p className="mb-4 text-sm leading-relaxed text-slate-600 dark:text-white/65">
                  Message our guest relations team directly on WhatsApp for
                  quick questions about your stay or booking.
                </p>
                <motion.a
                  href="https://wa.me/201005550123"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 420, damping: 22 }}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gold-400/40 bg-gold-400/10 py-3 text-sm font-semibold text-gold-600 transition-colors hover:bg-gold-400/20 dark:text-gold-300"
                >
                  <MessageSquare size={16} />
                  Open WhatsApp
                </motion.a>
              </motion.div>

              {/* Emergency */}
              <motion.div variants={riseIn} className={`${cardShell} p-6`}>
                <h3 className="mb-2 flex items-center gap-2 font-serif text-xl font-semibold text-[#1d3252] dark:text-white">
                  <Phone size={17} className="text-red-500" />
                  Urgent Assistance
                </h3>
                <p className="mb-3 text-sm leading-relaxed text-slate-600 dark:text-white/65">
                  For emergencies during your stay — safety, medical, or urgent
                  booking issues — call our 24/7 priority line.
                </p>
                <p className="font-serif text-2xl font-semibold text-gold-600 dark:text-gold-300">
                  +20 122 999 0000
                </p>
              </motion.div>

              {/* Social / global */}
              <motion.div variants={riseIn} className={`${cardShell} p-6`}>
                <h3 className="mb-3 flex items-center gap-2 font-serif text-xl font-semibold text-[#1d3252] dark:text-white">
                  <Globe size={17} className="text-gold-500" />
                  Connect With Us
                </h3>
                <div className="space-y-2.5">
                  {[
                    { label: "Twitter / X", handle: "@BlueWaveHotels" },
                    { label: "Instagram", handle: "@bluewavehotel" },
                    { label: "WhatsApp", handle: "+20 100 555 0123" },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="font-medium text-slate-600 dark:text-white/65">
                        {s.label}
                      </span>
                      <span className="font-semibold text-gold-600 dark:text-gold-300">
                        {s.handle}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ══════════════════════════ BRANCHES ══════════════════════════ */}
        <section ref={branchesRef} className="mt-20 scroll-mt-32">
          <SectionHeading eyebrow="Find Us" title="Our Branches" />
          <motion.div
            variants={staggerGrid}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {branches.map((branch) => (
              <motion.div
                key={branch.name}
                variants={riseIn}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className={`${cardShell} p-6`}
              >
                <h3 className="mb-3 font-serif text-2xl font-semibold text-[#1d3252] dark:text-white">
                  {branch.name}
                </h3>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin
                      size={15}
                      className="mt-0.5 shrink-0 text-gold-500"
                    />
                    <span className="text-slate-600 dark:text-white/65">
                      {branch.address}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={15} className="shrink-0 text-gold-500" />
                    <span className="text-slate-600 dark:text-white/65">
                      {branch.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail size={15} className="shrink-0 text-gold-500" />
                    <span className="text-slate-600 dark:text-white/65">
                      {branch.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock size={15} className="shrink-0 text-gold-500" />
                    <span className="text-slate-600 dark:text-white/65">
                      {branch.hours}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── Footer note ── */}
        <p className="mt-16 text-center text-xs text-slate-400 dark:text-white/35">
          Blue Wave Support — Committed to exceptional guest service across our
          branches.
        </p>
      </div>
      <Footer />
    </div>
  );
}
