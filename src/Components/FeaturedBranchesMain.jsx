import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { apiGet } from "../services/apiClient";
import { normalizeHotelBranch } from "../utils/hotelBranches";
import { getFallbackBranches } from "../utils/catalogFallbacks";
import { cardMetaIcon, cardShell } from "./cardSystem";

export default function FeaturedBranchesPreview() {
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadBranches = async () => {
      try {
        const data = await apiGet("/hotels");
        if (!isMounted) return;

        const normalizedBranches = Array.isArray(data?.hotels) && data.hotels.length > 0
          ? data.hotels
              .filter((hotel) => hotel?.status !== "Inactive")
              .map(normalizeHotelBranch)
              .slice(0, 3)
          : getFallbackBranches().slice(0, 3);

        setBranches(normalizedBranches);
      } catch {
        if (isMounted) {
          setBranches(getFallbackBranches().slice(0, 3));
        }
      }
    };

    loadBranches();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="px-6 py-24 md:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#2f6fb3] dark:text-[#9fc0ec]">
            Featured Branches
          </p>
          <h2 className="mt-4 font-serif text-4xl font-semibold text-[#16283c] dark:text-white md:text-5xl">
            Discover Our Finest Destinations
          </h2>
          <p className="mt-5 text-base leading-8 text-[#3c5068] dark:text-white/70 md:text-lg">
            Explore a selection of our most loved branches, each offering a unique luxury experience.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className={`${cardShell} relative h-80`}
            >
              <img
                src={branch.image}
                alt={branch.name}
                onError={(event) => {
                  if (branch.fallbackImage && event.currentTarget.src !== branch.fallbackImage) {
                    event.currentTarget.src = branch.fallbackImage;
                  }
                }}
                style={{ objectPosition: branch.imagePosition || "center" }}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Scrim so the overlaid title stays readable over any photo */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/25"></div>

              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <h3 className="font-serif text-3xl font-semibold text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]">
                  {branch.name}
                </h3>

                <div className="mt-3 flex items-center gap-2 text-white/85">
                  <MapPin size={16} className={cardMetaIcon} />
                  <span className="text-sm md:text-base">{branch.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/hotelDetails"
            className="inline-block rounded-full bg-[#2f6fb3] px-8 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#26567E] dark:bg-[#9fc0ec] dark:text-[#1f3147] dark:hover:bg-[#7ea0d6]"
          >
            Explore All Branches
          </Link>
        </div>
      </div>
    </section>
  );
}
