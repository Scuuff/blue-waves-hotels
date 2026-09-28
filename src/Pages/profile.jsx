import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../Context/UserContext';
import { useAuth } from '../Context/AuthContext';
import { changeMyPassword } from '../services/ProfileApi';
import EditProfileForm from "../Components/EditProfileForm";
import UpcomingStays from "../Components/UpcomingStays";
import BookingHistory from "../Components/BookingHistory";
import {
  CalendarDays, History, Award, Edit3, Shield, X,
  AlertCircle, LogOut, Loader2, Clock3, UserCog, Ban, KeyRound
} from 'lucide-react';

const tabs = [
  { id: 'profile', label: 'Edit Profile', icon: Edit3 },
  { id: 'upcoming', label: 'Upcoming Stays', icon: CalendarDays },
  { id: 'history', label: 'Booking History', icon: History },
];

function formatActivityDate(value) {
  if (!value) return "Just now";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Just now";

  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function ActivityIcon({ type }) {
  if (type === "booking_created") return <CalendarDays className="w-4 h-4" />;
  if (type === "booking_cancelled") return <Ban className="w-4 h-4" />;
  if (type === "password_changed") return <KeyRound className="w-4 h-4" />;
  return <UserCog className="w-4 h-4" />;
}

function getProfileInitials(user) {
  const firstName = `${user?.firstName || ""}`.trim();
  const lastName = `${user?.lastName || ""}`.trim();

  if (firstName || lastName) {
    return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
  }

  const fullName = `${user?.fullName || ""}`.trim();
  const parts = fullName.split(/\s+/).filter(Boolean);
  return `${parts[0]?.[0] || ""}${parts[1]?.[0] || ""}`.toUpperCase() || "GU";
}

function ActivityHistoryPanel({ user }) {
  const history = user.activityHistory || [];
  const stats = user.bookingStats || {};

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
      <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
        <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
          <Clock3 className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-serif text-lg font-semibold text-blue-900">Profile Activity</h3>
          <p className="text-[11px] text-slate-500 font-medium tracking-tight">Bookings, cancellations, and account updates</p>
        </div>
      </div>

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-center">
            <p className="text-2xl font-bold text-blue-900">{stats.totalBooked || 0}</p>
            <p className="text-xs text-slate-500">Total Booked</p>
          </div>
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-4 text-center">
            <p className="text-2xl font-bold text-red-500">{stats.totalCancelled || 0}</p>
            <p className="text-xs text-slate-500">Cancelled</p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{stats.totalCompleted || 0}</p>
            <p className="text-xs text-slate-500">Completed</p>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-slate-500 text-sm">
            No profile activity yet.
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item, index) => (
              <div
                key={`${item.type}-${item.createdAt || index}`}
                className="flex items-start gap-4 rounded-xl border border-slate-200 px-4 py-4"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <ActivityIcon type={item.type} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <p className="font-bold text-slate-800 text-sm">{item.title}</p>
                    <p className="text-xs text-slate-400">{formatActivityDate(item.createdAt)}</p>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{item.description || "Account activity recorded."}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Sub-Component: Log Out Confirmation Modal ---
function LogOutModal({ isOpen, onClose, onConfirm, isLoggingOut }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-10 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6">
            <LogOut className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl font-semibold text-blue-900 mb-2">Log Out?</h3>
          <p className="text-slate-500 text-sm mb-8">Are you sure you want to log out of your account?</p>
          
          <div className="flex gap-3">
            <button 
              disabled={isLoggingOut}
              onClick={onClose} 
              className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all text-xs disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              disabled={isLoggingOut}
              onClick={onConfirm} 
              className="flex-1 py-3.5 bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-100 hover:bg-red-600 transition-all text-xs flex items-center justify-center gap-2 disabled:opacity-80"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Logging out...
                </>
              ) : (
                "Log Out"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub-Component: Change Password Modal ---
function ChangePasswordModal({ isOpen, onClose, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [strength, setStrength] = useState({ label: "", color: "bg-slate-200", width: "0%" });
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  if (!isOpen) return null;

  const checkStrength = (password) => {
    if (password.length === 0) return { label: "", color: "bg-slate-200", width: "0%" };
    if (password.length < 6) return { label: "Too Short", color: "bg-red-500", width: "33%" };
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    if (hasLetters && hasNumbers && hasSpecial && password.length >= 8) return { label: "Strong", color: "bg-emerald-500", width: "100%" };
    if ((hasLetters && hasNumbers) || (hasLetters && hasSpecial)) return { label: "Medium", color: "bg-amber-500", width: "66%" };
    return { label: "Weak", color: "bg-red-500", width: "33%" };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "newPassword") setStrength(checkStrength(value));
    if (error) setError(""); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword.length < 6) { setError("New password must be at least 6 characters long."); return; }
    if (formData.newPassword !== formData.confirmPassword) { setError("The new passwords do not match."); return; }
    setIsSubmitting(true);

    try {
      await changeMyPassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setIsSubmitting(false);
      onSuccess();
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setStrength({ label: "", color: "bg-slate-200", width: "0%" });
      onClose();
    } catch (submitError) {
      setError(submitError.message || "Failed to update password.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-10">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-serif text-2xl font-semibold text-blue-900">Change Password</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-1">Current Password</label>
              <input required name="currentPassword" type="password" value={formData.currentPassword} onChange={handleChange} placeholder="••••••••" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-1">New Password</label>
                <span className={`text-[10px] font-bold uppercase ${strength.label === "Strong" ? "text-emerald-500" : strength.label === "Medium" ? "text-amber-500" : "text-red-500"}`}>{strength.label}</span>
              </div>
              <input required name="newPassword" type="password" value={formData.newPassword} onChange={handleChange} placeholder="Min. 6 characters" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all" />
              <div className="h-1.5 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
                <div className={`h-full transition-all duration-500 ${strength.color}`} style={{ width: strength.width }}></div>
              </div>
            </div>
            <div className="space-y-2 relative">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-1">Confirm New Password</label>
              <input required name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all" />
            </div>
            <div className="flex gap-4 pt-6">
              <button type="button" onClick={onClose} className="flex-1 py-4 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all text-sm">Cancel</button>
              <button disabled={isSubmitting} type="submit" className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all text-sm disabled:opacity-70">
                {isSubmitting ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// --- Main Page Component ---
export default function ProfilePage() {
  const { user, isProfileLoading, profileError } = useUser();
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLogOutModalOpen, setIsLogOutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Spinner state
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [lastChangedText, setLastChangedText] = useState("3 months ago");

  useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => setShowSuccessToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessToast]);

  const handlePasswordUpdate = () => {
    setShowSuccessToast(true);
    const now = new Date();
    setLastChangedText(`today, ${now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`);
  };

  const handleLogOutConfirm = async () => {
    setIsLoggingOut(true);
    await logout();
    navigate('/'); 
  };

  if (isProfileLoading && !user) {
    return <div className="p-20 text-center text-slate-400 font-medium">Loading Profile...</div>;
  }

  if (!user) return <div className="p-20 text-center text-slate-400 font-medium">Profile unavailable.</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 relative font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        
        <ProfileHero user={user} />

        {profileError ? (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-700">
            {profileError}
          </div>
        ) : null}

        <div className="flex gap-2 bg-white p-2 rounded-2xl mb-10 border border-slate-200/60 shadow-sm">
          {tabs.map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={`flex-1 flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl text-sm font-bold transition-all duration-200 ${
                activeTab === tab.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <tab.icon className="w-4 h-4 shrink-0" />
              {tab.label}
            </button>
          ))}
        </div>

          <div className="space-y-8">
            {activeTab === 'profile' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8">
                  <EditProfileForm />
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                  <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
                    <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-semibold text-blue-900">Account Security</h3>
                      <p className="text-[11px] text-slate-500 font-medium tracking-tight">Manage your credentials</p>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-50 rounded-xl border border-slate-200/50">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">Password</p>
                        <p className="text-xs text-slate-500">Last updated {lastChangedText}</p>
                      </div>
                      <button onClick={() => setIsPasswordModalOpen(true)} className="px-5 py-2.5 bg-white border border-slate-200 text-blue-600 font-bold text-xs rounded-lg shadow-sm hover:border-blue-400 hover:bg-blue-50 transition-all active:scale-95">
                        Change Password
                      </button>
                    </div>
                  </div>
               </div>

               <ActivityHistoryPanel user={user} />

               <div className="pt-10 mt-10 border-t border-slate-200 flex justify-center">
                  <button 
                    onClick={() => setIsLogOutModalOpen(true)}
                    className="flex items-center gap-3 px-8 py-4 bg-white border border-red-100 text-red-500 font-bold rounded-2xl hover:bg-red-50 hover:border-red-200 transition-all shadow-sm active:scale-95 group"
                  >
                    <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Log Out
                  </button>
               </div>
            </div>
          )}
          
          {activeTab === 'upcoming' && <div className="bg-white rounded-2xl p-8 border border-slate-200/60 shadow-sm animate-in fade-in duration-300"><UpcomingStays /></div>}
          {activeTab === 'history' && <div className="bg-white rounded-2xl p-8 border border-slate-200/60 shadow-sm animate-in fade-in duration-300"><BookingHistory /></div>}
        </div>
      </div>

      {/* Modals */}
      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
        onSuccess={handlePasswordUpdate} 
      />

      <LogOutModal 
        isOpen={isLogOutModalOpen} 
        isLoggingOut={isLoggingOut}
        onClose={() => setIsLogOutModalOpen(false)} 
        onConfirm={handleLogOutConfirm} 
      />
    </div>
  );
}

// --- ProfileHero helper ---
function ProfileHero({ user }) {
  const completedBookings = (user.bookings || []).filter((booking) => booking.status === "completed").length;
  const upcomingBookings = (user.bookings || []).filter((booking) => booking.status === "upcoming").length;
  const memberSince = user.memberSince || "N/A";

  return (
    <div className="relative rounded-3xl overflow-hidden mb-8 shadow-xl border border-blue-900 bg-blue-900">
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600 rounded-full blur-[100px] opacity-20 -mr-20 -mt-20"></div>
      <div className="relative z-10 p-10 flex flex-col sm:flex-row items-center gap-10">
        <div className="relative">
          <div className="w-32 h-32 rounded-3xl bg-white flex items-center justify-center text-blue-900 font-serif text-4xl font-semibold shadow-2xl border-4 border-blue-700">
            {getProfileInitials(user)}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-blue-400 w-6 h-6 rounded-full border-4 border-blue-900 shadow-lg"></div>
        </div>
        <div className="text-center sm:text-left flex-1 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h1 className="font-serif text-4xl font-semibold">
              {user.firstName} {user.lastName}
            </h1>
            <div className="bg-blue-600/40 border border-blue-400/40 px-3 py-1 rounded-lg flex items-center gap-1.5 self-center sm:self-auto">
              <Award className="w-3.5 h-3.5 text-blue-300" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {user.tier || "Gold Member"}
              </span>
            </div>
          </div>
          <p className="text-blue-200 text-lg mt-1 font-medium opacity-90">{user.email}</p>
          <div className="mt-8 flex flex-wrap justify-center sm:justify-start gap-10 border-t border-blue-800/60 pt-6">
            <div><p className="text-[10px] text-blue-300 uppercase font-bold tracking-[0.15em] mb-1">Upcoming Stays</p><p className="font-serif text-3xl font-semibold text-white">{upcomingBookings}</p></div>
            <div className="w-px h-10 bg-blue-800/80 hidden md:block"></div>
            <div><p className="text-[10px] text-blue-300 uppercase font-bold tracking-[0.15em] mb-1">Completed Stays</p><p className="font-serif text-3xl font-semibold text-white">{completedBookings}</p></div>
            <div className="w-px h-10 bg-blue-800/80 hidden md:block"></div>
            <div><p className="text-[10px] text-blue-300 uppercase font-bold tracking-[0.15em] mb-1">Member Since</p><p className="font-serif text-3xl font-semibold text-white">{memberSince}</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
