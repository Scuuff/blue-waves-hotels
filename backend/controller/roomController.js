import Booking from "../models/Booking.js";
import Room from "../models/Room.js";

const escapeRegex = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildBranchMatcher = (branch = "") => {
  const baseBranch = branch.trim().replace(/\s+Branch$/i, "");
  return new RegExp(`^${escapeRegex(baseBranch)}(?:\\s+Branch)?$`, "i");
};

const normalizeDateOnly = (value) => {
  if (!value) return null;

  const rawValue = value instanceof Date ? value.toISOString() : String(value);
  const datePart = rawValue.split("T")[0];
  const parsedDate = new Date(`${datePart}T00:00:00.000Z`);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const buildStayDateKeys = (checkIn, checkOut) => {
  const keys = [];
  const current = normalizeDateOnly(checkIn);
  const end = normalizeDateOnly(checkOut);

  if (!current || !end || current >= end) {
    return keys;
  }

  while (current < end) {
    keys.push(current.toISOString().split("T")[0]);
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return keys;
};

const roomHasManualBlock = (room, dateKeys) =>
  dateKeys.some((dateKey) => room?.dateStatuses?.[dateKey] === "reserved");

const sortRooms = (rooms = [], sortBy = "") => {
  const sortedRooms = [...rooms];

  if (sortBy === "low-high") {
    sortedRooms.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
  } else if (sortBy === "high-low") {
    sortedRooms.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
  } else if (sortBy === "rating" || sortBy === "popularity") {
    sortedRooms.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
  } else {
    sortedRooms.sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  return sortedRooms;
};

const normalizeDateStatuses = (dateStatuses = {}) => {
  if (!dateStatuses || typeof dateStatuses !== "object") {
    return {};
  }

  return Object.entries(dateStatuses).reduce((accumulator, [dateKey, status]) => {
    if (!dateKey) return accumulator;

    accumulator[dateKey] = status === "reserved" ? "reserved" : "available";
    return accumulator;
  }, {});
};

const normalizeRoomPayload = (body = {}) => {
  const status =
    body.status === "Occupied" || body.status === "Maintenance"
      ? body.status
      : "Available";

  return {
    ...body,
    status,
    available: status === "Available",
    dateStatuses: normalizeDateStatuses(body.dateStatuses),
  };
};

// CREATE room
export const createRoom = async (req, res) => {
  try {
    const room = await Room.create(normalizeRoomPayload(req.body));
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET all rooms
export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET one room
export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE room
export const updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      normalizeRoomPayload(req.body),
      {
        new: true,
        runValidators: true,
      }
    );

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE room
export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET featured rooms
export const getFeaturedRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ featured: true, available: true }).limit(4);
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADMIN FILTER rooms
export const filterRooms = async (req, res) => {
  try {
    const { branch, type, available } = req.query;

    const query = {};

    if (branch) query.branch = branch;
    if (type) query.type = type;
    if (available !== undefined) query.available = available === "true";

    const rooms = await Room.find(query).sort({ createdAt: -1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// USER HOTEL LISTING SEARCH / FILTER
export const userSearchRooms = async (req, res) => {
  try {
    const {
      destination,
      branch,
      roomType,
      type,
      guests,
      maxPrice,
      rating,
      sortBy,
      checkIn,
      checkOut,
    } = req.query;

    const hasStayDates = Boolean(checkIn && checkOut);
    const query = { $and: [] };

    if (branch) {
      query.$and.push({ branch: buildBranchMatcher(branch) });
    }

    if (roomType || type) {
      const requestedType = (roomType || type).trim();
      query.$and.push({
        type: {
          $regex: `^${escapeRegex(requestedType)}$`,
          $options: "i",
        },
      });
    }

    if (guests) {
      query.$and.push({ guests: { $gte: Number(guests) } });
    }

    if (maxPrice && !Number.isNaN(Number(maxPrice))) {
      query.$and.push({ price: { $lte: Number(maxPrice) } });
    }

    if (rating) {
      query.$and.push({ rating: { $gte: Number(rating) } });
    }

    if (destination) {
      const keyword = escapeRegex(destination.trim());

      query.$and.push({
        $or: [
          { hotelName: { $regex: keyword, $options: "i" } },
          { branch: { $regex: keyword, $options: "i" } },
          { city: { $regex: keyword, $options: "i" } },
          { location: { $regex: keyword, $options: "i" } },
          { roomName: { $regex: keyword, $options: "i" } },
          { type: { $regex: keyword, $options: "i" } },
        ],
      });
    }

    if (hasStayDates) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      if (checkInDate < today || checkOutDate < today) {
        return res.status(400).json({
          message: "You cannot search using past dates",
        });
      }

      if (checkOutDate <= checkInDate) {
        return res.status(400).json({
          message: "Check-out date must be after check-in date",
        });
      }

      query.$and.push({
        status: { $nin: ["Maintenance", "maintenance"] },
      });
    } else {
      query.$and.push({
        $or: [{ available: true }, { available: { $exists: false } }],
      });
      query.$and.push({
        $or: [{ status: "Available" }, { status: { $exists: false } }],
      });
    }

    const finalQuery = query.$and.length > 0 ? query : {};
    const rooms = await Room.find(finalQuery).lean();

    if (!hasStayDates) {
      return res.status(200).json(sortRooms(rooms, sortBy));
    }

    const stayDateKeys = buildStayDateKeys(checkIn, checkOut);
    const manuallyAvailableRooms = rooms.filter(
      (room) => !roomHasManualBlock(room, stayDateKeys)
    );

    const roomIds = manuallyAvailableRooms.map((room) => String(room._id));
    const roomNames = manuallyAvailableRooms.map((room) => room.roomName).filter(Boolean);

    const overlappingBookings =
      roomIds.length > 0 || roomNames.length > 0
        ? await Booking.find({
            status: { $nin: ["cancelled", "Cancelled"] },
            checkIn: { $lt: new Date(checkOut) },
            checkOut: { $gt: new Date(checkIn) },
            $or: [
              { room: { $in: roomIds } },
              { roomId: { $in: roomIds } },
              { roomName: { $in: roomNames } },
            ],
          }).lean()
        : [];

    const bookedRoomKeys = new Set(
      overlappingBookings
        .flatMap((booking) => [
          booking?.room ? String(booking.room) : null,
          booking?.roomId ? String(booking.roomId) : null,
          booking?.roomKey ? String(booking.roomKey) : null,
          booking?.roomName || null,
        ])
        .filter(Boolean)
    );

    const availableRooms = manuallyAvailableRooms.filter(
      (room) =>
        !bookedRoomKeys.has(String(room._id)) && !bookedRoomKeys.has(room.roomName)
    );

    if (availableRooms.length === 0 && overlappingBookings.length > 0) {
      return res.status(409).json({
        message:
          "This room is reserved during the selected period. Please change the dates and try again.",
        available: false,
      });
    }

    return res.status(200).json(sortRooms(availableRooms, sortBy));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
