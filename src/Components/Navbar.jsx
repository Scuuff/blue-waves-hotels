import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { motion as Motion } from "framer-motion";
import { Menu, X, UserCircle, LayoutDashboard, Sun, Moon } from "lucide-react";
import logoWhite from "../assets/Images/white_logo.png";
import { useAuth } from "../Context/AuthContext";
import { useIntro } from "../Context/IntroContext";
import { useTheme } from "../Context/ThemeContext";

export default function Navbar() {
  const location = useLocation();
  const { currentUser, isAuthenticated } = useAuth();
  const { darkMode, setDarkMode } = useTheme();

  // Cinematic intro entrance — only active during the homepage intro. On any
  // other page (or after the intro), `stage` is "done" and elements render
  // normally with no animation.
  const { stage } = useIntro();
  const introPlaying = stage !== "done";
  const revealUI = stage === "ui";
  const introProps = (initial, delay) =>
    introPlaying
      ? {
          initial,
          animate: revealUI ? { opacity: 1, x: 0, y: 0 } : initial,
          transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay },
        }
      : {};

  const [showNavbar, setShowNavbar] = useState(true);
  const [scrolledUpStyle, setScrolledUpStyle] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

  const isAdminRoute = location.pathname.startsWith("/admin");
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 20) {
        setShowNavbar(true);
        setScrolledUpStyle(false);
      } else if (currentScrollY > lastScrollY.current) {
        setShowNavbar(false);
        setMenuOpen(false);
      } else {
        setShowNavbar(true);
        setScrolledUpStyle(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isAdminRoute) return null;

  // The home hero is a dark video in both themes, so while the navbar floats
  // transparently over it the links must stay white. Everywhere else the
  // surface follows the theme: dark glass in dark mode, white glass in light.
  const onDarkSurface = darkMode || (isHomePage && !scrolledUpStyle);

  const navTextColor = onDarkSurface ? "text-white" : "text-[#16283c]";
  const navLinkHover = onDarkSurface
    ? "hover:text-[#7ea0d6]"
    : "hover:text-[#2f6fb3]";

  // Always the Blue Waves logo. It's a white mark, so over light glass it is
  // re-inked dark with a CSS filter instead of swapping to a different image.
  const currentLogo = logoWhite;
  const logoInkClass = onDarkSurface ? "" : "brightness-0 opacity-80";

  const navBackground = scrolledUpStyle
    ? `backdrop-blur-md shadow-lg border-b ${
        onDarkSurface ? "border-white/10" : "border-[#16283c]/10"
      }`
    : isHomePage
    ? "border-b border-white/20"
    : `backdrop-blur-md border-b ${
        onDarkSurface ? "border-white/10" : "border-[#16283c]/10"
      }`;

  // Background applied via inline style (reliable across pages/scroll states):
  // the home hero stays transparent; everywhere else is themed glass.
  const glassColor = darkMode
    ? "rgba(12, 24, 40, 0.9)"
    : "rgba(248, 251, 254, 0.92)";
  const navStyle = {
    backgroundColor:
      isHomePage && !scrolledUpStyle ? "transparent" : glassColor,
  };

  const authTextButtonClass = onDarkSurface
    ? "border-white text-white hover:bg-white hover:text-[#2f6fb3]"
    : "border-[#2f6fb3] text-[#2f6fb3] hover:bg-[#2f6fb3] hover:text-white";

  // The mobile dropdown panel is themed glass (not the transparent hero), so
  // its buttons follow the theme rather than the surface under the navbar.
  const mobileAuthButtonClass = darkMode
    ? "border-white text-white hover:bg-white hover:text-[#2f6fb3]"
    : "border-[#2f6fb3] text-[#2f6fb3] hover:bg-[#2f6fb3] hover:text-white";

  const profileTextClass = navTextColor;

  const themeToggleClass = `flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 hover:scale-110 ${
    onDarkSurface
      ? "border-white/25 text-white hover:bg-white/10"
      : "border-[#16283c]/15 text-[#16283c] hover:bg-[#16283c]/5"
  }`;

  return (
    <nav
      style={navStyle}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        showNavbar ? "translate-y-0" : "-translate-y-full"
      } ${navBackground}`}
    >
      <div className="flex h-24 w-full items-center justify-between px-4 md:px-6 lg:px-10">
        <Motion.div
          className="flex w-[140px] items-center lg:w-[180px]"
          {...introProps({ opacity: 0, x: -40 }, 0.15)}
        >
          <Link
            to="/"
            className="inline-block transition-transform duration-300 hover:scale-105"
          >
            <img
              src={currentLogo}
              alt="Blue Waves Hotel Logo"
              className={`h-14 w-auto object-contain transition-all duration-300 md:h-16 ${logoInkClass}`}
            />
          </Link>
        </Motion.div>

        <Motion.div
          className={`hidden flex-1 items-center justify-center gap-8 text-[15px] font-semibold md:flex lg:gap-10 ${navTextColor}`}
          {...introProps({ opacity: 0, y: -20 }, 0.32)}
        >
          <Link
            to="/"
            className={`whitespace-nowrap ${navLinkHover} transition-colors duration-300`}
          >
            Home
          </Link>
          <Link
            to="/hotelDetails"
            className={`whitespace-nowrap ${navLinkHover} transition-colors duration-300`}
          >
            Hotel Details
          </Link>
          <Link
            to="/offers"
            className={`whitespace-nowrap ${navLinkHover} transition-colors duration-300`}
          >
            Offers
          </Link>
          <Link
            to="/hotels"
            className={`whitespace-nowrap ${navLinkHover} transition-colors duration-300`}
          >
            Search
          </Link>
         
          <Link
            to="/help"
            className={`whitespace-nowrap ${navLinkHover} transition-colors duration-300`}
          >
            Contact Us
          </Link>

        </Motion.div>

        <Motion.div
          className="hidden items-center justify-end gap-3 md:flex"
          {...introProps({ opacity: 0, x: 40 }, 0.5)}
        >
          <button
            onClick={() => setDarkMode(!darkMode)}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            className={themeToggleClass}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className={`px-5 py-2.5 rounded-full border text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:scale-105 ${authTextButtonClass}`}
              >
                Log In
              </Link>

              <Link
                to="/register"
                className="px-5 py-2.5 rounded-full bg-[#7ea0d6] text-white text-sm font-medium hover:bg-[#2f6fb3] hover:-translate-y-1 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-lg"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              {currentUser?.role === "admin" && (
                <Link
                  to="/admin/dashboard"
                  className={`px-4 py-2.5 rounded-full border text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:scale-105 flex items-center gap-2 ${authTextButtonClass}`}
                >
                  <LayoutDashboard size={16} />
                  Admin
                </Link>
              )}

              <Link
                to="/profile"
                className={`flex items-center gap-2 px-3 py-2 rounded-full ${navLinkHover} transition-colors duration-300 ${profileTextClass}`}
              >
                <UserCircle size={22} />
                <span className="text-sm font-medium whitespace-nowrap">
                  {currentUser?.fullName}
                </span>
              </Link>

            </>
          )}
        </Motion.div>

        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={() => setDarkMode(!darkMode)}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            className={themeToggleClass}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`transition-colors duration-300 ${navTextColor}`}
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      <div
        style={{
          backgroundColor: darkMode
            ? "rgba(12, 24, 40, 0.95)"
            : "rgba(248, 251, 254, 0.97)",
        }}
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        } backdrop-blur-md`}
      >
        <div
          className={`px-6 py-5 flex flex-col gap-4 ${
            darkMode ? "text-white" : "text-[#16283c]"
          }`}
        >
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="hover:text-[#7ea0d6]"
          >
            Home
          </Link>
          <Link
            to="/hotelDetails"
            onClick={() => setMenuOpen(false)}
            className="hover:text-[#7ea0d6]"
          >
            Hotel Details
          </Link>
          <Link
            to="/offers"
            onClick={() => setMenuOpen(false)}
            className="hover:text-[#7ea0d6]"
          >
            Offers
          </Link>
          <Link
            to="/hotels"
            onClick={() => setMenuOpen(false)}
            className="hover:text-[#7ea0d6]"
          >
            Search
          </Link>
         
          <Link to="/help" onClick={() => setMenuOpen(false)} className="hover:text-[#7ea0d6]">
            Contact Us
          </Link>

          {!isAuthenticated ? (
            <div className="flex flex-col gap-3 pt-3">
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className={`px-5 py-2.5 rounded-full border text-sm font-medium text-center transition-all duration-300 ${mobileAuthButtonClass}`}
              >
                Log In
              </Link>

              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="px-5 py-2.5 rounded-full bg-[#7ea0d6] text-white text-sm font-medium text-center hover:bg-[#2f6fb3] transition-all duration-300"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pt-3">
              {currentUser?.role === "admin" && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className={`px-5 py-2.5 rounded-full border text-sm font-medium text-center transition-all duration-300 ${mobileAuthButtonClass}`}
                >
                  Admin Dashboard
                </Link>
              )}

              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2 hover:text-[#7ea0d6]"
              >
                <UserCircle size={22} />
                <span className="font-medium">{currentUser?.fullName}</span>
              </Link>

            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
