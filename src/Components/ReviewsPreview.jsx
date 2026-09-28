import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Star, CheckCircle, Quote, MapPin, Sparkles } from "lucide-react";
import { apiGet } from "../services/apiClient";
import HeadingDivider from "./HeadingDivider";
import { homeReviews } from "../data/reviewsData";

// Drop placeholder/low-effort API entries so the marquee only shows
// substantive, genuine-looking reviews alongside the curated collection.
function isGenuineReview(review) {
  const name = review.name?.trim();
  const title = review.title?.trim();
  const text = review.text?.trim() ?? "";
  return (
    Boolean(name) &&
    name !== "Anonymous Guest" &&
    Boolean(title) &&
    title !== "Untitled Review" &&
    text.length >= 12
  );
}

function normalizeReview(review = {}) {
  return {
    id: review._id ?? review.id,
    name: review.name ?? "Anonymous Guest",
    title: review.title?.trim() || "Untitled Review",
    text: review.comment ?? "",
    branch: review.branch ?? "",
    rating: Number(review.rating) || 0,
    verified:
      typeof review.verified === "boolean" ? review.verified : Boolean(review.userId),
    createdAt: review.createdAt || review.date || new Date().toISOString(),
  };
}

function formatReviewTime(value) {
  const reviewDate = new Date(value);
  const now = new Date();
  const diffMs = now - reviewDate;

  if (Number.isNaN(reviewDate.getTime()) || diffMs < 0) {
    return "Recently";
  }

  const day = 1000 * 60 * 60 * 24;
  const days = Math.floor(diffMs / day);

  if (days < 7) {
    return days <= 1 ? "1 day ago" : `${days} days ago`;
  }

  const weeks = Math.floor(days / 7);
  if (weeks < 5) {
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return months === 1 ? "1 month ago" : `${months} months ago`;
  }

  const years = Math.floor(days / 365);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}

