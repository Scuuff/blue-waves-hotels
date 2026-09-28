import React from "react";
import { useNavigate } from "react-router-dom";
import {
  badgeNeutral,
  cardAmenityPill,
  cardButton,
  cardButtonShimmer,
  cardDescription,
  cardEyebrow,
  cardShell,
  cardTitle,
} from "./cardSystem";

export default function BranchesSection({ branches = [] }) {
  const navigate = useNavigate();

  // The Cairo pyramids photo is portrait; bias its crop downward so the
  // sphinx + pyramids stay framed when object-cover fills the wide card slot.
  const focusPosition = (src = "") =>
    /Cairo_Pyramids/i.test(src) ? "center 68%" : "center";

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#f6f9fd] via-[#edf4fb] to-[#f6f9fd] py-16 px-6 dark:from-[#0a1420] dark:via-[#0d1b2c] dark:to-[#0a1420] md:px-10 lg:px-12">
      <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-[#9fc0ec]/20 blur-3xl dark:bg-[#9fc0ec]/10" />

      <div className="relative max-w-6xl mx-auto">
        {/* Header: title on the left, supporting copy on the right */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-3xl md:text-5xl font-serif text-[#16283c] dark:text-[#9fc0ec]">
            Our Branches
          </h2>
          <p className="max-w-sm text-sm md:text-base leading-relaxed text-[#3c5068] dark:text-[#96D0F2] sm:text-right">
            Explore our luxury branches across Egypt and choose your perfect stay.
          </p>
        </div>

        {/* Stacked horizontal cards */}
        <div className="flex flex-col gap-5">
          {branches.map((branch, index) => (
            <div
              key={branch.id || branch.slug || index}
              className={`dbw-branch-card ${cardShell} flex flex-col md:flex-row md:items-stretch`}
            >
              {/* Image */}
              <div className="dbw-branch-imgwrap relative shrink-0 overflow-hidden md:w-64">
                <img
                  src={branch.image}
                  alt={branch.title || branch.name}
                  onError={(event) => {
                    if (branch.fallbackImage && event.currentTarget.src !== branch.fallbackImage) {
                      event.currentTarget.src = branch.fallbackImage;
                    }
                  }}
                  style={{ objectPosition: focusPosition(branch.image) }}
                  className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />

                {branch.badge && (
                  <span className={badgeNeutral}>
                    {branch.badge}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col justify-center gap-3 p-5 md:p-6">
                <div>
                  <p className={cardEyebrow}>
                    {branch.location || branch.city}
                  </p>
                  <h3 className={cardTitle}>{branch.title || branch.name}</h3>
                </div>

                <p className={`${cardDescription} line-clamp-2 max-w-xl`}>
                  {branch.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {(branch.features || []).map((feature, i) => (
                    <span
                      key={i}
                      className={cardAmenityPill}
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center px-5 pb-5 md:px-6 md:pb-0">
                <button
                  onClick={() => navigate(`/branches/${branch.slug}`)}
                  className={`${cardButton} inline-flex items-center gap-2 whitespace-nowrap text-sm`}
                >
                  <span className={cardButtonShimmer} />
                  Explore Branch
                  <span className="transition-transform duration-300 group-hover/btn:translate-x-1">
                    →
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Card/image heights set here (not via base + md: arbitrary Tailwind
          utilities) so the Tailwind Play CDN's rule ordering can't break them. */}
      <style>
        {`
          .dbw-branch-imgwrap { height: 176px; }
          @media (min-width: 768px) {
            .dbw-branch-card { height: 180px; }
            .dbw-branch-imgwrap { height: 100%; }
          }
        `}
      </style>
    </section>
  );
}
