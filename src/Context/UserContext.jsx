import { createContext, useContext, useEffect, useState } from "react";
import { logAuditEvent } from "../services/auditLogger";
import { useAuth } from "./AuthContext";
import { getMyProfile } from "../services/ProfileApi";
import { cancelMyBooking, getMyBookings } from "../services/bookingsApi";
import { normalizeHotelBranch } from "../utils/hotelBranches";
import { getRoomFallbackImage } from "../utils/roomMedia";

const UserContext = createContext();

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function formatMemberSince(value) {
  if (!value) return "";

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.getFullYear().toString();
}

function buildAvatarInitials(firstName = "", lastName = "", fullName = "") {
  const primary = `${firstName}`.trim();
  const secondary = `${lastName}`.trim();

  if (primary || secondary) {
    return `${primary[0] || ""}${secondary[0] || ""}`.toUpperCase();
  }

  const words = `${fullName}`.trim().split(/\s+/).filter(Boolean);
  return `${words[0]?.[0] || ""}${words[1]?.[0] || ""}`.toUpperCase();
}

function inferRoomType(roomName = "") {
  const normalized = String(roomName).toLowerCase();

  if (normalized.includes("penthouse")) return "Penthouse";
  if (normalized.includes("suite")) return "Suite";
  if (normalized.includes("deluxe")) return "Deluxe";
  return "Standard";
}

function normalizeBookingStatus(rawBooking) {
  if (String(rawBooking?.status || "").toLowerCase() === "cancelled") {
    return "cancelled";
  }

  const today = startOfToday();
  const checkOut = rawBooking?.checkOut ? new Date(rawBooking.checkOut) : null;
  const checkIn = rawBooking?.checkIn ? new Date(rawBooking.checkIn) : null;

  if (checkOut && !Number.isNaN(checkOut.getTime()) && checkOut < today) {
    return "completed";
  }

  if (checkIn && !Number.isNaN(checkIn.getTime()) && checkIn >= today) {
    return "upcoming";
  }

  return "upcoming";
}

function buildConfirmationCode(rawBooking) {
  const sourceId = String(rawBooking?._id || rawBooking?.id || "").slice(-8).toUpperCase();
  return sourceId ? `BW-${sourceId}` : "BW-PENDING";
}

function normalizeBooking(rawBooking) {
  const branch = rawBooking?.branch || "Blue Wave Branch";
  const room = rawBooking?.roomName || "Room";
  const branchImage = normalizeHotelBranch({ name: branch, city: branch }).image;
  const totalPrice = Number(rawBooking?.total ?? rawBooking?.price ?? 0);
  const nights =
    Number(rawBooking?.nights) ||
    Math.max(
      1,
      Math.ceil(
        (new Date(rawBooking?.checkOut || Date.now()) - new Date(rawBooking?.checkIn || Date.now())) /
          (1000 * 60 * 60 * 24)
      )
    );

  return {
    id: rawBooking?._id || rawBooking?.id,
    hotel: branch.replace(/\s+Branch$/i, "") || "Blue Wave Hotel",
    location: branch,
    checkIn: rawBooking?.checkIn,
    checkOut: rawBooking?.checkOut,
    guests: Number(rawBooking?.guests) || 1,
    room,
    nights,
    totalPrice,
    status: normalizeBookingStatus(rawBooking),
    confirmationCode: buildConfirmationCode(rawBooking),
    image: branchImage || getRoomFallbackImage({ type: inferRoomType(room) }),
    rating: normalizeBookingStatus(rawBooking) === "cancelled" ? 0 : 5,
    rawStatus: rawBooking?.status || "confirmed",
  };
}

function buildUserProfile(authUser, currentProfile, bookings = []) {
  if (!authUser && !currentProfile) return null;

  const source = currentProfile || authUser || {};
  const firstName = source.firstName || authUser?.firstName || "Guest";
  const lastName = source.lastName || authUser?.lastName || "User";
  const fullName =
    source.fullName?.trim() ||
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    "Guest User";
  const initials = buildAvatarInitials(firstName, lastName, fullName);
  const derivedBookingStats = {
    totalBooked: bookings.length,
    totalCancelled: bookings.filter((booking) => booking.status === "cancelled").length,
    totalCompleted: bookings.filter((booking) => booking.status === "completed").length,
  };

  return {
    id: source._id || source.id || authUser?.id || "",
    firstName,
    lastName,
    fullName,
    email: source.email || authUser?.email || "",
    avatarInitials: initials || "GU",
    tier: source.tier || "Gold Member",
    loyaltyPoints: Number(source.loyaltyPoints) || 2450,
    memberSince:
      formatMemberSince(source.createdAt) ||
      currentProfile?.memberSince ||
      new Date().getFullYear().toString(),
    countryCode: source.countryCode || "+20",
    phone: source.phone || authUser?.phone || "",
    address: source.address || "",
    city: source.city || "",
    country: source.country || "",
    dob: source.dob || "",
    avatar: source.avatar || "",
    bio: source.bio || "",
    createdAt: source.createdAt || "",
    bookings,
    bookingStats: derivedBookingStats,
    profileBookingStats: source.bookingStats || null,
    activityHistory: Array.isArray(source.activityHistory) ? source.activityHistory : [],
    totalBookings: bookings.length,
  };
}

