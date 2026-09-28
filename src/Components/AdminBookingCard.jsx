import useAdminThemeMode from "../hooks/useAdminThemeMode";

export default function BookingCard({ booking, onViewDetails }) {
  const { darkMode } = useAdminThemeMode();

  const statusColor =
    booking.status === "Confirmed"
      ? "bg-blue-200 text-gray-700"
      : "bg-red-200 text-red-700";

  return (
    <div className={`rounded-2xl shadow-md p-5 flex flex-col gap-4 ${darkMode ? "bg-gray-800 text-white" : "bg-white"}`}>

      {/* Booking ID */}
      <h2 className={`font-bold text-lg ${darkMode ? "text-white" : "text-gray-800"}`}>
        {booking.id}
      </h2>

      {/* Customer Name */}
      <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
        {booking.name}
      </p>

    {/* Status + Wave */}
<div className="relative">

  {/* Status */}
  <span className={`px-4 py-1 rounded-full text-sm font-medium w-fit ${statusColor} relative z-10`}>
    {booking.status}
  </span>

  {/* Wave */}
  <div className="absolute top-6 left-0 w-full opacity-30 z-0">
    <svg viewBox="0 0 500 100" className="w-full h-12">
      <path
        d="M0 50 C150 100 350 0 500 50 L500 100 L0 100 Z"
        fill={darkMode ? "#4b7399" : "#8fb3c9"}
      />
    </svg>
  </div>

</div>

{/* Divider BELOW wave  */}
<div className={`border-t-2 mt-10 ${darkMode ? "border-gray-600" : "border-gray-400"}`}></div>

  
      {/* Button */}
      <button
        onClick={() => onViewDetails(booking)}
        className="bg-[#2F4156] text-white px-4 py-2 rounded-xl hover:bg-[#1f2e3d] transition "
      >
        View Customer Details
      </button>

    </div>
  );
}