import React, { useEffect, useRef, useState } from "react";
import {
  MapPin,
  Plane,
  Landmark,
  Navigation,
  ChevronDown,
  Check,
} from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  MapContainer,
  TileLayer,
  Marker,
  ZoomControl,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTheme } from "../Context/ThemeContext";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Two pin styles: a muted default, and a larger, brighter, pulsing selected pin.
function buildMarker(selected) {
  const size = selected ? 28 : 20;
  const pin = selected ? "#9fc0ec" : "#2f6fb3";
  const ring = selected ? "#dbe8fb" : "#ffffff";
  const pulse = selected
    ? `<span style="position:absolute;left:50%;top:50%;width:${size}px;height:${size}px;margin:-${size / 2}px 0 0 -${size / 2}px;border-radius:50%;background:rgba(159,192,236,0.45);animation:plPulse 1.6s ease-out infinite;"></span>`
    : "";

  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;">
        ${pulse}
        <div style="
          position:relative;
          width:${size}px;height:${size}px;
          background:${pin};
          border:3px solid ${ring};
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          box-shadow:0 6px 14px rgba(0,0,0,0.45);
        "></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

const defaultMarker = buildMarker(false);
const selectedMarker = buildMarker(true);

// Smoothly flies the map to the selected branch whenever it changes.
function FlyToBranch({ position, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, zoom, { duration: 1.2, easeLinearity: 0.25 });
    }
  }, [position, zoom, map]);
  return null;
}

const EASE = [0.22, 1, 0.36, 1];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const infoFields = [
  { icon: MapPin, title: "Address", field: "address" },
  { icon: Plane, title: "Airport", field: "airport" },
  { icon: Landmark, title: "Nearby Attractions", field: "attractions" },
];

// Custom, on-theme branch selector styled to match the section's info cards.
function BranchDropdown({ branches, selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDocClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={ref} className="relative max-w-xs">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-[#26567E]/20 bg-white px-4 py-3 text-left shadow-[0_12px_35px_rgba(38,86,126,0.15)] transition-colors duration-300 hover:border-[#2f6fb3]/50 dark:border-[#9fc0ec]/20 dark:bg-gradient-to-br dark:from-[#15273f] dark:to-[#0c1828] dark:shadow-[0_12px_45px_rgba(0,0,0,0.45)] dark:hover:border-[#9fc0ec]/40"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#2f6fb3]/25 bg-[#2f6fb3]/10 dark:border-[#9fc0ec]/20 dark:bg-[#9fc0ec]/10">
            <MapPin className="h-4 w-4 text-[#2f6fb3] dark:text-[#9fc0ec]" />
          </span>
          <span className="truncate font-medium text-[#16283c] dark:text-white">
            {selected?.name}
          </span>
        </span>
        <Motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: EASE }}
        >
          <ChevronDown className="h-5 w-5 text-[#2f6fb3] dark:text-[#9fc0ec]" />
        </Motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <Motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="absolute z-[1000] mt-2 w-full overflow-hidden rounded-2xl border border-[#26567E]/15 bg-white/95 p-1.5 shadow-[0_20px_60px_rgba(38,86,126,0.25)] backdrop-blur-xl dark:border-[#9fc0ec]/20 dark:bg-[#0c1828]/95 dark:shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
          >
            {branches.map((branch) => {
              const isSelected = String(branch.id) === String(selected?.id);
              return (
                <li key={branch.id} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(branch.id);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors duration-200 ${
                      isSelected
                        ? "bg-[#2f6fb3]/10 text-[#2f6fb3] dark:bg-[#9fc0ec]/15 dark:text-[#9fc0ec]"
                        : "text-[#2b3f55] hover:bg-[#2f6fb3]/5 hover:text-[#16283c] dark:text-white/80 dark:hover:bg-white/5 dark:hover:text-white"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <MapPin
                        className={`h-4 w-4 shrink-0 ${
                          isSelected
                            ? "text-[#2f6fb3] dark:text-[#9fc0ec]"
                            : "text-[#16283c]/35 dark:text-white/40"
                        }`}
                      />
                      <span className="truncate">{branch.name}</span>
                    </span>
                    {isSelected && (
                      <Check className="h-4 w-4 shrink-0 text-[#2f6fb3] dark:text-[#9fc0ec]" />
                    )}
                  </button>
                </li>
              );
            })}
          </Motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

// A value that cross-fades whenever it changes (e.g. selecting a new branch).
function MorphingText({ value, className }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Motion.p
        key={value}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: EASE }}
        className={className}
      >
        {value}
      </Motion.p>
    </AnimatePresence>
  );
}

