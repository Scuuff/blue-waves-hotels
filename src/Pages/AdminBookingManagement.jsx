  import { useState } from "react";
  import AdminNavbar from "../Components/AdminNavbar";
  import AdminSidebar from "../Components/AdminSidebar";
  import StatsCard from "../Components/AdminStatsCard";
  import BookingCard from "../Components/AdminBookingCard";
  import BookingTimeline from "../Components/AdminBookingTimeline";
  import useBookings from "../hooks/useBookings";
  import useAdminThemeMode from "../hooks/useAdminThemeMode";

  export default function BookingManagement() {
    const { darkMode } = useAdminThemeMode();
    const [selectedBooking, setSelectedBooking] = useState(null);

    const [collapsed, setCollapsed] = useState(false);
    const [filterStatus, setFilterStatus] = useState("All");

    const [showForm, setShowForm] = useState(false);
    const [newName, setNewName] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [newPhone, setNewPhone] = useState("");
    const [newRoomName, setNewRoomName] = useState("");
    const [newStatus, setNewStatus] = useState("Pending");

    const { bookings, loading, error, approveBooking, cancelBooking, addBooking, deleteBooking } = useBookings();

    const total = bookings.length;
    const confirmed = bookings.filter(b => b.status === "Confirmed").length;
    const cancelled = bookings.filter(b => b.status === "Cancelled").length;
    const pending = bookings.filter(b => b.status === "Pending").length;

    const handleApproveBooking = async (id) => {
      try {
        await approveBooking(id);
        setSelectedBooking(prev =>
          prev?.id === id ? { ...prev, status: "Confirmed" } : prev
        );
      } catch (err) {
        alert(err.message);
      }
    };

    const handleCancelBooking = async (id) => {
      try {
        await cancelBooking(id);
        setSelectedBooking(prev =>
          prev?.id === id ? { ...prev, status: "Cancelled" } : prev
        );
      } catch (err) {
        alert(err.message);
      }
    };

    const handleDeleteBooking = async (id) => {
      try {
        await deleteBooking(id);
        setSelectedBooking(prev => (prev?.id === id ? null : prev));
      } catch (err) {
        alert(err.message);
      }
    };

    const filteredBookings =
      filterStatus === "All"
        ? bookings
        : bookings.filter(b => b.status === filterStatus);

    return (
      <div className={`admin-theme flex min-h-screen ${darkMode ? "admin-theme-dark bg-gray-900 text-white" : "admin-theme-light bg-white"}`}>

        {/* Sidebar */}
        <AdminSidebar collapsed={collapsed} />

        <div className="flex flex-col flex-1">

          {/* Navbar */}
          <AdminNavbar 
  onToggleSidebar={() => setCollapsed(!collapsed)} 
  title="Booking Management"
/>

          {/* PAGE CONTAINER */}
          <div className="px-8 py-6">

            {/* Header Box */}
            <div className={`border rounded-2xl shadow-md p-6 mb-6 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
              <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-[#2F4156]"}`}>
                Booking Management
              </h1>

              <p className={`mt-2 text-base ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                Manage and track all bookings in one place.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <StatsCard title="Total Bookings" value={total} />
              <StatsCard title="Pending" value={pending} />
              <StatsCard title="Confirmed" value={confirmed} />
              <StatsCard title="Cancelled" value={cancelled} />
            </div>


            {/* Controls Box */}
            <div className={`rounded-2xl shadow-sm p-4 mb-6 flex justify-between items-center ${darkMode ? "bg-gray-800" : "bg-[#C8D9E6]"}`}>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`outline-none border px-3 py-2 rounded-lg ${darkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "border-gray-200 text-gray-700"}`}
              >
                <option value="All">Booking Status</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <button
                onClick={() => setShowForm(true)}
                className="bg-[#2F4156] text-white px-5 py-2 rounded-xl hover:bg-[#1f2e3d] transition"
              >
                Add New Booking
              </button>

            </div>

            {/* Add Booking Form */}
            {showForm && (
              <div className={`p-4 rounded-xl shadow mb-6 grid grid-cols-1 md:grid-cols-5 gap-3 items-center ${darkMode ? "bg-gray-800" : "bg-white"}`}>

                <input
                  type="text"
                  placeholder="Customer Name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className={`border px-3 py-2 rounded-lg ${darkMode ? "bg-gray-700 border-gray-600 text-white" : ""}`}
                />

                <input
                  type="email"
                  placeholder="Email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className={`border px-3 py-2 rounded-lg ${darkMode ? "bg-gray-700 border-gray-600 text-white" : ""}`}
                />

                <input
                  type="text"
                  placeholder="Phone"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  className={`border px-3 py-2 rounded-lg ${darkMode ? "bg-gray-700 border-gray-600 text-white" : ""}`}
                />

                <input
                  type="text"
                  placeholder="Room Name"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className={`border px-3 py-2 rounded-lg ${darkMode ? "bg-gray-700 border-gray-600 text-white" : ""}`}
                />

                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className={`border px-3 py-2 rounded-lg ${darkMode ? "bg-gray-700 border-gray-600 text-white" : ""}`}
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                <button
                  onClick={async () => {
                    try {
                      await addBooking({
                        name: newName,
                        email: newEmail,
                        phone: newPhone,
                        roomName: newRoomName,
                        status: newStatus,
                      });
                      setNewName("");
                      setNewEmail("");
                      setNewPhone("");
                      setNewRoomName("");
                      setNewStatus("Pending");
                      setShowForm(false);
                    } catch (err) {
                      alert(err.message);
                    }
                  }}
                  className="bg-[#C8D9E6] text-[#2F4156] px-4 py-2 rounded-lg md:col-start-5"
                >
                  Save
                </button>

              </div>
            )}

            {/* Booking Cards */}
            <div className="grid grid-cols-4 gap-6">

              <div className="col-span-3 grid grid-cols-3 gap-4 items-start">
                {loading && (
                  <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                    Loading bookings...
                  </p>
                )}

                {error && (
                  <p className="text-red-500">
                    {error}
                  </p>
                )}

                {!loading && !error && filteredBookings.length === 0 && (
                  <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                    No bookings found.
                  </p>
                )}

                {filteredBookings.map(b => (
                  <BookingCard
                    key={b.id}
                   booking={b}
                  onViewDetails={setSelectedBooking}
                  />
                ))}
              </div>
             {/* Timeline */}
              <BookingTimeline
                booking={selectedBooking}
                onApprove={handleApproveBooking}
                onCancel={handleCancelBooking}
                onDelete={handleDeleteBooking}
             />

            </div>

          </div>
        </div>
      </div>
    );
  }
