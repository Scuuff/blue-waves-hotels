import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import mongoose from "mongoose";
import ProfileInfo from "../models/ProfileInfo.js";
import { appendProfileActivity } from "./profileController.js";
import { isMailConfigured, sendBookingConfirmationEmail } from "../utils/mailer.js";
const MAX_BOOKING_SNAPSHOTS = 20;

function buildConfirmationCode() {
  return `BW-${Date.now().toString(36).toUpperCase()}`;
}

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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

const canUseObjectId = (value) =>
  !!value && mongoose.Types.ObjectId.isValid(String(value));

const getBookingRoomId = (booking = {}) => booking?.roomId || booking?.room || booking?.roomKey || null;

const isCancelledStatus = (value) => String(value || "").toLowerCase() === "cancelled";

const buildRequestedBookingConditions = ({
  roomId,
  roomName,
  branch,
  roomType,
}) => {
  const conditions = [];
  const trimmedRoomName = String(roomName || "").trim();
  const trimmedBranch = String(branch || "").trim();
  const trimmedRoomId = String(roomId || "").trim();
  const trimmedRoomType = String(roomType || "").trim();

  if (trimmedRoomId) {
    if (canUseObjectId(trimmedRoomId)) {
      conditions.push({ room: trimmedRoomId }, { roomId: trimmedRoomId });
    } else {
      conditions.push({ roomKey: trimmedRoomId });
    }
  }

  if (trimmedRoomName) {
    const exactRoomName = new RegExp(`^${escapeRegex(trimmedRoomName)}$`, "i");
    conditions.push({ roomName: exactRoomName });
  }

  if (trimmedBranch) {
    conditions.push({ branch: buildBranchMatcher(trimmedBranch) });
  }

  if (trimmedRoomType) {
    conditions.push({ roomType: new RegExp(`^${escapeRegex(trimmedRoomType)}$`, "i") });
  }

  return conditions;
};

const enrichBookingsWithRoomData = async (bookings = []) => {
  const roomIds = [...new Set(
    bookings
      .map((booking) => getBookingRoomId(booking))
      .filter((roomId) => canUseObjectId(roomId))
  )];

  if (roomIds.length === 0) {
    return bookings;
  }

  const rooms = await Room.find({ _id: { $in: roomIds } }).lean();
  const roomMap = new Map(rooms.map((room) => [String(room._id), room]));

  return bookings.map((booking) => {
    const resolvedRoomId = getBookingRoomId(booking);
    const room = resolvedRoomId ? roomMap.get(String(resolvedRoomId)) : null;

    return {
      ...booking,
      roomId: resolvedRoomId || "",
      image: booking.image || room?.image || "",
      branch: booking.branch || room?.branch || "",
      roomName: booking.roomName || room?.roomName || "",
      guests: booking.guests || room?.guests || 1,
      price: booking.price ?? room?.price ?? 0,
    };
  });
};

