import React, { useEffect, useState } from "react";
import { MapPin, Calendar, Users, Bed, AlertTriangle, XCircle, X, Loader2 } from "lucide-react";
import { getMyBookings, cancelMyBooking } from "../services/ProfileApi";
import { useUser } from "../Context/UserContext";
import { getSafeRoomImage } from "../utils/roomMedia";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isUpcoming(booking) {
  if (String(booking.status || "").toLowerCase() === "cancelled") return false;
  if (!booking.checkOut) return false;
  return new Date(booking.checkOut) >= new Date();
}

function CancelModal({ booking, onConfirm, onClose, isCancelling }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100">
        <div className="flex items-start gap-4">
          <div className="bg-red-50 p-2.5 rounded-xl flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 text-lg">Cancel Booking?</h3>
            <p className="text-gray-500 text-sm mt-1">
              Are you sure you want to cancel your booking for{" "}
              <span className="font-semibold text-gray-700">{booking.roomName}</span>?
            </p>
            <div className="bg-gray-50 rounded-xl p-3 mt-3 text-sm text-gray-600">
              <p><span className="font-medium">Check-in:</span> {formatDate(booking.checkIn)}</p>
              <p><span className="font-medium">Branch:</span> {booking.branch}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isCancelling}
            className="flex-1 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Keep Booking
          </button>

          <button
            onClick={onConfirm}
            disabled={isCancelling}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isCancelling ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                Yes, Cancel
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function BookingCard({ booking, onCancelled, onProfileRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const bookingImage = getSafeRoomImage({
    image: booking.image,
    type: booking.roomName?.includes("Penthouse")
      ? "Penthouse"
      : booking.roomName?.includes("Suite")
        ? "Suite"
        : booking.roomName?.includes("Deluxe")
          ? "Deluxe"
          : "Standard",
  });

  const handleCancel = async () => {
    try {
      setIsCancelling(true);
      await cancelMyBooking(booking._id || booking.id);
      setShowModal(false);
      onCancelled();
      if (onProfileRefresh) {
        onProfileRefresh().catch((err) =>
          console.error("Failed to refresh profile after cancel:", err)
        );
      }
    } catch (err) {
      console.error("Failed to cancel booking:", err);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-48 h-40 sm:h-auto relative overflow-hidden flex-shrink-0">
            <img
              src={bookingImage}
              alt={booking.roomName || "Room"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.currentTarget.src = getSafeRoomImage({});
              }}
            />
          </div>

          <div className="flex-1 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-800 text-base leading-tight">
                    {booking.roomName || "Room Booking"}
                  </h3>
                  <p className="text-gray-500 text-sm flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {booking.branch || "No branch"}
                  </p>
                </div>
                <span className="bg-teal-50 text-teal-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider whitespace-nowrap border border-teal-100">
                  Upcoming
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="bg-blue-50 p-1.5 rounded-lg">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 leading-none">Check-in</p>
                    <p className="font-medium text-gray-700 text-xs">{formatDate(booking.checkIn)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="bg-teal-50 p-1.5 rounded-lg">
                    <Calendar className="w-3.5 h-3.5 text-teal-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 leading-none">Check-out</p>
                    <p className="font-medium text-gray-700 text-xs">{formatDate(booking.checkOut)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="bg-sky-50 p-1.5 rounded-lg">
                    <Users className="w-3.5 h-3.5 text-sky-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 leading-none">Guests</p>
                    <p className="font-medium text-gray-700 text-xs">
                      {booking.guests} guest{booking.guests > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <Bed className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {booking.roomName} · {booking.nights} nights
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-semibold">Total Price</p>
                <p className="font-bold text-slate-800 text-lg">
                  ${Number(booking.total || 0).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setShowModal(true)}
                className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border border-red-100"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <CancelModal
          booking={booking}
          onConfirm={handleCancel}
          onClose={() => setShowModal(false)}
          isCancelling={isCancelling}
        />
      )}
    </>
  );
}

export default function UpcomingStays() {
  const { refreshUser } = useUser();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await getMyBookings();
      setBookings(Array.isArray(data) ? data.filter(isUpcoming) : []);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  if (loading) {
    return <div className="text-center py-10 text-slate-500">Loading upcoming stays...</div>;
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-teal-50 p-2 rounded-xl border border-teal-100">
            <Calendar className="w-4 h-4 text-teal-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Upcoming Stays</h2>
            <p className="text-xs text-gray-500">
              {bookings.length} booking{bookings.length !== 1 ? "s" : ""} scheduled
            </p>
          </div>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <div className="bg-gray-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-600 mb-1">No upcoming stays</h3>
          <p className="text-gray-400 text-sm">Book your next adventure and it'll appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              onCancelled={loadBookings}
              onProfileRefresh={refreshUser}
            />
          ))}
        </div>
      )}
    </div>
  );
}
