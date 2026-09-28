// controllers/reviewController.js
import Review from "../models/Review.js";

export const getReviews = async (req, res) => {
  const reviews = await Review.find().sort({ createdAt: -1 });
  res.json(reviews);
};

export const createReview = async (req, res) => {
  const review = await Review.create({
    ...req.body,
    verified: req.body.verified ?? true,
    userId: req.user.userId
  });
  res.status(201).json(review);
};

export const updateReview = async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({ message: "Review not found" });
  }

  const isOwner = String(review.userId) === String(req.user.userId);
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: "Forbidden" });
  }

  review.comment = req.body.comment ?? review.comment;
  review.rating = req.body.rating ?? review.rating;
  review.title = req.body.title ?? review.title;
  review.branch = req.body.branch ?? review.branch;

  await review.save();
  return res.json(review);
};

export const deleteReview = async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({ message: "Review not found" });
  }

  const isOwner = String(review.userId) === String(req.user.userId);
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: "Forbidden" });
  }

  await Review.findByIdAndDelete(req.params.id);
  return res.status(204).send();
};
