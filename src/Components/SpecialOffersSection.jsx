import { Link } from "react-router-dom";
import { useMemo } from "react";
import { ArrowRight, MapPin, Sparkles, Star } from "lucide-react";
import { useOffers } from "../Context/OffersContext";
import { isOfferLive } from "../utils/offerStatus";
import {
  cardAmenityPill,
  cardButton,
  cardButtonShimmer,
  cardEyebrow,
  cardImageScrim,
  cardMetaIcon,
  cardPrice,
  cardPriceStrike,
  cardPriceUnit,
  cardRatingPill,
  cardShell,
  cardTitle,
} from "./cardSystem";
import { amenityIcon } from "../utils/amenityIcons";
import HeadingDivider from "./HeadingDivider";

// Palette: navy (deep background) · dark-blue #26567E (card surfaces) ·
// light-blue #96D0F2 (accents/highlights)

// Bento placement per card index (matches the reference: two big splits,
// then compact / wide-split / compact). Extra cards fall back to a split.
// How many offers this homepage preview shows. The Offers page shows them all.
const PREVIEW_COUNT = 5;

const WIDE = { variant: "split", span: "lg:col-span-5" };
const FULL = { variant: "split", span: "lg:col-span-10" };
const FEATURE = { variant: "split", span: "lg:col-span-6" };
const COMPACT = { variant: "compact", span: "lg:col-span-2" };

// The grid is 10 columns wide. Build a tile list that always fills each row,
// alternating a pair of wide cards with a compact/feature/compact row, so any
// number of offers lays out cleanly instead of leaving a ragged gap.
// A fixed 5-slot array used to cap this section, which meant offers on the
// Offers page could silently go missing here.
function buildBentoLayout(count) {
  const tiles = [];
  let placed = 0;
  let pairRow = true;

  while (placed < count) {
    const remaining = count - placed;

    if (remaining === 1) {
      tiles.push(FULL);
      placed += 1;
    } else if (remaining === 2 || pairRow) {
      tiles.push(WIDE, WIDE);
      placed += 2;
    } else {
      tiles.push(COMPACT, FEATURE, COMPACT);
      placed += 3;
    }
    pairRow = !pairRow;
  }

  return tiles;
}

const DiscountBadge = ({ percent }) =>
  percent > 0 ? (
    <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#1d3252] backdrop-blur-md">
      -{percent}%
    </div>
  ) : null;

const AmenityRow = ({ features }) => (
  <div className="flex flex-wrap gap-2">
    {features.slice(0, 3).map((feature) => {
      const Icon = amenityIcon(feature);
      return (
        <span key={feature} className={cardAmenityPill}>
          <Icon size={13} className={cardMetaIcon} />
          {feature}
        </span>
      );
    })}
  </div>
);

const SplitCard = ({ offer }) => (
  <Link
    to="/offers"
    className={`${cardShell} relative flex flex-col lg:flex-row`}
  >
    <div className="relative h-44 shrink-0 overflow-hidden lg:h-full lg:w-1/2">
      <img
        src={offer.image}
        alt={offer.title}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className={cardImageScrim} />
      <DiscountBadge percent={offer.discountPercent} />
    </div>

    <div className="flex flex-1 flex-col justify-center gap-4 p-6 lg:w-1/2">
      <div>
        <p className={cardEyebrow}>{offer.branch}</p>
        <h3 className={cardTitle}>{offer.title}</h3>
      </div>

      {offer.features?.length > 0 && <AmenityRow features={offer.features} />}

      <div className="mt-auto flex items-center justify-between pt-2">
        <div className="flex items-baseline gap-2">
          {offer.originalPrice > offer.discountedPrice && (
            <span className={cardPriceStrike}>${offer.originalPrice}</span>
          )}
          <span className={cardPrice}>${offer.discountedPrice}</span>
          <span className={cardPriceUnit}>/night</span>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#28415f] text-white transition-all duration-300 group-hover:bg-[#182c46]">
          <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </div>
    </div>
  </Link>
);

