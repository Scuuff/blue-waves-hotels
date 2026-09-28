import { useState, useEffect } from "react";
import useAdminThemeMode from "../hooks/useAdminThemeMode";

export default function BookingStats() {
  const [occupancy, setOccupancy] = useState(0);
  const { darkMode } = useAdminThemeMode();

  useEffect(() => {
    let value = 0;

    const interval = setInterval(() => {
      value += 1;

      if (value > 75) {
        clearInterval(interval);
      } else {
        setOccupancy(value);
      }
    }, 20);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`p-6 rounded-2xl shadow-md mt-6 max-w-3xl ${darkMode ? "bg-gray-800" : "bg-white"}`}>

      <h3 className={`font-semibold mb-6 ${darkMode ? "text-white" : "text-[#2c3a47]"}`}>
        Booking Stats
      </h3>

      <div className="grid grid-cols-3 items-center gap-6">

        {/*  Circle */}
        <div className="flex justify-center">
          <div className="w-28 h-28 border-[10px] border-blue-500 rounded-full flex items-center justify-center font-bold">
            {occupancy}%
          </div>
        </div>

        {/*  Center */}
        <div className="text-center">
          <h2 className="text-3xl font-bold">{occupancy}%</h2>
          <p className={darkMode ? "text-gray-400" : "text-gray-500"}>Occupancy Hotel</p>

          <div className={`w-full h-2 rounded mt-3 ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
            <div
              className="h-2 bg-blue-500 rounded"
              style={{ width: `${occupancy}%` }}
            ></div>
          </div>
        </div>

        {/*  Right */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span>Available rooms</span>
            <span className="text-blue-500">20</span>
          </div>

          <div className="flex justify-between">
            <span>Occupied rooms</span>
            <span className="text-yellow-500">10</span>
          </div>

          <div className="flex justify-between">
            <span>Cancelled</span>
            <span className="text-red-500">6</span>
          </div>
        </div>

      </div>
    </div>
  );
}