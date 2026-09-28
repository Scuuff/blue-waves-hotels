import mongoose from "mongoose";

const userPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
    },
    scope: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

userPreferenceSchema.index({ userId: 1, scope: 1 }, { unique: true });

const UserPreference = mongoose.model("UserPreference", userPreferenceSchema);

export default UserPreference;