export default function PrimeLocationSection({ locations = [] }) {
  const [selectedId, setSelectedId] = useState(locations[0]?.id ?? null);
  const { darkMode } = useTheme();

  // CARTO basemap that matches the active theme; keyed so Leaflet swaps tiles
  // immediately when the guest toggles between light and dark.
  const tileUrl = darkMode
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  const selectedLocation =
    locations.find((loc) => String(loc.id) === String(selectedId)) ||
    locations[0] ||
    null;

  if (!selectedLocation) return null;

  const { name, address, airport, attractions, mapPosition } = selectedLocation;
  const values = { address, airport, attractions };

  // Route to the branch's exact coordinates so "Get Directions" always lands on
  // the real pin (Marsa Alam, Sharm El Sheikh, …) — not an ambiguous text search.
  const [lat, lng] = mapPosition || [];
  const directionsUrl =
    lat != null && lng != null
      ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#f6f9fd] via-[#edf4fb] to-[#f6f9fd] py-16 px-6 dark:from-[#0a1420] dark:via-[#0d1b2c] dark:to-[#0a1420] md:px-10 lg:px-12">
      {/* Slowly drifting ambient glow */}
      <Motion.div
        className="pointer-events-none absolute -left-24 bottom-0 h-96 w-96 rounded-full bg-[#9fc0ec]/20 blur-3xl dark:bg-[#9fc0ec]/10"
        animate={{ y: [0, -24, 0], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 9, ease: "easeInOut", repeat: Infinity }}
      />

      <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Left column — staggered reveal */}
        <Motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          <Motion.h2
            variants={itemVariants}
            className="text-3xl md:text-5xl font-serif text-[#16283c] dark:text-white mb-4"
          >
            Prime Location
          </Motion.h2>

          <Motion.p
            variants={itemVariants}
            className="text-[#3c5068] dark:text-white/70 text-sm md:text-base leading-relaxed max-w-lg mb-6"
          >
            Explore our branches across Egypt. Choose a branch to center the map
            on its exact location and view its address, airport access, nearby
            attractions, and get directions instantly.
          </Motion.p>

          {/* Modern branch selector */}
          <Motion.div variants={itemVariants} className="mb-6">
            <span className="mb-2 block text-sm font-medium text-[#2f6fb3] dark:text-[#9fc0ec]">
              Choose a branch
            </span>
            <BranchDropdown
              branches={locations}
              selected={selectedLocation}
              onSelect={setSelectedId}
            />
          </Motion.div>

          <div className="space-y-4 mb-6">
            {infoFields.map((info) => {
              const FieldIcon = info.icon;
              return (
                <Motion.div
                  key={info.title}
                  variants={itemVariants}
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="group rounded-2xl border border-[#26567E]/15 bg-white px-4 py-4 flex items-start gap-4 shadow-[0_12px_35px_rgba(38,86,126,0.12)] transition-colors duration-300 hover:border-[#2f6fb3]/50 dark:border-[#9fc0ec]/15 dark:bg-gradient-to-br dark:from-[#15273f] dark:to-[#0c1828] dark:shadow-[0_12px_45px_rgba(0,0,0,0.45)] dark:hover:border-[#9fc0ec]/40"
                >
                  <div className="w-10 h-10 rounded-full border border-[#2f6fb3]/25 bg-[#2f6fb3]/10 dark:border-[#9fc0ec]/20 dark:bg-[#9fc0ec]/10 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                    <FieldIcon className="w-5 h-5 text-[#2f6fb3] dark:text-[#9fc0ec]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[#16283c] dark:text-white font-serif text-lg">{info.title}</h3>
                    <MorphingText
                      value={values[info.field]}
                      className="text-[#3c5068] dark:text-white/65 text-sm"
                    />
                  </div>
                </Motion.div>
              );
            })}
          </div>

          <Motion.a
            variants={itemVariants}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group/button inline-flex items-center gap-2 bg-[#2f6fb3] text-white px-6 py-3 rounded-full font-semibold shadow-md transition-colors duration-300 hover:bg-[#26567E] dark:bg-[#9fc0ec] dark:text-[#0c1828] dark:hover:bg-[#7ea0d6]"
          >
            <Navigation className="w-4 h-4 transition-transform duration-300 group-hover/button:translate-x-1" />
            <span className="transition-transform duration-300 group-hover/button:translate-x-2">
              Get Directions
            </span>
          </Motion.a>
        </Motion.div>

        {/* Right column — dark map that recenters on the selected branch */}
        <Motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.75, ease: EASE }}
          className="relative"
        >
          <div className="rounded-[28px] overflow-hidden border border-[#26567E]/20 shadow-[0_12px_45px_rgba(38,86,126,0.25)] dark:border-[#9fc0ec]/20 dark:shadow-[0_12px_45px_rgba(0,0,0,0.55)] h-[420px]">
            <MapContainer
              center={selectedLocation.mapPosition}
              zoom={11}
              scrollWheelZoom={true}
              zoomControl={false}
              className="h-full w-full"
            >
              <TileLayer
                key={darkMode ? "carto-dark" : "carto-light"}
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url={tileUrl}
              />

              <FlyToBranch position={selectedLocation.mapPosition} zoom={11} />

              {locations.map((location) => {
                const isSelected = location.id === selectedLocation.id;
                return (
                  <Marker
                    key={location.id}
                    position={location.mapPosition}
                    icon={isSelected ? selectedMarker : defaultMarker}
                    zIndexOffset={isSelected ? 1000 : 0}
                    eventHandlers={{
                      click: () => setSelectedId(location.id),
                    }}
                  />
                );
              })}

              <ZoomControl position="bottomright" />
            </MapContainer>
          </div>
        </Motion.div>
      </div>

      {/* Keyframes for the selected marker's pulsing halo (global, used by Leaflet divIcon) */}
      <style>
        {`
          @keyframes plPulse {
            0%   { transform: scale(0.6); opacity: 0.7; }
            70%  { transform: scale(2.2); opacity: 0; }
            100% { transform: scale(2.2); opacity: 0; }
          }
        `}
      </style>
    </section>
  );
}
