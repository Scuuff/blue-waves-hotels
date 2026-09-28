import useAdminThemeMode from "../hooks/useAdminThemeMode";

export default function BookingTimeline({ booking, onApprove, onCancel, onDelete }) {
  const { darkMode } = useAdminThemeMode();

  if (!booking) {
    return (
      <div className={`rounded-2xl p-6 shadow-md ${darkMode ? "bg-gray-800" : "bg-[#C8D9E6]"}`}>
        <h1 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-[#2F4156]"}`}>
    Booking Timeline
  </h1>

  <p className={`text-sm ${darkMode ? "text-gray-300" : "text-[#2F4156]"}`}>
    Select View customer details to view information
  </p>

      </div>
    );
  }

  return (
    <div className={`rounded-2xl p-6 shadow-md flex flex-col gap-4 ${darkMode ? "bg-gray-800" : "bg-[#C8D9E6]"}`}>

      {/* Title */}
      <h2 className={`text-lg font-bold ${darkMode ? "text-white" : "text-[#2F4156]"}`}>
        Customer Details
      </h2>

      {/* Info */}
      <div className={`text-sm space-y-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>

     <p><span className="font-medium">Name:</span> {booking.name}</p>

     <p><span className="font-medium">Booking ID:</span> {booking.id}</p>

     <p><span className="font-medium">Status:</span> {booking.status}</p>

     <p><span className="font-medium">Email:</span> {booking.email}</p>

     <p><span className="font-medium">Phone:</span> {booking.phone}</p>

     <p><span className="font-medium">Room:</span> {booking.roomName || "Room"}</p>

     <p><span className="font-medium">Notes:</span> {booking.notes}</p>

</div>

      <hr className={darkMode ? "border-gray-600" : "border-gray-300"} />

      
      <div className="text-sm space-y-2">
       <p className={`font-semibold ${darkMode ? "text-white" : "text-[#2F4156]"}`}>
         Payment Steps
       </p>

      {booking.payment?.map((step, index) => (
      <p key={index}>✔ {step}</p>
      ))}

</div>

    

      <hr className={darkMode ? "border-gray-600" : "border-gray-300"} />

      {/* Actions */}
      <div className="flex flex-col gap-3 items-center">
        <div className="flex gap-3">
          <button
            onClick={() => onApprove(booking.id)}
            className="bg-[#2F4156] text-white px-4 py-1 rounded-lg"
          >
            Approve
          </button>

          <button
            onClick={() => onCancel(booking.id)}
            className={`border px-4 py-1 rounded-lg ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
          >
            Cancel
          </button>
        </div>

        <button
          onClick={() => onDelete(booking.id)}
          className="bg-red-600 text-white px-4 py-1 rounded-lg w-fit"
        >
          Delete
        </button>
      </div>

    </div>
  );
}
