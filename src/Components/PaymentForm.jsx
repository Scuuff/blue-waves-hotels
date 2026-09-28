import React from "react";
import { useNavigate } from "react-router-dom";

const CLEANING_FEE = 100;
const TAXES = 240;

export default function PaymentForm({ room, nights, total, checkIn, checkOut }) {
  const navigate = useNavigate();

  const roomPrice = Number(room?.price) || 0;
  const originalPrice =
    Number(room?.originalPrice) > roomPrice ? Number(room.originalPrice) : 0;
  const guestCount = Number(room?.guests) || 1;
  const roomSubtotal = nights > 0 ? nights * roomPrice : 0;

  const handleProceed = () => {
    if (!nights || nights <= 0) {
      alert("Please select your dates first to calculate total cost.");
      return;
    }

    if (!room?.roomName || !roomPrice) {
      alert("Room information is missing.");
      return;
    }

    const pendingBooking = {
      room,
      nights,
      total,
      checkIn,
      checkOut,
      branch: room?.branch || "",
      guests: room?.guests || 1,
    };

    sessionStorage.setItem("pendingBooking", JSON.stringify(pendingBooking));
    navigate("/payment", { state: { room, nights, total, checkIn, checkOut } });
  };

  return (
    <div className="w-full max-w-[600px] rounded-xl bg-[#edf7ff] p-6 shadow-lg dark:bg-[#0f1f33] dark:text-white/85 dark:ring-1 dark:ring-white/10">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          {originalPrice > 0 && (
            <span className="text-sm text-gray-400 line-through dark:text-white/40">
              ${originalPrice.toFixed(2)}
            </span>
          )}
          <span className="text-2xl font-bold dark:text-white">${roomPrice.toFixed(2)}</span>
          <span className="text-sm text-gray-500 dark:text-white/55">/ night</span>
        </div>

        <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-white/65">
          {`Max ${guestCount} ${guestCount === 1 ? "guest" : "guests"}`}
        </span>
      </div>

      <hr className="mb-4 dark:border-white/10" />

      <div className="space-y-2 text-sm">
        {originalPrice > 0 && (
          <div className="flex justify-between text-[#1e3a8a] dark:text-[#9fc0ec]">
            <span>Offer discount</span>
            <span>-{Number(room?.discountPercent || 0)}%</span>
          </div>
        )}

        {nights > 0 && (
          <div className="flex justify-between">
            <span>{nights} nights at ${roomPrice}/night</span>
            <span>${roomSubtotal.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span>Cleaning fee</span>
          <span>${CLEANING_FEE.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span>Taxes</span>
          <span>${TAXES.toFixed(2)}</span>
        </div>

        <hr className="dark:border-white/10" />

        <div className="flex justify-between text-lg font-bold dark:text-white">
          <span>Total Cost</span>
          <span>${Number(total || 0).toFixed(2)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleProceed}
        className="mt-4 w-full rounded-xl bg-[#1e3a8a] py-3 text-white transition hover:bg-[#17306e] dark:bg-[#2f6fb3] dark:hover:bg-[#26567E]"
      >
        Pay
      </button>
    </div>
  );
}
