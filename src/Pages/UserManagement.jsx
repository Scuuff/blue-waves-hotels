import React, { useEffect, useMemo, useState } from "react";
import { 
  Users, UserCheck, UserX, Briefcase, ShoppingBag, 
  Download, Search, Check, Mail, Phone, UserPlus, X 
} from 'lucide-react';
import useAdminThemeMode from "../hooks/useAdminThemeMode";
import { apiGet, apiPatch, apiPost } from "../services/apiClient";
import AdminSidebar from "../Components/AdminSidebar";
import AdminNavbar from "../Components/AdminNavbar";

// --- Configuration & Helpers ---
const ACTIVITY_UI = {
  login: { icon: 'M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1', color: 'text-blue-600 bg-blue-50' },
  logout: { icon: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1', color: 'text-slate-400 bg-slate-50' },
  profile_updated: { icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', color: 'text-sky-500 bg-sky-50' },
  booking_created: { icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'text-indigo-600 bg-indigo-50' },
  booking_cancelled: { icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-red-600 bg-red-50' },
  payment_made: { icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', color: 'text-emerald-600 bg-emerald-50' },
  staff_added: { icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z', color: 'text-orange-600 bg-orange-50' },
  status_changed: { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', color: 'text-purple-600 bg-purple-50' },
  report_downloaded: { icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z', color: 'text-blue-700 bg-blue-100' },
};

const formatDate = (date, full = false) =>
  new Date(date).toLocaleDateString(
    "en-US",
    full
      ? {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      : { year: "numeric", month: "short", day: "numeric" }
  );

const makeAvatarUrl = (user) =>
  user.avatar ||
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
    `${user.firstName || ""}${user.lastName || ""}`.trim() || user.email || String(user.id)
  )}`;

const formatActivitySummary = (activity = {}) => {
  const meta = activity.metadata || {};

  if (activity.type === "booking_created") {
    const roomName = meta.roomName || activity.roomName || "Room";
    const nights = Number(meta.nights || activity.nights || 0);
    const bookedRoomLabel = nights > 0 ? `Booked "${roomName}" for ${nights} night${nights === 1 ? "" : "s"}` : `Booked "${roomName}"`;
    return {
      title: bookedRoomLabel,
      details: [
        meta.branch ? `Branch: ${meta.branch}` : "",
        meta.checkIn ? `Check-in: ${formatDate(meta.checkIn)}` : "",
        meta.checkOut ? `Check-out: ${formatDate(meta.checkOut)}` : "",
      ].filter(Boolean),
      time: activity.createdAt || activity.timestamp,
    };
  }

  if (activity.type === "login") {
    return {
      title: "User logged into the system",
      details: [
        meta.loginAt ? `Login time: ${formatDate(meta.loginAt, true)}` : "",
        meta.ipAddress ? `IP: ${meta.ipAddress}` : "",
      ].filter(Boolean),
      time: activity.createdAt || meta.loginAt || activity.timestamp,
    };
  }

  if (activity.type === "status_changed") {
    return {
      title:
        meta.nextStatus === "blocked"
          ? "Account blocked"
          : meta.nextStatus === "active"
            ? "Account unblocked"
            : activity.title || "Status updated",
      details: [
        meta.previousStatus ? `Previous: ${meta.previousStatus}` : "",
        meta.nextStatus ? `Current: ${meta.nextStatus}` : "",
      ].filter(Boolean),
      time: activity.createdAt || activity.timestamp,
    };
  }

  return {
    title: activity.description || activity.title || "Activity update",
    details: [],
    time: activity.createdAt || activity.timestamp,
  };
};

const normalizeUser = (user = {}) => ({
  ...user,
  id: user.id || user._id,
  status: String(user.status || "active").toLowerCase(),
  role: String(user.role || "customer").toLowerCase(),
  displayRole: String(user.role || "customer").toLowerCase() === "admin" ? "staff" : "customer",
  roleLabel: String(user.role || "customer").toLowerCase() === "admin" ? "Staff" : "Customer",
  createdAt: user.createdAt || user.joinedDate || new Date().toISOString(),
  joinedDate: user.createdAt || user.joinedDate || new Date().toISOString(),
  avatar: makeAvatarUrl(user),
  activityHistory: Array.isArray(user.activityHistory) ? user.activityHistory : [],
});

const ActivityModal = ({ user, onClose }) => {
  const activities = [...(user.activityHistory || [])].sort(
    (a, b) => new Date(b.createdAt || b.timestamp || 0) - new Date(a.createdAt || a.timestamp || 0)
  );
  
  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="bg-blue-900 px-6 py-4 flex items-center justify-between text-white border-b border-blue-800">
          <div className="flex items-center gap-4">
            <div className="relative">
                <img src={user.avatar} className="w-10 h-10 rounded-full border-2 border-blue-400 bg-slate-100" alt="" />
                <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-blue-900 ${user.status === 'active' ? 'bg-emerald-500' : 'bg-pink-500'}`}></span>
            </div>
            <div>
              <h3 className="font-semibold leading-tight">{user.firstName} {user.lastName}</h3>
              <p className="text-[10px] text-blue-300 uppercase tracking-widest font-bold">{user.roleLabel || user.displayRole || user.role} Activity Log</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-blue-800 rounded-lg transition-colors text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 bg-slate-50/50">
          {activities.length ? activities.map(act => (
            <div key={act._id || act.id || `${act.type}-${act.createdAt}`} className={`flex gap-4 p-4 rounded-xl border bg-white shadow-sm transition-all hover:shadow-md ${act.type === 'booking_cancelled' ? 'border-red-100' : 'border-slate-100'}`}>
              <div className={`p-2.5 rounded-xl h-fit shadow-sm ${ACTIVITY_UI[act.type]?.color || 'bg-slate-50'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ACTIVITY_UI[act.type]?.icon} />
                </svg>
              </div>
              <div className="flex-1">
                {(() => {
                  const summary = formatActivitySummary(act);
                  return (
                    <>
                <div className="flex justify-between items-start">
                    <p className={`text-sm font-bold ${act.type === 'booking_cancelled' ? 'text-red-900' : 'text-slate-800'}`}>
                        {summary.title}
                    </p>
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">{String(act.type || "").replace('_', ' ')}</span>
                </div>
                {summary.details.length > 0 && (
                  <div className="mt-2 space-y-1 rounded-xl bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-500">
                    {summary.details.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                )}
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-50">
                    <p className="text-[10px] font-medium text-slate-400">{formatDate(summary.time, true)}</p>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-slate-300 uppercase">Activity Logged</span>
                    </div>
                </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )) : (
            <div className="text-center py-16">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-400 font-bold">No activity logs found for this {user.roleLabel || user.displayRole || user.role}.</p>
                <p className="text-xs text-slate-300 mt-1">Actions performed by this user will appear here.</p>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-[#e1f0ff] border-t border-slate-100 flex justify-end items-center">
            <button onClick={onClose} className="px-6 py-2 bg-[#00499f] text-[#F0F7FF] rounded-xl text-xs font-bold hover:bg-[#0062d1] transition-all">Close History</button>
        </div>
      </div>
    </div>
  );
};

const UserManagement = () => {
  const { darkMode } = useAdminThemeMode();
  const [collapsed, setCollapsed] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    role: "all",
    status: "all",
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false); 
  const itemsPerPage = 5;

  const [newStaff, setNewStaff] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    let isMounted = true;

    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        setLoadError("");

        const data = await apiGet("/auth/users");
        if (!isMounted) return;

        const normalizedUsers = Array.isArray(data?.users)
          ? data.users.map(normalizeUser)
          : [];

        setUsers(normalizedUsers);
      } catch (error) {
        if (isMounted) {
          setUsers([]);
          setLoadError(error.message || "Failed to load users.");
        }
      } finally {
        if (isMounted) {
          setLoadingUsers(false);
        }
      }
    };

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        filters.search === "" ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(filters.search.toLowerCase()) ||
        u.email.toLowerCase().includes(filters.search.toLowerCase());
      const matchesRole = filters.role === "all" || u.displayRole === filters.role;
      const matchesStatus = filters.status === "all" || u.status === filters.status;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, filters]);

  const handleAddStaff = (e) => {
    e.preventDefault();
    apiPost("/auth/users", {
      firstName: newStaff.firstName,
      lastName: newStaff.lastName,
      email: newStaff.email,
      phone: newStaff.phone,
      address: newStaff.address,
      role: "admin",
    })
      .then((data) => {
        const createdUser = normalizeUser(data?.user || {});
        setUsers((prev) => [createdUser, ...prev]);
        setIsAddUserOpen(false);
        setNewStaff({ firstName: '', lastName: '', email: '', phone: '', address: '' });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        if (data?.temporaryPassword) {
          alert(`Staff profile created. Temporary password: ${data.temporaryPassword}`);
        }
      })
      .catch((error) => {
        console.error("Failed to create staff member:", error.message);
        alert(error.message || "Failed to create staff member.");
      });
  };

  const handleDownloadReport = () => {
    const headers = ["ID", "Name", "Email", "Role", "Status", "Joined Date"];
    const rows = filteredUsers.map(u => [u.id, `"${u.firstName} ${u.lastName}"`, u.email, u.roleLabel || u.displayRole || u.role, u.status, u.joinedDate || 'N/A']);
    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `User_Report_${new Date().toLocaleDateString()}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);

  };

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const toggleStatus = (id) => {
    const target = users.find((u) => u.id === id);
    if (target) {
      const nextStatus = target.status === "active" ? "blocked" : "active";
      apiPatch(`/auth/users/${id}/status`, { status: nextStatus })
        .then((data) => {
          const updatedUser = normalizeUser(data?.user || {});
          setUsers((prev) =>
            prev.map((u) => (u.id === id ? { ...u, ...updatedUser } : u))
          );
          setSelectedUser((prev) => (prev && prev.id === id ? { ...prev, ...updatedUser } : prev));
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        })
        .catch((error) => {
          console.error("Failed to update user status:", error.message);
        });
    }
  };

  const stats = [
    { label: 'Total Users', val: users.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-500', hover: 'hover:border-blue-400 hover:shadow-blue-100 hover:bg-blue-50' },
    { label: 'Active', val: users.filter(u => u.status === 'active').length, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-500', hover: 'hover:border-emerald-400 hover:shadow-emerald-100 hover:bg-emerald-50' },
    { label: 'Blocked', val: users.filter(u => u.status === 'blocked').length, icon: UserX, color: 'text-pink-600', bg: 'bg-pink-500', hover: 'hover:border-pink-400 hover:shadow-pink-100 hover:bg-pink-50' },
    { label: 'Staff Members', val: users.filter(u => u.displayRole === 'staff').length, icon: Briefcase, color: 'text-orange-600', bg: 'bg-orange-500', hover: 'hover:border-orange-400 hover:shadow-orange-100 hover:bg-orange-50' },
    { label: 'Customers', val: users.filter(u => u.displayRole === 'customer').length, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-500', hover: 'hover:border-blue-400 hover:shadow-blue-100 hover:bg-blue-50' }
  ];

  return (
    <div className={`admin-theme flex h-screen ${darkMode ? "admin-theme-dark bg-gray-900 text-white" : "admin-theme-light bg-[#f5f7fb]"}`}>
      <AdminSidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar title="User Management" onToggleSidebar={() => setCollapsed(!collapsed)} />
        <div className="flex-1 overflow-y-auto">
    <div className={`p-8 space-y-8 ${darkMode ? "bg-gray-900" : "bg-slate-50"} min-h-full relative`}>
      {showSuccess && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3">
            <Check className="w-5 h-5" strokeWidth={3} />
            <span className="font-bold uppercase tracking-wide text-sm">Action Successful</span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">User Management</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage, filter, and monitor all system participants.</p>
        </div>
        
        <button 
          onClick={handleDownloadReport}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
        >
          <Download className="w-5 h-5" />
          Download Report
        </button>
      </div>

      {loadError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((s) => (
          <div key={s.label} className={`group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-all duration-300 cursor-default ${s.hover}`}>
            <div className={`w-12 h-12 ${s.bg} rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg transition-transform duration-300 group-hover:scale-110`}>
              <s.icon className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">{s.label}</p>
            <p className={`text-4xl font-black mt-1 ${s.color} tracking-tight`}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-[#e1f0ff] p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-300"
            placeholder="e.g. John Smith" 
            value={filters.search}
            onChange={e => { setFilters({...filters, search: e.target.value}); setCurrentPage(1); }} 
          />
        </div>
        <div className="flex flex-wrap gap-4 items-center">
            <select 
              className="px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-bold text-slate-600 text-sm cursor-pointer text-center appearance-none" 
              value={filters.role} 
              onChange={e => { setFilters({...filters, role: e.target.value}); setCurrentPage(1); }}
            >
              <option value="all">All Roles ▾</option>
              <option value="staff">Staff</option>
              <option value="customer">Customer</option>
            </select>
            <select 
              className="px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-bold text-slate-600 text-sm cursor-pointer text-center appearance-none" 
              value={filters.status} 
              onChange={e => { setFilters({...filters, status: e.target.value}); setCurrentPage(1); }}
            >
              <option value="all">Any Status ▾</option>
              <option value="active">Active Only</option>
              <option value="blocked">Blocked Only</option>
            </select>

            <button 
              onClick={() => setIsAddUserOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
            >
              <UserPlus className="w-5 h-5" />
              Add Staff Member
            </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-blue-50 border-b border-blue-100 text-blue-900 text-xs font-bold uppercase">
              <tr>
                <th className="px-8 py-5">User Profile</th>
                <th className="px-8 py-5">Contact</th>
                <th className="px-8 py-5">Join Date</th>
                <th className="px-8 py-5">Role</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {loadingUsers ? (
                <tr>
                  <td colSpan="6" className="px-8 py-24 text-center text-slate-400 font-bold text-lg">
                    Loading users...
                  </td>
                </tr>
              ) : currentData.length > 0 ? currentData.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={u.avatar} className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-100 object-cover" alt="" />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-4 border-white rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-pink-500'}`}></div>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-base">{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-slate-400 font-medium">{u.address || '123 Main St, New York'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-600 font-medium">
                        <Mail className="w-3.5 h-3.5 text-orange-500" />
                        <span>{u.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-xs">
                        <Phone className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{u.phone || '+1 (555) 123-4567'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-slate-500 font-semibold">{formatDate(u.createdAt)}</td>
                  <td className="px-8 py-5">
                    <span className={`px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-wider ${
                      u.displayRole === 'staff' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                    }`}>
                      {u.roleLabel}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${u.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-pink-50 text-pink-600'}`}>
                        {u.status}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => setSelectedUser(u)} className="p-2.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all" title="View Activity">
                        <Search className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => toggleStatus(u.id)}
                        className={`p-2.5 rounded-xl transition-all ${u.status === 'active' ? 'text-slate-400 hover:bg-pink-50 hover:text-pink-600' : 'text-emerald-600 hover:bg-emerald-50'}`}
                        title={u.status === "active" ? "Block user" : "Unblock user"}
                        aria-label={u.status === "active" ? "Block user" : "Unblock user"}
                      >
                        {u.status === 'active' ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" className="px-8 py-24 text-center text-slate-400 font-bold text-lg">No users found matching filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-8 py-6 bg-slate-50/30 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Page <span className="text-blue-600">{currentPage}</span> of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(prev => prev - 1)} 
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none transition-all active:scale-95"
            >
              Prev
            </button>
            <div className="flex gap-1 mx-2">
                {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i + 1} 
                  onClick={() => setCurrentPage(i + 1)} 
                  className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                    currentPage === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  {i + 1}
                </button>
                ))}
            </div>
            <button 
              disabled={currentPage === totalPages || totalPages === 0} 
              onClick={() => setCurrentPage(prev => prev + 1)} 
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none transition-all active:scale-95"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedUser && (
        <ActivityModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
      
      {/* ADD NEW USER FORM */}
      {isAddUserOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
              <div className="bg-blue-900 p-6 flex justify-between items-center text-white">
                <h2 className="text-xl font-bold">Add New Staff Member</h2>
                <button onClick={() => setIsAddUserOpen(false)} className="hover:bg-white/10 p-2 rounded-lg transition-colors"><X /></button>
              </div>

              <form onSubmit={handleAddStaff} className="p-8 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: '#26567e' }}>First Name</label>
                    <input 
                      required 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all placeholder:text-slate-300 text-sm" 
                      placeholder="e.g. Zeinab"
                      value={newStaff.firstName} 
                      onChange={e => setNewStaff({...newStaff, firstName: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: '#26567e' }}>Last Name</label>
                    <input 
                      required 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all placeholder:text-slate-300 text-sm" 
                      placeholder="e.g. Mohamed"
                      value={newStaff.lastName} 
                      onChange={e => setNewStaff({...newStaff, lastName: e.target.value})} 
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: '#26567e' }}>Email Address</label>
                  <input 
                    required 
                    type="email" 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all placeholder:text-slate-300 text-sm" 
                    placeholder="e.g. zeinab@email.com"
                    value={newStaff.email} 
                    onChange={e => setNewStaff({...newStaff, email: e.target.value})} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: '#26567e' }}>Phone Number</label>
                  <input 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all placeholder:text-slate-300 text-sm" 
                    placeholder="e.g. (555) 000-0000"
                    value={newStaff.phone} 
                    onChange={e => setNewStaff({...newStaff, phone: e.target.value})} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: '#26567e' }}>Address</label>
                  <input 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all placeholder:text-slate-300 text-sm" 
                    placeholder="e.g. 123 Main St, Cairo"
                    value={newStaff.address} 
                    onChange={e => setNewStaff({...newStaff, address: e.target.value})} 
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-6">
                   <button type="button" onClick={() => setIsAddUserOpen(false)} className="px-6 py-3 border border-red-100 text-red-500 font-bold rounded-2xl hover:bg-red-50 hover:border-red-200 transition-all active:scale-95 text-sm">Cancel</button>
                   <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all">Create Staff Profile</button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
