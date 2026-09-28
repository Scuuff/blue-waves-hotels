import { useState } from "react";
import useAdminOffers from "../hooks/useAdminOffers";
import OfferFormModal from "../Components/OfferFormModal";
import AdminSidebar from "../Components/AdminSidebar";
import AdminNavbar from "../Components/AdminNavbar";
import useAdminThemeMode from "../hooks/useAdminThemeMode";
import { getOfferExpiry, getOfferStatus, isOfferLive } from "../utils/offerStatus";

function AdminOffersPage() {
  const { darkMode } = useAdminThemeMode();
  const { offers, addOffer, deleteOffer, toggleOffer } = useAdminOffers();

  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  // Pick a gradient color for each card based on offer type
  const getCardGradient = (type) => {
    if (type === "Bundle")   return "linear-gradient(135deg, #bfdbfe, #93c5fd)";
    if (type === "Discount") return "linear-gradient(135deg, #93c5fd, #60a5fa)";
    if (type === "Package")  return "linear-gradient(135deg, #e0f2fe, #bae6fd)";
    if (type === "Seasonal") return "linear-gradient(135deg, #a5f3fc, #67e8f9)";
    return "linear-gradient(135deg, #bbf7d0, #86efac)";
  };

  // Pick a badge color based on badge text
  const getBadgeStyle = (badge) => {
    if (badge === "Most Popular")  return { background: "#f59e0b", color: "#78350f" };
    if (badge === "Limited Rooms") return { background: "#ef4444", color: "white" };
    if (badge === "Romantic")      return { background: "#ec4899", color: "white" };
    if (badge === "Weekday Deal")  return { background: "#8b5cf6", color: "white" };
    if (badge === "Summer Special")return { background: "#06b6d4", color: "white" };
    if (badge === "Family")        return { background: "#22c55e", color: "white" };
    return { background: "#1565a8", color: "white" };
  };

  return (
    <div className={`admin-theme flex h-screen ${darkMode ? "admin-theme-dark bg-gray-900 text-white" : "admin-theme-light bg-[#f5f7fb]"}`}>
      <AdminSidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar title="Offers & Deals" onToggleSidebar={() => setCollapsed(!collapsed)} />
        <div className="flex-1 overflow-y-auto">
    <div className={`min-h-full ${darkMode ? "bg-gray-900" : "bg-[#f0f7ff]"} px-6 py-8`}>

      {/* ── Page Title ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-semibold text-[#1565a8]">Offers & Deals</h1>
          <p className="text-2xl text-[#5b9bd5] mt-1">Manage, create and delete hotel offers</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#1565a8] hover:bg-[#1e40af] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          + New Offer
        </button>
      </div>

      {/* ── Stats Row ── */}
      <div className="flex flex-wrap gap-4 mb-8">

        <div className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-[#dbeafe] flex-1 min-w-[130px]">
          <div className="w-10 h-10 rounded-xl bg-[#dbeafe] flex items-center justify-center text-lg flex-shrink-0">🏷️</div>
          <div>
            <p className="text-2xl font-semibold text-[#1565a8] leading-none">{offers.length}</p>
            <p className="text-xs text-[#5b9bd5] mt-1">Total Offers</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-[#dbeafe] flex-1 min-w-[130px]">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-lg flex-shrink-0">✅</div>
          <div>
            <p className="text-2xl font-semibold text-green-700 leading-none">
              {offers.filter((o) => isOfferLive(o)).length}
            </p>
            <p className="text-xs text-[#5b9bd5] mt-1">Active Offers</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-[#dbeafe] flex-1 min-w-[130px]">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-lg flex-shrink-0">🔥</div>
          <div>
            <p className="text-2xl font-semibold text-orange-600 leading-none">
              {offers.length ? Math.max(...offers.map((o) => o.discount)) : 0}%
            </p>
            <p className="text-xs text-[#5b9bd5] mt-1">Max Discount</p>
          </div>
        </div>

      </div>

      {/* ── Offers Cards Grid ── */}
      {offers.length === 0 && (
        <div className="text-center py-20 text-[#5b9bd5]">
          No offers yet. Click "+ New Offer" to add one.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {offers.map((offer) => {
          // "active" alone is not enough — an offer past its expiry date is
          // dead even while the switch is still on. See utils/offerStatus.
          const status = getOfferStatus(offer);
          const expiry = getOfferExpiry(offer);
          return (
          <div
            key={offer._id}
            className={`bg-white rounded-2xl overflow-hidden border border-[#dbeafe] transition-opacity ${
              status !== "active" ? "opacity-70" : ""
            }`}
          >
            {/* Card Image Area */}
            <div
              className="h-32 relative flex items-center justify-center text-4xl"
              style={{ background: getCardGradient(offer.type) }}
            >
              {/* Discount Badge */}
              <span className="absolute top-2.5 right-2.5 bg-[#1565a8] text-white text-xs font-semibold px-2 py-1 rounded-lg">
                -{offer.discount}%
              </span>

              {/* Offer Badge */}
              <span
                className="absolute top-2.5 left-2.5 text-xs font-semibold px-2 py-1 rounded-full"
                style={getBadgeStyle(offer.badge)}
              >
                {offer.badge}
              </span>

              {/* Type label at bottom */}
              <span className="absolute bottom-2.5 left-2.5 text-xs bg-white/70 text-[#1e3a5f] px-2 py-0.5 rounded-full">
                {offer.type}
              </span>

              🏨
            </div>

            {/* Card Content */}
            <div className="p-4">
              <p className="text-[#1565a8] text-sm font-semibold mb-1">{offer.title}</p>
              <p className="text-[#5b9bd5] text-xs mb-3">Bundle package for unforgettable stays</p>

              <p className={`text-xs mb-3 ${status === "expired" ? "text-red-500 font-semibold" : "text-[#5b9bd5]"}`}>
                {expiry
                  ? `${status === "expired" ? "Expired" : "Expires"} ${expiry.toLocaleDateString()}`
                  : "No expiry date set"}
              </p>

              {/* Price + Status */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[#93c5fd] text-xs line-through">${offer.originalPrice}</p>
                  <p className="text-[#1565a8] text-base font-semibold">
                    ${offer.pricePerNight}
                    <span className="text-xs text-[#5b9bd5] font-normal">/night</span>
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full border ${
                  status === "active"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : status === "paused"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-red-50 text-red-600 border-red-200"
                }`}>
                  {status === "active"
                    ? "● Active"
                    : status === "paused"
                    ? "● Paused"
                    : "● Expired"}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => toggleOffer(offer._id)}
                  disabled={status === "expired"}
                  title={
                    status === "expired"
                      ? "This offer is past its expiry date. Edit the date to make it bookable again."
                      : undefined
                  }
                  className="flex-1 bg-[#dbeafe] hover:bg-[#bfdbfe] text-[#1565a8] text-xs font-semibold py-2 rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#dbeafe]"
                >
                  {status === "expired"
                    ? "⌛ Expired"
                    : offer.active
                    ? "⏸ Pause"
                    : "▶ Activate"}
                </button>
                <button
                  onClick={() => setDeleteId(offer._id)}
                  className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                >
                  🗑
                </button>
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {/* ── Delete Confirm Modal ── */}
      {deleteId && (
        <div className="fixed inset-0 bg-[#1565a8]/30 z-50 flex items-center justify-center p-5">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl border border-[#dbeafe]">
            <div className="text-4xl mb-3">⚠️</div>
            <h2 className="text-lg font-semibold text-[#1565a8] mb-2">Delete Offer?</h2>
            <p className="text-sm text-[#5b9bd5] mb-6">This action cannot be undone.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteId(null)}
                className="px-5 py-2 rounded-xl border-2 border-[#dbeafe] text-[#5b9bd5] text-sm font-semibold hover:bg-[#dbeafe] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { deleteOffer(deleteId); setDeleteId(null); }}
                className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Offer Modal ── */}
      {showForm && (
        <OfferFormModal
          onClose={() => setShowForm(false)}
          onSubmit={addOffer}
        />
      )}

    </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOffersPage;
