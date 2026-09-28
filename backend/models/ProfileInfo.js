import mongoose from "mongoose";

const profileActivitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "login",
        "booking_created",
        "booking_cancelled",
        "profile_updated",
        "password_changed",
        "status_changed",
        "staff_added",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const profileBookingItemSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    roomId: {
      type: String,
      default: "",
      trim: true,
    },
    roomName: {
      type: String,
      default: "",
      trim: true,
    },
    hotelName: {
      type: String,
      default: "",
      trim: true,
    },
    branch: {
      type: String,
      default: "",
      trim: true,
    },
    city: {
      type: String,
      default: "",
      trim: true,
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
    roomType: {
      type: String,
      default: "",
      trim: true,
    },
    beds: {
      type: Number,
      default: 1,
    },
    baths: {
      type: Number,
      default: 1,
    },
    size: {
      type: Number,
      default: 1,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    amenities: {
      type: [String],
      default: [],
    },
    bookedBy: {
      name: { type: String, default: "", trim: true },
      email: { type: String, default: "", trim: true },
      phone: { type: String, default: "", trim: true },
    },
    confirmationCode: {
      type: String,
      default: "",
      trim: true,
    },
    pricePerNight: {
      type: Number,
      default: 0,
    },
    checkIn: {
      type: Date,
      default: null,
    },
    checkOut: {
      type: Date,
      default: null,
    },
    guests: {
      type: Number,
      default: 1,
    },
    nights: {
      type: Number,
      default: 1,
    },
    total: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: "upcoming",
      trim: true,
    },
    rawBookingStatus: {
      type: String,
      default: "confirmed",
      trim: true,
    },
    statusDetails: {
      bookedAt: {
        type: Date,
        default: Date.now,
      },
      cancelledAt: {
        type: Date,
        default: null,
      },
      completedAt: {
        type: Date,
        default: null,
      },
      lastUpdatedAt: {
        type: Date,
        default: Date.now,
      },
    },
    bookedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const profileInfoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      trim: true,
      default: "",
    },
    lastName: {
      type: String,
      trim: true,
      default: "",
    },
    fullName: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    countryCode: {
      type: String,
      trim: true,
      default: "+20",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      trim: true,
      default: "",
    },
    country: {
      type: String,
      trim: true,
      default: "",
    },
    dob: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      trim: true,
      default: "",
    },
    bookingStats: {
      totalBooked: { type: Number, default: 0 },
      totalCancelled: { type: Number, default: 0 },
      totalCompleted: { type: Number, default: 0 },
    },
    upcomingStays: {
      type: [profileBookingItemSchema],
      default: [],
    },
    bookingHistory: {
      type: [profileBookingItemSchema],
      default: [],
    },
    activityHistory: {
      type: [profileActivitySchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("ProfileInfo", profileInfoSchema);
