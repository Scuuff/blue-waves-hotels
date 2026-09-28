/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import bgImage from "../assets/Images/register-bg.jpg";
import { useAuth } from "../Context/AuthContext";

const formContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

const formItem = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshAuth } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmittingAnim, setIsSubmittingAnim] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [shakeForm, setShakeForm] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    document.title = "Login";
  }, []);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Please enter a valid email")
        .required("Email is required"),
      password: Yup.string().required("Password is required"),
    }),

    onSubmit: async (values, { setFieldError }) => {
      setServerError("");
      setIsSubmittingAnim(true);

      try {
        const response = await fetch("http://localhost:5050/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: values.email,
            password: values.password,
          }),
        });

        const data = await response.json();
        
        console.log("Login response:", {
          status: response.status,
          ok: response.ok,
          data: data,
          hasToken: !!data.token,
          tokenPreview: data.token ? data.token.substring(0, 30) + "..." : "NO TOKEN"
        });

        if (!response.ok) {
          throw new Error(data.message || "Login failed");
        }

        if (!data.token) {
          throw new Error("No token received from server");
        }

        setIsSubmittingAnim(false);

        if (values.rememberMe) {
          console.log("Saving to localStorage");
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
        } else {
          console.log("Saving to sessionStorage");
          sessionStorage.setItem("token", data.token);
          sessionStorage.setItem("user", JSON.stringify(data.user));
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }

        console.log("After saving:", {
          localStorage: localStorage.getItem("token") ? "✓" : "✗",
          sessionStorage: sessionStorage.getItem("token") ? "✓" : "✗"
        });

        refreshAuth();
        setSuccessMessage(true);

        setTimeout(() => {
          setSuccessMessage(false);

          const returnTo = location.state?.from;
          const pendingRoom = location.state?.pendingRoom;

          // Admins always land on their dashboard — never inside the guest
          // booking flow, even if they arrived here from a "Book Now" button.
          if (data.user.role === "admin") {
            navigate("/admin/dashboard");
          } else if (pendingRoom) {
            // Continue the booking the guest started before logging in.
            navigate("/booking", { replace: true, state: { room: pendingRoom } });
          } else if (returnTo?.pathname) {
            navigate(returnTo.pathname, {
              replace: true,
              state: returnTo.state,
            });
          } else if (typeof returnTo === "string") {
            navigate(returnTo, { replace: true });
          } else {
            navigate("/");
          }
        }, 1200);
      } catch (error) {
        setIsSubmittingAnim(false);
        if (error.errors && Array.isArray(error.errors)) {
          error.errors.forEach((err) => {
            if (err.path === "email") {
              setFieldError("email", err.msg);
            } else if (err.path === "password") {
              setFieldError("password", err.msg);
            }
          });
        }
        setServerError(error.message || "Cannot connect to server");
        setShakeForm(true);
        setTimeout(() => setShakeForm(false), 500);
      }
    },
  });

  const inputClass = (fieldName) => {
    const hasError = formik.touched[fieldName] && formik.errors[fieldName];

    return `w-full rounded-2xl border bg-white/90 py-4 pl-12 pr-12 text-[#2F4156] placeholder:text-[#6b7f90] outline-none transition-all duration-300 dark:bg-[#15273f] dark:text-white dark:placeholder:text-white/40 ${
      hasError
        ? "border-red-400 focus:border-red-400 focus:ring-4 focus:ring-red-100 dark:focus:ring-red-500/20"
        : "border-[#C8D9E6] focus:border-[#567C8D] focus:ring-4 focus:ring-[#C8D9E6]/40 dark:border-white/15 dark:focus:border-[#9fc0ec] dark:focus:ring-[#9fc0ec]/20"
    }`;
  };

  const renderError = (fieldName) =>
    formik.touched[fieldName] && formik.errors[fieldName] ? (
      <motion.p
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        className="mt-2 text-sm text-red-500"
      >
        {formik.errors[fieldName]}
      </motion.p>
    ) : null;

  const handleInvalidSubmit = async () => {
    const errors = await formik.validateForm();
    formik.setTouched({
      email: true,
      password: true,
    });

    if (Object.keys(errors).length > 0) {
      setShakeForm(true);
      setTimeout(() => setShakeForm(false), 500);
    }
  };

  const handleCapsLock = (e) => {
    setCapsLockOn(e.getModifierState && e.getModifierState("CapsLock"));
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-[#2F4156]/72" />

      <motion.div
        animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-10 top-20 h-40 w-40 rounded-full bg-[#567C8D]/25 blur-2xl"
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            x: shakeForm ? [0, -8, 8, -6, 6, -3, 3, 0] : 0,
          }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full max-w-6xl overflow-hidden rounded-[32px] border border-white/15 bg-white/10 shadow-2xl backdrop-blur-md"
        >
          <div className="grid min-h-[700px] grid-cols-1 lg:grid-cols-2">
            <div className="relative hidden lg:flex flex-col justify-between p-10 text-white">
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -25 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm"
                >
                  <ShieldCheck size={16} />
                  Hotel Booking Platform
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, x: -25 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.7 }}
                  className="mt-8 max-w-md text-5xl font-bold leading-tight"
                >
                  Welcome back to your booking experience
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, x: -25 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45, duration: 0.7 }}
                  className="mt-5 max-w-lg text-base leading-7 text-white/80"
                >
                  Log in to manage reservations, view saved rooms, and continue
                  your hotel journey with a smooth and secure experience.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.7 }}
                className="grid grid-cols-3 gap-4"
              >
                <motion.div
                  whileHover={{ y: -6, scale: 1.03 }}
                  className="rounded-2xl bg-white/10 p-4 backdrop-blur-md"
                >
                  <p className="text-2xl font-bold">Fast</p>
                  <p className="mt-1 text-sm text-white/75">Access</p>
                </motion.div>
                <motion.div
                  whileHover={{ y: -6, scale: 1.03 }}
                  className="rounded-2xl bg-white/10 p-4 backdrop-blur-md"
                >
                  <p className="text-2xl font-bold">Secure</p>
                  <p className="mt-1 text-sm text-white/75">Login</p>
                </motion.div>
                <motion.div
                  whileHover={{ y: -6, scale: 1.03 }}
                  className="rounded-2xl bg-white/10 p-4 backdrop-blur-md"
                >
                  <p className="text-2xl font-bold">Easy</p>
                  <p className="mt-1 text-sm text-white/75">Management</p>
                </motion.div>
              </motion.div>
            </div>

            <div className="flex items-center justify-center bg-[#F5EFEB]/94 p-6 dark:bg-[#0f1f33]/95 sm:p-10">
              <motion.div
                variants={formContainer}
                initial="hidden"
                animate="show"
                className="w-full max-w-md"
              >
                <motion.div variants={formItem} className="mb-8 text-center">
                  <motion.h1
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl font-bold text-[#2F4156] dark:text-white"
                  >
                    Login
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15, duration: 0.5 }}
                    className="mt-2 text-[#567C8D] dark:text-[#9fc0ec]"
                  >
                    Access your hotel booking account
                  </motion.p>
                </motion.div>

                <form onSubmit={formik.handleSubmit} className="space-y-5">
                  <motion.div variants={formItem}>
                    <motion.div whileHover={{ y: -2 }} className="relative">
                      <Mail
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#567C8D] dark:text-[#9fc0ec]"
                        size={20}
                      />
                      <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={inputClass("email")}
                      />
                    </motion.div>
                    <AnimatePresence>{renderError("email")}</AnimatePresence>
                  </motion.div>

                  <motion.div variants={formItem}>
                    <motion.div whileHover={{ y: -2 }} className="relative">
                      <Lock
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#567C8D] dark:text-[#9fc0ec]"
                        size={20}
                      />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        onKeyUp={handleCapsLock}
                        onKeyDown={handleCapsLock}
                        className={inputClass("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#567C8D] transition hover:scale-110 dark:text-[#9fc0ec]"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </motion.div>

                    <AnimatePresence>
                      {capsLockOn && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="mt-2 flex items-center gap-2 text-sm text-amber-600"
                        >
                          <AlertTriangle size={16} />
                          Caps Lock is on
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>{renderError("password")}</AnimatePresence>
                  </motion.div>

                  <motion.div
                    variants={formItem}
                    className="flex items-center justify-between"
                  >
                    <label className="flex items-center gap-2 text-sm text-[#567C8D] dark:text-white/70">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        checked={formik.values.rememberMe}
                        onChange={formik.handleChange}
                        className="h-4 w-4 accent-[#2F4156] dark:accent-[#9fc0ec]"
                      />
                      Remember me
                    </label>

                    <button
                      type="button"
                      className="text-sm font-medium text-[#2F4156] hover:underline dark:text-[#9fc0ec]"
                    >
                      Forgot password?
                    </button>
                  </motion.div>

                  <AnimatePresence>
                    {serverError && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-sm text-red-500"
                      >
                        {serverError}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleInvalidSubmit}
                    type="submit"
                    disabled={isSubmittingAnim}
                    className="w-full rounded-2xl bg-[#2F4156] py-4 font-semibold text-white shadow-lg transition hover:bg-[#567C8D] disabled:cursor-not-allowed disabled:opacity-90 dark:bg-[#2f6fb3] dark:hover:bg-[#26567E]"
                  >
                    <AnimatePresence mode="wait">
                      {isSubmittingAnim ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="flex items-center justify-center gap-2"
                        >
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="inline-block h-5 w-5 rounded-full border-2 border-white/40 border-t-white"
                          />
                          Logging in...
                        </motion.div>
                      ) : (
                        <motion.span
                          key="login"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                        >
                          Login
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </form>

                <motion.p
                  variants={formItem}
                  className="mt-6 text-center text-[#567C8D] dark:text-white/70"
                >
                  Don&apos;t have an account?{" "}
                  <Link
                    to="/register"
                    className="font-semibold text-[#2F4156] hover:underline dark:text-[#9fc0ec]"
                  >
                    Register
                  </Link>
                </motion.p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 rounded-2xl bg-[#2F4156] px-5 py-4 text-white shadow-2xl"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} />
              Logged in successfully
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
