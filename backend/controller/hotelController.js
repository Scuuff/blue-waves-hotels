import { validationResult } from "express-validator";
import Hotel from "../models/Hotel.js";

// CREATE
export const createHotel = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const hotel = await Hotel.create(req.body);

    res.status(201).json({
      message: "Branch created successfully",
      hotel,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// READ ALL
export const getAllHotels = async (req, res) => {
  try {
    const { search, city, status } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    if (city && city !== "all") {
      filter.city = city;
    }

    if (status && status !== "all") {
      filter.status = status;
    }

    const hotels = await Hotel.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      count: hotels.length,
      hotels,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// READ ONE
export const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({ message: "Branch not found" });
    }

    res.status(200).json(hotel);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// UPDATE
export const updateHotel = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!hotel) {
      return res.status(404).json({ message: "Branch not found" });
    }

    res.status(200).json({
      message: "Branch updated successfully",
      hotel,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// DELETE
export const deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);

    if (!hotel) {
      return res.status(404).json({ message: "Branch not found" });
    }

    res.status(200).json({
      message: "Branch deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// READ ALL ROOMS FOR HOTEL LISTING PAGE
export const getAllListingRooms = async (req, res) => {
  try {
    const { branch, guests, checkIn, checkOut } = req.query;

    const hotels = await Hotel.find({ status: "Active" }).sort({
      createdAt: -1,
    });

    let rooms = [];

    hotels.forEach((hotel) => {
      hotel.rooms.forEach((room) => {
        rooms.push({
          _id: room._id,
          hotelId: hotel._id,
          hotelName: hotel.hotelName,
          branch: hotel.name,
          city: hotel.city,
          location: hotel.address,
          status: hotel.status,
          roomName: room.roomName,
          type: room.type,
          price: room.price,
          rating: room.rating ?? hotel.rating ?? 0,
          guests: room.guests,
          beds: room.beds,
          baths: room.baths,
          size: room.size ?? 0,
          available: room.available,
          featured: room.featured,
          image: room.image || hotel.image,
          amenities:
            room.amenities && room.amenities.length > 0
              ? room.amenities
              : hotel.amenities,
          description: hotel.description,
          phone: hotel.phone,
          email: hotel.email,
          checkIn: checkIn || "",
          checkOut: checkOut || "",
        });
      });
    });

    rooms = rooms.filter((room) => room.available === true);

    if (branch && branch.trim() !== "") {
      rooms = rooms.filter(
        (room) => room.branch.toLowerCase() === branch.toLowerCase()
      );
    }

    if (guests) {
      const guestNumber = parseInt(guests, 10);
      if (!isNaN(guestNumber)) {
        rooms = rooms.filter((room) => room.guests >= guestNumber);
      }
    }

    res.status(200).json({
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};