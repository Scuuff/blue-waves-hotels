import { useState, useEffect, useMemo, useRef } from "react";
import { validPromoCodes } from "../data/offersData";
import { useOffers } from "../Context/OffersContext";
import { isOfferLive } from "../utils/offerStatus";
import OfferCard from "../Components/OfferCard";
import PromoSection from "../Components/PromoSection";
import Footer from "../Components/Footer";
import Navbar from "../Components/Navbar";

const categories = ["All", "Bundle", "Discount", "Package", "Seasonal"];

const SkeletonCard = () => (
  <div className="animate-pulse overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(47,65,86,0.08)] dark:bg-[#0f1f33]">
    <div className="h-44 bg-[#e5e7eb] dark:bg-white/10" />
    <div className="p-4 space-y-3">
      <div className="h-5 w-3/4 rounded bg-[#e5e7eb] dark:bg-white/10" />
      <div className="h-3 w-full rounded bg-[#e5e7eb] dark:bg-white/10" />
      <div className="h-3 w-5/6 rounded bg-[#e5e7eb] dark:bg-white/10" />
      <div className="mt-2 h-8 rounded-xl bg-[#67e8f9]/50 dark:bg-[#9fc0ec]/25" />
      <div className="mt-4 flex justify-between">
        <div className="h-8 w-20 rounded bg-[#e5e7eb] dark:bg-white/10" />
        <div className="h-8 w-24 rounded-full bg-[#67e8f9]/50 dark:bg-[#9fc0ec]/25" />
      </div>
    </div>
  </div>
);

const NumberTicker = ({ target, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !hasStarted) setHasStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [hasStarted, target, duration]);

  return <span ref={ref} className="tabular-nums">{count.toLocaleString()}</span>;
};

const OffersPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [appliedPromo, setAppliedPromo] = useState(null);

  const { mappedOffers, loading } = useOffers();

  const visibleOffers = useMemo(() => {
    // Live = switched on AND not past its expiry date (see utils/offerStatus).
    const activeOffers = mappedOffers.filter((offer) => isOfferLive(offer));
    return selectedCategory === "All"
      ? activeOffers
      : activeOffers.filter((o) => o.category === selectedCategory);
  }, [selectedCategory, mappedOffers]);

  const handlePromoApplied = (code) => {
    if (code && validPromoCodes[code]) {
      setAppliedPromo({ code, ...validPromoCodes[code] });
    } else {
      setAppliedPromo(null);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a1420]">
       <Navbar />
      <div className="relative pt-32 pb-12 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#C8D9E6] px-4 py-1.5 text-xs font-bold text-[#2F4156] dark:bg-[#9fc0ec]/15 dark:text-[#9fc0ec]">
            Discover Exclusive Weekly Deals ✨
          </div>

         <h1 className="mb-4 font-serif text-5xl font-semibold leading-tight text-[#96d0f2] md:text-6xl">
            Unbeatable<br />
            <span className="text-[#26567e] dark:text-[#cfe0f5]">Offers & Deals</span>
             </h1>

          <p className="mx-auto mb-8 max-w-xl text-lg text-[#6b7280] dark:text-white/60">
            Discover handpicked packages, seasonal escapes, and exclusive bundles — crafted for unforgettable stays.
          </p>

          {/* Stats in sky blue boxes */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="rounded-2xl bg-[#96d0f2] px-8 py-3 text-center dark:bg-[#15273f] dark:ring-1 dark:ring-[#9fc0ec]/20">
              <div className="font-serif text-3xl font-semibold text-[#2F4156] dark:text-white">
                + <NumberTicker target={100} duration={2000} />
              </div>
              <div className="mt-0.5 text-xs text-[#567C8D] dark:text-[#9fc0ec]">Offers Online</div>
            </div>
            <div className="rounded-2xl bg-[#96d0f2] px-8 py-3 text-center dark:bg-[#15273f] dark:ring-1 dark:ring-[#9fc0ec]/20">
              <div className="font-serif text-3xl font-semibold text-[#2F4156] dark:text-white">Up to 35%</div>
              <div className="mt-0.5 text-xs text-[#567C8D] dark:text-[#9fc0ec]">Savings</div>
            </div>
            <div className="rounded-2xl bg-[#96d0f2] px-8 py-3 text-center dark:bg-[#15273f] dark:ring-1 dark:ring-[#9fc0ec]/20">
              <div className="font-serif text-3xl font-semibold text-[#2F4156] dark:text-white">4 Active</div>
              <div className="mt-0.5 text-xs text-[#567C8D] dark:text-[#9fc0ec]">Codes</div>
            </div>
          </div>

        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 pb-20 pt-6">

        <PromoSection onPromoApplied={handlePromoApplied} />

        {/* FILTER */}
        <div className="flex items-center gap-2 flex-wrap mb-8">
          <span className="mr-1 text-sm font-semibold text-[#6b7280] dark:text-white/60">Filter</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                selectedCategory === cat
                  ? "scale-105 bg-[#26567e] text-[#f5f9fc] dark:bg-[#9fc0ec] dark:text-[#0c1828]"
                  : "bg-[#f5f9fc] text-[#26567e] dark:bg-white/5 dark:text-[#9fc0ec]"
              }`}
            >
              {cat}
            </button>
          ))}
          <span className="ml-auto text-sm text-[#6b7280] dark:text-white/60">
            {visibleOffers.length} offer{visibleOffers.length !== 1 ? "s" : ""} found
          </span>
        </div>

        {appliedPromo && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-[#22d3ee] bg-[#67e8f9] px-4 py-3 text-sm dark:border-[#9fc0ec]/30 dark:bg-[#9fc0ec]/15">
            <span className="font-bold text-[#1a1a2e] dark:text-[#cfe0f5]">🎉 Promo Active:</span>
            <span className="text-[#1a1a2e] dark:text-white/80">{appliedPromo.label} applied to all offers below!</span>
          </div>
        )}

        {/* OFFERS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : visibleOffers.length > 0 ? (
            visibleOffers.map((offer, i) => (
              <div
                key={offer.id}
                style={{
                  opacity: 0,
                  animation: `fadeSlideUp 0.5s ease forwards`,
                  animationDelay: `${i * 0.08}s`,
                  height: "100%",
                }}
              >
                <OfferCard offer={offer} appliedPromo={appliedPromo} steamHover />
              </div>
            ))
          ) : (
            <div className="col-span-3 py-20 text-center text-[#6b7280] dark:text-white/60">
              <div className="text-5xl mb-4">🏷️</div>
              <p className="text-lg font-semibold">No offers in this category yet.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
       <Footer />
    </div>
    
  );
};

export default OffersPage;
