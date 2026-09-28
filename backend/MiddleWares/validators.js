import { body } from "express-validator";

export const registerRules = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required"),
  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required"),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required"),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

export const loginRules = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required"),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

export const hotelRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Branch name is required"),

  body("hotelName")
    .trim()
    .notEmpty()
    .withMessage("Hotel name is required"),

  body("city")
    .trim()
    .notEmpty()
    .withMessage("City is required"),

  body("address")
    .trim()
    .notEmpty()
    .withMessage("Address is required"),

  body("status")
    .optional()
    .isIn(["Active", "Inactive"])
    .withMessage("Status must be Active or Inactive"),

  body("rating")
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage("Rating must be between 0 and 5"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Valid email is required"),

  body("phone")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Phone cannot be empty"),
];