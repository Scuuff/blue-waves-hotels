import React from "react";
import {
  Wifi,
  Waves,
  Dumbbell,
  Utensils,
  Car,
  Sparkles,
  Briefcase,
  ConciergeBell,
} from "lucide-react";
import {
  cardAccentIcon,
  cardDescription,
  cardShell,
  cardTitle,
} from "./cardSystem";

const iconMap = {
  wifi: Wifi,
  waves: Waves,
  dumbbell: Dumbbell,
  utensils: Utensils,
  car: Car,
  sparkles: Sparkles,
  briefcase: Briefcase,
  concierge: ConciergeBell,
};

export default function AmenitiesSection({ amenities }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#f6f9fd] via-[#edf4fb] to-[#f6f9fd] py-16 px-6 dark:from-[#0a1420] dark:via-[#0d1b2c] dark:to-[#0a1420] md:px-10 lg:px-12">
      <div className="pointer-events-none absolute -right-24 top-0 h-96 w-96 rounded-full bg-[#9fc0ec]/20 blur-3xl dark:bg-[#9fc0ec]/10" />

      <div className="relative max-w-6xl mx-auto">
        <div className="mb-10">
          <p className="mb-3 flex items-center gap-3 text-[12px] md:text-sm uppercase tracking-[0.28em] text-[#2f6fb3] dark:text-[#9fc0ec]">
            <span className="h-px w-8 bg-[#2f6fb3]/50 dark:bg-[#9fc0ec]/60" />
            Facilities
          </p>
          <h2 className="text-3xl md:text-5xl font-serif text-[#16283c] dark:text-white mb-3">
            Hotel Amenities
          </h2>
          <p className="text-[#3c5068] dark:text-[#96D0F2] max-w-xl text-sm md:text-base leading-relaxed">
            World-class facilities designed for your comfort and convenience.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {amenities.map((item, index) => {
            const IconComponent = iconMap[item.icon];

            return (
              <div
                key={index}
                className={`${cardShell} p-5`}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#e3ebf4] bg-[#f6f9fc] transition-transform duration-300 group-hover:scale-105 dark:border-white/10 dark:bg-white/[0.04]">
                    <IconComponent className={`h-5 w-5 ${cardAccentIcon}`} />
                  </div>
                  <span
                    className="leading-none text-slate-300 dark:text-white/25"
                    aria-hidden="true"
                  >
                    —
                  </span>
                </div>

                <h3 className={cardTitle}>{item.title}</h3>

                <p className={cardDescription}>{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
