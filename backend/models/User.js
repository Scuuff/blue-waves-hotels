import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      default: null,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
    },
    username: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    status: {
      type: String,
      default: "active",
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
    lastLoginAt: {
      type: Date,
    },
    ipAddress: {
      type: String,
      trim: true,
    },

    favorites: {
      type: [favoriteSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
