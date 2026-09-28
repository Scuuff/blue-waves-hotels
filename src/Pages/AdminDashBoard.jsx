import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../Components/AdminNavbar";
import AdminSidebar from "../Components/AdminSidebar";
import StatCard from "../Components/StatCard";
import AdminMoves from "../Components/AdminBookingStates";
import useAdminThemeMode from "../hooks/useAdminThemeMode";
import { useAuth } from "../Context/AuthContext";

import {
  CalendarCheck,
  Users,
  BedDouble,
  XCircle,
  Plus,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

function formatDate(dateValue) {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getBookingDate(booking) {
  return booking.createdAt || booking.checkIn || new Date().toISOString();
}

function getStatusSelectClass(status) {
  switch (status) {
    case "Confirmed":
      return "bg-green-100 text-green-700 border border-green-200";
    case "Cancelled":
      return "bg-red-100 text-red-700 border border-red-200";
    case "Pending":
    default:
      return "bg-yellow-100 text-yellow-800 border border-yellow-200";
  }
}

export default function AdminDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const { darkMode } = useAdminThemeMode();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tasks, setTasks] = useState([
    { text: "Respond to new inquiries", done: true },
    { text: "Check room availability", done: true },
    { text: "Follow up on pending bookings", done: false },
  ]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const token = getToken();

        const res = await fetch("/api/bookings", {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load bookings");
        }

        setBookings(Array.isArray(data) ? data : []);
        setError("");
      } catch (err) {
        setBookings([]);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const token = getToken();

      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update booking status");
      }

      setBookings(prev =>
        prev.map(booking => (booking._id === id ? data : booking))
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const addTask = () => {
    const newTask = prompt("Enter new task:");
    if (!newTask || newTask.trim() === "") return;
    setTasks(prev => [...prev, { text: newTask.trim(), done: false }]);
  };

  const toggleTask = (index) => {
    setTasks(prev =>
      prev.map((task, taskIndex) =>
        taskIndex === index ? { ...task, done: !task.done } : task
      )
    );
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const totalBookings = bookings.length;
  const confirmed = bookings.filter(b => b.status === "Confirmed").length;
  const pending = bookings.filter(b => b.status === "Pending").length;
  const cancelled = bookings.filter(b => b.status === "Cancelled").length;
  const availableRooms = 20;

  const chartData = useMemo(() => {
    return MONTHS.map((month, index) => {
      const monthBookings = bookings.filter(booking => {
        const date = new Date(getBookingDate(booking));
        return !Number.isNaN(date.getTime()) && date.getMonth() === index;
      });

      return {
        month,
        bookings: monthBookings.length,
        confirmed: monthBookings.filter(b => b.status === "Confirmed").length,
        cancelled: monthBookings.filter(b => b.status === "Cancelled").length,
      };
    });
  }, [bookings]);

  const recentBookings = useMemo(() => {
    return [...bookings]
      .sort((a, b) => new Date(getBookingDate(b)) - new Date(getBookingDate(a)))
      .slice(0, 6);
  }, [bookings]);

  const topCustomers = useMemo(() => {
    const customers = new Map();

    bookings.forEach(booking => {
      const key = booking.email || booking.name || booking._id;
      const current = customers.get(key) || {
        name: booking.name || "Guest",
        email: booking.email,
        count: 0,
      };
      customers.set(key, { ...current, count: current.count + 1 });
    });

    return [...customers.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [bookings]);

  return (
    <div className={`admin-theme flex h-screen ${darkMode ? "admin-theme-dark bg-gray-900 text-white" : "admin-theme-light bg-[#f5f7fb]"}`}>
      <AdminSidebar collapsed={collapsed} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar
          title="Dashboard"
          onToggleSidebar={() => setCollapsed(!collapsed)}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-4 gap-5 mb-6">
            <StatCard icon={<CalendarCheck />} title="Total Bookings" value={loading ? "..." : totalBookings} />
            <StatCard icon={<Users />} title="Pending" value={loading ? "..." : pending} />
            <StatCard icon={<BedDouble />} title="Available Rooms" value={availableRooms} />
            <StatCard icon={<XCircle />} title="Cancelled" value={loading ? "..." : cancelled} />
          </div>

          <div className="grid grid-cols-3 gap-5 mb-6">
            <div className="col-span-2 flex flex-col gap-5">
              <div className={`p-5 rounded-2xl shadow-sm h-64 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                <h3 className={`font-semibold mb-4 ${darkMode ? "text-white" : "text-[#2c3a47]"}`}>
                  Booking Overview
                </h3>

                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <XAxis dataKey="month" />
                      <Tooltip />
                      <Area type="monotone" dataKey="bookings" stroke="#163f8f" fill="#163f8f33" />
                      <Area type="monotone" dataKey="confirmed" stroke="#7ea0d6" fill="#7ea0d633" />
                      <Area type="monotone" dataKey="cancelled" stroke="#f56565" fill="#f5656533" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className={`p-5 rounded-2xl shadow-sm ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                <h3 className={`font-semibold mb-4 ${darkMode ? "text-white" : "text-[#2c3a47]"}`}>
                  Recent Bookings
                </h3>

                <table className="w-full text-sm">
                  <thead>
                    <tr className={`text-left border-b ${darkMode ? "text-gray-400 border-gray-700" : "text-gray-500"}`}>
                      <th className="py-2">Booking ID</th>
                      <th>Guest Name</th>
                      <th>Check-In</th>
                      <th>Check-Out</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {!loading && recentBookings.length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-4 text-center text-gray-400">
                          No bookings found.
                        </td>
                      </tr>
                    )}

                    {recentBookings.map(booking => (
                      <tr key={booking._id} className={`border-b transition ${darkMode ? "border-gray-700 hover:bg-gray-700" : "hover:bg-gray-50"}`}>
                        <td className="py-3 text-blue-600 font-medium">
                          {booking._id?.slice(-6) || "-"}
                        </td>
                        <td>{booking.name || "-"}</td>
                        <td>{formatDate(booking.checkIn)}</td>
                        <td>{formatDate(booking.checkOut)}</td>
                        <td>
                          <select
                            value={booking.status || "Pending"}
                            onChange={(e) => updateStatus(booking._id, e.target.value)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium outline-none ${getStatusSelectClass(booking.status || "Pending")}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <AdminMoves />
            </div>

            <div className="flex flex-col gap-4">
              <div className={`p-5 rounded-2xl shadow-sm ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`font-semibold ${darkMode ? "text-white" : "text-[#2c3a47]"}`}>
                    Tasks
                  </h3>

                  <button
                    onClick={addTask}
                    className="flex items-center gap-1 bg-[#163f8f] text-white px-3 py-1.5 rounded-lg text-sm"
                  >
                    <Plus size={14} />
                    Add New
                  </button>
                </div>

                <div className="divide-y">
                  {tasks.map((task, index) => (
                    <div
                      key={task.text}
                      onClick={() => toggleTask(index)}
                      className="flex items-center justify-between py-3 cursor-pointer"
                    >
                      <span>{task.text}</span>
                      <span>{task.done ? "Done" : "Pending"}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`p-5 rounded-2xl shadow-sm ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                <h3 className={`font-semibold mb-4 ${darkMode ? "text-white" : "text-[#2c3a47]"}`}>
                  Top Customers
                </h3>

                <div className="space-y-4 divide-y">
                  {!loading && topCustomers.length === 0 && (
                    <p className="py-3 text-sm text-gray-400">
                      No customers yet.
                    </p>
                  )}

                  {topCustomers.map((customer, index) => (
                    <div key={customer.email || customer.name} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://i.pravatar.cc/40?img=${index + 10}`}
                          alt={customer.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className={`font-medium ${darkMode ? "text-white" : "text-[#2c3a47]"}`}>
                            {customer.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {customer.count} Bookings
                          </p>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-[#5b8cff] to-[#3b6edc] text-white px-3 py-1 rounded-lg text-sm">
                        {customer.count}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
