import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

const FAQ_DATA = [
  {
    category: "Booking",
    items: [
      {
        question: "How do I book a hotel room?",
        answer:
          "Browse our destinations, pick your dates and preferred room type, then complete the secure checkout. You'll receive an instant confirmation email with your booking details and a unique reservation code.",
      },
      {
        question: "Can I book for someone else?",
        answer:
          "Absolutely. During checkout, simply enter the guest's name in the 'Guest Details' section. The confirmation will be sent to your email, and the guest can check in with a valid ID matching the name on the reservation.",
      },
      {
        question: "Is there a minimum stay requirement?",
        answer:
          "Most of our properties have a one-night minimum. During peak seasons or holidays some branches may require a two-night minimum — this will be clearly noted on the room selection page.",
      },
    ],
  },
  {
    category: "Cancellations & Refunds",
    items: [
      {
        question: "What is your cancellation policy?",
        answer:
          "Free cancellation is available on most bookings up to 48 hours before check-in. Late cancellations (within 48 hours) may incur a one-night charge. Non-refundable rates, if selected, are clearly marked at the time of booking.",
      },
      {
        question: "How long do refunds take to process?",
        answer:
          "Once a cancellation is confirmed, refunds are initiated within 24 hours. Depending on your payment provider, the funds typically appear in your account within 5–10 business days.",
      },
    ],
  },
  {
    category: "Your Stay",
    items: [
      {
        question: "What time is check-in and check-out?",
        answer:
          "Standard check-in is from 3:00 PM and check-out is by 11:00 AM. Early check-in and late check-out can be requested — availability varies by branch and occupancy.",
      },
      {
        question: "Do you offer airport transfers?",
        answer:
          "Yes, all five Blue Wave branches offer private airport transfer services. You can add a transfer during booking or contact the concierge at least 24 hours before arrival to arrange one.",
      },
      {
        question: "Are pets allowed at Blue Wave?",
        answer:
          "Our Ain El Sokhna and Marsa Alam branches are pet-friendly for dogs under 25 kg. A small nightly surcharge applies. Other branches do not currently allow pets.",
      },
    ],
  },
  {
    category: "Account & Loyalty",
    items: [
      {
        question: "How do I join the loyalty programme?",
        answer:
          "Simply create a free Blue Wave account and you're automatically enrolled. Every eligible booking earns points that can be redeemed for room upgrades, spa credits, and complimentary nights.",
      },
      {
        question: "I forgot my password — what should I do?",
        answer:
          "Click 'Sign In' then 'Forgot Password'. Enter your registered email and we'll send a secure reset link within minutes. If you don't see it, check your spam folder or contact support.",
      },
    ],
  },
];

export default function FAQAccordion() {
  const [activeIndex, setActiveIndex] = useState(null);
  const [activeCategory, setActiveCategory] = useState(FAQ_DATA[0].category);
  const [searchQuery, setSearchQuery] = useState("");

  const toggle = useCallback(
    (idx) => setActiveIndex((prev) => (prev === idx ? null : idx)),
    []
  );

  // Flatten & filter by search
  const visibleItems = searchQuery.trim()
    ? FAQ_DATA.flatMap((cat) =>
        cat.items.filter(
          (item) =>
            item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : FAQ_DATA.find((c) => c.category === activeCategory)?.items || [];

  return (
    <div>
      {/* Search */}
      <div className="relative mb-5">
        <HelpCircle
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-500"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search frequently asked questions…"
          className="w-full rounded-2xl border border-[#dfe8f2] bg-white/80 py-3 pl-11 pr-4 text-sm text-[#1d3252] placeholder-[#8fa3bd] outline-none transition-colors duration-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/30 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder-white/35"
        />
      </div>

      {/* Category pills — hidden while searching */}
      {!searchQuery.trim() && (
        <div className="mb-5 flex flex-wrap gap-2">
          {FAQ_DATA.map((cat) => (
            <button
              key={cat.category}
              onClick={() => {
                setActiveCategory(cat.category);
                setActiveIndex(null);
              }}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors duration-200 ${
                activeCategory === cat.category
                  ? "bg-[#1d3252] text-gold-300 dark:bg-gold-400/15"
                  : "border border-[#dfe8f2] bg-white text-[#33507a] hover:border-gold-400/50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70"
              }`}
            >
              {cat.category}
            </button>
          ))}
        </div>
      )}

      {/* Accordion items */}
      <div className="space-y-3">
        {visibleItems.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-500 dark:text-white/50">
            No results found. Try a different search term.
          </p>
        )}

        {visibleItems.map((faq, index) => {
          const isOpen = activeIndex === index;
          return (
            <div
              key={index}
              className={`overflow-hidden rounded-2xl border bg-white transition-colors duration-300 dark:bg-white/[0.03] ${
                isOpen
                  ? "border-gold-400/60 shadow-[0_10px_30px_rgba(20,40,70,0.08)] dark:shadow-none"
                  : "border-[#e3ebf4] hover:border-gold-400/40 dark:border-white/10"
              }`}
            >
              <button
                onClick={() => toggle(index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                aria-expanded={isOpen}
              >
                <span className="text-[15px] font-medium text-[#1d3252] dark:text-white">
                  {faq.question}
                </span>
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="shrink-0 text-gold-500"
                >
                  <ChevronDown size={18} />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-[#eef3f9] px-5 pb-4 pt-0 text-[15px] leading-relaxed text-[#33507a] dark:border-white/10 dark:text-white/70">
                      <p className="pt-3">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
