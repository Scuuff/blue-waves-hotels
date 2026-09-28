import React, { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CheckCircle,
  Wrench,
  Tag,
  ChevronLeft,
  ChevronRight,
  Check,
  User,
  X,
  Plus,
} from "lucide-react";
import AdminSidebar from "../Components/AdminSidebar";
import AdminNavbar from "../Components/AdminNavbar";
import RoomCard from "../Components/RoomCard";
import { logAuditEvent } from "../services/auditLogger";
import useAdminThemeMode from "../hooks/useAdminThemeMode";
import { useLanguage } from "../Context/LanguageContext";
import hotelsData from "../data/hotels";
import { apiDelete, apiGet, apiPatch, apiPost } from "../services/apiClient";
import { locations } from "../data/hotels";
import { getSafeRoomImage } from "../utils/roomMedia";

const branchInfoByName = Object.fromEntries(
  locations.map((location) => [location.name, location])
);

const roomTypeDefaults = {
  Standard: { guests: 2, beds: 1, baths: 1, size: 250, rating: 4.2 },
  Deluxe: { guests: 2, beds: 1, baths: 1, size: 320, rating: 4.5 },
  Suite: { guests: 4, beds: 2, baths: 2, size: 520, rating: 4.7 },
  Penthouse: { guests: 5, beds: 2, baths: 3, size: 900, rating: 4.9 },
};

const normalizeRoomFromApi = (room) => ({
  id: room._id || room.id,
  name: room.roomName,
  type: room.type,
  price: Number(room.price) || 0,
  status: room.status || (room.available ? "Available" : "Occupied"),
  description:
    room.description ||
    `${room.type} room in ${room.branch}, located at ${room.location}.`,
  image: room.image,
  branch: room.branch,
  location: room.location,
  city: room.city,
  guests: room.guests,
  beds: room.beds,
  baths: room.baths,
  amenities: room.amenities || [],
  size: room.size,
  rating: room.rating,
  available: typeof room.available === "boolean" ? room.available : room.status === "Available",
  featured: !!room.featured,
  dateStatuses: room.dateStatuses || {},
});