async function updateProfileBookingStats(userId) {
  const bookings = await Booking.find({ userId }).sort({ createdAt: -1 }).lean();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const snapshots = bookings.map((booking) => {
    const checkOut = booking?.checkOut ? new Date(booking.checkOut) : null;
    const status =
      isCancelledStatus(booking?.status)
        ? "cancelled"
        : checkOut && !Number.isNaN(checkOut.getTime()) && checkOut < today
          ? "completed"
          : "upcoming";

    const nights =
      Number(booking?.nights) ||
      Math.max(
        1,
      Math.ceil(
          (new Date(booking?.checkOut || Date.now()) - new Date(booking?.checkIn || Date.now())) /
            (1000 * 60 * 60 * 24)
        )
      );

    return {
      bookingId: booking._id,
      roomId: getBookingRoomId(booking) || "",
      roomName: booking.roomName || "",
      hotelName: booking.hotelName || "Blue Wave Hotel",
      branch: booking.branch || "",
      city: booking.city || "",
      location: booking.location || "",
      image: booking.image || "",
      roomType: booking.roomType || "",
      beds: Number(booking.beds) || 1,
      baths: Number(booking.baths) || 1,
      size: Number(booking.size) || 1,
      description: booking.description || "",
      amenities: Array.isArray(booking.amenities) ? booking.amenities : [],
      bookedBy: {
        name: booking.name || "",
        email: booking.email || "",
        phone: booking.phone || "",
      },
      confirmationCode: booking.confirmationCode || "",
      pricePerNight: Number(booking.price) || 0,
      checkIn: booking.checkIn || null,
      checkOut: booking.checkOut || null,
      guests: Number(booking.guests) || 1,
      nights,
      total: Number(booking.total ?? booking.price ?? 0),
      status,
      rawBookingStatus: booking.status || "confirmed",
      statusDetails: {
        bookedAt: booking.createdAt || new Date(),
        cancelledAt: booking.cancelledAt || null,
        completedAt: status === "completed" ? checkOut || booking.updatedAt || null : null,
        lastUpdatedAt: booking.updatedAt || booking.createdAt || new Date(),
      },
      bookedAt: booking.createdAt || new Date(),
    };
  });

  const totalBooked = snapshots.length;
  const totalCancelled = snapshots.filter((booking) => booking.status === "cancelled").length;
  const totalCompleted = snapshots.filter((booking) => booking.status === "completed").length;
  const upcomingStays = snapshots
    .filter((booking) => booking.status === "upcoming")
    .slice(0, MAX_BOOKING_SNAPSHOTS);
  const bookingHistory = snapshots
    .filter((booking) => booking.status === "completed" || booking.status === "cancelled")
    .slice(0, MAX_BOOKING_SNAPSHOTS);

  return ProfileInfo.findOneAndUpdate(
    { userId },
    {
      $setOnInsert: { userId },
      $set: {
        bookingStats: {
          totalBooked,
          totalCancelled,
          totalCompleted,
        },
        upcomingStays,
        bookingHistory,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    }
  );
}

// CREATE
export const createBooking = async (req, res) => {
  try {
    const {
      roomId,
      room: roomField,
      name,
      email,
      phone,
      roomKey: incomingRoomKey,
      ...bookingBody
    } = req.body;
    const resolvedRoomId = roomId || roomField;
    let roomKey = String(incomingRoomKey || resolvedRoomId || "").trim();

    console.log("createBooking payload:", {
      userId: req.user?.userId,
      roomId,
      roomField,
      resolvedRoomId,
      name,
      email,
      phone,
      checkIn: req.body?.checkIn,
      checkOut: req.body?.checkOut,
      nights: req.body?.nights,
      total: req.body?.total,
    });

    if (!name || !email || !phone) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let room = null;

    if (resolvedRoomId) {
      if (mongoose.Types.ObjectId.isValid(resolvedRoomId)) {
        room = await Room.findById(resolvedRoomId);
      } else {
        const roomLookup = {};
        if (bookingBody.roomName) {
          roomLookup.roomName = new RegExp(
            `^${escapeRegex(String(bookingBody.roomName).trim())}$`,
            "i"
          );
        }
        if (bookingBody.branch) {
          roomLookup.branch = new RegExp(
            `^${escapeRegex(String(bookingBody.branch).trim())}$`,
            "i"
          );
        }

        room = Object.keys(roomLookup).length > 0 ? await Room.findOne(roomLookup) : null;
      }

      if (room && !roomKey) {
        roomKey = String(room._id);
      }
    }

    const booking = await Booking.create({
      name,
      email,
      phone,
      ...bookingBody,
      room: room?._id || undefined,
      roomKey: roomKey || room?._id?.toString() || "",
      confirmationCode: req.body.confirmationCode || buildConfirmationCode(),
      image: bookingBody.image || room?.image || "",
      hotelName: bookingBody.hotelName || room?.hotelName || "Blue Wave Hotel",
      branch: bookingBody.branch || room?.branch || "",
      city: bookingBody.city || room?.city || "",
      location: bookingBody.location || room?.location || "",
      roomName: bookingBody.roomName || room?.roomName || "",
      roomType: bookingBody.roomType || room?.type || "",
      beds: bookingBody.beds || room?.beds || 1,
      baths: bookingBody.baths || room?.baths || 1,
      size: bookingBody.size || room?.size || 1,
      description: bookingBody.description || room?.description || "",
      amenities: bookingBody.amenities || room?.amenities || [],
      guests: bookingBody.guests || room?.guests || 1,
      price: bookingBody.price ?? room?.price ?? 0,
      userId: req.user?.userId,
    });

    console.log("createBooking saved:", {
      bookingId: String(booking._id),
      userId: String(booking.userId || ""),
      roomId: String(booking.roomId || booking.room || ""),
      branch: booking.branch,
      roomName: booking.roomName,
      total: booking.total,
    });

    // Confirmation email — fired only after the paid booking is saved.
    // Fire-and-forget: a mail failure must never fail a successful booking.
    if (isMailConfigured()) {
      sendBookingConfirmationEmail(booking)
        .then(() =>
          console.log(`Booking confirmation email sent to ${booking.email} (${booking.confirmationCode})`)
        )
        .catch((mailError) =>
          console.error("Booking confirmation email failed:", mailError.message)
        );
    } else {
      console.warn("Booking confirmation email skipped — MAIL_USER/MAIL_PASS not configured.");
    }

    if (req.user?.userId) {
      await Promise.all([
        updateProfileBookingStats(req.user.userId),
        appendProfileActivity(req.user.userId, {
          type: "booking_created",
          title: "Booking created",
          description: `${booking.roomName || "Room"} at ${booking.branch || "Blue Wave Branch"} was booked.`,
          metadata: {
            bookingId: booking._id,
            confirmationCode: booking.confirmationCode || "",
            hotelName: booking.hotelName || "",
            roomName: booking.roomName || "",
            branch: booking.branch || "",
            city: booking.city || "",
            location: booking.location || "",
            roomType: booking.roomType || "",
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            nights: booking.nights || 1,
            total: booking.total ?? booking.price ?? 0,
          },
        }),
      ]);
    }

    res.status(201).json(booking);
  } catch (error) {
    console.error("createBooking failed:", error?.name, error?.message, error?.errors || "");
    res.status(500).json({ message: error.message });
  }
};

// SEARCH AVAILABILITY
export const searchAvailability = async (req, res) => {
  try {
    const { branch, roomType, roomId, roomName, checkIn, checkOut, guests } = req.body;

    if ((!branch && !roomId && !roomName) || !checkIn || !checkOut || !guests) {
      return res.status(400).json({
        message: "Room details, check-in, check-out, and guests are required",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({
        message: "Invalid date format",
      });
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

    const guestNumber = Number(guests);

    if (!Number.isFinite(guestNumber) || guestNumber < 1) {
      return res.status(400).json({
        message: "Guests must be a valid number",
      });
    }

    // For future-date searches, rely on booking overlap and manual date blocks.
    // "Occupied" is a current state and should not hide a room that is free on the selected dates.
    const roomQuery = {
      guests: { $gte: guestNumber },
      status: { $nin: ["Maintenance", "maintenance"] },
    };

    if (roomId && mongoose.Types.ObjectId.isValid(roomId)) {
      roomQuery._id = roomId;
    } else if (roomName && roomName.trim() !== "") {
      roomQuery.roomName = new RegExp(`^${escapeRegex(roomName.trim())}$`, "i");
      if (branch) {
        roomQuery.branch = buildBranchMatcher(branch);
      }
    } else if (branch) {
      roomQuery.branch = buildBranchMatcher(branch);
    }

    if (roomType && roomType.trim() !== "") {
      roomQuery.type = new RegExp(`^${escapeRegex(roomType.trim())}$`, "i");
    }

    const stayDateKeys = buildStayDateKeys(checkInDate, checkOutDate);
    const requestedBookingConditions = buildRequestedBookingConditions({
      roomId,
      roomName,
      branch,
      roomType,
    });

    console.log("Incoming search body:", {
      branch,
      roomType,
      roomId,
      roomName,
      checkIn,
      checkOut,
      guests,
    });

    console.log("Room query:", roomQuery);

    const bookingQuery = {
      status: { $nin: ["cancelled", "Cancelled"] },
      checkIn: { $lt: checkOutDate },
      checkOut: { $gt: checkInDate },
    };

    const matchingRooms = await Room.find(roomQuery);
    console.log("Matching rooms found:", matchingRooms.length);

    const manuallyAvailableRooms = matchingRooms.filter(
      (room) => !roomHasManualBlock(room, stayDateKeys)
    );

    const overlapConditions =
      manuallyAvailableRooms.length > 0
        ? [
            {
              room: {
                $in: manuallyAvailableRooms.map((room) => String(room._id)),
              },
            },
            {
              roomId: {
                $in: manuallyAvailableRooms.map((room) => String(room._id)),
              },
            },
            {
              roomName: {
                $in: manuallyAvailableRooms.map((room) => room.roomName),
              },
            },
          ]
        : requestedBookingConditions;

    const overlappingBookings = overlapConditions.length
      ? await Booking.find({
          ...bookingQuery,
          $or: overlapConditions,
        })
      : [];

    const bookedRoomKeys = new Set(
      overlappingBookings.flatMap((booking) => [
        getBookingRoomId(booking) ? String(getBookingRoomId(booking)) : null,
        booking.roomName || null,
      ]).filter(Boolean)
    );
    const availableRooms = manuallyAvailableRooms.filter(
      (room) =>
        !bookedRoomKeys.has(String(room._id)) &&
        !bookedRoomKeys.has(room.roomName)
    );

    console.log("Overlapping bookings found:", overlappingBookings.length);
    console.log("Matching bookings:", overlappingBookings);

    if (availableRooms.length === 0) {
      if (overlappingBookings.length > 0) {
        return res.status(409).json({
          message:
            "This room is already reserved for the selected dates. Please choose different dates.",
          available: false,
        });
      }

      return res.status(404).json({
        message: "Selected dates are unavailable for this room.",
        available: false,
      });
    }

    return res.status(200).json({
      message: "Dates are available",
      available: true,
      data: {
        branch,
        roomType,
        checkIn,
        checkOut,
        guests,
      },
      rooms: availableRooms,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL
export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "firstName email")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ONE
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("userId", "firstName email");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE
export const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate("userId", "firstName email");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.userId }).lean().sort({
      createdAt: -1,
    });

    const enrichedBookings = await enrichBookingsWithRoomData(bookings);

    res.status(200).json(enrichedBookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelMyBooking = async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.userId,
      },
      { status: "Cancelled", cancelledAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await Promise.all([
      updateProfileBookingStats(req.user.userId),
      appendProfileActivity(req.user.userId, {
        type: "booking_cancelled",
        title: "Booking cancelled",
        description: `${booking.roomName || "Room"} at ${booking.branch || "Blue Wave Branch"} was cancelled.`,
        metadata: {
          bookingId: booking._id,
          confirmationCode: booking.confirmationCode || "",
          hotelName: booking.hotelName || "",
          roomName: booking.roomName || "",
          branch: booking.branch || "",
          city: booking.city || "",
          location: booking.location || "",
          roomType: booking.roomType || "",
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          total: booking.total ?? booking.price ?? 0,
        },
      }),
    ]);

    res.status(200).json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
