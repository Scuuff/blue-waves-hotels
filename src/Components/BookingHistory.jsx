import React, { useEffect, useState } from "react";
import { MapPin, Calendar, Users, Bed, History, Loader2 } from "lucide-react";
import { getMyBookings } from "../services/ProfileApi";
import { getSafeRoomImage } from "../utils/roomMedia";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getBookingViewStatus(booking) {
  if (String(booking.status || "").toLowerCase() === "cancelled") return "cancelled";

  if (booking.checkOut && new Date(booking.checkOut) < new Date()) {
    return "completed";
  }

  return "upcoming";
}

function HistoryCard({ booking }) {
  const isCancelled = getBookingViewStatus(booking) === "cancelled";
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

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${
        isCancelled ? "border-red-100" : "border-gray-100"
      }`}
    >
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-36 h-32 sm:h-auto relative overflow-hidden flex-shrink-0">
          <img
            src={bookingImage}
            alt={booking.roomName || "Room"}
            className={`w-full h-full object-cover ${isCancelled ? "grayscale opacity-60" : ""}`}
            onError={(e) => {
              e.currentTarget.src = getSafeRoomImage({});
            }}
          />
        </div>

        <div className="flex-1 p-4 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3
                className={`font-bold text-sm leading-tight ${
                  isCancelled ? "text-gray-500" : "text-brand-navy"
                }`}
              >
                {booking.roomName || "Room Booking"}
              </h3>

              <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" /> {booking.branch || "No branch"}
              </p>

              <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                <Bed className="w-3 h-3" /> {booking.roomName || "Room"}
              </p>
            </div>

            <span
              className={
                isCancelled
                  ? "bg-red-50 text-red-500 border border-red-100 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider"
                  : "bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider"
              }
            >
              {isCancelled ? "Cancelled" : "Completed"}
            </span>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(booking.checkIn)} – {formatDate(booking.checkOut)}
              </span>

              <span className="hidden sm:flex items-center gap-1">
                <Users className="w-3 h-3" />
                {booking.guests || 1} guest{booking.guests > 1 ? "s" : ""}
              </span>
            </div>

            <p
              className={`font-bold text-sm mt-0.5 ${
                isCancelled ? "text-gray-400 line-through" : "text-brand-navy"
              }`}
            >
              ${Number(booking.total || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setIsLoading(true);
        setProfileError("");

        const data = await getMyBookings();
        const allBookings = Array.isArray(data) ? data : [];

        const pastBookings = allBookings.filter((booking) => {
          const status = getBookingViewStatus(booking);
          return status === "completed" || status === "cancelled";
        });

        setBookings(pastBookings);
      } catch (error) {
        setProfileError(error.message || "Failed to load booking history");
      } finally {
        setIsLoading(false);
      }
    };

    loadBookings();
  }, []);

  const completed = bookings.filter(
    (booking) => getBookingViewStatus(booking) === "completed"
  );
  const cancelled = bookings.filter(
    (booking) => getBookingViewStatus(booking) === "cancelled"
  );

  const totalSpent = completed.reduce(
    (sum, booking) => sum + Number(booking.total || 0),
    0
  );

  if (isLoading) {
    return (
      <div className="py-16 flex items-center justify-center gap-3 text-slate-500">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Loading booking history...</span>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-brand-navy/8 p-2 rounded-xl">
          <History className="w-4 h-4 text-brand-navy" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-brand-navy">Booking History</h2>
          <p className="text-xs text-gray-500">
            {bookings.length} past booking{bookings.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {profileError ? (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {profileError}
        </div>
      ) : null}

      {bookings.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-brand-blue/5 border border-brand-blue/10 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-brand-blue">{completed.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Completed</p>
          </div>

          <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-red-400">{cancelled.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Cancelled</p>
          </div>

          <div className="bg-teal-50 border border-teal-100 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-brand-teal">
              ${totalSpent.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Total Spent</p>
          </div>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <div className="bg-gray-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <History className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-600 mb-1">No booking history</h3>
          <p className="text-gray-400 text-sm">Your completed trips will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <HistoryCard key={booking._id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}