const normalizeDateOnly = (value) => {
  if (!value) return null;

  const datePart = String(value).split("T")[0];
  const parsedDate = new Date(`${datePart}T00:00:00.000Z`);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const buildStayDateKeys = (checkIn, checkOut) => {
  const keys = [];
  const current = normalizeDateOnly(checkIn);
  const end = normalizeDateOnly(checkOut);

  if (!current || !end || current >= end) {
    return keys;
  }

  while (current < end) {
    keys.push(current.toISOString().split("T")[0]);
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return keys;
};

const getBranchMeta = (branch) => branchInfoByName[branch] || null;

const getDefaultRoomNumbers = (type) =>
  roomTypeDefaults[type] || roomTypeDefaults.Standard;

function AdminRoomManagement() {
  const { darkMode } = useAdminThemeMode();
  const { t, language } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [roomsError, setRoomsError] = useState("");
  const [bookings, setBookings] = useState([]);

  const [editingRoom, setEditingRoom] = useState(null);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    branch: "",
    type: "",
    price: "",
    status: "",
    description: "",
    city: "",
    location: "",
    guests: "",
    beds: "",
    baths: "",
    size: "",
    image: "",
    featured: false,
  });

  const [newRoomForm, setNewRoomForm] = useState({
    name: "",
    branch: "",
    type: "Standard",
    price: "",
    status: "Available",
    description: "",
    city: "",
    location: "",
    image: "",
    guests: "",
    beds: "",
    baths: "",
    size: "",
    featured: false,
  });

  const [rooms, setRooms] = useState([]);

  const branchOptions = [...new Set(hotelsData.map((room) => room.branch))];
  const branchLocations = Object.fromEntries(
    hotelsData.map((room) => [room.branch, room.location])
  );

  useEffect(() => {
    let cancelled = false;

    const fetchRooms = async () => {
      try {
        setRoomsLoading(true);
        setRoomsError("");

        const [roomsData, bookingsData] = await Promise.all([
          apiGet("/rooms"),
          apiGet("/bookings").catch(() => []),
        ]);
        if (cancelled) return;

        setRooms(roomsData.map(normalizeRoomFromApi));
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      } catch (error) {
        if (cancelled) return;
        setRoomsError(error.message || "Failed to load rooms.");
      } finally {
        if (!cancelled) setRoomsLoading(false);
      }
    };

    fetchRooms();

    return () => {
      cancelled = true;
    };
  }, []);

  const formatDateKey = (date) => date.toISOString().split("T")[0];

  const isPastDate = (date) => {
    const today = new Date();
    const compareDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const compareToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    return compareDate < compareToday;
  };

  const bookedDateStatusesByRoom = useMemo(() => {
    return bookings.reduce((accumulator, booking) => {
      if (
        !booking ||
        !booking.checkIn ||
        !booking.checkOut ||
        ["cancelled", "Cancelled"].includes(booking.status)
      ) {
        return accumulator;
      }

      const matchingRoom = rooms.find((room) => {
        if (booking.roomId && String(booking.roomId) === String(room.id)) {
          return true;
        }

        return (
          booking.roomName === room.name &&
          (!booking.branch || booking.branch === room.branch)
        );
      });

      if (!matchingRoom) {
        return accumulator;
      }

      const reservedDates = buildStayDateKeys(booking.checkIn, booking.checkOut);

      if (reservedDates.length === 0) {
        return accumulator;
      }

      const existingStatuses = accumulator[matchingRoom.id] || {};
      reservedDates.forEach((dateKey) => {
        existingStatuses[dateKey] = "reserved";
      });

      accumulator[matchingRoom.id] = existingStatuses;
      return accumulator;
    }, {});
  }, [bookings, rooms]);

  const handleToggleStatus = (roomId) => {
    const roomBefore = rooms.find((room) => room.id === roomId);
    if (!roomBefore) return;

    let nextStatus = "Available";
    if (roomBefore.status === "Available") nextStatus = "Occupied";
    else if (roomBefore.status === "Occupied") nextStatus = "Maintenance";
    else if (roomBefore.status === "Maintenance") nextStatus = "Available";

    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.id === roomId
          ? { ...room, status: nextStatus, available: nextStatus === "Available" }
          : room
      )
    );

    apiPatch(`/rooms/${roomId}`, {
      ...roomBefore,
      roomName: roomBefore.name,
      status: nextStatus,
      available: nextStatus === "Available",
    }).catch((error) => {
      setRooms((prevRooms) =>
        prevRooms.map((room) =>
          room.id === roomId ? roomBefore : room
        )
      );
      alert(error.message || "Failed to update room status.");
    });

    logAuditEvent({
      actionType: "room.status.updated",
      module: "room_management",
      entityType: "room",
      entityId: String(roomId),
      targetLabel: roomBefore.name,
      status: "success",
      reason: "Room status cycle changed",
      before: { status: roomBefore.status },
      after: { status: nextStatus },
    });
  };

  const handleDeleteRoom = (roomToDelete) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${roomToDelete.name}?`
    );

    if (!confirmed) return;

    const snapshot = rooms;

    setRooms((prevRooms) =>
      prevRooms.filter((room) => room.id !== roomToDelete.id)
    );

    if (selectedRoom?.id === roomToDelete.id) {
      setSelectedRoom(null);
    }

    if (editingRoom?.id === roomToDelete.id) {
      handleCloseEditRoom();
    }

    apiDelete(`/rooms/${roomToDelete.id}`).catch((error) => {
      setRooms(snapshot);
      alert(error.message || "Failed to delete room.");
    });

    logAuditEvent({
      actionType: "room.deleted",
      module: "room_management",
      entityType: "room",
      entityId: String(roomToDelete.id),
      targetLabel: roomToDelete.name,
      status: "success",
      reason: "Room deleted by admin",
      before: {
        name: roomToDelete.name,
        branch: roomToDelete.branch,
        type: roomToDelete.type,
        price: roomToDelete.price,
        status: roomToDelete.status,
      },
      after: null,
    });
  };

  const handleOpenManageDates = (room) => {
    setSelectedRoom(room);
    setCalendarMonth(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    );
  };

  const handleCloseManageDates = () => {
    setSelectedRoom(null);
  };

  const handleToggleDateStatus = (roomId, dateKey) => {
    const roomBefore = rooms.find((room) => room.id === roomId);
    const isBookedDate = bookedDateStatusesByRoom[roomId]?.[dateKey] === "reserved";

    if (!roomBefore || isBookedDate) return;

    const currentStatus = roomBefore.dateStatuses?.[dateKey] || "available";
    const nextStatus = currentStatus === "available" ? "reserved" : "available";
    const nextDateStatuses = {
      ...roomBefore.dateStatuses,
      [dateKey]: nextStatus,
    };

    setRooms((prevRooms) =>
      prevRooms.map((room) => {
        if (room.id !== roomId) return room;

        return {
          ...room,
          dateStatuses: nextDateStatuses,
        };
      })
    );

    setSelectedRoom((prevRoom) => {
      if (!prevRoom || prevRoom.id !== roomId) return prevRoom;

      return {
        ...prevRoom,
        dateStatuses: nextDateStatuses,
      };
    });

    apiPatch(`/rooms/${roomId}`, {
      roomName: roomBefore.name,
      branch: roomBefore.branch,
      city: roomBefore.city,
      location: roomBefore.location,
      type: roomBefore.type,
      price: roomBefore.price,
      status: roomBefore.status,
      description: roomBefore.description,
      image: roomBefore.image,
      guests: roomBefore.guests,
      beds: roomBefore.beds,
      baths: roomBefore.baths,
      size: roomBefore.size,
      featured: roomBefore.featured,
      amenities: roomBefore.amenities || [],
      rating: roomBefore.rating || 0,
      dateStatuses: nextDateStatuses,
    }).catch((error) => {
      setRooms((prevRooms) =>
        prevRooms.map((room) => (room.id === roomId ? roomBefore : room))
      );
      setSelectedRoom((prevRoom) =>
        prevRoom?.id === roomId ? roomBefore : prevRoom
      );
      alert(error.message || "Failed to update room calendar.");
    });

    logAuditEvent({
      actionType: "room.date_status.updated",
      module: "room_management",
      entityType: "room_calendar",
      entityId: `${roomId}:${dateKey}`,
      targetLabel: roomBefore.name,
      status: "success",
      reason: "Room calendar day toggled",
      before: { dateKey, status: currentStatus },
      after: { dateKey, status: nextStatus },
    });
  };

  const handleOpenEditRoom = (room) => {
    setEditingRoom(room);
    const branchMeta = getBranchMeta(room.branch);
    setEditForm({
      name: room.name,
      branch: room.branch,
      type: room.type,
      price: room.price,
      status: room.status,
      description: room.description,
      city: room.city || branchMeta?.city || "",
      location: room.location || branchMeta?.address || "",
      guests: room.guests ?? "",
      beds: room.beds ?? "",
      baths: room.baths ?? "",
      size: room.size ?? "",
      image: room.image || "",
      featured: !!room.featured,
    });
  };

  const handleCloseEditRoom = () => {
    setEditingRoom(null);
    setEditForm({
      name: "",
      branch: "",
      type: "",
      price: "",
      status: "",
      description: "",
      city: "",
      location: "",
      guests: "",
      beds: "",
      baths: "",
      size: "",
      image: "",
      featured: false,
    });
  };

  const handleEditInputChange = (field, value) => {
    setEditForm((prev) => {
      if (field === "branch") {
        const branchMeta = getBranchMeta(value);
        return {
          ...prev,
          branch: value,
          city: branchMeta?.city || "",
          location: branchMeta?.address || "",
        };
      }

      if (field === "type") {
        const defaults = getDefaultRoomNumbers(value);
        return {
          ...prev,
          type: value,
          guests: String(defaults.guests),
          beds: String(defaults.beds),
          baths: String(defaults.baths),
          size: String(defaults.size),
        };
      }

      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleSaveRoom = () => {
    if (!editingRoom) return;

    const roomBefore = rooms.find((room) => room.id === editingRoom.id);
    const branchMeta = getBranchMeta(editingRoom.branch || editForm.branch);
    const normalizedPayload = {
      roomName: editForm.name.trim(),
      branch: editForm.branch.trim(),
      city: editForm.city.trim() || branchMeta?.city || "",
      location: editForm.location.trim() || branchMeta?.address || "",
      type: editForm.type,
      price: Number(editForm.price),
      status: editForm.status,
      description: editForm.description.trim(),
      image: editForm.image.trim() || roomBefore?.image,
      guests: Number(editForm.guests) || roomBefore?.guests || 1,
      beds: Number(editForm.beds) || roomBefore?.beds || 1,
      baths: Number(editForm.baths) || roomBefore?.baths || 1,
      size: Number(editForm.size) || roomBefore?.size || 1,
      featured: !!editForm.featured,
      amenities: roomBefore?.amenities || [],
      rating: roomBefore?.rating || 0,
      dateStatuses: roomBefore?.dateStatuses || {},
    };

    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.id === editingRoom.id
          ? {
              ...room,
              ...normalizedPayload,
              available: editForm.status === "Available",
            }
          : room
      )
    );

    setSelectedRoom((prevRoom) => {
      if (!prevRoom || prevRoom.id !== editingRoom.id) return prevRoom;
      return {
        ...prevRoom,
        ...normalizedPayload,
        available: editForm.status === "Available",
      };
    });

    apiPatch(`/rooms/${editingRoom.id}`, normalizedPayload).catch((error) => {
      setRooms((prevRooms) =>
        prevRooms.map((room) =>
          room.id === editingRoom.id ? roomBefore : room
        )
      );
      alert(error.message || "Failed to save room changes.");
    });

    handleCloseEditRoom();

    if (roomBefore) {
      logAuditEvent({
        actionType: "room.updated",
        module: "room_management",
        entityType: "room",
        entityId: String(editingRoom.id),
        targetLabel: roomBefore.name,
        status: "success",
        reason: "Room details saved by admin",
        before: {
          name: roomBefore.name,
          branch: roomBefore.branch,
          type: roomBefore.type,
          price: roomBefore.price,
          status: roomBefore.status,
          description: roomBefore.description,
        },
        after: {
          name: normalizedPayload.roomName,
          branch: normalizedPayload.branch,
          type: normalizedPayload.type,
          price: normalizedPayload.price,
          status: normalizedPayload.status,
          description: normalizedPayload.description,
        },
      });
    }
  };

  const handleNewRoomInputChange = (field, value) => {
    setNewRoomForm((prev) => {
      if (field === "branch") {
        const branchMeta = getBranchMeta(value);
        return {
          ...prev,
          branch: value,
          location: branchMeta?.address || branchLocations[value] || "",
          city: branchMeta?.city || "",
        };
      }
      if (field === "type") {
        const defaults = getDefaultRoomNumbers(value);
        return {
          ...prev,
          type: value,
          guests: String(defaults.guests),
          beds: String(defaults.beds),
          baths: String(defaults.baths),
          size: String(defaults.size),
        };
      }
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleAddRoom = () => {
    if (
      !newRoomForm.name.trim() ||
      !newRoomForm.branch.trim() ||
      !newRoomForm.type.trim() ||
      !newRoomForm.price ||
      !newRoomForm.description.trim()
    ) {
      alert("Please fill in all required room information.");
      return;
    }

    const branchMeta = getBranchMeta(newRoomForm.branch);
    const defaults = getDefaultRoomNumbers(newRoomForm.type);
    const newRoom = {
      id: Date.now(),
      name: newRoomForm.name.trim(),
      branch: newRoomForm.branch,
      location: newRoomForm.location || branchMeta?.address || "Unknown Location",
      city: newRoomForm.city || branchMeta?.city || "",
      type: newRoomForm.type,
      price: Number(newRoomForm.price),
      status: newRoomForm.status,
      description: newRoomForm.description,
      image:
        newRoomForm.image.trim() ||
        getSafeRoomImage({ type: newRoomForm.type, branch: newRoomForm.branch }),
      guests: Number(newRoomForm.guests) || defaults.guests,
      beds: Number(newRoomForm.beds) || defaults.beds,
      baths: Number(newRoomForm.baths) || defaults.baths,
      amenities: [],
      size: Number(newRoomForm.size) || defaults.size,
      rating: defaults.rating,
      featured: !!newRoomForm.featured,
      dateStatuses: {},
      available: newRoomForm.status === "Available",
    };

    setRooms((prev) => [newRoom, ...prev]);
    setShowAddRoomModal(false);
    setNewRoomForm({
      name: "",
      branch: "",
      type: "Standard",
      price: "",
      status: "Available",
      description: "",
      city: "",
      location: "",
      image: "",
      guests: "",
      beds: "",
      baths: "",
      size: "",
      featured: false,
    });

    apiPost("/rooms", {
      roomName: newRoom.name,
      branch: newRoom.branch,
      city: newRoom.city || branchMeta?.city || "",
      location: newRoom.location || branchMeta?.address || "Unknown Location",
      type: newRoom.type,
      price: newRoom.price,
      status: newRoom.status,
      description: newRoom.description,
      image: newRoom.image,
      guests: newRoom.guests,
      beds: newRoom.beds,
      baths: newRoom.baths,
      size: newRoom.size,
      featured: newRoom.featured,
      amenities: [],
      rating: newRoom.rating,
      dateStatuses: newRoom.dateStatuses,
    })
      .then((createdRoom) => {
        setRooms((prev) =>
          prev.map((room) =>
            room.id === newRoom.id ? normalizeRoomFromApi(createdRoom) : room
          )
        );
      })
      .catch((error) => {
        setRooms((prev) => prev.filter((room) => room.id !== newRoom.id));
        alert(error.message || "Failed to create room.");
      });

    logAuditEvent({
      actionType: "room.created",
      module: "room_management",
      entityType: "room",
      entityId: String(newRoom.id),
      targetLabel: newRoom.name,
      status: "success",
      reason: "Room created by admin",
      before: null,
      after: {
        name: newRoom.name,
        branch: newRoom.branch,
        type: newRoom.type,
        price: newRoom.price,
        status: newRoom.status,
      },
    });
  };

  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(
    (room) => room.status === "Occupied"
  ).length;
  const maintenanceRooms = rooms.filter(
    (room) => room.status === "Maintenance"
  ).length;
  const avgPrice =
    rooms.length > 0
      ? Math.round(
          rooms.reduce((sum, room) => sum + (Number(room.price) || 0), 0) /
            rooms.length
        )
      : 0;

  const roomTypes = ["all", ...new Set(rooms.map((room) => room.type))];
  const roomStatuses = ["all", ...new Set(rooms.map((room) => room.status))];

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const query = searchTerm.toLowerCase();

      const matchesSearch =
        room.name.toLowerCase().includes(query) ||
        room.type.toLowerCase().includes(query) ||
        String(room.price).includes(query) ||
        room.branch.toLowerCase().includes(query) ||
        room.location.toLowerCase().includes(query) ||
        room.city.toLowerCase().includes(query);

      const matchesType = selectedType === "all" || room.type === selectedType;
      const matchesStatus =
        selectedStatus === "all" || room.status === selectedStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [rooms, searchTerm, selectedType, selectedStatus]);

  const locale = language === "ar" ? "ar-EG" : language;

  const weekdayLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
    const referenceSunday = new Date(Date.UTC(2026, 2, 1));

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(referenceSunday);
      date.setUTCDate(referenceSunday.getUTCDate() + index);
      return formatter.format(date);
    });
  }, [locale]);

  const getRoomTypeLabel = (type) => {
    if (type === "all") return t("roomMgmt.filter.allTypes");
    return t(`roomMgmt.type.${String(type).toLowerCase()}`);
  };

  const getRoomStatusLabel = (status) => {
    if (status === "all") return t("roomMgmt.filter.allStatus");
    return t(`roomMgmt.status.${String(status).toLowerCase()}`);
  };

  const buildCalendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const startDay = firstDayOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(new Date(year, month, day));
    }
    return cells;
  };

  const calendarDays = buildCalendarDays();

  return (
    <div
      className={`admin-theme admin-route-page flex min-h-screen ${
        darkMode
          ? "admin-theme-dark bg-gray-900 text-white"
          : "admin-theme-light bg-gray-100"
      }`}
    >
      <AdminSidebar collapsed={collapsed} />

      <div className="min-w-0 flex-1">
        <AdminNavbar
          onToggleSidebar={() => setCollapsed(!collapsed)}
          title="Room Management"
        />

        <div className="p-7">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#0f2247]">
                Room Management
              </h1>
              <p className="text-sm text-slate-500">
                Manage rooms and keep user pages in sync automatically.
              </p>
            </div>
          </div>

          {roomsLoading && (
            <div className="mb-6 rounded-2xl border border-blue-100 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
              Loading rooms from the database...
            </div>
          )}

          {roomsError && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">
              {roomsError}
            </div>
          )}

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {t("roomMgmt.stats.totalRooms")}
                </p>
                <h3 className="mt-1 text-2xl font-bold text-[#0f2247]">
                  {totalRooms}
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Building2 size={20} />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {t("roomMgmt.stats.occupied")}
                </p>
                <h3 className="mt-1 text-2xl font-bold text-[#159a66]">
                  {occupiedRooms}
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
                <CheckCircle size={20} />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {t("roomMgmt.stats.maintenance")}
                </p>
                <h3 className="mt-1 text-2xl font-bold text-[#d97706]">
                  {maintenanceRooms}
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                <Wrench size={20} />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {t("roomMgmt.stats.avgPrice")}
                </p>
                <h3 className="mt-1 text-2xl font-bold text-[#0f2247]">
                  ${avgPrice}
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                <Tag size={20} />
              </div>
            </div>
          </div>

          <div className="mb-5 rounded-2xl border border-gray-200 bg-[#C8D9E6] p-3 shadow-sm">
            <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <label className="mb-2 block text-sm font-medium text-[#2F4156]">
                  Search Room
                </label>
                <input
                  type="text"
                  placeholder={t("roomMgmt.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-2 block text-sm font-medium text-[#2F4156]">
                  Select Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="min-w-[115px] rounded-xl border border-gray-200 bg-[#f8fafc] px-3 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-200"
                >
                  {roomTypes.map((type) => (
                    <option key={type} value={type}>
                      {getRoomTypeLabel(type)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="mb-2 block text-sm font-medium text-[#2F4156]">
                  Select Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="min-w-[115px] rounded-xl border border-gray-200 bg-[#f8fafc] px-3 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-200"
                >
                  {roomStatuses.map((status) => (
                    <option key={status} value={status}>
                      {getRoomStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                t={t}
                onToggleStatus={handleToggleStatus}
                onManageDates={handleOpenManageDates}
                onEditRoom={handleOpenEditRoom}
                onDeleteRoom={handleDeleteRoom}
              />
            ))}
          </div>
        </div>

       <button
          onClick={() => setShowAddRoomModal(true)}
          className="group fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#0f2247] text-white shadow-xl transition-all duration-300 hover:w-44 hover:bg-[#163f8f]" 
        >
        <Plus
          size={22}
          className="absolute transition-all duration-300 group-hover:left-5"
        />
        <span className="ml-8 whitespace-nowrap opacity-0 transition-all duration-300 group-hover:opacity-100">
          Add Room
        </span>
      </button>
      </div>

      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-6">
          <div className="custom-scrollbar relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl">
            <button
              onClick={handleCloseManageDates}
              className="absolute right-4 top-4 text-xl text-slate-500 hover:text-slate-800"
            >
              ×
            </button>

            <div className="mb-2">
              <h2 className="text-2xl font-bold text-slate-800">
                {selectedRoom.name}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {selectedRoom.branch} • {selectedRoom.location}
              </p>
            </div>

            <div className="mb-5 flex items-center justify-between">
              <button
                onClick={() =>
                  setCalendarMonth(
                    new Date(
                      calendarMonth.getFullYear(),
                      calendarMonth.getMonth() - 1,
                      1
                    )
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100"
              >
                <ChevronLeft size={20} className="text-slate-600" />
              </button>

              <h2 className="text-2xl font-bold text-slate-800">
                {calendarMonth.toLocaleString(locale, {
                  month: "long",
                  year: "numeric",
                })}
              </h2>

              <button
                onClick={() =>
                  setCalendarMonth(
                    new Date(
                      calendarMonth.getFullYear(),
                      calendarMonth.getMonth() + 1,
                      1
                    )
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100"
              >
                <ChevronRight size={20} className="text-slate-600" />
              </button>
            </div>

            <div className="mb-2 grid grid-cols-7 gap-2">
              {weekdayLabels.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-semibold text-slate-400"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((date, index) => {
                if (!date) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="h-20 rounded-xl bg-transparent"
                    />
                  );
                }

                const dateKey = formatDateKey(date);
                const past = isPastDate(date);
                const bookingDateStatus =
                  bookedDateStatusesByRoom[selectedRoom.id]?.[dateKey] || "available";
                const roomDateStatus =
                  bookingDateStatus === "reserved"
                    ? "reserved"
                    : selectedRoom.dateStatuses?.[dateKey] || "available";
                const lockedByBooking = bookingDateStatus === "reserved";

                let cellStyle =
                  "bg-[#dff4ea] border border-[#98e0bc] text-slate-800";
                let barStyle = "bg-[#2fc98f]";
                let label = t("roomMgmt.calendar.available");
                let hoverText = t("roomMgmt.calendar.clickToBlock");

                if (past) {
                  cellStyle =
                    "bg-[#f1f5f9] border border-[#e2e8f0] text-slate-400";
                  barStyle = "bg-[#cbd5e1]";
                  label = "";
                } else if (roomDateStatus === "reserved") {
                  cellStyle =
                    "bg-[#fde8e8] border border-[#f4b2b2] text-slate-800";
                  barStyle = "bg-[#ff6b6b]";
                  label = t("roomMgmt.calendar.reserved");
                  hoverText = lockedByBooking
                    ? t("roomMgmt.calendar.reserved")
                    : t("roomMgmt.calendar.clickToUnblock");
                }

                return (
                  <div
                    key={dateKey}
                    onClick={() => {
                      if (!past && !lockedByBooking) {
                        handleToggleDateStatus(selectedRoom.id, dateKey);
                      }
                    }}
                    className={`group relative h-20 rounded-xl p-2 transition-all duration-300 ${
                      past || lockedByBooking ? "cursor-not-allowed" : "cursor-pointer"
                    } ${cellStyle}`}
                  >
                    <div className="text-[14px] font-bold">{date.getDate()}</div>

                    {!past && (
                      <>
                        <div
                          className={`absolute bottom-6 left-2 right-2 h-1.5 rounded-full ${barStyle}`}
                        />
                        <div className="absolute bottom-2 left-2 text-[11px] font-medium">
                          {label}
                        </div>
                        <div
                          className={`absolute bottom-2 left-2 right-2 flex h-7 items-center justify-center rounded-md text-center text-[10px] font-semibold text-white whitespace-nowrap opacity-0 transition-all duration-200 group-hover:opacity-100 ${
                            roomDateStatus === "available"
                              ? "bg-[#1fbe86]"
                              : "bg-[#ff5a5a]"
                          }`}
                        >
                          {lockedByBooking ? label : hoverText}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {editingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="custom-scrollbar max-h-[90vh] overflow-y-auto rounded-b-3xl">
              <div className="flex items-center justify-between border-b border-[#163f8f] bg-[#163f8f] px-5 py-4">
                <h2 className="text-xl font-bold text-white">
                  {t("roomMgmt.edit.title")}
                </h2>
                <button
                  onClick={handleCloseEditRoom}
                  className="text-white/70 hover:text-white"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="space-y-5 p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block font-semibold text-slate-600">
                      {t("roomMgmt.edit.room")}
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        handleEditInputChange("name", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-700 outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-semibold text-slate-600">
                      Branch
                    </label>
                    <select
                      value={editForm.branch}
                      onChange={(e) =>
                        handleEditInputChange("branch", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-700 outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      {branchOptions.map((branch) => (
                        <option key={branch} value={branch}>
                          {branch}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block font-semibold text-slate-600">
                      {t("roomMgmt.edit.roomType")}
                    </label>
                    <select
                      value={editForm.type}
                      onChange={(e) =>
                        handleEditInputChange("type", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-700 outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="Standard">
                        {t("roomMgmt.type.standard")}
                      </option>
                      <option value="Deluxe">
                        {t("roomMgmt.type.deluxe")}
                      </option>
                      <option value="Suite">{t("roomMgmt.type.suite")}</option>
                      <option value="Penthouse">
                        {t("roomMgmt.type.penthouse")}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block font-semibold text-slate-600">
                      {t("roomMgmt.edit.pricePerNight")}
                    </label>
                    <input
                      type="number"
                      value={editForm.price}
                      onChange={(e) =>
                        handleEditInputChange("price", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-700 outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block font-semibold text-slate-600">
                    {t("roomMgmt.edit.status")}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        handleEditInputChange("status", "Available")
                      }
                      className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 transition-all duration-200 ${
                        editForm.status === "Available"
                          ? "border-[#34c98f] bg-[#e7f8ef] text-[#159a66]"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Check size={18} />
                      <span className="text-sm font-medium">
                        {t("roomMgmt.status.available")}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleEditInputChange("status", "Occupied")
                      }
                      className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 transition-all duration-200 ${
                        editForm.status === "Occupied"
                          ? "border-[#4b72f2] bg-[#edf2ff] text-[#2f5bdb]"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <User size={18} />
                      <span className="text-sm font-medium">
                        {t("roomMgmt.status.occupied")}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleEditInputChange("status", "Maintenance")
                      }
                      className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 transition-all duration-200 ${
                        editForm.status === "Maintenance"
                          ? "border-[#f0b04f] bg-[#fff4e5] text-[#b56a13]"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Wrench size={18} />
                      <span className="text-sm font-medium">
                        {t("roomMgmt.status.maintenance")}
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block font-semibold text-slate-600">
                    {t("roomMgmt.edit.description")}
                  </label>
                  <textarea
                    rows="3"
                    value={editForm.description}
                    onChange={(e) =>
                      handleEditInputChange("description", e.target.value)
                    }
                    className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-slate-700 outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-semibold text-slate-600">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={editForm.image}
                    onChange={(e) =>
                      handleEditInputChange("image", e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-700 outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Paste image URL or leave empty for default image"
                  />
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={handleCloseEditRoom}
                    className="flex-1 rounded-xl border border-slate-300 py-3 font-semibold text-slate-600 transition-all duration-300 hover:bg-slate-50"
                  >
                    {t("roomMgmt.common.cancel")}
                  </button>

                  <button
                    onClick={handleSaveRoom}
                    className="flex-1 rounded-xl bg-[#0f2247] py-3 font-semibold text-white shadow-md transition-all duration-300 hover:bg-[#163f8f]"
                  >
                    {t("roomMgmt.edit.saveRoom")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="custom-scrollbar max-h-[90vh] overflow-y-auto rounded-b-3xl">
              <div className="flex items-center justify-between border-b border-[#163f8f] bg-[#163f8f] px-5 py-4">
                <h2 className="text-xl font-bold text-white">Add New Room</h2>
                <button
                  onClick={() => setShowAddRoomModal(false)}
                  className="text-white/70 hover:text-white"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="space-y-5 p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block font-semibold text-slate-600">
                      Room Name
                    </label>
                    <input
                      type="text"
                      value={newRoomForm.name}
                      onChange={(e) =>
                        handleNewRoomInputChange("name", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-700 outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="Royal Suite"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-semibold text-slate-600">
                      Branch
                    </label>
                    <select
                      value={newRoomForm.branch}
                      onChange={(e) =>
                        handleNewRoomInputChange("branch", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-700 outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="">Select Branch</option>
                      {branchOptions.map((branch) => (
                        <option key={branch} value={branch}>
                          {branch}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block font-semibold text-slate-600">
                      Room Type
                    </label>
                    <select
                      value={newRoomForm.type}
                      onChange={(e) =>
                        handleNewRoomInputChange("type", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-700 outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="Standard">Standard</option>
                      <option value="Deluxe">Deluxe</option>
                      <option value="Suite">Suite</option>
                      <option value="Penthouse">Penthouse</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block font-semibold text-slate-600">
                      Price per Night ($)
                    </label>
                    <input
                      type="number"
                      value={newRoomForm.price}
                      onChange={(e) =>
                        handleNewRoomInputChange("price", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-700 outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="300"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block font-semibold text-slate-600">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={newRoomForm.image}
                    onChange={(e) =>
                      handleNewRoomInputChange("image", e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-700 outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Paste image URL or leave empty for default image"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    If you leave this empty, we will use a built-in room photo
                    based on the room type.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block font-semibold text-slate-600">
                    Status
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        handleNewRoomInputChange("status", "Available")
                      }
                      className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 transition-all duration-200 ${
                        newRoomForm.status === "Available"
                          ? "border-[#34c98f] bg-[#e7f8ef] text-[#159a66]"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Check size={18} />
                      <span className="text-sm font-medium">Available</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleNewRoomInputChange("status", "Occupied")
                      }
                      className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 transition-all duration-200 ${
                        newRoomForm.status === "Occupied"
                          ? "border-[#4b72f2] bg-[#edf2ff] text-[#2f5bdb]"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <User size={18} />
                      <span className="text-sm font-medium">Occupied</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleNewRoomInputChange("status", "Maintenance")
                      }
                      className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 transition-all duration-200 ${
                        newRoomForm.status === "Maintenance"
                          ? "border-[#f0b04f] bg-[#fff4e5] text-[#b56a13]"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Wrench size={18} />
                      <span className="text-sm font-medium">Maintenance</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block font-semibold text-slate-600">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    value={newRoomForm.description}
                    onChange={(e) =>
                      handleNewRoomInputChange("description", e.target.value)
                    }
                    className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-slate-700 outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Luxury room with ocean view."
                  />
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => setShowAddRoomModal(false)}
                    className="flex-1 rounded-xl border border-slate-300 py-3 font-semibold text-slate-600 transition-all duration-300 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleAddRoom}
                    className="flex-1 rounded-xl bg-[#0f2247] py-3 font-semibold text-white shadow-md transition-all duration-300 hover:bg-[#163f8f]"
                  >
                    Add Room
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminRoomManagement;
