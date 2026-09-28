import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useInView,
  useReducedMotion,
  animate,
} from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles, Heart } from "lucide-react";
import Navbar from "../Components/Navbar";
import SearchBar from "../Components/SearchBar";
import FilterSidebar from "../Components/FilterSidebar";
import HotelCard from "../Components/HotelCard";
import { cardShell } from "../Components/cardSystem";
import Footer from "../Components/Footer";
import { apiGet } from "../services/apiClient";
import { getSafeRoomImage, normalizeRoomRecord } from "../utils/roomMedia";
import { useFavorites } from "../Context/FavoritesContext";
import Background1 from "../assets/Images/Background.jpg";
import Background2 from "../assets/Images/Background2.jpg";
import Background3 from "../assets/Images/Backgroud3.jpg";
import Background4 from "../assets/Images/Background4.jpg";
import Background5 from "../assets/Images/Background 5.jpg";

const EASE = [0.22, 1, 0.36, 1];

const heroTextContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
  exit: {
    opacity: 0,
    y: -16,
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

const heroTextItem = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
};

const staggerGrid = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const riseIn = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

function AnimatedNumber({ value }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 1.2,
      ease: EASE,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, reduced]);

  return <span ref={ref}>{display}</span>;
}

function StatCard({ label, value, caption }) {
  return (
    <motion.div
      variants={riseIn}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="rounded-[28px] border border-[#e9eff6] bg-white p-6 shadow-[0_10px_30px_rgba(20,40,70,0.06)] dark:border-white/10 dark:bg-[#0f1f33]"
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold-600 dark:text-gold-300">
        {label}
      </p>
      <h3 className="mt-3 font-serif text-5xl font-semibold text-[#1d3252] dark:text-white">
        <AnimatedNumber value={value} />
      </h3>
      <div className="mt-3 h-px w-10 bg-gold-400/60" />
      <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-white/55">
        {caption}
      </p>
    </motion.div>
  );
}

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
      <h2 className="mt-3 font-serif text-4xl font-semibold text-[#1d3252] dark:text-white md:text-5xl">
        {title}
      </h2>
    </motion.div>
  );
}

