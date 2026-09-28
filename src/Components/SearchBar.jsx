import React, { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";
import * as Yup from "yup";

const fieldShell =
  "flex w-full items-center justify-between gap-3 rounded-2xl border border-[#dfe8f2] bg-white/80 px-4 py-3.5 text-left text-[15px] text-[#1d3252] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] outline-none transition-colors duration-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/30 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:shadow-none dark:focus:border-gold-400/70";

function FieldError({ error }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -4, height: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="mt-1.5 overflow-hidden text-xs font-medium text-red-500"
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

function FieldLabel({ children }) {
  return (
    <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-[#6a83a6] dark:text-gold-300/80">
      {children}
    </label>
  );
}

function DownDropdown({ name, value, options, placeholder, onChange, onBlur }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        onBlur={onBlur}
        className={fieldShell}
      >
        <span
          className={`min-w-0 truncate ${
            selectedOption?.value
              ? ""
              : "text-[#8fa3bd] dark:text-white/40"
          }`}
        >
          {selectedOption?.label || placeholder}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="shrink-0 text-gold-500"
        >
          <ChevronDown size={17} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 top-[calc(100%+8px)] z-[100] max-h-64 w-full origin-top overflow-y-auto rounded-2xl border border-[#e3ebf4] bg-white py-2 shadow-[0_18px_44px_rgba(15,30,60,0.16)] dark:border-white/10 dark:bg-[#12233b] dark:shadow-[0_18px_44px_rgba(0,0,0,0.5)]"
          >
            {options.map((option) => (
              <button
                key={`${name}-${option.value || "empty"}`}
                type="button"
                role="option"
                aria-selected={option.value === value}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`block w-full px-5 py-2.5 text-left text-sm transition-colors duration-150 ${
                  option.value === value
                    ? "bg-[#1d3252] font-semibold text-gold-300 dark:bg-gold-400/15 dark:text-gold-300"
                    : "text-[#33507a] hover:bg-[#f2f7fc] dark:text-white/80 dark:hover:bg-white/[0.06]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SearchBar({
  filters = {},
  onSearch,
  onSearchClick,
  resultCount,
  branchOptions = [],
  roomTypeOptions = [],
}) {
  const submitHandler = onSearchClick || onSearch;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const validationSchema = Yup.object({
    branch: Yup.string(),
    roomType: Yup.string(),
    checkIn: Yup.date()
      .required("Check-in date is required")
      .min(today, "You cannot search using past dates"),
    checkOut: Yup.date()
      .required("Check-out date is required")
      .min(today, "You cannot search using past dates")
      .test(
        "after-check-in",
        "Check-out must be after check-in",
        function (value) {
          const { checkIn } = this.parent;
          if (!value || !checkIn) return true;
          return new Date(value) > new Date(checkIn);
        }
      ),
    guests: Yup.string().required("Guests is required"),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      branch: filters.branch || "",
      roomType: filters.roomType || "",
      checkIn: filters.checkIn || "",
      checkOut: filters.checkOut || "",
      guests:
        filters.guests && Number(filters.guests) > 0
          ? `${filters.guests} Guest${Number(filters.guests) > 1 ? "s" : ""}`
          : "1 Guest",
    },
    validationSchema,
    onSubmit: (values) => {
      const guestsNumber = parseInt(values.guests) || 1;

      submitHandler?.({
        destination: values.branch,
        branch: values.branch,
        roomType: values.roomType,
        checkIn: values.checkIn,
        checkOut: values.checkOut,
        guests: guestsNumber,
        maxPrice: filters.maxPrice,
      });
    },
  });

  const branchSelectOptions = [
    { value: "", label: "Select branch" },
    ...branchOptions.map((branch) => ({ value: branch, label: branch })),
  ];

  const roomTypeSelectOptions = [
    { value: "", label: "Any Room Type" },
    ...roomTypeOptions.map((type) => ({ value: type, label: type })),
  ];

  const guestSelectOptions = [
    { value: "", label: "Select guests" },
    { value: "1 Guest", label: "1 Guest" },
    { value: "2 Guests", label: "2 Guests" },
    { value: "3 Guests", label: "3 Guests" },
    { value: "4 Guests", label: "4 Guests" },
    { value: "5 Guests", label: "5 Guests" },
  ];

  return (
    <div className="w-full">
      <form onSubmit={formik.handleSubmit}>
        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div>
            <FieldLabel>Branch</FieldLabel>
            <DownDropdown
              name="branch"
              value={formik.values.branch}
              options={branchSelectOptions}
              placeholder="Select branch"
              onChange={(value) => formik.setFieldValue("branch", value)}
              onBlur={() => formik.setFieldTouched("branch", true)}
            />
            <FieldError
              error={formik.touched.branch ? formik.errors.branch : ""}
            />
          </div>

          <div>
            <FieldLabel>Room Type</FieldLabel>
            <DownDropdown
              name="roomType"
              value={formik.values.roomType}
              options={roomTypeSelectOptions}
              placeholder="Any Room Type"
              onChange={(value) => formik.setFieldValue("roomType", value)}
              onBlur={() => formik.setFieldTouched("roomType", true)}
            />
          </div>

          <div>
            <FieldLabel>Check-in</FieldLabel>
            <input
              type="date"
              name="checkIn"
              value={formik.values.checkIn}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`${fieldShell} dark:[color-scheme:dark]`}
            />
            <FieldError
              error={formik.touched.checkIn ? formik.errors.checkIn : ""}
            />
          </div>

          <div>
            <FieldLabel>Check-out</FieldLabel>
            <input
              type="date"
              name="checkOut"
              value={formik.values.checkOut}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`${fieldShell} dark:[color-scheme:dark]`}
            />
            <FieldError
              error={formik.touched.checkOut ? formik.errors.checkOut : ""}
            />
          </div>

          <div>
            <FieldLabel>Guests</FieldLabel>
            <DownDropdown
              name="guests"
              value={formik.values.guests}
              options={guestSelectOptions}
              placeholder="Select guests"
              onChange={(value) => formik.setFieldValue("guests", value)}
              onBlur={() => formik.setFieldTouched("guests", true)}
            />
            <FieldError
              error={formik.touched.guests ? formik.errors.guests : ""}
            />
          </div>

          <div className="md:pt-[26px]">
            <motion.button
              type="submit"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 420, damping: 22 }}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-br from-[#28415f] to-[#182c46] py-4 font-semibold tracking-wide text-white shadow-[0_14px_30px_rgba(24,44,70,0.35)]"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gold-300/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
              <Search size={17} className="text-gold-300" />
              Search Now
            </motion.button>
          </div>
        </div>
      </form>

      {typeof resultCount === "number" && (
        <motion.div
          key={resultCount}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-3 pr-2 text-right text-sm text-[#6c7f95] dark:text-white/50"
        >
          <span className="font-serif text-base font-semibold text-gold-600 dark:text-gold-300">
            {resultCount}
          </span>{" "}
          stays found
        </motion.div>
      )}
    </div>
  );
}
