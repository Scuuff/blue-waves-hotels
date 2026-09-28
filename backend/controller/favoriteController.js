import User from "../models/User.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import mongoose from "mongoose";

// ADD / REMOVE FAVORITE
export const toggleFavorite = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { hotelId, roomId } = req.body;
    const safeHotelId =
      hotelId && mongoose.Types.ObjectId.isValid(hotelId) ? hotelId : null;

    if (!roomId) {
      return res.status(400).json({
        message: "roomId is required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const existingIndex = user.favorites.findIndex(
      (fav) => fav.roomId.toString() === roomId
    );

    let action = "";

    if (existingIndex > -1) {
      user.favorites.splice(existingIndex, 1);
      action = "removed";
    } else {
      user.favorites.push({ hotelId: safeHotelId, roomId });
      action = "added";
    }

    await user.save();

    res.status(200).json({
      message: `Favorite ${action} successfully`,
      action,
      favorites: user.favorites,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// GET MY FAVORITES
export const getMyFavorites = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const favorites = user.favorites || [];

    if (favorites.length === 0) {
      return res.status(200).json({
        count: 0,
        favorites: [],
      });
    }

    const roomIds = [...new Set(favorites.map((fav) => fav.roomId.toString()))];
    const hotelIds = [
      ...new Set(
        favorites
          .map((fav) => fav.hotelId?.toString())
          .filter((id) => id && mongoose.Types.ObjectId.isValid(id))
      ),
    ];

    const [rooms, hotels] = await Promise.all([
      Room.find({ _id: { $in: roomIds } }).lean(),
      hotelIds.length > 0
        ? Hotel.find({ _id: { $in: hotelIds } }).lean()
        : Promise.resolve([]),
    ]);

    const favoriteRooms = favorites
      .map((fav) => {
        const room = rooms.find((item) => item._id.toString() === fav.roomId.toString());
        if (!room) return null;

        const hotel =
          hotels.find(
            (item) =>
              fav.hotelId && item._id.toString() === fav.hotelId.toString()
          ) ||
          hotels.find(
            (item) =>
              item.name === room.branch &&
              item.hotelName === room.hotelName &&
              item.city === room.city
          ) ||
          null;

        return {
          _id: room._id,
          roomId: room._id,
          hotelId: hotel?._id || fav.hotelId || null,
          hotelName: room.hotelName || hotel?.hotelName || "Blue Wave Hotel",
          branch: room.branch || hotel?.name || "",
          city: room.city || hotel?.city || "",
          location: room.location || hotel?.address || "",
          status: room.status || (room.available ? "Available" : "Occupied"),
          roomName: room.roomName,
          type: room.type,
          price: room.price,
          rating: room.rating ?? hotel?.rating ?? 0,
          guests: room.guests,
          beds: room.beds,
          baths: room.baths,
          size: room.size ?? 0,
          available: room.available,
          featured: room.featured,
          image: room.image || hotel?.image || "",
          amenities:
            room.amenities && room.amenities.length > 0
              ? room.amenities
              : hotel?.amenities || [],
          description: room.description || hotel?.description || "",
          phone: hotel?.phone || "",
          email: hotel?.email || "",
        };
      })
      .filter(Boolean);

    res.status(200).json({
      count: favoriteRooms.length,
      favorites: favoriteRooms,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
