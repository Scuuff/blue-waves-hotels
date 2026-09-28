import Navbar from "../Components/Navbar";
import PaymentForm from "../Components/PaymentForm";
import RoomDetails from "../Components/RoomDetails";
import BookingCard from "../Components/BookingCard";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

import { calculateNights, calculateTotal } from "../hooks/useBookingpayment";
import { apiGet } from "../services/apiClient";
import { normalizeRoomRecord } from "../utils/roomMedia";

function mergeOfferIntoRoom(baseRoom = {}, sourceRoom = {}) {
  const normalizedBase = normalizeRoomRecord(baseRoom);
  const offerPrice = Number(sourceRoom?.discountedPrice || sourceRoom?.price);
  const originalPrice = Number(sourceRoom?.originalPrice);

  if (!offerPrice || !originalPrice || offerPrice >= originalPrice) {
    return normalizedBase;
  }

  return {
    ...normalizedBase,
    price: offerPrice,
    discountedPrice: offerPrice,
    originalPrice,
    discountPercent: Number(sourceRoom?.discountPercent) || 0,
    offerBadge: sourceRoom?.offerBadge || "",
    offerTitle: sourceRoom?.offerTitle || "",
  };
}

export default function RoomBooking() {
  const location = useLocation();
  const roomFromNavigation = location.state?.room || location.state?.selectedRoom;

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [nights, setNights] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [roomLoading, setRoomLoading] = useState(false);
  const [availabilityModal, setAvailabilityModal] = useState({
    open: false,
    title: "",
    message: "",
  });
  const [room, setRoom] = useState(
    roomFromNavigation ? normalizeRoomRecord(roomFromNavigation) : null
  );

  const roomId = useMemo(
    () => roomFromNavigation?._id || roomFromNavigation?.id,
    [roomFromNavigation]
  );

  useEffect(() => {
    if (!roomFromNavigation) {
      setRoom(null);
      return;
    }

    setRoom(mergeOfferIntoRoom(roomFromNavigation, roomFromNavigation));
  }, [roomFromNavigation]);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      if (!roomId) return;

      try {
        setRoomLoading(true);
        const latestRoom = await apiGet(`/rooms/${roomId}`);
        setRoom(mergeOfferIntoRoom(latestRoom, roomFromNavigation));
      } catch (error) {
        console.error("Failed to load room details:", error.message);
      } finally {
        setRoomLoading(false);
      }
    };

    fetchRoomDetails();
  }, [roomId, roomFromNavigation]);

  if (!room && roomLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a1420]">
        <p className="pt-40 text-center text-xl dark:text-white">Loading room details...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a1420]">
        <p className="pt-40 text-center text-xl dark:text-white">No room selected</p>
      </div>
    );
  }

  const closeAvailabilityModal = () => {
    setAvailabilityModal({ open: false, title: "", message: "" });
  };

  const showAvailabilityModal = (title, message) => {
    setAvailabilityModal({
      open: true,
      title,
      message,
    });
  };

  const handleCheckAvailability = async () => {
    if (!checkIn || !checkOut) {
      showAvailabilityModal("Missing Dates", "Please select both check-in and check-out dates.");
      return;
    }

    const calculatedNights = calculateNights(checkIn, checkOut);

    if (calculatedNights <= 0) {
      showAvailabilityModal("Invalid Dates", "Check-out must be after check-in.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/api/bookings/search", {
        roomId: room._id || room.id,
        branch: room.branch || room.city,
        roomName: room.roomName,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        guests: room.guests || 1,
      });

      if (response.data.available) {
        const calculatedTotal = calculateTotal(calculatedNights, room.price);
        setNights(calculatedNights);
        setTotal(calculatedTotal);
        showAvailabilityModal(
          "Room Available",
          `This room is available for ${calculatedNights} nights.`
        );
      }
    } catch (error) {
      const status = error.response?.status;
      const backendMessage =
        error.response?.data?.message ||
        "Error checking availability. Please try again.";

      showAvailabilityModal(
        status === 409 || status === 404 ? "Room Unavailable" : "Availability Check Failed",
        backendMessage
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="flex min-h-screen w-full justify-center bg-white pb-16 pt-40 dark:bg-[#0a1420]">
        <div className="grid w-full max-w-7xl gap-10 px-10 lg:grid-cols-2">
          <div className="space-y-6">
            <RoomDetails room={room} />

            <BookingCard
              checkIn={checkIn}
              checkOut={checkOut}
              setCheckIn={setCheckIn}
              setCheckOut={setCheckOut}
              onCheckAvailability={handleCheckAvailability}
              isLoading={loading}
            />
          </div>

          <div className="space-y-6">
            <div>
              <div className="mt-2 flex items-center gap-3">
                <span className="rounded-full bg-[#1e3a8a] px-3 py-1 text-sm text-white">
                  {room.type}
                </span>

                {room.discountPercent > 0 && (
                  <span className="rounded-full bg-[#dbeafe] px-3 py-1 text-sm text-[#1e3a8a]">
                    -{room.discountPercent}% offer
                  </span>
                )}

                <span className="text-yellow-500">* {room.rating}</span>

                <span className="text-sm text-gray-500 dark:text-white/50">
                  ({Math.floor(room.rating * 30)} reviews)
                </span>
              </div>

              <h2 className="text-3xl font-semibold dark:text-white">{room.roomName}</h2>

              <p className="mt-3 text-gray-600 dark:text-white/65">
                {room.description ||
                  `${room.type} room in ${room.city} with capacity for ${room.guests} guests.`}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 text-gray-600 dark:text-white/65">
                {(room.amenities || []).map((item, index) => (
                  <p key={`${item}-${index}`}>- {item}</p>
                ))}
              </div>
            </div>

            <PaymentForm
              room={room}
              nights={nights}
              total={total}
              checkIn={checkIn}
              checkOut={checkOut}
            />
          </div>
        </div>
      </div>

      {availabilityModal.open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-[#0f1f33] dark:ring-1 dark:ring-white/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6b7280] dark:text-white/55">
                  Booking Check
                </p>
                <h3 className="mt-1 text-2xl font-bold text-[#1e3a8a] dark:text-[#9fc0ec]">
                  {availabilityModal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeAvailabilityModal}
                className="rounded-full px-2 py-1 text-2xl leading-none text-gray-400 hover:text-gray-700"
                aria-label="Close popup"
              >
                &times;
              </button>
            </div>

            <div className="mt-5 rounded-2xl bg-[#f8fbff] p-4 text-sm leading-6 text-gray-700 dark:bg-[#15273f] dark:text-white/70">
              {availabilityModal.message}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={closeAvailabilityModal}
                className="rounded-xl bg-[#1e3a8a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#17306e]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

