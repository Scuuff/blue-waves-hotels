import { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import logoWhite from "../assets/Images/white_logo.png";
import cairoBg from "../assets/Images/Cairo_Pyramids.jpg";

// Full-screen cinematic loader: blurred/darkened hero still, centred logo,
// and an elegant progress count (0 → 100%). Calls `onComplete` once the count
// settles; the parent unmounts it inside <AnimatePresence> so it fades out.
export default function IntroLoader({ onComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const DURATION = 2400; // ms to reach 100%
    const start = Date.now();
    let done = false;
    let holdTimer;

    // Timer-based (not requestAnimationFrame) so progress keeps advancing even
    // if the tab is backgrounded — rAF pauses there, setInterval does not.
    const finish = () => {
      if (done) return;
      done = true;
      clearInterval(interval);
      setProgress(100);
      holdTimer = setTimeout(onComplete, 550); // brief hold at 100%
    };

    const interval = setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / DURATION);
      // ease-out so it decelerates toward 100% — feels weighty, not linear
      setProgress(Math.round((1 - Math.pow(1 - t, 2)) * 100));
      if (t >= 1) finish();
    }, 30);

    // Hard safety net: never let the loader hang past the expected duration.
    const safety = setTimeout(finish, DURATION + 400);

    return () => {
      clearInterval(interval);
      clearTimeout(safety);
      clearTimeout(holdTimer);
    };
  }, [onComplete]);

  return (
    <Motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
    >
      {/* Blurred + darkened hero still */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${cairoBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(10px) brightness(0.35)",
          transform: "scale(1.12)",
        }}
      />
      <div className="absolute inset-0 bg-[#0a1420]/75" />

      {/* Content */}
      <Motion.img
        src={logoWhite}
        alt="Blue Waves Hotel"
        className="relative h-20 w-auto object-contain md:h-24"
        initial={{ opacity: 0, y: 12, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
      />

      <Motion.div
        className="relative mt-12 w-60 md:w-72"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.4 }}
      >
        <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg,#cfe0f5,#9fc0ec,#6f9fe0)",
              transition: "width 120ms linear",
            }}
          />
        </div>
        <div className="mt-4 flex items-center justify-between text-[11px] font-medium tracking-[0.35em] text-white/60">
          <span>LOADING</span>
          <span className="tabular-nums text-white/80">{progress}%</span>
        </div>
      </Motion.div>
    </Motion.div>
  );
}
