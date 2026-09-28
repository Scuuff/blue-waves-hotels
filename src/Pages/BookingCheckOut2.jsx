
import Navbar from "../Components/Navbar";
import PaymentForm from "../Components/PaymentForm";
import RoomDetails from "../Components/RoomDetails";
import BookingCard from "../Components/BookingCard";
import { useState } from "react";
import axios from "axios";
import { calculateNights, calculateTotal } from "../hooks/useBookingpayment";

export default function RoomBooking(){

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [nights, setNights] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleCheckAvailability = async () => {

  if (!checkIn || !checkOut) {
    alert("Please select both dates.");
    return;
  }

  const calculatedNights = calculateNights(checkIn, checkOut);

  if (calculatedNights <= 0) {
    alert("Check-out must be after check-in.");
    return;
  }

  setLoading(true);
  try {
    // Call backend API to verify availability
    const response = await axios.post("/api/bookings/search", {
      branch: "Sharm El Sheikh Branch", // Update based on room data
      roomName: "Standered Room",
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      guests: 2,
    });

    if (response.data.available) {
      const calculatedTotal = calculateTotal(calculatedNights);
      setNights(calculatedNights);
      setTotal(calculatedTotal);
      alert(`Room is available for ${calculatedNights} nights`);
    }
  } catch (error) {
    alert(error.response?.data?.message || "Error checking availability. Please try again.");
  } finally {
    setLoading(false);
  }
};

  return(
    <>
      <Navbar />

      <div className="pt-40 flex justify-center w-full">

        <div className="grid grid-cols-2 gap-10 max-w-7xl w-full px-10">

          {/* LEFT */}
          <div className="space-y-6">

            <RoomDetails />

            <BookingCard
              checkIn={checkIn}
              checkOut={checkOut}
              setCheckIn={setCheckIn}
              setCheckOut={setCheckOut}
              onCheckAvailability={handleCheckAvailability}
              isLoading={loading}
            />

          </div>

          {/* RIGHT */}
          <div className="space-y-6">

            <div>

              <div className="flex items-center gap-3 mt-2">
                <span className="bg-[#5F7F8A] text-white text-sm px-3 py-1 rounded-full">
                  Standered
                </span>

                <span className="text-yellow-500">
                  ⭐ ⭐ ⭐ 
                </span>

                <span className="text-gray-500 text-sm">
                  (120 reviews)
                </span>
              </div>

              <h2 className="text-3xl font-semibold">
                Standered Room
              </h2>

              <p className="text-gray-600 mt-3">
                Comfortable room with modern design, cozy bed, and essential amenities for a relaxing stay.
              </p>

              <div className="grid grid-cols-2 gap-3 mt-6 text-gray-600">
                <p>✔ WiFi</p>
                <p>✔ Air Conditioning</p>
                <p>✔ TV</p>
                <p>✔ Private Bathroom</p>
                <p>✔ Room Service</p>
                
              </div>

            </div>

            <PaymentForm nights={nights} total={total} />

          </div>

        </div>

      </div>
    </>
  );
}
