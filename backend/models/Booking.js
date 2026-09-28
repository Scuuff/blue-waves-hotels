import mongoose from "mongoose";
const bookingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },

    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      alias: "roomId",
      required: false,
    },

    roomKey: { type: String, trim: true, default: "" },

    // home page search availability
    branch: { type: String, trim: true },
    guests: { type: Number, min: 1 },
    roomName: { type: String, trim: true, default: "" },
    hotelName: { type: String, trim: true, default: "Blue Wave Hotel" },
    city: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    image: { type: String, trim: true, default: "" },
    roomType: { type: String, trim: true, default: "" },
    beds: { type: Number, min: 1, default: 1 },
    baths: { type: Number, min: 1, default: 1 },
    size: { type: Number, min: 1, default: 1 },
    description: { type: String, trim: true, default: "" },
    amenities: { type: [String], default: [] },
    price: { type: Number, min: 0, default: 0 },

    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },

    nights: { type: Number, min: 1, required: true },
    total: { type: Number, min: 0, required: true },

    confirmationCode: { type: String, trim: true, default: "" },

    paymentMethod: {
      type: String,
      enum: ["card", "google", "apple", "paypal"],
      default: "card",
    },

    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled"],
      default: "Confirmed",
    },
    cancelledAt: { type: Date, default: null },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  { timestamps: true }
);

bookingSchema.pre("validate", function syncRoomAlias() {
  if (!this.room && this.roomId) {
    this.room = this.roomId;
  }
});

export default mongoose.model("Booking", bookingSchema);

