const ROOM_TYPE_FALLBACK_IMAGES = {
  Standard: "/Images/Standard.jpg",
  Deluxe: "/Images/Deluxe.jpg",
  Suite: "/Images/Suite.jpg",
  Penthouse: "/Images/Penthouse1.jpg",
};

export function getRoomFallbackImage(room = {}) {
  return ROOM_TYPE_FALLBACK_IMAGES[room.type] || ROOM_TYPE_FALLBACK_IMAGES.Standard;
}

export function getSafeRoomImage(room = {}) {
  const image = typeof room.image === "string" ? room.image.trim() : "";

  if (!image) return getRoomFallbackImage(room);
  if (image.startsWith("/images/")) {
    return `/Images/${image.slice("/images/".length)}`;
  }
  if (
    image.startsWith("/") ||
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:")
  ) {
    return image;
  }

  return `/Images/${image}`;
}

export function normalizeRoomRecord(room = {}) {
  const status = room.status || (room.available ? "Available" : "Occupied");
  const image = getSafeRoomImage(room);

  return {
    _id: room._id || room.id,
    id: room._id || room.id,
    hotelId: room.hotelId || room.branch || room.hotelName || "",
    hotelName: room.hotelName || "Blue Wave Hotel",
    roomName: room.roomName || room.name || "Room",
    name: room.name || room.roomName || "Room",
    branch: room.branch || "",
    city: room.city || "",
    location: room.location || "",
    type: room.type || "Standard",
    price: Number(room.price) || 0,
    rating: Number(room.rating) || 0,
    guests: Number(room.guests) || 1,
    beds: Number(room.beds) || 1,
    baths: Number(room.baths) || 1,
    size: Number(room.size) || 1,
    available: status === "Available",
    status,
    featured: !!room.featured,
    image,
    amenities: Array.isArray(room.amenities) ? room.amenities : [],
    description:
      room.description ||
      `${room.type || "Standard"} room in ${room.branch || "our hotel"}.`,
    dateStatuses: room.dateStatuses || {},
  };
}
