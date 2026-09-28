import bcrypt from "bcryptjs";
import User from "../models/User.js";
import ProfileInfo from "../models/ProfileInfo.js";
import Booking from "../models/Booking.js";

const USER_PROFILE_FIELDS = ["firstName", "lastName", "email", "phone"];
const PROFILE_INFO_FIELDS = [
  "countryCode",
  "address",
  "city",
  "country",
  "dob",
  "avatar",
  "bio",
];
const MAX_ACTIVITY_HISTORY = 50;
const MAX_BOOKING_SNAPSHOTS = 20;
const isCancelledStatus = (value) => String(value || "").toLowerCase() === "cancelled";

function getBookingSnapshotStatus(booking) {
  if (isCancelledStatus(booking?.status)) {
    return "cancelled";
  }

  const checkOut = booking?.checkOut ? new Date(booking.checkOut) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkOut && !Number.isNaN(checkOut.getTime()) && checkOut < today) {
    return "completed";
  }

  return "upcoming";
}

function buildBookingSnapshot(booking) {
  const snapshotStatus = getBookingSnapshotStatus(booking);
  const checkOutDate = booking?.checkOut ? new Date(booking.checkOut) : null;
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
    roomId: booking.roomId || "",
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
    status: snapshotStatus,
    rawBookingStatus: booking.status || "confirmed",
    statusDetails: {
      bookedAt: booking.createdAt || new Date(),
      cancelledAt: booking.cancelledAt || null,
      completedAt: snapshotStatus === "completed" ? checkOutDate || booking.updatedAt || null : null,
      lastUpdatedAt: booking.updatedAt || booking.createdAt || new Date(),
    },
    bookedAt: booking.createdAt || new Date(),
  };
}

function mergeProfileResponse(user, profileInfo) {
  return {
    _id: user._id,
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: profileInfo?.updatedAt || user.updatedAt,
    countryCode: profileInfo?.countryCode ?? "+20",
    address: profileInfo?.address ?? "",
    city: profileInfo?.city ?? "",
    country: profileInfo?.country ?? "",
    dob: profileInfo?.dob ?? "",
    avatar: profileInfo?.avatar ?? "",
    bio: profileInfo?.bio ?? "",
    bookingStats: profileInfo?.bookingStats ?? {
      totalBooked: 0,
      totalCancelled: 0,
      totalCompleted: 0,
    },
    upcomingStays: profileInfo?.upcomingStays ?? [],
    bookingHistory: profileInfo?.bookingHistory ?? [],
    activityHistory: profileInfo?.activityHistory ?? [],
  };
}

async function ensureProfileInfo(userId) {
  let profileInfo = await ProfileInfo.findOne({ userId });

  if (!profileInfo) {
    profileInfo = await ProfileInfo.create({ userId });
  }

  return profileInfo;
}

async function syncProfileOwnerInfo(user) {
  return ProfileInfo.findOneAndUpdate(
    { userId: user._id },
    {
      $setOnInsert: { userId: user._id },
      $set: {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        email: user.email || "",
        phone: user.phone || "",
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    }
  );
}

async function syncProfileBookingStats(userId) {
  const bookings = await Booking.find({ userId }).sort({ createdAt: -1 }).lean();
  const snapshots = bookings.map(buildBookingSnapshot);
  const upcomingStays = snapshots
    .filter((booking) => booking.status === "upcoming")
    .slice(0, MAX_BOOKING_SNAPSHOTS);
  const bookingHistory = snapshots
    .filter((booking) => booking.status === "completed" || booking.status === "cancelled")
    .slice(0, MAX_BOOKING_SNAPSHOTS);
  const totalBooked = snapshots.length;
  const totalCancelled = snapshots.filter((booking) => booking.status === "cancelled").length;
  const totalCompleted = snapshots.filter((booking) => booking.status === "completed").length;

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

export async function appendProfileActivity(userId, activity) {
  return ProfileInfo.findOneAndUpdate(
    { userId },
    {
      $setOnInsert: { userId },
      $push: {
        activityHistory: {
          $each: [
            {
              ...activity,
              createdAt: activity.createdAt || new Date(),
            },
          ],
          $position: 0,
          $slice: MAX_ACTIVITY_HISTORY,
        },
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    }
  );
}

export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await ensureProfileInfo(user._id);
    await syncProfileOwnerInfo(user);
    const profileInfo = await syncProfileBookingStats(user._id);

    res.status(200).json({
      user: mergeProfileResponse(user, profileInfo),
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const userUpdates = {};
    const profileUpdates = {};

    USER_PROFILE_FIELDS.forEach((field) => {
      if (req.body[field] !== undefined) {
        userUpdates[field] = req.body[field];
      }
    });

    PROFILE_INFO_FIELDS.forEach((field) => {
      if (req.body[field] !== undefined) {
        profileUpdates[field] = req.body[field];
      }
    });

    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (userUpdates.email) {
      const existingUser = await User.findOne({
        email: userUpdates.email,
        _id: { $ne: req.user.userId },
      });

      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }
    }

    const updatedUser =
      Object.keys(userUpdates).length > 0
        ? await User.findByIdAndUpdate(req.user.userId, userUpdates, {
            new: true,
            runValidators: true,
          }).select("-password")
        : user;

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    let updatedProfileInfo = await ProfileInfo.findOneAndUpdate(
      { userId: req.user.userId },
      {
        $set: {
          ...profileUpdates,
          firstName: updatedUser.firstName || "",
          lastName: updatedUser.lastName || "",
          fullName: `${updatedUser.firstName || ""} ${updatedUser.lastName || ""}`.trim(),
          email: updatedUser.email || "",
          phone: updatedUser.phone || "",
        },
        $setOnInsert: { userId: req.user.userId },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    const changedFields = [
      ...Object.keys(userUpdates),
      ...Object.keys(profileUpdates),
    ];

    if (changedFields.length > 0) {
      updatedProfileInfo = await appendProfileActivity(req.user.userId, {
        type: "profile_updated",
        title: "Profile updated",
        description: `Updated ${changedFields.join(", ")}`,
        metadata: {
          changedFields,
        },
      });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: mergeProfileResponse(updatedUser, updatedProfileInfo),
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const changeMyPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current password and new password are required" });
    }

    if (String(newPassword).length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters long" });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    await appendProfileActivity(req.user.userId, {
      type: "password_changed",
      title: "Password changed",
      description: "Account password was updated successfully.",
    });

    res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
