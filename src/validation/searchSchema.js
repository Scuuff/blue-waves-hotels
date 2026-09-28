import * as Yup from "yup";

export const searchSchema = Yup.object({
  destination: Yup.string()
    .min(2, "Destination must be at least 2 characters")
    .required("Destination is required"),
  guests: Yup.number()
    .typeError("Guests must be a number")
    .min(1, "Guests must be at least 1")
    .max(10, "Maximum guests is 10")
    .required("Guests is required"),
  minPrice: Yup.number()
    .typeError("Min price must be a number")
    .min(0, "Min price cannot be less than 0")
    .required("Min price is required"),
  maxPrice: Yup.number()
    .typeError("Max price must be a number")
    .moreThan(Yup.ref("minPrice"), "Max price must be greater than min price")
    .required("Max price is required"),
});