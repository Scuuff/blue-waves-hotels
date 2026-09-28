import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const amenityOptions = [
  "Free WiFi",
  "Parking",
  "Pool",
  "Spa",
  "Gym",
  "Restaurant",
  "Airport Transfer",
  "Breakfast Included",
  "Sea View",
  "Beach Access",
];

const validationSchema = Yup.object({
  name: Yup.string().required("Branch name is required."),
  hotelName: Yup.string().required("Hotel name is required."),
  city: Yup.string().required("City is required."),
  address: Yup.string().required("Address is required."),
  rating: Yup.number()
    .typeError("Star rating is required.")
    .required("Star rating is required.")
    .min(0, "Rating cannot be less than 0.")
    .max(5, "Rating cannot be more than 5."),
  phone: Yup.string().required("Phone number is required."),
  email: Yup.string()
    .email("Please enter a valid email address.")
    .required("Email address is required."),
  image: Yup.string().required("Image is required."),
  description: Yup.string().required("Description is required."),
  status: Yup.string().required("Branch status is required."),
  amenities: Yup.array()
    .min(1, "Please select at least one amenity.")
    .required("Please select at least one amenity."),
});

// Owns its own load-error state. Previously this lived in BranchForm and was
// reset by a useEffect called inside Formik's render callback, which breaks the
// Rules of Hooks (hooks must not be called from a callback).
function BranchImagePreview({ image }) {
  const [previewError, setPreviewError] = useState(false);

  if (!image || previewError) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-[#567C8D]">
        Image preview will appear here
      </div>
    );
  }

  return (
    <img
      src={image}
      alt="Branch preview"
      className="h-64 w-full object-cover"
      onError={() => setPreviewError(true)}
      onLoad={() => setPreviewError(false)}
    />
  );
}

