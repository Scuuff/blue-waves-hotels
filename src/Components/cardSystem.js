// ---------------------------------------------------------------------------
// Shared card design system.
//
// Every room / offer / branch card on the site is built from these tokens, so
// there is exactly one place that defines card colour, radius, shadow,
// typography and spacing. The values are taken from the hotel listing card,
// which is the canonical design.
//
// Rule: never hardcode a card colour in a page or section component. If a card
// needs a new part, add a token here so every surface picks it up.
// ---------------------------------------------------------------------------

// Outer shell: white in light mode, deep navy in dark, soft lifted shadow.
export const cardShell =
  "group h-full overflow-hidden rounded-[28px] border border-[#e9eff6] bg-white " +
  "shadow-[0_10px_30px_rgba(20,40,70,0.08)] transition-shadow duration-300 " +
  "hover:shadow-[0_24px_50px_rgba(20,40,70,0.16)] " +
  "dark:border-white/10 dark:bg-[#0f1f33] dark:shadow-none";

// Same shell for cards that are a link/flex column rather than a motion.div.
export const cardShellColumn = `${cardShell} flex flex-col`;

// Media well.
export const cardMedia = "relative overflow-hidden";
export const cardImage =
  "h-[260px] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105";
export const cardImageScrim =
  "pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent";

// Pill badges that sit on the image.
const badgeBase =
  "absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] backdrop-blur-md";
export const badgeAvailable = `${badgeBase} bg-emerald-50/95 text-emerald-700`;
export const badgeBooked = `${badgeBase} bg-red-50/95 text-red-600`;
// Neutral variant for category labels (Deluxe, Suite, Resort, offer type...).
export const badgeNeutral = `${badgeBase} bg-white/90 text-[#1d3252]`;

// Round icon button on the image (favourite heart).
export const cardIconButton =
  "absolute right-4 top-4 rounded-full bg-white/90 p-2.5 shadow backdrop-blur-md";

// Body.
export const cardBody = "p-5";
export const cardBodyColumn = "flex flex-1 flex-col p-5";

// Typography.
export const cardEyebrow =
  "text-[11px] font-bold uppercase tracking-[0.22em] text-gold-600 dark:text-gold-300";
export const cardTitle =
  "mt-1 font-serif text-2xl font-semibold text-[#1d3252] dark:text-white";
export const cardMetaText =
  "mt-2 flex items-center gap-1 text-sm text-slate-500 dark:text-white/55";
export const cardMetaIcon = "text-gold-500";
// Brand-blue accent icon, matching the Prime Location section. Used where an
// icon is the tile's focal point rather than a small inline meta marker.
export const cardAccentIcon = "text-[#2f6fb3] dark:text-[#9fc0ec]";
export const cardDescription =
  "mt-2 text-sm leading-relaxed text-slate-500 dark:text-white/55";

// Rating chip.
export const cardRatingPill =
  "flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-sm font-semibold text-amber-600 dark:bg-amber-400/10 dark:text-amber-300";

// Amenity chips.
export const cardAmenityRow = "mt-4 flex flex-wrap gap-2";
export const cardAmenityPill =
  "inline-flex items-center gap-1.5 rounded-full border border-[#e3ebf4] bg-[#f6f9fc] px-3 py-1 text-xs text-[#33507a] " +
  "dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70";

// Spec strip (beds / baths / guests).
export const cardSpecRow =
  "mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-dashed border-[#e3ebf4] pt-4 text-sm text-slate-600 " +
  "dark:border-white/10 dark:text-white/65";
export const cardSpecItem = "flex items-center gap-1.5";

// Price.
export const cardPrice =
  "font-serif text-3xl font-semibold text-[#1d3252] dark:text-white";
export const cardPriceUnit =
  "font-sans text-sm font-normal text-slate-500 dark:text-white/55";
export const cardPriceStrike =
  "text-sm line-through text-slate-400 dark:text-white/40";

// Footer row holding price + action.
export const cardFooter = "mt-6 flex items-center justify-between";

// Primary action button (navy gradient with a gold shimmer sweep).
export const cardButton =
  "group/btn relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#28415f] to-[#182c46] " +
  "px-5 py-3 font-medium text-white transition-transform duration-200 hover:-translate-y-0.5 active:scale-95 " +
  "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0";
export const cardButtonShimmer =
  "pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gold-300/25 to-transparent transition-transform duration-700 ease-out group-hover/btn:translate-x-full";

// Quieter text action ("View Room ->").
export const cardLinkAction =
  "inline-flex items-center gap-2 text-sm font-semibold text-[#28415f] transition-colors duration-300 hover:text-[#182c46] dark:text-gold-300 dark:hover:text-white";
