import React from "react";
import {
  CalendarDays,
  Pencil,
  Trash2,
  Check,
  User,
  Wrench,
  MapPin,
} from "lucide-react";
import useAdminThemeMode from "../hooks/useAdminThemeMode";
import { getSafeRoomImage } from "../utils/roomMedia";

function RoomCard({ room, t, onToggleStatus, onManageDates, onEditRoom, onDeleteRoom }) {
  const { darkMode } = useAdminThemeMode();
  const getStatusLabel = (status) => {
    return t(`roomMgmt.status.${String(status).toLowerCase()}`);
  };

  const getRoomTypeLabel = (type) => {
    return t(`roomMgmt.type.${String(type).toLowerCase()}`);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Available":
        return {
          badge: "bg-[#d7f7e8] text-[#159a66]",
          icon: <Check size={14} />,
        };
      case "Occupied":
        return {
          badge: "bg-[#dfe7ff] text-[#2f5bdb]",
          icon: <User size={14} />,
        };
      case "Maintenance":
        return {
          badge: "bg-[#fdecc8] text-[#b56a13]",
          icon: <Wrench size={14} />,
        };
      default:
        return {
          badge: "bg-gray-100 text-gray-600",
          icon: null,
        };
    }
  };

  const statusStyle = getStatusStyle(room.status);

  return (
    <div className={`rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition-all duration-300 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
      <div className="relative h-48 overflow-hidden">
        <img
          src={getSafeRoomImage(room)}
          onError={(e) => {
            e.currentTarget.src = getSafeRoomImage({ type: room.type });
          }}
          alt={room.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        <div
          className={`absolute right-3 top-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm ${statusStyle.badge}`}
        >
          {statusStyle.icon}
          <span>{getStatusLabel(room.status)}</span>
        </div>

        <div className="absolute bottom-4 left-4 text-white">
          <h2 className="text-2xl font-bold leading-none drop-shadow-md">
            {room.name}
          </h2>

          <p className="mt-2 text-sm font-medium text-white/95">
            {getRoomTypeLabel(room.type)}
          </p>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className={`text-xs font-bold tracking-wide uppercase ${darkMode ? "text-gray-400" : "text-slate-500"}`}>
              {t("roomMgmt.pricePerNight")}
            </p>
            <h3 className={`text-2xl font-extrabold mt-1 ${darkMode ? "text-white" : "text-[#0f2247]"}`}>
              ${room.price}
            </h3>

            <div className="mt-2 flex items-center gap-1.5 text-sm font-medium text-slate-500">
              <MapPin size={14} />
              <span>{room.branch || "Unknown Branch"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onManageDates(room)}
              className={`w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#163f8f] hover:text-white transition-all duration-300 ${darkMode ? "bg-gray-700 text-gray-300" : "bg-slate-100 text-slate-600"}`}
            >
              <CalendarDays size={16} />
            </button>

            <button
              onClick={() => onEditRoom(room)}
              className={`w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#163f8f] hover:text-white transition-all duration-300 ${darkMode ? "bg-gray-700 text-gray-300" : "bg-slate-100 text-slate-600"}`}
            >
              <Pencil size={16} />
            </button>

            <button
              onClick={() => onDeleteRoom(room)}
              className={`w-9 h-9 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all duration-300 ${darkMode ? "bg-gray-700 text-gray-300" : "bg-slate-100 text-slate-600"}`}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <p className={`text-sm mt-4 min-h-[44px] ${darkMode ? "text-gray-400" : "text-slate-600"}`}>
          {room.description}
        </p>

        <hr className={`my-4 ${darkMode ? "border-gray-700" : "border-gray-200"}`} />

        <div className="flex gap-2.5">
          <button
            onClick={() => onToggleStatus(room.id)}
            className={`flex-1 border font-semibold text-sm py-2.5 rounded-xl transition-all duration-300 ${darkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-slate-200 text-slate-600 hover:bg-slate-100"}`}
          >
            {t("roomMgmt.toggleStatus")}
          </button>

          <button
            onClick={() => onManageDates(room)}
            className="flex-1 rounded-xl bg-[#0f2247] py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#163f8f]"
          >
            {t("roomMgmt.manageDates")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoomCard;
