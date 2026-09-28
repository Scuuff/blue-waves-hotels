import hotels, { branchDetails } from "../data/hotels.js";
import { offersData } from "../data/offersData";
import { getSafeRoomImage, normalizeRoomRecord } from "./roomMedia";
import { slugifyBranchName } from "./hotelBranches";

export function getFallbackRooms() {
  return hotels.map((room) => normalizeRoomRecord(room));
}

export function getFallbackBranches() {
  return branchDetails.map((branch, index) => ({
    _id: branch.slug || index + 1,
    id: branch.slug || index + 1,
    slug: branch.slug || slugifyBranchName(branch.title),
    title: branch.title,
    name: branch.title,
    hotelName: "Blue Wave Hotel",
    city: branch.title.replace(" Branch", ""),
    address: "",
    location: branch.title.replace(" Branch", ""),
    destination: branch.title.replace(" Branch", ""),
    description: branch.description,
    image: branch.image,
    fallbackImage: branch.image,
    imagePosition: branch.imagePosition || "center",
    badge: branch.badge,
    features: Array.isArray(branch.features) ? branch.features : [],
    amenities: Array.isArray(branch.features) ? branch.features : [],
    status: "Active",
    rating: 0,
    phone: "Phone not available",
    email: "Email not available",
  }));
}

function findRoomForOffer(offer, rooms) {
  if (!Array.isArray(rooms) || rooms.length === 0) return null;

  const requestedRoomId = String(offer.roomId || "").trim();
  if (requestedRoomId) {
    const directMatch = rooms.find(
      (room) => String(room._id) === requestedRoomId || String(room.id) === requestedRoomId
    );
    if (directMatch) return directMatch;
  }

  const requestedHotelId = String(offer.hotelId || "").trim();
  if (requestedHotelId) {
    const directMatch = rooms.find(
      (room) => String(room._id) === requestedHotelId || String(room.id) === requestedHotelId
    );
    if (directMatch) return directMatch;
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

export function getFallbackOffers() {
  const rooms = getFallbackRooms();

  return offersData.map((offer) => {
    const room = findRoomForOffer(offer, rooms);

    return {
      ...offer,
      _id: offer.id,
      id: offer.id,
      active: true,
      discountedPrice: Number(offer.discountedPrice) || 0,
      discountPercent: Number(offer.discountPercent) || 0,
      originalPrice: Number(offer.originalPrice) || 0,
      expiryDate: offer.expiresAt,
      expiresAt: offer.expiresAt,
      category: offer.category,
      tag: offer.tag,
      tagColor: offer.tagColor,
      image: room ? room.image : getSafeRoomImage({ type: "Standard" }),
      features: Array.isArray(offer.features) ? offer.features : [],
      description:
        offer.description || room?.description || "Exclusive offer available for a limited time.",
      roomName: room?.roomName || offer.title,
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
  });
}
