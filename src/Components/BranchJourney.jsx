import { useEffect, useRef, useState } from "react";
import { motion as Motion } from "framer-motion";
import { ChevronDown, MapPin } from "lucide-react";
import marsaAlamImg from "../assets/Images/bad203b0404175e6adf69b44a0755f06.jpg";
import cairoImg from "../assets/Images/Cairo_Branch.png";
import sharmImg from "../assets/Images/Background 5.jpg";
import sokhnaImg from "../assets/Images/95765a89224d307e4310bf5e7ead0a90.jpg";

// Cinematic scroll journey shown once, between the loading screen and the
// homepage hero. The overlay owns its own scroll area (the page behind stays
// locked); scrolling crossfades through the four branches, and reaching the
// end calls `onComplete` so the existing hero-reveal flow takes over.

const BRANCHES = [
  {
    name: "Marsa Alam",
    region: "Red Sea Riviera",
    tagline: "Where the desert meets a living reef.",
    image: marsaAlamImg,
  },
  {
    name: "Cairo",
    region: "Giza Plateau · Greater Cairo",
    tagline: "Golden evenings in the heart of the capital.",
    image: cairoImg,
  },
  {
    name: "Sharm El Sheikh",
    region: "Sinai Peninsula",
    tagline: "Turquoise bays and endless summer.",
    image: sharmImg,
  },
  {
    name: "Ain El Sokhna Branch",
    region: "Gulf of Suez",
    tagline: "The capital's own stretch of sea.",
    image: sokhnaImg,
  },
];

const N = BRANCHES.length;
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
// Map value v from [a, b] to [0, 1], clamped.
const range = (v, a, b) => clamp((v - a) / (b - a), 0, 1);

export default function BranchJourney({ onComplete }) {
  const scrollerRef = useRef(null);
  const doneRef = useRef(false);
  const [progress, setProgress] = useState(0);

  const complete = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onComplete();
  };

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    const p = max > 0 ? el.scrollTop / max : 1;
    setProgress(p);
    if (p >= 0.985) complete();
  };

  // Focus the scroller so arrow keys / PageDown scroll it immediately.
  useEffect(() => {
    scrollerRef.current?.focus();
  }, []);

  // Panel progress: pp runs 0 → N across the whole journey; panel i owns
  // pp ∈ [i, i+1) with short crossfade windows on either side.
  const pp = progress * N;

  return (
    <Motion.div
      className="fixed inset-0 z-[95] bg-[#05090f]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: "easeInOut" }}
    >
      <div
        ref={scrollerRef}
        tabIndex={0}
        onScroll={handleScroll}
        className="h-full w-full overflow-y-scroll outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {/* Scroll runway: one viewport per branch plus a short tail so the
            last panel gets a beat of stillness before the handoff. */}
        <div style={{ height: `${N * 100 + 35}vh` }}>
          <div className="sticky top-0 h-screen w-full overflow-hidden">
            {BRANCHES.map((branch, i) => {
              const u = pp - i; // local progress for this panel
              const fadeIn = i === 0 ? 1 : range(u, -0.14, 0.06);
              const fadeOut = i === N - 1 ? 1 : 1 - range(u, 0.9, 1.1);
              const opacity = fadeIn * fadeOut;
              if (opacity <= 0.001) return null;

              const zoom = 1.18 - 0.12 * clamp(u, 0, 1); // slow Ken Burns out
              const drift = (clamp(u, -0.5, 1.5) - 0.5) * -4; // parallax %
              const textIn = range(u, 0.02, 0.3);
              const textOut = i === N - 1 ? 1 : 1 - range(u, 0.82, 1.02);
              const textOpacity = (i === 0 ? 1 : textIn) * textOut;
              const textRise = (1 - (i === 0 ? 1 : textIn)) * 48;

              return (
                <div
                  key={branch.name}
                  className="absolute inset-0"
                  style={{ opacity, zIndex: i }}
                >
                  <img
                    src={branch.image}
                    alt={branch.name}
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{
                      transform: `scale(${zoom}) translateY(${drift}%)`,
                    }}
                  />
                  {/* Cinematic scrims */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#05090f]/70 via-transparent to-[#05090f]/85" />
                  <div className="absolute inset-0 bg-[#0a1420]/25" />

                  {/* Ghost index number */}
                  <span
                    aria-hidden="true"
                    className="absolute right-4 top-1/2 -translate-y-1/2 select-none font-serif text-[38vh] font-bold leading-none text-white/[0.05] md:right-16"
                    style={{ opacity: textOpacity }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {/* Branch copy */}
                  <div
                    className="absolute inset-x-0 bottom-0 px-6 pb-28 sm:px-10 md:pb-32 lg:px-20"
                    style={{
                      opacity: textOpacity,
                      transform: `translateY(${textRise}px)`,
                    }}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.5em] text-[#9fc0ec] md:text-xs">
                      {String(i + 1).padStart(2, "0")} — Blue Waves Destinations
                    </p>
                    <h2 className="mt-4 max-w-4xl font-serif text-5xl font-bold leading-[1.02] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.6)] sm:text-7xl lg:text-[92px]">
                      {branch.name}
                    </h2>
                    <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-[#9fc0ec] md:text-base">
                        <MapPin size={16} />
                        {branch.region}
                      </span>
                      <span className="hidden h-px w-14 bg-white/30 sm:block" />
                      <span className="text-sm font-light italic text-white/80 md:text-lg">
                        {branch.tagline}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Final dim so the overlay's exit fade lands on the dark hero
                without a visible jump. */}
            <div
              className="pointer-events-none absolute inset-0 z-10 bg-[#05090f]"
              style={{ opacity: range(progress, 0.94, 1) * 0.85 }}
            />

            {/* ------ Fixed chrome over the panels ------ */}

            {/* Progress rail */}
            <div className="absolute left-5 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-0 md:left-10">
              <div className="relative h-44 w-px bg-white/20">
                <div
                  className="absolute left-0 top-0 w-px bg-[#9fc0ec]"
                  style={{ height: `${progress * 100}%` }}
                />
              </div>
              <div className="mt-4 flex flex-col items-center gap-3">
                {BRANCHES.map((b, i) => (
                  <span
                    key={b.name}
                    className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                      pp >= i - 0.1 ? "bg-[#9fc0ec]" : "bg-white/25"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Counter */}
            <div className="absolute bottom-8 right-6 z-20 text-xs font-medium tracking-[0.3em] text-white/60 md:right-10">
              <span className="text-white">
                {String(Math.min(N, Math.floor(pp) + 1)).padStart(2, "0")}
              </span>
              {" / "}
              {String(N).padStart(2, "0")}
            </div>

            {/* Skip */}
            <button
              onClick={complete}
              className="absolute right-6 top-6 z-20 rounded-full border border-white/25 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/80 backdrop-blur-sm transition-all duration-300 hover:border-white/60 hover:bg-white/10 hover:text-white md:right-10 md:top-8"
            >
              Skip
            </button>

            {/* Scroll hint — fades once the guest starts moving */}
            <div
              className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1 text-white/70"
              style={{ opacity: 1 - range(progress, 0.01, 0.06) }}
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.45em]">
                Scroll to explore
              </span>
              <ChevronDown size={18} className="animate-bounce" />
            </div>
          </div>
        </div>
      </div>
    </Motion.div>
  );
}