function avatarUrl(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=15273f&color=9fc0ec&bold=true`;
}

function ReviewCard({ review }) {
  return (
    <article className="group relative flex w-[300px] shrink-0 flex-col overflow-hidden rounded-3xl border border-[#9fc0ec]/15 bg-gradient-to-br from-[#15273f] to-[#0c1828] p-6 shadow-[0_12px_45px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#9fc0ec]/40 hover:shadow-[0_20px_60px_rgba(15,40,80,0.5)] sm:w-[340px]">
      {/* Decorative quote watermark */}
      <Quote
        size={64}
        className="pointer-events-none absolute -right-1 top-3 fill-[#9fc0ec]/[0.07] text-transparent"
      />

      <div className="relative flex items-center gap-3">
        <img
          src={avatarUrl(review.name)}
          alt={review.name}
          className="h-12 w-12 rounded-full object-cover ring-2 ring-[#9fc0ec]/30 ring-offset-2 ring-offset-[#0f1f33]"
        />

        <div className="min-w-0">
          <h3 className="truncate font-semibold text-white">{review.name}</h3>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-white/50">
            <span className="inline-flex items-center gap-1">
              {review.branch && <MapPin size={12} className="text-[#9fc0ec]" />}
              {review.branch || "Guest Review"}
            </span>
            <span className="h-1 w-1 rounded-full bg-white/30" />
            <span>{formatReviewTime(review.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            size={15}
            className={
              index < review.rating
                ? "fill-[#f4b400] text-[#f4b400]"
                : "text-white/20"
            }
          />
        ))}
      </div>

      <h4 className="mt-4 text-lg font-semibold text-white">{review.title}</h4>

      <p className="mt-2 flex-1 text-sm leading-7 text-white/65">{review.text}</p>

      {review.verified && (
        <div className="mt-5 flex items-center gap-2 border-t border-white/5 pt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            <CheckCircle size={13} />
            Verified Stay
          </span>
        </div>
      )}
    </article>
  );
}

function ReviewsRow({ reviews, direction }) {
  // Duplicate the cards so the -50% shift loops seamlessly.
  const loopReviews = [...reviews, ...reviews];
  // Scale duration with card count so the px/second speed stays consistent.
  const duration = Math.max(reviews.length * 9, 28);

  return (
    <div className="overflow-hidden">
      <div
        className={`reviews-marquee ${
          direction === "right"
            ? "reviews-marquee--right"
            : "reviews-marquee--left"
        } gap-6 pr-6`}
        style={{ "--marquee-duration": `${duration}s` }}
      >
        {loopReviews.map((review, index) => (
          <ReviewCard key={`${review.id}-${index}`} review={review} />
        ))}
      </div>
    </div>
  );
}

export default function ReviewsPreview() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadReviews = async () => {
      try {
        const data = await apiGet("/reviews");
        if (!isMounted) return;

        const normalized = Array.isArray(data) ? data.map(normalizeReview) : [];
        setReviews(normalized.filter(isGenuineReview));
      } catch (error) {
        if (isMounted) {
          console.error("Unable to load homepage reviews:", error.message);
          setReviews([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadReviews();
    return () => {
      isMounted = false;
    };
  }, []);

  // Merge genuine user reviews with the curated collection, de-duplicating by
  // comment text so no card ever repeats, then order newest-first.
  const displayedReviews = useMemo(() => {
    const seen = new Set();
    const merged = [];

    for (const review of [...reviews, ...homeReviews]) {
      const key = review.text?.trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      merged.push(review);
    }

    return merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [reviews]);

  const [topRow, bottomRow] = useMemo(() => {
    const half = Math.ceil(displayedReviews.length / 2);
    return [displayedReviews.slice(0, half), displayedReviews.slice(half)];
  }, [displayedReviews]);

  const averageRating = useMemo(() => {
    if (displayedReviews.length === 0) return "0.0";
    const total = displayedReviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / displayedReviews.length).toFixed(1);
  }, [displayedReviews]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#f6f9fd] via-[#edf4fb] to-[#f6f9fd] px-6 py-24 dark:from-[#0a1420] dark:via-[#0d1b2c] dark:to-[#0a1420] md:px-10 lg:px-16">
      {/* Ambient blue glows */}
      <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-[#9fc0ec]/20 blur-3xl dark:bg-[#9fc0ec]/10" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[#3b6fae]/10 blur-3xl dark:bg-[#3b6fae]/15" />

      <div className="relative mx-auto max-w-[1800px]">
        {/* Heading */}
        <div className="text-center">
          <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.35em] text-[#2f6fb3] dark:text-[#9fc0ec]">
            <Sparkles size={16} />
            Testimonials
          </p>

          <h2 className="mt-4 font-serif text-4xl font-semibold text-[#16283c] dark:text-white dark:drop-shadow-[0_2px_25px_rgba(159,192,236,0.3)] md:text-5xl">
            Guest Reviews
          </h2>

          <HeadingDivider />

          <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-[#26567E]/15 bg-white/70 px-5 py-2.5 backdrop-blur-xl dark:border-[#9fc0ec]/15 dark:bg-white/5">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  size={18}
                  className={
                    index < Math.round(averageRating)
                      ? "fill-[#f4b400] text-[#f4b400]"
                      : "text-[#16283c]/20 dark:text-white/25"
                  }
                />
              ))}
            </div>
            <span className="text-lg font-bold text-[#16283c] dark:text-white">{averageRating}</span>
            <span className="h-1 w-1 rounded-full bg-[#16283c]/25 dark:bg-white/30" />
            <span className="text-sm text-[#3c5068] dark:text-white/60">
              {displayedReviews.length.toLocaleString()} verified
              {displayedReviews.length === 1 ? " review" : " reviews"}
            </span>
          </div>
        </div>

        {/* Reviews marquee — two opposite-direction infinite rows */}
        {loading ? (
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="h-[280px] animate-pulse rounded-3xl border border-white/10 bg-gradient-to-br from-[#15273f] to-[#0c1828]"
              />
            ))}
          </div>
        ) : displayedReviews.length > 0 ? (
          <div className="reviews-marquee-group relative mt-14 flex flex-col gap-6">
            {/* Edge fade masks for a premium, seamless look.
                The negative offsets pull each mask out into the section's own
                horizontal padding, so the solid end of the gradient sits over
                empty margin and only a short tail reaches the cards - same
                fade, just further from the review content. */}
            <div className="pointer-events-none absolute inset-y-0 -left-6 z-10 w-14 bg-gradient-to-r from-[#edf4fb] to-transparent dark:from-[#0d1b2c] md:-left-10 md:w-24 lg:-left-16 lg:w-28" />
            <div className="pointer-events-none absolute inset-y-0 -right-6 z-10 w-14 bg-gradient-to-l from-[#edf4fb] to-transparent dark:from-[#0d1b2c] md:-right-10 md:w-24 lg:-right-16 lg:w-28" />

            <ReviewsRow reviews={topRow} direction="left" />
            {bottomRow.length > 0 && (
              <ReviewsRow reviews={bottomRow} direction="right" />
            )}
          </div>
        ) : (
          <div className="mt-14 rounded-3xl border border-[#26567E]/15 bg-white/70 p-10 text-center text-[#3c5068] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-white/65">
            No reviews yet. Be the first guest to share your experience.
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            to="/reviews"
            className="inline-flex items-center gap-2 rounded-full bg-[#2f6fb3] px-8 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#26567E] dark:bg-[#9fc0ec] dark:text-[#0c1828] dark:hover:bg-[#7ea0d6]"
          >
            Load More Reviews
          </Link>
        </div>
      </div>
    </section>
  );
}

