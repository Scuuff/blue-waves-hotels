import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Footer from "../Components/Footer";
import {
  Star,
  Search,
  ArrowUpDown,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  Edit3,
  Check,
  X,
  MessageSquare,
  Award,
  TrendingUp,
  Filter,
  ChevronLeft,
  ChevronRight,
  Send,
  User,
  Calendar,
  Quote,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { apiDelete, apiGet, apiPatch, apiPost } from "../services/apiClient";
import { homeReviews } from "../data/reviewsData";

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];
const REVIEWS_PER_PAGE = 4;
const MAX_COMMENT_LENGTH = 500;
function normalizeReview(review) {
  return {
    id: review._id ?? review.id,
    _id: review._id,
    name: review.name ?? "Anonymous Guest",
    title: review.title?.trim() || "Untitled Review",
    branch: review.branch ?? "",
    comment: review.comment ?? "",
    rating: Number(review.rating) || 0,
    date: review.createdAt
      ? new Date(review.createdAt).toISOString().split("T")[0]
      : review.date ?? new Date().toISOString().split("T")[0],
    helpful: Number(review.helpful) || 0,
    unhelpful: Number(review.unhelpful) || 0,
    verified: typeof review.verified === "boolean" ? review.verified : Boolean(review.userId),
  };
}

// Curated showcase reviews shared with the homepage, mapped to this page's
// shape. They have no server `_id`, so they are display-only (not editable or
// deletable on the backend).
const CURATED_REVIEWS = homeReviews.map((review) => ({
  id: review.id,
  _id: undefined,
  name: review.name,
  title: review.title,
  branch: review.branch,
  comment: review.text,
  rating: Number(review.rating) || 0,
  date: review.createdAt
    ? new Date(review.createdAt).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0],
  helpful: 0,
  unhelpful: 0,
  verified: Boolean(review.verified),
}));

// Merge review lists, de-duplicating by comment text so nothing repeats.
// Earlier lists win, so real (editable) API reviews take precedence.
function mergeUniqueReviews(...lists) {
  const seen = new Set();
  const merged = [];
  for (const review of lists.flat()) {
    const key = review.comment?.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push(review);
  }
  return merged;
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bg =
    type === "success"
      ? "bg-teal-600"
      : type === "error"
      ? "bg-red-600"
      : "bg-sky-600";

  return (
    <div
      className={`fixed top-6 right-6 z-50 ${bg} text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-[slideIn_0.3s_ease-out]`}
    >
      {type === "success" ? (
        <Check size={18} />
      ) : type === "error" ? (
        <X size={18} />
      ) : (
        <Sparkles size={18} />
      )}
      <span className="font-medium text-sm">{message}</span>
    </div>
  );
}

