export default function BookingCard({
  checkIn,
  checkOut,
  setCheckIn,
  setCheckOut,
  onCheckAvailability,
  isLoading = false
}) {
  return (
    <div className="bg-[#edf7ff] shadow-lg rounded-xl p-6 dark:bg-[#0f1f33] dark:ring-1 dark:ring-white/10">

      <h2 className="text-2xl font-semibold mb-4 dark:text-white">
        Select Your Dates
      </h2>

      <div className="mb-4">
        <label className="text-gray-600 text-sm dark:text-white/65">
          Check-in
        </label>

        <input
          type="date"
          value={checkIn}
          onChange={(e)=>setCheckIn(e.target.value)}
          className="w-full border rounded p-2 mt-1 dark:border-white/15 dark:bg-[#15273f] dark:text-white dark:[color-scheme:dark]"
          disabled={isLoading}
        />
      </div>

      <div className="mb-4">
        <label className="text-gray-600 text-sm dark:text-white/65">
          Check-out
        </label>

        <input
          type="date"
          value={checkOut}
          onChange={(e)=>setCheckOut(e.target.value)}
          className="w-full border rounded p-2 mt-1 dark:border-white/15 dark:bg-[#15273f] dark:text-white dark:[color-scheme:dark]"
          disabled={isLoading}
        />
      </div>

      <button
        onClick={onCheckAvailability}
        disabled={isLoading}
        className={`w-full mt-4 bg-[#1e3a8a] text-white py-3 rounded-lg hover:bg-white hover:text-[#1e3a8a] border border-[#1e3a8a] transition duration-300 dark:bg-[#2f6fb3] dark:border-[#2f6fb3] dark:hover:bg-[#9fc0ec] dark:hover:text-[#0c1828] dark:hover:border-[#9fc0ec] ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isLoading ? 'Checking Availability...' : 'Check Availability'}
      </button>

    </div>
  );
}