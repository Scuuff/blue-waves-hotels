import React, { useState, useEffect } from "react";
import { getMyProfile, updateMyProfile } from "../services/ProfileApi";
import { useUser } from "../Context/UserContext";
import {
  User,
  Mail,
  Phone,
  Globe,
  Calendar,
  Save,
  CheckCircle,
  Loader2,
  MapPin,
  Building2,
  ChevronDown,
} from "lucide-react";

export default function EditProfileForm({ onProfileUpdated }) {
  const { updateUser } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "+20",
    phone: "",
    address: "",
    city: "",
    country: "",
    dob: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMyProfile();
        const user = data.user;

        setFormData({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          countryCode: user.countryCode || "+20",
          phone: user.phone || "",
          address: user.address || "",
          city: user.city || "",
          country: user.country || "",
          dob: user.dob ? String(user.dob).split("T")[0] : "",
        });
      } catch (err) {
        setError(err.message || "Failed to load profile");
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const response = await updateMyProfile(formData);
      const user = response.user;

      updateUser(user);
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        countryCode: user.countryCode || "+20",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        country: user.country || "",
        dob: user.dob ? String(user.dob).split("T")[0] : "",
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
      if (onProfileUpdated) onProfileUpdated();
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    "w-full pl-10 pr-4 py-3 bg-[#f8fbff] border border-[#d7e6f3] rounded-xl text-[#26567e] font-medium focus:ring-2 focus:ring-[#26567e]/20 focus:border-[#26567e] transition-all outline-none placeholder:text-slate-300";
  const labelClass =
    "flex items-center gap-2 text-xs font-black text-[#26567e] mb-2 ml-1 uppercase tracking-wider";

  return (
    <form onSubmit={handleSubmit} className="animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-[#d7e6f3] p-2.5 rounded-xl border border-blue-100">
          <User className="w-5 h-5 text-[#26567e]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#26567e] leading-tight">
            Edit Profile
          </h2>
          <p className="text-sm text-slate-500">
            Update your personal and location details
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>
            <User className="w-3.5 h-3.5" /> First Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#26567e]/50" />
            <input
              type="text"
              className={inputClass}
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              required
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>
            <User className="w-3.5 h-3.5" /> Last Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#26567e]/50" />
            <input
              type="text"
              className={inputClass}
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              required
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>
            <Mail className="w-3.5 h-3.5" /> Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#26567e]/50" />
            <input
              type="email"
              className={inputClass}
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>
            <Phone className="w-3.5 h-3.5" /> Phone Number
          </label>
          <div className="relative flex gap-2">
            <div className="relative min-w-[100px]">
              <select
                value={formData.countryCode}
                onChange={(e) =>
                  setFormData({ ...formData, countryCode: e.target.value })
                }
                className="w-full pl-3 pr-8 py-3 bg-[#f8fbff] border border-[#d7e6f3] rounded-xl text-[#26567e] font-medium appearance-none focus:ring-2 focus:ring-[#26567e]/20 outline-none transition-all cursor-pointer"
              >
                <option value="+20">🇪🇬 +20</option>
                <option value="+966">🇸🇦 +966</option>
                <option value="+971">🇦🇪 +971</option>
                <option value="+1">🇺🇸 +1</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[#26567e] pointer-events-none" />
            </div>

            <div className="relative flex-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#26567e]/50" />
              <input
                type="tel"
                className={inputClass}
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        <div>
          <label className={labelClass}>
            <Calendar className="w-3.5 h-3.5" /> Date of Birth
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#26567e]/50 pointer-events-none" />
            <input
              type="date"
              className={inputClass}
              value={formData.dob}
              onChange={(e) =>
                setFormData({ ...formData, dob: e.target.value })
              }
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>
            <MapPin className="w-3.5 h-3.5" /> Street Address
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#26567e]/50" />
            <input
              type="text"
              className={inputClass}
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>
            <Building2 className="w-3.5 h-3.5" /> City
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#26567e]/50" />
            <input
              type="text"
              className={inputClass}
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>
            <Globe className="w-3.5 h-3.5" /> Country
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#26567e]/50" />
            <input
              type="text"
              className={inputClass}
              value={formData.country}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-gray-100 flex items-center gap-4">
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 bg-[#1557e7] hover:bg-[#1046ba] disabled:bg-slate-400 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-95"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>

        {isSaved && (
          <div className="flex items-center gap-2 text-teal-600 animate-in fade-in slide-in-from-left-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Profile updated!</span>
          </div>
        )}
      </div>
    </form>
  );
}
