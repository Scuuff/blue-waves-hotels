/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as offersService from "../services/offersService";
import { apiGet } from "../services/apiClient";
import { getSafeRoomImage, normalizeRoomRecord } from "../utils/roomMedia";
import { getFallbackOffers, getFallbackRooms } from "../utils/catalogFallbacks";
import { getOfferExpiry, getOfferStatus, isOfferLive } from "../utils/offerStatus";

const OffersContext = createContext();

function getTagColor(badge = "", type = "") {
  const normalizedBadge = badge.toLowerCase();

  if (normalizedBadge.includes("popular")) return "bg-amber-400 text-amber-900";
  if (normalizedBadge.includes("limited")) return "bg-red-500 text-white";
  if (normalizedBadge.includes("romantic")) return "bg-pink-500 text-white";
  if (normalizedBadge.includes("weekday")) return "bg-blue-500 text-white";
  if (normalizedBadge.includes("summer")) return "bg-cyan-500 text-white";
  if (normalizedBadge.includes("family")) return "bg-green-500 text-white";

  switch (type) {
    case "Bundle":
      return "bg-amber-400 text-amber-900";
    case "Discount":
      return "bg-red-500 text-white";
    case "Package":
      return "bg-blue-500 text-white";
    case "Seasonal":
      return "bg-cyan-500 text-white";
    default:
      return "bg-blue-500 text-white";
  }
}

function matchRoomForOffer(offer, rooms) {
  if (!Array.isArray(rooms) || rooms.length === 0) return null;

  const requestedRoomId = String(offer.roomId || "").trim();
  if (requestedRoomId) {
    const roomMatch = rooms.find(
      (room) => String(room._id) === requestedRoomId || String(room.id) === requestedRoomId
    );
    if (roomMatch) return roomMatch;
  }

  const requestedId = String(offer.hotelId || "").trim();
  if (requestedId) {
    const exactMatch = rooms.find(
      (room) => String(room._id) === requestedId || String(room.id) === requestedId
    );
    if (exactMatch) return exactMatch;
  }

  const offerTitle = String(offer.title || "").toLowerCase();
  const offerDescription = String(offer.description || "").toLowerCase();
  const offerPrice = Number(offer.originalPrice) || Number(offer.pricePerNight) || 0;

  return (
    rooms.find((room) => {
      const roomName = String(room.roomName || "").toLowerCase();
      return (
        (offerTitle && roomName && offerTitle.includes(roomName)) ||
        (offerDescription && roomName && offerDescription.includes(roomName)) ||
        (offerPrice > 0 && Number(room.price) === offerPrice)
      );
    }) || null
  );
}

function mapToUserFormat(adminOffer, rooms) {
  const room = matchRoomForOffer(adminOffer, rooms);
  // A missing or unparseable expiry stays null so the card reads as expired
  // instead of inventing a countdown that makes dead data look bookable.
  const expiryDate = getOfferExpiry(adminOffer);

  return {
    ...adminOffer,
    id: adminOffer._id,
    status: getOfferStatus(adminOffer),
    isLive: isOfferLive(adminOffer),
    discountedPrice: Number(adminOffer.pricePerNight) || 0,
    discountPercent: Number(adminOffer.discount) || 0,
    originalPrice: Number(adminOffer.originalPrice) || 0,
    expiresAt: expiryDate ? expiryDate.toISOString() : null,
    category: adminOffer.type,
    tag: adminOffer.badge,
    tagColor: getTagColor(adminOffer.badge, adminOffer.type),
    image: room ? getSafeRoomImage(room) : getSafeRoomImage({ type: "Standard" }),
    features:
      room?.amenities?.slice(0, 4) ||
      [adminOffer.type, `${adminOffer.discount}% Off`, "Limited Time", "Book Now"],
    description:
      adminOffer.description || room?.description || "Exclusive offer available for a limited time.",
    badge: adminOffer.badge,
    roomName: room?.roomName || adminOffer.title,
    branch: room?.branch || "Blue Wave Branch",
    guests: room?.guests || 1,
    beds: room?.beds || 1,
    baths: room?.baths || 1,
    size: room?.size || 1,
    rating: room?.rating || 0,
    amenities: room?.amenities || [],
    type: room?.type || "Standard",
    roomId: room?._id || null,
  };
}

export function OffersProvider({ children }) {
  const [offers, setOffers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [offersData, roomsData] = await Promise.all([
        offersService.fetchOffers().catch(() => []),
        apiGet("/rooms").catch(() => []),
      ]);

      const normalizedOffers = Array.isArray(offersData) && offersData.length > 0
        ? offersData
        : getFallbackOffers();
      const normalizedRooms = Array.isArray(roomsData) && roomsData.length > 0
        ? roomsData.map(normalizeRoomRecord)
        : getFallbackRooms();

      setOffers(normalizedOffers);
      setRooms(normalizedRooms);
      setError(null);
    } catch {
      setOffers(getFallbackOffers());
      setRooms(getFallbackRooms());
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refreshOffers = async () => {
    await loadData();
  };

  const addOffer = async (newOffer) => {
    try {
      const discount = Number(newOffer.discount);
      const originalPrice = Number(newOffer.originalPrice);
      const pricePerNight = Math.round(originalPrice * (1 - discount / 100));

      const created = await offersService.createOffer({
        ...newOffer,
        discount,
        originalPrice,
        pricePerNight,
      });
      await refreshOffers();
      return created;
    } catch (err) {
      console.error("Failed to create offer:", err.message);
      throw err;
    }
  };

  const deleteOffer = async (id) => {
    try {
      await offersService.deleteOffer(id);
      await refreshOffers();
    } catch (err) {
      console.error("Failed to delete offer:", err.message);
      throw err;
    }
  };

  const toggleOffer = async (id) => {
    try {
      await offersService.toggleOffer(id);
      await refreshOffers();
    } catch (err) {
      console.error("Failed to toggle offer:", err.message);
      throw err;
    }
  };

  const mappedOffers = useMemo(
    () => offers.map((offer) => mapToUserFormat(offer, rooms)),
    [offers, rooms]
  );

  return (
    <OffersContext.Provider
      value={{ offers, mappedOffers, loading, error, addOffer, deleteOffer, toggleOffer }}
    >
      {children}
    </OffersContext.Provider>
  );
}

export function useOffers() {
  return useContext(OffersContext);
}