const CompactCard = ({ offer }) => (
  <Link
    to="/offers"
    className={`${cardShell} relative block h-72 lg:h-full`}
  >
    <img
      src={offer.image}
      alt={offer.title}
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-[#081019] via-[#0c1828]/40 to-transparent" />
    <DiscountBadge percent={offer.discountPercent} />

    <div className="absolute inset-x-0 bottom-0 p-5">
      <h3 className="font-serif text-xl font-semibold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">
        {offer.title}
      </h3>
      <div className="mt-1 flex items-center gap-1.5 text-xs text-white/70">
        <MapPin size={13} className={cardMetaIcon} />
        <span>{offer.branch}</span>
      </div>
    </div>
  </Link>
);

function ratingLabel(rating) {
  if (rating >= 4.5) return "Overwhelmingly Positive";
  if (rating >= 4) return "Very Positive";
  if (rating >= 3) return "Mostly Positive";
  if (rating > 0) return "Mixed";
  return "New Offer";
}

// Steam-style detail popup that pops open over the card on hover.
const OfferHoverPanel = ({ offer }) => (
  <Link
    to="/offers"
    aria-hidden="true"
    tabIndex={-1}
    className="pointer-events-none absolute left-1/2 top-1/2 z-50 hidden w-[340px] -translate-x-1/2 -translate-y-1/2 scale-95 opacity-0 transition-all duration-300 ease-out group-hover/offer:pointer-events-auto group-hover/offer:scale-100 group-hover/offer:opacity-100 group-hover/offer:delay-150 lg:block"
  >
    <div className={cardShell}>
      <div className="relative h-40 w-full overflow-hidden">
        <img src={offer.image} alt={offer.title} className="h-full w-full object-cover" />
        <div className={cardImageScrim} />
      </div>

      <div className="space-y-3 p-5">
        <p className={cardEyebrow}>{offer.branch}</p>
        <h3 className={cardTitle}>{offer.title}</h3>

        <div className="flex items-center gap-2 text-sm">
          <span className={cardRatingPill}>
            <Star size={14} className="fill-amber-400 text-amber-400" />
            {offer.rating > 0 ? offer.rating.toFixed(1) : "New"}
          </span>
          <span className="text-slate-500 dark:text-white/55">
            {ratingLabel(offer.rating)}
          </span>
        </div>

        {offer.features?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {offer.features.slice(0, 4).map((feature) => (
              <span key={feature} className={cardAmenityPill}>
                {feature}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-baseline gap-2">
            {offer.originalPrice > offer.discountedPrice && (
              <span className={cardPriceStrike}>${offer.originalPrice}</span>
            )}
            <span className={cardPrice}>${offer.discountedPrice}</span>
            <span className={cardPriceUnit}>/night</span>
          </div>
          <span className={`${cardButton} inline-flex items-center gap-1.5 px-4 py-2 text-xs`}>
            <span className={cardButtonShimmer} />
            View Offer
            <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </div>
  </Link>
);

const SkeletonCard = ({ span }) => (
  <div
    className={`h-72 animate-pulse rounded-[28px] border border-[#e9eff6] bg-slate-100 dark:border-white/10 dark:bg-[#0f1f33] lg:h-auto ${span}`}
  />
);

export default function SpecialOffersPreview() {
  const { mappedOffers, loading } = useOffers();

  // A 5-offer preview of the Offers page — same source, same live filter, so
  // these are always current; the cap is just how many the section shows.
  const featuredOffers = useMemo(
    () => mappedOffers.filter((offer) => isOfferLive(offer)).slice(0, PREVIEW_COUNT),
    [mappedOffers]
  );

  const bentoLayout = useMemo(
    () => buildBentoLayout(featuredOffers.length),
    [featuredOffers.length]
  );

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#f6f9fd] via-[#edf4fb] to-[#f6f9fd] px-6 py-24 dark:from-[#0a1420] dark:via-[#0d1b2c] dark:to-[#0a1420] md:px-10 lg:px-16">
      {/* Ambient blue glows */}
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-[#96D0F2]/20 blur-3xl dark:bg-[#96D0F2]/12" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[#26567E]/10 blur-3xl dark:bg-[#26567E]/40" />

      <div className="relative mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.35em] text-[#2f6fb3] dark:text-[#96D0F2]">
            <Sparkles size={16} />
            Exclusive Offers
          </p>
          <h2 className="mt-4 font-serif text-4xl font-semibold text-[#16283c] dark:text-white dark:drop-shadow-[0_2px_25px_rgba(150,208,242,0.35)] md:text-5xl">
            Offers Worth Discovering
          </h2>
          <HeadingDivider />
          <p className="mt-6 text-base leading-8 text-[#3c5068] dark:text-white/70 md:text-lg">
            Explore curated deals for opulent escapes and unique branch experiences.
          </p>
        </div>

        {/* Bento grid */}
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-10 lg:auto-rows-[19rem]">
          {loading ? (
            buildBentoLayout(PREVIEW_COUNT).map((cfg, index) => (
              <SkeletonCard key={index} span={cfg.span} />
            ))
          ) : featuredOffers.length > 0 ? (
            featuredOffers.map((offer, index) => {
              const cfg = bentoLayout[index] || WIDE;
              const isCompact = cfg.variant === "compact";
              const Card = isCompact ? CompactCard : SplitCard;
              // The hover popup is only for the small (compact) cards; the wide
              // (split) cards stay static with no floating preview.
              return (
                <div
                  key={offer.id}
                  className={
                    isCompact
                      ? `group/offer relative transition-[z-index] hover:z-50 ${cfg.span}`
                      : cfg.span
                  }
                >
                  <Card offer={offer} />
                  {isCompact && <OfferHoverPanel offer={offer} />}
                </div>
              );
            })
          ) : (
            <div className="col-span-full rounded-3xl border border-[#26567E]/15 bg-white/70 p-10 text-center text-[#3c5068] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-white/65">
              No offers available right now.
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/offers"
            className="inline-flex items-center gap-2 rounded-full bg-[#2f6fb3] px-8 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#26567E] dark:bg-[#96D0F2] dark:text-[#0c1828] dark:hover:bg-white"
          >
            View All Offers
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
