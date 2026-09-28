import useAdminThemeMode from "../hooks/useAdminThemeMode";

export default function StatsCard({ title, value }) {
  const { darkMode } = useAdminThemeMode();

  return (
    <div className={`p-4 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-28 ${
      darkMode
        ? "bg-gradient-to-r from-gray-800 to-gray-700"
        : "bg-gradient-to-r from-[#dce6ef] to-[#cfd9e3]"
    }`}>

      <div className="flex items-center gap-3">

        {/* Circle number */}
        <div className="w-12 h-12 rounded-full bg-[#163f8f] text-white flex items-center justify-center font-bold text-lg">
          {value}
        </div>

        {/* Title */}
        <h3 className={`font-semibold text-sm ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
          {title}
        </h3>

      </div>

      {/* Decorative line */}
      <svg viewBox="0 0 200 40" className="w-full h-8 opacity-70">
        <path
          d="M0 25 C40 5, 80 40, 120 20 S160 10, 200 25"
          stroke={darkMode ? "#60a5fa" : "#3b82f6"}
          strokeWidth="3"
          fill="none"
        />
      </svg>

    </div>
  );
}