function BranchForm({
  initialData,
  onSubmit,
  onCancel,
  submitButtonText = "Save Branch",
  successMessage = "Branch information saved successfully.",
}) {
  const [showSuccess, setShowSuccess] = useState(false);

  const initialValues = {
    name: initialData?.name || "",
    hotelName: initialData?.hotelName || "Blue Wave Hotel",
    city: initialData?.city || "",
    address: initialData?.address || "",
    description: initialData?.description || "",
    rating: initialData?.rating !== undefined ? Number(initialData.rating) : "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    image: initialData?.image || "",
    status: initialData?.status || "Active",
    amenities: initialData?.amenities || [],
  };

  const inputClass =
    "w-full rounded-2xl border border-[#C8D9E6] bg-white px-4 py-3.5 text-sm text-[#2F4156] outline-none transition focus:border-[#567C8D] focus:ring-2 focus:ring-[#C8D9E6]";

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  return (
    <section className="space-y-5">
      {showSuccess && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {successMessage}
        </div>
      )}

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={async (values, { resetForm, setSubmitting }) => {
          try {
            const payload = {
              ...values,
              rating: Number(values.rating),
              amenities: values.amenities || [],
              rooms: initialData?.rooms || [],
            };

            if (onSubmit) {
              await onSubmit(payload);
            } else {
              console.log(payload);
            }

            setShowSuccess(true);

            if (!initialData) {
              resetForm();
            }
          } catch (error) {
            console.error("Branch form submit error:", error);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ values, touched, errors, isSubmitting }) => {
          return (
            <Form className="space-y-6">
              <div className="rounded-[26px] bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-[#2F4156]">
                    Branch Information
                  </h3>
                  <p className="mt-1 text-sm text-[#567C8D]">
                    Fill in the main details for this branch.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#2F4156]">
                      Branch Name
                    </label>
                    <Field
                      type="text"
                      name="name"
                      placeholder="Enter branch name"
                      className={`${inputClass} ${
                        touched.name && errors.name ? "border-red-400" : ""
                      }`}
                    />
                    <ErrorMessage
                      name="name"
                      component="p"
                      className="mt-2 text-sm text-red-600"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#2F4156]">
                      Hotel Name
                    </label>
                    <Field
                      type="text"
                      name="hotelName"
                      placeholder="Enter hotel name"
                      className={`${inputClass} ${
                        touched.hotelName && errors.hotelName
                          ? "border-red-400"
                          : ""
                      }`}
                    />
                    <ErrorMessage
                      name="hotelName"
                      component="p"
                      className="mt-2 text-sm text-red-600"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#2F4156]">
                      City
                    </label>
                    <Field
                      type="text"
                      name="city"
                      placeholder="Enter city"
                      className={`${inputClass} ${
                        touched.city && errors.city ? "border-red-400" : ""
                      }`}
                    />
                    <ErrorMessage
                      name="city"
                      component="p"
                      className="mt-2 text-sm text-red-600"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#2F4156]">
                      Address
                    </label>
                    <Field
                      type="text"
                      name="address"
                      placeholder="Enter branch address"
                      className={`${inputClass} ${
                        touched.address && errors.address ? "border-red-400" : ""
                      }`}
                    />
                    <ErrorMessage
                      name="address"
                      component="p"
                      className="mt-2 text-sm text-red-600"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#2F4156]">
                      Star Rating
                    </label>
                    <Field
                      as="select"
                      name="rating"
                      className={`${inputClass} ${
                        touched.rating && errors.rating ? "border-red-400" : ""
                      }`}
                    >
                      <option value="">Select rating</option>
                      <option value="3">3 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="5">5 Stars</option>
                    </Field>
                    <ErrorMessage
                      name="rating"
                      component="p"
                      className="mt-2 text-sm text-red-600"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#2F4156]">
                      Phone Number
                    </label>
                    <Field
                      type="text"
                      name="phone"
                      placeholder="Enter phone number"
                      className={`${inputClass} ${
                        touched.phone && errors.phone ? "border-red-400" : ""
                      }`}
                    />
                    <ErrorMessage
                      name="phone"
                      component="p"
                      className="mt-2 text-sm text-red-600"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#2F4156]">
                      Email Address
                    </label>
                    <Field
                      type="email"
                      name="email"
                      placeholder="Enter email address"
                      className={`${inputClass} ${
                        touched.email && errors.email ? "border-red-400" : ""
                      }`}
                    />
                    <ErrorMessage
                      name="email"
                      component="p"
                      className="mt-2 text-sm text-red-600"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-[#2F4156]">
                      Main Image Path
                    </label>
                    <Field
                      type="text"
                      name="image"
                      placeholder="Image URL or local image path"
                      className={`${inputClass} ${
                        touched.image && errors.image ? "border-red-400" : ""
                      }`}
                    />
                    <ErrorMessage
                      name="image"
                      component="p"
                      className="mt-2 text-sm text-red-600"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-[#2F4156]">
                      Description
                    </label>
                    <Field
                      as="textarea"
                      name="description"
                      rows="4"
                      placeholder="Write a short description about the branch"
                      className={`${inputClass} resize-none ${
                        touched.description && errors.description
                          ? "border-red-400"
                          : ""
                      }`}
                    />
                    <ErrorMessage
                      name="description"
                      component="p"
                      className="mt-2 text-sm text-red-600"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-[#2F4156]">
                      Branch Status
                    </label>
                    <Field
                      as="select"
                      name="status"
                      className={`${inputClass} ${
                        touched.status && errors.status ? "border-red-400" : ""
                      }`}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </Field>
                    <ErrorMessage
                      name="status"
                      component="p"
                      className="mt-2 text-sm text-red-600"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-[26px] bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-xl font-bold text-[#2F4156]">
                    Amenities
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {amenityOptions.map((amenity) => (
                      <label
                        key={amenity}
                        className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#C8D9E6] bg-[#F5EFEB] px-4 py-3 text-sm font-medium text-[#2F4156] transition hover:border-[#567C8D] hover:bg-white"
                      >
                        <Field
                          type="checkbox"
                          name="amenities"
                          value={amenity}
                          className="h-4 w-4 accent-[#567C8D]"
                        />
                        {amenity}
                      </label>
                    ))}
                  </div>

                  <ErrorMessage
                    name="amenities"
                    component="p"
                    className="mt-3 text-sm text-red-600"
                  />
                </div>

                <div className="rounded-[26px] bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-xl font-bold text-[#2F4156]">
                    Image Preview
                  </h3>

                  <div className="overflow-hidden rounded-2xl border border-[#C8D9E6] bg-[#F5EFEB]">
                    <BranchImagePreview key={values.image} image={values.image} />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="rounded-2xl border border-[#C8D9E6] bg-white px-6 py-4 text-base font-semibold text-[#2F4156] transition hover:bg-[#F5EFEB]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-2xl bg-[#2F4156] px-6 py-4 text-base font-semibold text-white shadow-md transition hover:bg-[#567C8D] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Saving..." : submitButtonText}
                </button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </section>
  );
}

export default BranchForm;