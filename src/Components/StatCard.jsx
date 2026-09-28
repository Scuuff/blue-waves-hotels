import React from "react";
import useAdminThemeMode from "../hooks/useAdminThemeMode";

function StatCard({ icon, title, value }) {
  const { darkMode } = useAdminThemeMode();

  return (
    <div className={`group relative p-5 rounded-2xl flex justify-between items-center shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
      darkMode ? "bg-gray-800 text-white" : "bg-white text-[#2c3a47]"
    }`}>

      {/*  Hover background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#7ea0d6] to-[#163f8f] opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

      {/* CONTENT */}
      <div className="relative z-10 flex justify-between w-full items-center">

        {/* TEXT */}
        <div className="transition-all duration-300 group-hover:text-white">
          <p className="text-sm opacity-80">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>

        {/* ICON */}
        <div className={`text-3xl transition-all duration-300 group-hover:text-white group-hover:scale-110 ${
          darkMode ? "text-blue-400" : "text-[#7ea0d6]"
        }`}>
          {icon}
        </div>

      </div>
    </div>
  );
}

export default StatCard;