export default function ReviewRating() {
  const [reviews, setReviews] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [branch, setBranch] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRating, setFilterRating] = useState(0);
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [editComment, setEditComment] = useState("");
  const [editRating, setEditRating] = useState(0);
  const [toast, setToast] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const formRef = useRef(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type, key: Date.now() });
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadReviewData = async () => {
      try {
        const [reviewData, hotelData] = await Promise.all([
          apiGet("/reviews"),
          apiGet("/hotels").catch(() => ({ hotels: [] })),
        ]);
        if (!isMounted) return;

        const normalizedReviews = Array.isArray(reviewData)
          ? reviewData.map(normalizeReview)
          : [];

        const hotelBranches = Array.isArray(hotelData?.hotels)
          ? hotelData.hotels
              .filter((hotel) => hotel?.status !== "Inactive")
              .map((hotel) => hotel?.name?.trim())
              .filter(Boolean)
          : [];

        setReviews(mergeUniqueReviews(normalizedReviews, CURATED_REVIEWS));
        setBranchOptions([...new Set(hotelBranches)]);
      } catch (error) {
        if (isMounted) {
          setReviews(CURATED_REVIEWS);
          setBranchOptions([]);
          showToast(error.message || "Unable to load reviews right now.", "error");
        }
      } finally {
        if (isMounted) {
          setLoadingReviews(false);
        }
      }
    };

    loadReviewData();
    return () => {
      isMounted = false;
    };
  }, [showToast]);

  const average = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const ratingDistribution = useMemo(() => {
    const dist = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1] += 1;
    });
    return dist;
  }, [reviews]);

  const processedReviews = useMemo(() => {
    let result = [...reviews];

    if (filterRating > 0) {
      result = result.filter((r) => r.rating === filterRating);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.comment.toLowerCase().includes(q) ||
          (r.title && r.title.toLowerCase().includes(q))
      );
    }

    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case "highest":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "lowest":
        result.sort((a, b) => a.rating - b.rating);
        break;
      case "most-helpful":
        result.sort((a, b) => b.helpful - a.helpful);
        break;
      default:
        break;
    }

    return result;
  }, [reviews, filterRating, searchQuery, sortBy]);

  const totalPages = Math.max(1, Math.ceil(processedReviews.length / REVIEWS_PER_PAGE));
  const paginatedReviews = processedReviews.slice(
    (currentPage - 1) * REVIEWS_PER_PAGE,
    currentPage * REVIEWS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filterRating, searchQuery, sortBy]);

  async function addReview() {
    if (!name.trim() || !comment.trim() || rating === 0 || !branch) {
      showToast("Please fill in all fields, select a branch, and choose a rating.", "error");
      return;
    }

    try {
      const createdReview = await apiPost("/reviews", {
        name: name.trim(),
        title: title.trim() || "Untitled Review",
        branch,
        comment: comment.trim(),
        rating,
      });

      setReviews((prev) => [normalizeReview(createdReview), ...prev]);
      setName("");
      setTitle("");
      setBranch("");
      setComment("");
      setRating(0);
      setHover(0);
      setShowForm(false);
      showToast("Your review has been published!");
    } catch (error) {
      showToast(error.message || "Unable to publish review right now.", "error");
    }
  }

  async function deleteReview(review) {
    try {
      if (review._id) {
        await apiDelete(`/reviews/${review._id}`);
      }

      setReviews((prev) => prev.filter((r) => r.id !== review.id));
      showToast("Review deleted successfully.");
    } catch (error) {
      showToast(error.message || "Unable to delete review.", "error");
    }
  }

  function startEdit(review) {
    setEditingId(review.id);
    setEditComment(review.comment);
    setEditRating(review.rating);
  }

  async function saveEdit(review) {
    if (!editComment.trim()) return;

    try {
      if (!review._id) {
        throw new Error("This review cannot be updated.");
      }

      const updatedReview = await apiPatch(`/reviews/${review._id}`, {
        comment: editComment.trim(),
        rating: editRating,
      });

      setReviews((prev) =>
        prev.map((item) =>
          item.id === review.id ? normalizeReview(updatedReview) : item
        )
      );
      setEditingId(null);
      showToast("Review updated.");
    } catch (error) {
      showToast(error.message || "Unable to update review.", "error");
    }
  }

  function vote(id, type) {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [type]: r[type] + 1 } : r))
    );
  }

  function InteractiveStars({ value, hoverValue, onSelect, onHover, onLeave, size = 28 }) {
    return (
      <div className="flex gap-1" onMouseLeave={onLeave}>
        {[1, 2, 3, 4, 5].map((i) => {
          const active = i <= (hoverValue || value);
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(i)}
              onMouseEnter={() => onHover(i)}
              className="transition-all duration-150 hover:scale-125 focus:outline-none"
              aria-label={`${i} star`}
            >
              <Star
                size={size}
                className={
                  active
                    ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                    : "text-sky-300"
                }
              />
            </button>
          );
        })}
      </div>
    );
  }

  function StaticStars({ value, size = 18 }) {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={i <= value ? "fill-amber-400 text-amber-400" : "text-sky-300"}
          />
        ))}
      </div>
    );
  }

  function Avatar({ name: reviewName }) {
    const initials = reviewName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    const colors = [
      "bg-blue-900",
      "bg-teal-600",
      "bg-blue-800",
      "bg-teal-700",
      "bg-sky-600",
      "bg-teal-500",
      "bg-sky-500",
      "bg-blue-950",
    ];
    const color = colors[reviewName.length % colors.length];

    return (
      <div
        className={`${color} w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md`}
      >
        {initials}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-sky-50 to-teal-50 w-full">
      {toast && (
        <Toast
          key={toast.key}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(80px); }
          to { opacity: 1; transform: translateX(0); }
        }
        /* Zero-specificity reset (via :where) flattens icon-only buttons while
           still letting Tailwind bg-/border- utilities win (e.g. Publish, pager). */
        :where(.reviews-page button) {
          background-color: transparent;
          border: none;
        }
      `}</style>

      <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8 reviews-page">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-sky-100 text-teal-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-4 tracking-wide uppercase">
            <MessageSquare size={14} />
            Guest Experiences
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-blue-950 mb-3">
            Reviews &amp; Ratings
          </h1>
          <p className="text-teal-600 max-w-xl mx-auto text-lg">
            Honest feedback from our guests helps us deliver the extraordinary
            stays you deserve.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow-md border border-sky-100 p-6 flex flex-col items-center justify-center">
            <p className="text-xs font-semibold text-sky-500 uppercase tracking-widest mb-2">
              Overall Rating
            </p>
            <div className="flex items-end gap-1">
              <span className="font-serif text-6xl font-semibold text-blue-950 leading-none">
                {average}
              </span>
              <span className="text-xl text-sky-400 mb-1">/5</span>
            </div>
            <div className="mt-2">
              <StaticStars value={Math.round(Number(average))} size={22} />
            </div>
            <p className="text-sky-500 text-sm mt-2">
              {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-sky-100 p-6 col-span-1 md:col-span-2">
            <p className="text-xs font-semibold text-sky-500 uppercase tracking-widest mb-4">
              Rating Breakdown
            </p>
            <div className="space-y-2.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingDistribution[star - 1];
                const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <button
                    key={star}
                    onClick={() => setFilterRating(filterRating === star ? 0 : star)}
                    className={`flex items-center gap-3 w-full group text-left rounded-lg px-2 py-1 -mx-2 transition-colors ${
                      filterRating === star ? "bg-sky-100" : "hover:bg-sky-50"
                    }`}
                  >
                    <span className="text-sm font-medium text-blue-800 w-6 text-right">
                      {star}
                    </span>
                    <Star size={14} className="fill-amber-400 text-amber-400 shrink-0" />
                    <div className="flex-1 h-3 bg-sky-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm text-teal-600 w-14 text-right">
                      {count} ({Math.round(pct)}%)
                    </span>
                  </button>
                );
              })}
            </div>
            {filterRating > 0 && (
              <button
                onClick={() => setFilterRating(0)}
                className="mt-3 text-xs text-teal-600 hover:text-teal-800 font-medium flex items-center gap-1"
              >
                <X size={12} /> Clear filter
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            {
              icon: <Award size={20} className="text-amber-500" />,
              label: "5-Star Reviews",
              value: ratingDistribution[4],
            },
            {
              icon: <TrendingUp size={20} className="text-teal-500" />,
              label: "Recommend",
              value:
                reviews.length > 0
                  ? Math.round(
                      (reviews.filter((r) => r.rating >= 4).length / reviews.length) *
                        100
                    ) + "%"
                  : "-",
            },
            {
              icon: <ShieldCheck size={20} className="text-sky-500" />,
              label: "Verified",
              value: reviews.filter((r) => r.verified).length,
            },
            {
              icon: <ThumbsUp size={20} className="text-teal-600" />,
              label: "Helpful Votes",
              value: reviews.reduce((a, r) => a + r.helpful, 0),
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow-sm border border-sky-100 p-4 flex flex-col items-center text-center"
            >
              {stat.icon}
              <span className="text-2xl font-bold text-blue-950 mt-1">
                {stat.value}
              </span>
              <span className="text-xs text-sky-500 mt-0.5">{stat.label}</span>
            </div>
          ))}
        </div>

        <div ref={formRef} className="mb-10">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-white hover:bg-sky-50 border-2 border-dashed border-teal-300 text-teal-600 font-semibold py-5 rounded-2xl transition-colors flex items-center justify-center gap-3 text-lg"
            >
              <Edit3 size={22} />
              Share Your Experience
            </button>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-sky-100 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl font-semibold text-blue-950 flex items-center gap-2">
                  <Quote size={22} className="text-teal-500" />
                  Write a Review
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-sky-400 hover:text-teal-600 transition-colors"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-blue-900 mb-1.5">
                    <User size={14} className="inline mr-1 -mt-0.5" />
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    maxLength={50}
                    className="w-full border border-sky-200 rounded-xl px-4 py-3 text-blue-900 bg-sky-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
                    placeholder="e.g. Jane Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-blue-900 mb-1.5">
                    Review Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    maxLength={80}
                    className="w-full border border-sky-200 rounded-xl px-4 py-3 text-blue-900 bg-sky-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
                    placeholder="Summarize your experience"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-blue-900 mb-1.5">
                  Hotel Branch
                </label>
                <select
                  value={branch}
                  onChange={(event) => setBranch(event.target.value)}
                  className="w-full border border-sky-200 rounded-xl px-4 py-3 text-blue-900 bg-sky-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
                >
                  <option value="">Select a branch...</option>
                  {branchOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-blue-900 mb-1.5">
                  Your Review
                </label>
                <textarea
                  value={comment}
                  onChange={(event) => {
                    if (event.target.value.length <= MAX_COMMENT_LENGTH) {
                      setComment(event.target.value);
                    }
                  }}
                  rows="4"
                  className="w-full border border-sky-200 rounded-xl px-4 py-3 text-blue-900 bg-sky-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow resize-none"
                  placeholder="Tell us about your stay - what stood out, what could be better..."
                />
                <p
                  className={`text-xs mt-1 text-right ${
                    comment.length > MAX_COMMENT_LENGTH * 0.9 ? "text-red-500" : "text-sky-500"
                  }`}
                >
                  {comment.length}/{MAX_COMMENT_LENGTH}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-blue-900 mb-2">
                  Your Rating
                </label>
                <div className="flex items-center gap-4">
                  <InteractiveStars
                    value={rating}
                    hoverValue={hover}
                    onSelect={setRating}
                    onHover={setHover}
                    onLeave={() => setHover(0)}
                    size={32}
                  />
                  {(hover || rating) > 0 && (
                    <span className="text-sm font-medium text-blue-800 bg-sky-100 px-3 py-1 rounded-full">
                      {RATING_LABELS[hover || rating]}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={addReview}
                disabled={!name.trim() || !comment.trim() || !branch || rating === 0}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-sky-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg shadow-md shadow-teal-200"
              >
                <Send size={20} />
                Publish Review
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-sky-100 p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search reviews..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown size={16} className="text-sky-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="bg-sky-50 border border-sky-200 rounded-xl text-sm text-blue-900 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
              <option value="most-helpful">Most Helpful</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <Filter size={16} className="text-sky-400 shrink-0" />
            {[5, 4, 3, 2, 1].map((stars) => (
              <button
                key={stars}
                onClick={() => setFilterRating(filterRating === stars ? 0 : stars)}
                className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                  filterRating === stars
                    ? "bg-teal-600 text-white"
                    : "bg-sky-100 text-blue-800 hover:bg-sky-200"
                }`}
              >
                {stars}
                <Star
                  size={10}
                  className={
                    filterRating === stars
                      ? "fill-white text-white"
                      : "fill-amber-400 text-amber-400"
                  }
                />
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-teal-600 mb-4 px-1">
          Showing <span className="font-semibold text-blue-900">{processedReviews.length}</span>{" "}
          {processedReviews.length === 1 ? "review" : "reviews"}
          {filterRating > 0 && (
            <span>
              {" "}
              with <span className="font-semibold text-amber-600">{filterRating} stars</span>
            </span>
          )}
          {searchQuery.trim() && (
            <span>
              {" "}
              matching &ldquo;
              <span className="font-semibold text-teal-700">{searchQuery}</span>
              &rdquo;
            </span>
          )}
        </p>

        <div className="space-y-5">
          {loadingReviews ? (
            <div className="bg-white rounded-2xl shadow-md border border-sky-100 p-12 text-center">
              <MessageSquare size={48} className="text-sky-300 mx-auto mb-4" />
              <p className="text-sky-500 text-lg font-medium">Loading reviews...</p>
            </div>
          ) : processedReviews.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md border border-sky-100 p-12 text-center">
              <MessageSquare size={48} className="text-sky-300 mx-auto mb-4" />
              <p className="text-sky-500 text-lg font-medium">No reviews found</p>
              <p className="text-sky-500 text-sm mt-1">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            paginatedReviews.map((review) => {
              const isEditing = editingId === review.id;
              return (
                <div
                  key={review.id}
                  className="bg-white rounded-2xl shadow-md border border-sky-100 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <Avatar name={review.name} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-blue-950">{review.name}</h3>
                        {review.verified && (
                          <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                            <ShieldCheck size={12} /> Verified Guest
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {isEditing ? (
                          <InteractiveStars
                            value={editRating}
                            hoverValue={0}
                            onSelect={setEditRating}
                            onHover={() => {}}
                            onLeave={() => {}}
                            size={18}
                          />
                        ) : (
                          <StaticStars value={review.rating} />
                        )}
                        <span className="text-xs text-sky-500 flex items-center gap-1">
                          <Calendar size={11} />
                          {new Date(review.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        {review.branch && (
                          <span className="text-xs bg-sky-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                            {review.branch}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => saveEdit(review)}
                            className="p-1.5 rounded-lg text-teal-600 hover:bg-teal-50 transition-colors"
                            aria-label="Save"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 rounded-lg text-sky-400 hover:bg-sky-100 transition-colors"
                            aria-label="Cancel"
                          >
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(review)}
                            className="p-1.5 rounded-lg text-sky-400 hover:bg-sky-100 hover:text-teal-600 transition-colors"
                            aria-label="Edit"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => deleteReview(review)}
                            className="p-1.5 rounded-lg text-sky-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            aria-label="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {review.title && !isEditing && (
                    <h4 className="font-semibold text-blue-900 mt-3 text-[15px]">
                      {review.title}
                    </h4>
                  )}

                  {isEditing ? (
                    <textarea
                      value={editComment}
                      onChange={(event) => setEditComment(event.target.value)}
                      rows="3"
                      className="w-full mt-3 border border-sky-200 rounded-xl px-4 py-3 text-blue-900 bg-sky-50 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                    />
                  ) : (
                    <p className="text-blue-800 leading-relaxed mt-2 text-[15px]">
                      {review.comment}
                    </p>
                  )}

                  {!isEditing && (
                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-sky-100">
                      <span className="text-xs text-sky-500">Was this helpful?</span>
                      <button
                        onClick={() => vote(review.id, "helpful")}
                        className="flex items-center gap-1 text-xs text-teal-500 hover:text-teal-600 transition-colors"
                      >
                        <ThumbsUp size={14} />
                        <span className="font-medium">{review.helpful}</span>
                      </button>
                      <button
                        onClick={() => vote(review.id, "unhelpful")}
                        className="flex items-center gap-1 text-xs text-teal-500 hover:text-red-500 transition-colors"
                      >
                        <ThumbsDown size={14} />
                        <span className="font-medium">{review.unhelpful}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-white border border-sky-200 hover:bg-sky-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-xl text-sm font-semibold transition-colors shadow-sm ${
                  currentPage === page
                    ? "bg-teal-600 text-white"
                    : "bg-white border border-sky-200 text-blue-800 hover:bg-sky-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-white border border-sky-200 hover:bg-sky-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        <p className="text-center text-xs text-sky-500 mt-10">
          All reviews are from real guests. Verified badges indicate confirmed
          bookings through Blue waves.
        </p>
      </div>
      <Footer />
    </div>
  );
}