export function UserProvider({ children }) {
  const { currentUser, token } = useAuth();
  const [user, setUser] = useState(() => buildUserProfile(currentUser, null, []));
  const [isProfileLoading, setIsProfileLoading] = useState(Boolean(currentUser));
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    if (!currentUser || !token) {
      setUser(null);
      setIsProfileLoading(false);
      setProfileError("");
      return;
    }

    let isMounted = true;

    const hydrateUser = async () => {
      setIsProfileLoading(true);
      setProfileError("");

      const [profileResult, bookingsResult] = await Promise.allSettled([
        getMyProfile(),
        getMyBookings(),
      ]);

      if (!isMounted) return;

      const profileUser =
        profileResult.status === "fulfilled" ? profileResult.value?.user : currentUser;
      const normalizedBookings =
        bookingsResult.status === "fulfilled"
          ? (bookingsResult.value || []).map(normalizeBooking)
          : [];

      setUser(buildUserProfile(currentUser, profileUser, normalizedBookings));

      if (profileResult.status === "rejected" || bookingsResult.status === "rejected") {
        const message =
          profileResult.status === "rejected"
            ? profileResult.reason?.message
            : bookingsResult.reason?.message;
        setProfileError(message || "Some profile data could not be loaded.");
      }

      setIsProfileLoading(false);
    };

    hydrateUser();

    return () => {
      isMounted = false;
    };
  }, [currentUser, token]);

  const updateUser = (updatedData) => {
      setUser((prevUser) => {
      if (!prevUser) return prevUser;

      const nextUser = {
        ...prevUser,
        ...updatedData,
        firstName: updatedData.firstName ?? prevUser.firstName,
        lastName: updatedData.lastName ?? prevUser.lastName,
        fullName:
          updatedData.fullName ??
          `${updatedData.firstName ?? prevUser.firstName} ${updatedData.lastName ?? prevUser.lastName}`.trim(),
      };

      nextUser.avatarInitials = buildAvatarInitials(
        nextUser.firstName,
        nextUser.lastName,
        nextUser.fullName
      );

      try {
        const storage = localStorage.getItem("user") ? localStorage : sessionStorage;
        const rawStored = storage.getItem("user");
        if (rawStored) {
          const storedUser = JSON.parse(rawStored);
          storage.setItem(
            "user",
            JSON.stringify({
              ...storedUser,
              firstName: nextUser.firstName,
              lastName: nextUser.lastName,
              fullName: nextUser.fullName,
              email: nextUser.email,
              phone: nextUser.phone,
            })
          );
        }
      } catch {
        // ignore storage sync errors
      }

      return nextUser;
    });
  };

  const refreshUser = async () => {
    if (!currentUser || !token) return;

    setIsProfileLoading(true);
    setProfileError("");

    try {
      const [profileData, bookingsData] = await Promise.all([
        getMyProfile(),
        getMyBookings(),
      ]);

      setUser(
        buildUserProfile(
          currentUser,
          profileData?.user,
          (bookingsData || []).map(normalizeBooking)
        )
      );
    } catch (error) {
      setProfileError(error.message || "Failed to refresh profile data.");
    } finally {
      setIsProfileLoading(false);
    }
  };

  const cancelBooking = async (id) => {
    const response = await cancelMyBooking(id);
    const normalizedBooking = normalizeBooking(response?.booking);

    setUser((prevUser) => {
      if (!prevUser) return prevUser;

      return {
        ...prevUser,
        bookings: prevUser.bookings.map((booking) =>
          booking.id === id ? normalizedBooking : booking
        ),
      };
    });

    return normalizedBooking;
  };

  useEffect(() => {
    if (!user?.email) return;

    logAuditEvent({
      actionType: "user.login",
      module: "auth",
      entityType: "session",
      entityId: String(user.email),
      targetLabel: `${user.firstName} ${user.lastName}`,
      status: "success",
      reason: "User session initialized",
    });
  }, [user?.email, user?.firstName, user?.lastName]);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        updateUser,
        refreshUser,
        cancelBooking,
        isProfileLoading,
        profileError,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
