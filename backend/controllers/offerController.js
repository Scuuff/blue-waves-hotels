import { validationResult } from "express-validator";
import Offer from "../models/Offer.js";

// Returns a 400 with the validator errors, or null if the request is valid
const rejectIfInvalid = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return true;
  }
  return false;
};

// GET all offers
export const getOffers = async (req, res) => {
  try {
    const offers = await Offer.find();
    res.status(200).json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET single offer by id
export const getOfferById = async (req, res) => {
  if (rejectIfInvalid(req, res)) return;
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: "Offer not found" });
    res.status(200).json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE offer (admin only)
export const createOffer = async (req, res) => {
  if (rejectIfInvalid(req, res)) return;
  try {
    const {
      title,
      type,
      badge,
      discount,
      originalPrice,
      pricePerNight,
      expiryDate,
      roomId,
      hotelId,
      description,
    } = req.body;

    const offer = await Offer.create({
      title,
      type,
      badge,
      discount,
      originalPrice,
      pricePerNight,
      expiryDate,
      roomId,
      hotelId,
      description,
    });

        res.status(201).json(offer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// UPDATE offer (admin only)
export const updateOffer = async (req, res) => {
  if (rejectIfInvalid(req, res)) return;
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!offer) return res.status(404).json({ message: "Offer not found" });
    res.status(200).json(offer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// TOGGLE active/inactive (admin only)
export const toggleOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: "Offer not found" });

    offer.active = !offer.active;
    await offer.save();

    res.status(200).json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE offer (admin only)
export const deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) return res.status(404).json({ message: "Offer not found" });
    res.status(200).json({ message: "Offer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