export default function HotelListingPage() {
  const location = useLocation();
  const initialState = location.state || {};
  const initialBranch = initialState.branch || "";
  const initialCheckIn = initialState.checkIn || "";
  const initialCheckOut = initialState.checkOut || "";
  const initialGuests = initialState.guests || "";
  const initialRoomType = initialState.roomType || "";

  const scrollRef = useRef(null);
  const availableRoomsRef = useRef(null);
  const { favoriteCount } = useFavorites();
  const reduced = useReducedMotion();

  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [rooms, setRooms] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [searchPopup, setSearchPopup] = useState({
    open: false,
    title: "",
    message: "",
  });

  const normalizeGuests = (value) => {
    if (!value) return "";
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? "" : parsed;
  };

  const [filters, setFilters] = useState({
    destination: initialBranch,
    checkIn: initialCheckIn,
    checkOut: initialCheckOut,
    guests: normalizeGuests(initialGuests) || "",
    maxPrice: "",
    roomType: initialRoomType,
    type: initialRoomType,
    branch: initialBranch,
    rating: "",
    sortBy: "popularity",
  });

  const heroImages = [
    Background1,
    Background2,
    Background3,
    Background4,
    Background5,
  ];

  const heroContent = [
    {
      badge: "Blue Wave Escape",
      title: "Stay somewhere that feels unforgettable",
      text: "Browse elegant rooms, ocean escapes, and premium suites across our branches.",
    },
    {
      badge: "Luxury Collection",
      title: "Handpicked rooms for every kind of traveler",
      text: "Find modern comfort, stylish interiors, and memorable views in one place.",
    },
    {
      badge: "Exclusive Offers",
      title: "Your next premium stay starts here",
      text: "Search by city, price, and room type to discover the ideal room faster.",
    },
    {
      badge: "Signature Experience",
      title: "Designed for comfort, chosen for elegance",
      text: "From standard rooms to premium suites, enjoy a smoother booking experience.",
    },
    {
      badge: "Blue Wave Hotel",
      title: "Relax, search, and book with confidence",
      text: "Explore our best rooms with smart filters and featured stays.",
    },
  ];

  const buildRoomQuery = (values = {}) => {
    const params = new URLSearchParams();

    if (values.destination) params.append("destination", values.destination);
    if (values.branch) params.append("branch", values.branch);
    const effectiveType = values.type || values.roomType;
    if (effectiveType) params.append("type", effectiveType);
    if (values.checkIn) params.append("checkIn", values.checkIn);
    if (values.checkOut) params.append("checkOut", values.checkOut);
    if (values.guests) params.append("guests", values.guests);
    if (
      values.maxPrice !== "" &&
      values.maxPrice !== null &&
      values.maxPrice !== undefined
    ) {
      params.append("maxPrice", values.maxPrice);
    }
    if (values.rating) params.append("rating", values.rating);
    if (values.sortBy) params.append("sortBy", values.sortBy);

    return params.toString();
  };

  const fetchFilteredRooms = async (values = filters) => {
    const query = buildRoomQuery(values);
    const data = await apiGet(`/rooms/user-search?${query}`);
    return Array.isArray(data) ? data.map(normalizeRoomRecord) : [];
  };

  const fetchAllRooms = async () => {
    const data = await apiGet("/rooms");
    const normalizedRooms = Array.isArray(data)
      ? data.map(normalizeRoomRecord)
      : [];

    setAllRooms(normalizedRooms);
    return normalizedRooms;
  };

  const fetchFeaturedRooms = async () => {
    const data = await apiGet("/rooms/featured");
    const normalizedFeaturedRooms = Array.isArray(data)
      ? data.map(normalizeRoomRecord)
      : [];

    setFeaturedRooms(normalizedFeaturedRooms);
    return normalizedFeaturedRooms;
  };

  useEffect(() => {
    const loadInitialRooms = async () => {
      try {
        setLoading(true);

        await Promise.all([fetchAllRooms(), fetchFeaturedRooms()]);

        const initialFilters = {
          destination: initialBranch,
          branch: initialBranch,
          roomType: initialRoomType || "",
          type: initialRoomType || "",
          checkIn: initialCheckIn,
          checkOut: initialCheckOut,
          guests: normalizeGuests(initialGuests) || "",
          maxPrice: "",
          rating: "",
          sortBy: "popularity",
        };

        const backendRooms = await fetchFilteredRooms(initialFilters);
        setRooms(backendRooms);
      } catch (error) {
        console.error("Failed to load rooms:", error.message);
        setRooms([]);
        setAllRooms([]);
        setFeaturedRooms([]);
      } finally {
        setLoading(false);
      }
    };

    loadInitialRooms();
  }, [
    initialBranch,
    initialCheckIn,
    initialCheckOut,
    initialGuests,
    initialRoomType,
  ]);

  useEffect(() => {
    const sliderInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(sliderInterval);
  }, [heroImages.length]);

  const scrollToAvailableRooms = () => {
    window.setTimeout(() => {
      availableRoomsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);
  };

  const handleSearchClick = async (values) => {
    const updatedFilters = {
      ...filters,
      destination: values.destination || values.branch || "",
      branch: values.branch || "",
      roomType: values.roomType || "",
      type: values.roomType || "",
      checkIn: values.checkIn || "",
      checkOut: values.checkOut || "",
      guests: normalizeGuests(values.guests) || "",
      maxPrice:
        values.maxPrice !== undefined ? values.maxPrice : filters.maxPrice,
    };

    try {
      setLoading(true);
      setSearchPopup({
        open: false,
        title: "",
        message: "",
      });

      const backendRooms = await fetchFilteredRooms(updatedFilters);

      setFilters(updatedFilters);
      setRooms(backendRooms);
    } catch (error) {
      console.error("Backend search failed:", error.message);
      setRooms([]);

      if (error?.status === 409) {
        setSearchPopup({
          open: true,
          title: "Room Reserved",
          message:
            "This room is reserved during the selected period. Please change the check-in or check-out date and try again.",
        });
      }
    } finally {
      setLoading(false);
      scrollToAvailableRooms();
    }
  };

  const resetFilters = async () => {
    const resetValues = {
      destination: "",
      checkIn: "",
      checkOut: "",
      guests: "",
      maxPrice: "",
      roomType: "",
      type: "",
      branch: "",
      rating: "",
      sortBy: "popularity",
    };

    setFilters(resetValues);

    try {
      setLoading(true);
      const backendRooms = await fetchFilteredRooms(resetValues);
      setRooms(backendRooms);
    } catch (error) {
      console.error("Reset filters failed:", error.message);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const applyBackendFilters = async () => {
      try {
        setLoading(true);
        const backendRooms = await fetchFilteredRooms(filters);
        setRooms(backendRooms);
      } catch (error) {
        console.error("Backend filter failed:", error.message);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };

    applyBackendFilters();
  }, [
    filters.branch,
    filters.type,
    filters.rating,
    filters.guests,
    filters.maxPrice,
    filters.sortBy,
    filters.checkIn,
    filters.checkOut,
  ]);

  const filteredRooms = useMemo(() => {
    return rooms;
  }, [rooms]);

  const branchOptions = useMemo(
    () =>
      [...new Set(allRooms.map((room) => room.branch).filter(Boolean))].sort(),
    [allRooms]
  );

  const typeOptions = useMemo(
    () =>
      [...new Set(allRooms.map((room) => room.type).filter(Boolean))].sort(),
    [allRooms]
  );

  const uniqueBranchesCount = useMemo(() => {
    return new Set(allRooms.map((room) => room.branch).filter(Boolean)).size;
  }, [allRooms]);

  const currentHero = heroContent[currentSlide];

  const scrollFeatured = (direction) => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: direction === "left" ? -380 : 380,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen bg-[#f6f9fc] pt-28 dark:bg-[#0a1420]">
      <Navbar />

      <AnimatePresence>
        {searchPopup.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 10,
                transition: { duration: 0.2 },
              }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="w-full max-w-md rounded-[28px] bg-white p-7 shadow-2xl dark:bg-[#0f1f33] dark:ring-1 dark:ring-white/10"
            >
              <h3 className="font-serif text-3xl font-semibold text-[#1d3252] dark:text-white">
                {searchPopup.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-white/65">
                {searchPopup.message}
              </p>
              <div className="mt-6 flex justify-end">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setSearchPopup({
                      open: false,
                      title: "",
                      message: "",
                    })
                  }
                  className="rounded-2xl bg-gradient-to-br from-[#28415f] to-[#182c46] px-6 py-3 font-semibold text-white"
                >
                  OK
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="relative px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: EASE }}
          className="relative mx-auto max-w-7xl overflow-hidden rounded-[36px] shadow-[0_40px_90px_rgba(10,25,50,0.35)]"
        >
          <div className="relative h-[660px] sm:h-[560px] md:h-[620px]">
            <AnimatePresence initial={false}>
              <motion.div
                key={currentSlide}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.1, ease: "easeInOut" }}
              >
                <motion.div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${heroImages[currentSlide]})`,
                  }}
                  initial={{ scale: 1 }}
                  animate={{ scale: reduced ? 1 : 1.07 }}
                  transition={{ duration: 6.5, ease: "linear" }}
                />
              </motion.div>
            </AnimatePresence>

            <div className="absolute inset-0 bg-gradient-to-r from-[#0b1830e6] via-[#0b183066] to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />

            <div className="relative z-10 flex h-full items-center">
              <div className="max-w-2xl px-6 pb-28 sm:pb-24 md:px-12">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    variants={heroTextContainer}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                  >
                    <motion.div
                      variants={heroTextItem}
                      className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold-300/40 bg-white/10 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.24em] text-gold-200 backdrop-blur-md"
                    >
                      <Sparkles size={14} />
                      {currentHero.badge}
                    </motion.div>

                    <motion.h1
                      variants={heroTextItem}
                      className="max-w-xl font-serif text-5xl font-semibold leading-[1.05] text-white md:text-7xl"
                    >
                      {currentHero.title}
                    </motion.h1>

                    <motion.p
                      variants={heroTextItem}
                      className="mt-6 max-w-lg text-base leading-8 text-white/80 md:text-lg"
                    >
                      {currentHero.text}
                    </motion.p>

                    <motion.div
                      variants={heroTextItem}
                      className="mt-9 flex flex-wrap gap-3"
                    >
                      <Link
                        to="/offers"
                        className="group relative overflow-hidden rounded-full bg-white px-7 py-3.5 font-semibold text-[#1d3252] transition-transform duration-300 hover:-translate-y-1"
                      >
                        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gold-300/40 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
                        Explore Offers
                      </Link>

                      <Link
                        to="/favorites"
                        className="rounded-full border border-white/30 bg-white/10 px-7 py-3.5 font-semibold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-gold-300/50 hover:bg-white/20"
                      >
                        Saved Rooms ({favoriteCount})
                      </Link>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <div className="absolute bottom-20 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full bg-black/20 px-4 py-2.5 backdrop-blur-sm">
              {heroImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    index === currentSlide
                      ? "w-10 bg-gold-300"
                      : "w-2.5 bg-white/50 hover:bg-white"
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 44 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.35, ease: EASE }}
          className="relative z-30 mx-auto -mt-14 max-w-6xl px-2"
        >
          <div className="rounded-[32px] border border-white/70 bg-white/90 p-5 shadow-[0_30px_80px_rgba(15,30,60,0.16)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0f1f33]/95 dark:shadow-[0_30px_80px_rgba(0,0,0,0.5)] md:p-6">
            <SearchBar
              filters={{
                branch: filters.branch,
                roomType: filters.roomType,
                checkIn: filters.checkIn,
                checkOut: filters.checkOut,
                guests: filters.guests,
                maxPrice: filters.maxPrice,
              }}
              onSearchClick={handleSearchClick}
              resultCount={filteredRooms.length}
              branchOptions={branchOptions}
              roomTypeOptions={typeOptions}
            />
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-12 md:px-6 lg:px-8">
        <motion.div
          variants={staggerGrid}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid gap-6 md:grid-cols-3"
        >
          <StatCard
            label="Available Branches"
            value={uniqueBranchesCount}
            caption="Discover different locations and room styles."
          />
          <StatCard
            label="Featured Rooms"
            value={featuredRooms.length}
            caption="Handpicked premium rooms for a better stay."
          />
          <StatCard
            label="Saved Favorites"
            value={favoriteCount}
            caption="Keep your preferred rooms in one place."
          />
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Featured Stays"
            title="Premium Blue Wave Rooms"
          />

          <div className="hidden items-center gap-3 md:flex">
            <motion.button
              onClick={() => scrollFeatured("left")}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Scroll featured rooms left"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#dbe4f0] bg-white text-[#1d3252] shadow-sm transition-colors hover:border-gold-400/50 hover:text-gold-600 dark:border-white/15 dark:bg-[#0f1f33] dark:text-white dark:hover:text-gold-300"
            >
              <ChevronLeft size={20} />
            </motion.button>
            <motion.button
              onClick={() => scrollFeatured("right")}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Scroll featured rooms right"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#dbe4f0] bg-white text-[#1d3252] shadow-sm transition-colors hover:border-gold-400/50 hover:text-gold-600 dark:border-white/15 dark:bg-[#0f1f33] dark:text-white dark:hover:text-gold-300"
            >
              <ChevronRight size={20} />
            </motion.button>
          </div>
        </div>

        <motion.div
          ref={scrollRef}
          variants={staggerGrid}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="flex gap-6 overflow-x-auto scroll-smooth pb-3 [scrollbar-width:none] [-ms-overflow-style:none]"
        >
          {featuredRooms.map((room) => (
            <motion.div
              key={room._id}
              variants={riseIn}
              className="min-w-[320px] flex-shrink-0 md:min-w-[360px]"
            >
              <Link
                to="/booking"
                state={{ selectedRoom: room }}
                className={`${cardShell} relative block min-h-[360px]`}
              >
                <img
                  src={getSafeRoomImage(room)}
                  alt={room.roomName}
                  onError={(e) => {
                    e.currentTarget.src = getSafeRoomImage({
                      type: room.type,
                    });
                  }}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1830e6] via-black/25 to-transparent" />
                <div className="absolute bottom-0 p-6 text-white transition-transform duration-500 ease-out group-hover:-translate-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-gold-300">
                    {room.branch}
                  </p>
                  <h3 className="mt-1.5 font-serif text-3xl font-semibold">
                    {room.roomName}
                  </h3>
                  <p className="mt-1.5 text-sm text-slate-200">
                    {room.location}
                  </p>
                  <p className="mt-3 font-serif text-2xl font-semibold text-gold-200">
                    ${room.price}
                    <span className="font-sans text-sm font-normal text-white/70">
                      {" "}
                      / night
                    </span>
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section
        ref={availableRoomsRef}
        className="mx-auto max-w-7xl scroll-mt-32 px-4 pb-16 md:px-6 lg:px-8"
      >
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <SectionHeading eyebrow="Your Search" title="Available Rooms" />
            <motion.p
              key={filteredRooms.length}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="mt-3 text-sm text-[#8A99A8] dark:text-white/55"
            >
              {filteredRooms.length} rooms found across Blue Wave branches
            </motion.p>
          </div>

          <Link
            to="/favorites"
            className="inline-flex items-center gap-2 self-start rounded-2xl border border-[#dbe4f0] bg-white px-5 py-3 font-medium text-[#1d3252] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-400/50 dark:border-white/15 dark:bg-[#0f1f33] dark:text-white md:self-auto"
          >
            <Heart size={18} className="fill-red-500 text-red-500" />
            Favorites ({favoriteCount})
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            resetFilters={resetFilters}
            branchOptions={branchOptions}
            typeOptions={typeOptions}
          />

          <div>
            {loading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-[420px] animate-pulse rounded-[28px] bg-gradient-to-br from-white to-[#e9f0f8] shadow-sm dark:from-[#0f1f33] dark:to-[#12233b]"
                  />
                ))}
              </div>
            ) : filteredRooms.length > 0 ? (
              <motion.div
                layout
                className="grid grid-cols-1 gap-6 md:grid-cols-2"
              >
                <AnimatePresence mode="popLayout">
                  {filteredRooms.map((room, index) => (
                    <motion.div
                      key={room._id || room.id}
                      layout
                      initial={{ opacity: 0, y: 26 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{
                        opacity: 0,
                        scale: 0.96,
                        transition: { duration: 0.25, ease: "easeIn" },
                      }}
                      transition={{
                        duration: 0.5,
                        ease: EASE,
                        delay: Math.min(index * 0.05, 0.35),
                      }}
                    >
                      <HotelCard hotel={room} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="rounded-[28px] border border-[#e9eff6] bg-white p-12 text-center shadow-sm dark:border-white/10 dark:bg-[#0f1f33]"
              >
                <h3 className="font-serif text-3xl font-semibold text-[#1d3252] dark:text-white">
                  No rooms found
                </h3>
                <p className="mt-3 text-slate-500 dark:text-white/55">
                  Try changing your search or filters.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
