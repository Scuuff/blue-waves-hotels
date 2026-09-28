import { Link, useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion as Motion } from "framer-motion";
import MainBackground from "../assets/Images/hero_video.mp4";
import hotels from "../data/hotels";
import { useIntro } from "../Context/IntroContext";

const INTRO_EASE = [0.22, 1, 0.36, 1];

export default function HomeMainSection() {
  const navigate = useNavigate();

  // Cinematic intro entrance (homepage, once per session). `stage` is "done"
  // when the intro is over or was already played — elements then render
  // normally with no animation.
  const { stage } = useIntro();
  const playIntro = stage !== "done";
  const revealUI = stage === "ui";
  const intro = (initial, delay = 0) =>
    playIntro
      ? {
          initial,
          animate: revealUI ? { opacity: 1, x: 0, y: 0 } : initial,
          transition: { duration: 1.05, ease: INTRO_EASE, delay },
        }
      : {};

  // Subtle Ken Burns zoom on the hero background during the intro. Once it
  // zooms in it stays there (we never reset it), so there is no reverse pan.
  const [kenBurns, setKenBurns] = useState(1);
  useEffect(() => {
    if (stage === "heroReveal") setKenBurns(1.06);
  }, [stage]);

  const [branch, setBranch] = useState("Cairo Branch");
  const [roomType, setRoomType] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("1");
  const [loading, setLoading] = useState(false);
  const roomTypes = [...new Set(hotels.map((room) => room.type))].sort();

  // Two stacked videos that crossfade so the loop never freezes/pauses.
  // While one plays, the other is already buffered and ready at frame 0,
  // so there is no seek-and-redecode stall at the loop boundary.
  const videoA = useRef(null);
  const videoB = useRef(null);

  useEffect(() => {
    const a = videoA.current;
    const b = videoB.current;
    if (!a || !b) return;

    const FADE = 0.6; // seconds before the end to start crossfading
    let current = a;
    let next = b;

    next.pause();

    const handleTime = (e) => {
      const vid = e.target;
      if (vid !== current || !vid.duration) return;

      if (vid.currentTime >= vid.duration - FADE) {
        // The incoming clip fades IN on top (higher z-index) while the
        // outgoing clip stays FULLY OPAQUE underneath. There is always one
        // solid layer covering the background, so no white can ever show.
        next.currentTime = 0;
        next.style.zIndex = "2";
        current.style.zIndex = "1";
        next.play().catch(() => {});
        next.style.opacity = "1";

        const finished = current;
        const incoming = next;
        // Once the incoming clip is fully opaque on top, hide & reset the
        // outgoing one behind it (instant, since it's no longer visible).
        window.setTimeout(() => {
          finished.style.opacity = "0";
          finished.pause();
          finished.currentTime = 0;
        }, FADE * 1000 + 120);

        current = incoming;
        next = finished;
      }
    };

    // Safety net: if a clip ever reaches its end (crossfade window missed,
    // or playback was throttled while the tab was backgrounded), restart it
    // immediately so the loop can never get stuck on the last frame.
    const handleEnded = (e) => {
      const vid = e.target;
      vid.currentTime = 0;
      vid.style.opacity = vid === current ? "1" : "0";
      if (vid === current) vid.play().catch(() => {});
    };

    // Resume playback when the tab regains focus.
    const handleVisibility = () => {
      if (!document.hidden) current.play().catch(() => {});
    };

    a.addEventListener("timeupdate", handleTime);
    b.addEventListener("timeupdate", handleTime);
    a.addEventListener("ended", handleEnded);
    b.addEventListener("ended", handleEnded);
    document.addEventListener("visibilitychange", handleVisibility);
    a.play().catch(() => {});

    return () => {
      a.removeEventListener("timeupdate", handleTime);
      b.removeEventListener("timeupdate", handleTime);
      a.removeEventListener("ended", handleEnded);
      b.removeEventListener("ended", handleEnded);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const isPastDate = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const chosenDate = new Date(dateString);
    chosenDate.setHours(0, 0, 0, 0);

    return chosenDate < today;
  };

  const handleSearch = async () => {
    if (!checkIn || !checkOut) {
      alert("Please select both check-in and check-out dates.");
      return;
    }

    if (isPastDate(checkIn) || isPastDate(checkOut)) {
      alert("You cannot search using past dates.");
      return;
    }

    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);

    if (outDate <= inDate) {
      alert("Check-out date must be after check-in date.");
      return;
    }

    try {
      setLoading(true);

      try {
        const response = await fetch("http://localhost:5050/api/bookings/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            branch,
            roomType,
            checkIn,
            checkOut,
            guests: Number(guests),
          }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          const message =
            response.status === 409
              ? "This room is already reserved for these dates."
              : data.message || "No rooms available matching your criteria.";
          alert(message);
          return;
        }
      } catch {
        console.warn("Booking search API is unavailable. Falling back to local room search.");
      }

      navigate("/hotels", {
        state: {
          branch,
          roomType,
          checkIn,
          checkOut,
          guests: Number(guests),
        },
      });
    } catch (error) {
      console.error("Search error:", error);
      navigate("/hotels", {
        state: {
          branch,
          roomType,
          checkIn,
          checkOut,
          guests: Number(guests),
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#0b1622]">
      <Motion.div
        className="absolute inset-0 z-0"
        animate={{ scale: kenBurns }}
        transition={{ duration: 7.5, ease: "easeOut" }}
      >
        <video
          ref={videoA}
          autoPlay
          muted
          playsInline
          preload="auto"
          style={{ opacity: 1, zIndex: 2, transition: "opacity 600ms ease-in-out" }}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={MainBackground} type="video/mp4" />
        </video>

        <video
          ref={videoB}
          muted
          playsInline
          preload="auto"
          style={{ opacity: 0, zIndex: 1, transition: "opacity 600ms ease-in-out" }}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={MainBackground} type="video/mp4" />
        </video>
      </Motion.div>

      <div className="absolute inset-0 z-[3] bg-gradient-to-b from-black/50 via-black/30 to-black/60"></div>

      <div className="relative z-10 flex w-full flex-1 flex-col items-start justify-center px-6 pt-28 pb-10 text-left sm:px-10 lg:px-16">
          <Motion.p
            className="mb-6 text-xs font-medium uppercase tracking-[0.45em] text-[#9fc0ec] md:text-base"
            {...intro({ opacity: 0, y: -20 }, 0.25)}
          >
            Welcome to Blue Waves Hotel
          </Motion.p>

          <h1 className="max-w-4xl font-serif text-6xl font-bold leading-[1.02] tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.55)] md:text-8xl lg:text-[104px]">
            <Motion.span className="inline-block" {...intro({ opacity: 0, x: -60 }, 0.45)}>
              Smart Stays,
            </Motion.span>{" "}
            <Motion.span
              className="inline-block bg-gradient-to-r from-[#cfe0f5] via-[#9fc0ec] to-[#6f9fe0] bg-clip-text text-transparent"
              {...intro({ opacity: 0, x: 60 }, 0.65)}
            >
              Effortless Escapes
            </Motion.span>
          </h1>

          <Motion.p
            className="mt-8 max-w-2xl text-lg font-light leading-8 text-white/90 drop-shadow-[0_1px_10px_rgba(0,0,0,0.5)] md:text-[24px] md:leading-9"
            {...intro({ opacity: 0, y: 20 }, 0.9)}
          >
            On your journey to the perfect getaway, we are your reliable partner
            at Blue Waves Hotel.
          </Motion.p>

          <Motion.div
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-5"
            {...intro({ opacity: 0, y: 30 }, 1.15)}
          >
            <Link
              to="/hotelDetails"
              className="rounded-full bg-[#7ea0d6] px-9 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#2f6fb3]"
            >
              Explore Hotels
            </Link>

            <Link
              to="/offers"
              className="rounded-full border border-white/70 bg-white/10 px-9 py-3.5 text-sm font-semibold text-white backdrop-blur-sm shadow-[0_12px_30px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:text-[#2F4156]"
            >
              View Offers
            </Link>
          </Motion.div>
        </div>

      <Motion.div
        className="relative z-20 mx-auto w-full max-w-7xl px-6 pb-12 md:pb-16"
        {...intro({ opacity: 0, y: 60 }, 1.4)}
      >
        <div className="rounded-[24px] border border-white/25 bg-white/10 p-4 shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl md:p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
            <Motion.div className="xl:col-span-1" {...intro({ opacity: 0, y: 20 }, 1.65)}>
              <label className="mb-2 block text-base font-semibold text-[#9fc0ec] drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
                Branch
              </label>
              <div className="relative">
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full appearance-none rounded-2xl border border-white/30 bg-white/20 px-4 py-3.5 pr-12 text-base text-[#9fc0ec] outline-none backdrop-blur-md transition focus:border-white/70 focus:bg-white/30 [&>option]:text-[#2F4156]"
                >
                  <option>Cairo Branch</option>
                  <option>Alexandria Branch</option>
                  <option>Marsa Alam Branch</option>
                  <option>Sharm El Sheikh Branch</option>
                  <option>Ain El Sokhna Branch</option>
                </select>
                <ChevronDown
                  size={18}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9fc0ec]"
                />
              </div>
            </Motion.div>

            <Motion.div className="xl:col-span-1" {...intro({ opacity: 0, y: 20 }, 1.75)}>
              <label className="mb-2 block text-base font-semibold text-[#9fc0ec] drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
                Room Type
              </label>
              <div className="relative">
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="w-full appearance-none rounded-2xl border border-white/30 bg-white/20 px-4 py-3.5 pr-12 text-base text-[#9fc0ec] outline-none backdrop-blur-md transition focus:border-white/70 focus:bg-white/30 [&>option]:text-[#2F4156]"
                >
                  <option value="">Any Room Type</option>
                  {roomTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={18}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9fc0ec]"
                />
              </div>
            </Motion.div>

            <Motion.div className="xl:col-span-1" {...intro({ opacity: 0, y: 20 }, 1.85)}>
              <label className="mb-2 block text-base font-semibold text-[#9fc0ec] drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
                Check-in
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full rounded-2xl border border-white/30 bg-white/20 px-4 py-3.5 text-base text-[#9fc0ec] outline-none backdrop-blur-md transition [color-scheme:dark] focus:border-white/70 focus:bg-white/30"
              />
            </Motion.div>

            <Motion.div className="xl:col-span-1" {...intro({ opacity: 0, y: 20 }, 1.95)}>
              <label className="mb-2 block text-base font-semibold text-[#9fc0ec] drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
                Check-out
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full rounded-2xl border border-white/30 bg-white/20 px-4 py-3.5 text-base text-[#9fc0ec] outline-none backdrop-blur-md transition [color-scheme:dark] focus:border-white/70 focus:bg-white/30"
              />
            </Motion.div>

            <Motion.div className="xl:col-span-1" {...intro({ opacity: 0, y: 20 }, 2.05)}>
              <label className="mb-2 block text-base font-semibold text-[#9fc0ec] drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
                Guests
              </label>
              <div className="relative">
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full appearance-none rounded-2xl border border-white/30 bg-white/20 px-4 py-3.5 pr-12 text-base text-[#9fc0ec] outline-none backdrop-blur-md transition focus:border-white/70 focus:bg-white/30 [&>option]:text-[#2F4156]"
                >
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4 Guests</option>
                  <option value="5">5 Guests</option>
                </select>
                <ChevronDown
                  size={18}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9fc0ec]"
                />
              </div>
            </Motion.div>

            <Motion.div className="xl:col-span-1" {...intro({ opacity: 0, y: 20 }, 2.15)}>
              <label className="mb-2 block text-base font-semibold opacity-0">
                Search
              </label>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full rounded-2xl bg-[#9fc0ec] px-6 py-3.5 text-base font-semibold text-[#1f3147] transition-all duration-300 hover:bg-[#7ea0d6] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Searching..." : "Search Now"}
              </button>
            </Motion.div>
          </div>
        </div>
      </Motion.div>
    </section>
  );
}
