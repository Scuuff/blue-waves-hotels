import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Navbar from "../Components/Navbar";
import HomeMainSection from "../Components/HomeMainSection";
import WhyChooseUsSection from "../Components/WhyChooseUsSection";
import FeaturedBranchesSection from "../Components/FeaturedBranchesMain";
import SpecialOffersPreview from "../Components/SpecialOffersSection";
import RoomTypesPreview from "../Components/RoomTypesPreview";
import ReviewsPreview from "../Components/ReviewsPreview";
import CallToActionSection from "../Components/CallToActionSection";
import Footer from "../Components/Footer";
import IntroLoader from "../Components/IntroLoader";
import BranchJourney from "../Components/BranchJourney";
import { IntroContext } from "../Context/IntroContext";
import ResortBg from "../assets/Images/Background4.jpg";

// Plays the cinematic intro only once per browser session.
const INTRO_SESSION_KEY = "bw_intro_played_v1";

export default function HomePage() {
  const [stage, setStage] = useState(() =>
    typeof window !== "undefined" && sessionStorage.getItem(INTRO_SESSION_KEY)
      ? "done"
      : "loading"
  );

  // Loader (100%) → cinematic branch journey → the existing hero reveal.
  const handleLoaderComplete = useCallback(() => setStage("journey"), []);
  const handleJourneyComplete = useCallback(() => setStage("heroReveal"), []);

  // Advance through the cinematic stages.
  useEffect(() => {
    if (stage === "heroReveal") {
      // Hero-only hold before the UI animates in.
      const t = setTimeout(() => setStage("ui"), 700);
      return () => clearTimeout(t);
    }
    if (stage === "ui") {
      // After the staggered entrance finishes, mark the intro complete.
      const t = setTimeout(() => {
        setStage("done");
        try {
          sessionStorage.setItem(INTRO_SESSION_KEY, "1");
        } catch {
          /* sessionStorage may be unavailable (private mode) — intro just replays */
        }
      }, 3800);
      return () => clearTimeout(t);
    }
  }, [stage]);

  // Lock scrolling while the loader / journey / hero-only hold is on screen.
  // (The journey overlay scrolls internally; the page behind it must not.)
  useEffect(() => {
    const lock =
      stage === "loading" || stage === "journey" || stage === "heroReveal";
    document.body.style.overflow = lock ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [stage]);

  return (
    <IntroContext.Provider value={{ stage }}>
      <div>
        <AnimatePresence>
          {stage === "loading" && <IntroLoader onComplete={handleLoaderComplete} />}
        </AnimatePresence>

        <AnimatePresence>
          {stage === "journey" && (
            <BranchJourney onComplete={handleJourneyComplete} />
          )}
        </AnimatePresence>

        <Navbar />
        <HomeMainSection />
        <div
          className="relative bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${ResortBg})` }}
        >
          {/* Frosted scrim: airy sea-glass in light mode, deep navy in dark. */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#f2f7fc]/[0.93] to-[#e7f0f9]/[0.95] dark:from-[#08101a]/90 dark:to-[#0b1622]/[0.92]" />
          <div className="relative">
            <WhyChooseUsSection />
            <FeaturedBranchesSection />
          </div>
        </div>
        <SpecialOffersPreview />
        <RoomTypesPreview />
        <ReviewsPreview />
        <CallToActionSection />
        <Footer />
      </div>
    </IntroContext.Provider>
  );
}
