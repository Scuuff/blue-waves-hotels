import React, { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../Components/AdminSidebar";
import AdminNavbar from "../Components/AdminNavbar";
import BranchForm from "../Components/BranchForm";
import { logAuditEvent } from "../services/auditLogger";
import useAdminThemeMode from "../hooks/useAdminThemeMode";
import { useLanguage } from "../Context/LanguageContext";
import CairoBranchImg from "../assets/Images/Cairo_Pyramids.jpg";
import AinElSokhnaBranchImg from "../assets/Images/Ain_El_Sokhna_Branch.png";
import SharmBranchImg from "../assets/Images/Sharm_Branch.png";
import AlexBranchImg from "../assets/Images/Alex_Branch.png";
import MarsaAlamBranchImg from "../assets/Images/MrasaAlam_Branch.avif";

const API_BASE_URL = "http://localhost:5050/api";

const branchImageByKey = {
  "alexandria branch": AlexBranchImg,
  "cairo branch": CairoBranchImg,
  "sharm el sheikh branch": SharmBranchImg,
  "ain el sokhna branch": AinElSokhnaBranchImg,
  "marsa alam branch": MarsaAlamBranchImg,
  alexandria: AlexBranchImg,
  cairo: CairoBranchImg,
  "sharm el sheikh": SharmBranchImg,
  "ain el sokhna": AinElSokhnaBranchImg,
  "marsa alam": MarsaAlamBranchImg,
};

const branchImageByFileName = {
  "alex_branch.png": AlexBranchImg,
  "cairo_branch.png": CairoBranchImg,
  "sharm_branch.png": SharmBranchImg,
  "ain_el_sokhna_branch.png": AinElSokhnaBranchImg,
  "mrasaalam_branch.avif": MarsaAlamBranchImg,
};

const fallbackBranchImage = (branch) => {
  const branchKey = String(branch?.name || "").trim().toLowerCase();
  const cityKey = String(branch?.city || "").trim().toLowerCase();

  return branchImageByKey[branchKey] || branchImageByKey[cityKey] || "";
};

function HotelManagement() {
  const { darkMode } = useAdminThemeMode();
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [branchToDelete, setBranchToDelete] = useState(null);
  const [branchToView, setBranchToView] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [branchToEdit, setBranchToEdit] = useState(null);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: "",
  });

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      null
    );
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, type, message });

    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 2500);
  };

  const fetchBranches = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/hotels`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch branches");
      }

      setBranches(data.hotels || []);
    } catch (error) {
      console.error("Fetch branches error:", error);
      showToast(error.message || "Failed to load branches", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const cities = [
    "all",
    ...new Set(branches.map((branch) => branch.city).filter(Boolean)),
  ];

  const statuses = [
    "all",
    ...new Set(branches.map((branch) => branch.status).filter(Boolean)),
  ];

  const filteredBranches = useMemo(() => {
    return branches.filter((branch) => {
      const branchName = branch.name || "";
      const branchAddress = branch.address || "";

      const matchesSearch =
        branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branchAddress.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCity =
        selectedCity === "all" || branch.city === selectedCity;

      const matchesStatus =
        selectedStatus === "all" || branch.status === selectedStatus;

      return matchesSearch && matchesCity && matchesStatus;
    });
  }, [branches, searchTerm, selectedCity, selectedStatus]);

  const handleDeleteClick = (branch) => {
    setBranchToDelete(branch);
  };

  const handleConfirmDelete = async () => {
    try {
      const token = getToken();
      const target = branchToDelete;

      if (!token) {
        throw new Error("No token found. Please login again.");
      }

      const response = await fetch(
        `${API_BASE_URL}/hotels/${target._id || target.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete branch");
      }

      setBranches((prev) =>
        prev.filter(
          (branch) => (branch._id || branch.id) !== (target._id || target.id)
        )
      );

      setBranchToDelete(null);

      if (target) {
        logAuditEvent({
          actionType: "hotel.branch.deleted",
          module: "hotel_management",
          entityType: "branch",
          entityId: String(target._id || target.id),
          targetLabel: target.name,
          status: "success",
          reason: "Branch removed by admin",
          before: {
            name: target.name,
            city: target.city,
            status: target.status,
          },
        });

        showToast(`Branch "${target.name}" deleted successfully.`);
      }
    } catch (error) {
      console.error("Delete branch error:", error);
      showToast(error.message || "Failed to delete branch", "error");
    }
  };

  const handleCancelDelete = () => {
    setBranchToDelete(null);
  };

  const handleToggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleAddBranch = async (newBranchData) => {
    try {
      const token = getToken();

      if (!token) {
        throw new Error("No token found. Please login again.");
      }

      const response = await fetch(`${API_BASE_URL}/hotels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newBranchData,
          rating: Number(newBranchData.rating) || 0,
          amenities: newBranchData.amenities || [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add branch");
      }

      setBranches((prev) => [data.hotel, ...prev]);
      setShowAddForm(false);
      showToast(`Branch "${data.hotel.name}" added successfully.`);
    } catch (error) {
      console.error("Add branch error:", error);
      showToast(error.message || "Failed to add branch", "error");
    }
  };

  const handleEditClick = (branch) => {
    setBranchToEdit(branch);
  };

  const handleUpdateBranch = async (updatedBranchData) => {
    try {
      const token = getToken();

      if (!token) {
        throw new Error("No token found. Please login again.");
      }

      const response = await fetch(
        `${API_BASE_URL}/hotels/${branchToEdit._id || branchToEdit.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...updatedBranchData,
            rating: Number(updatedBranchData.rating) || 0,
            amenities: updatedBranchData.amenities || [],
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update branch");
      }

      setBranches((prev) =>
        prev.map((branch) =>
          (branch._id || branch.id) === (branchToEdit._id || branchToEdit.id)
            ? data.hotel
            : branch
        )
      );

      setBranchToEdit(null);
      showToast(`Branch "${data.hotel.name}" updated successfully.`);
    } catch (error) {
      console.error("Update branch error:", error);
      showToast(error.message || "Failed to update branch", "error");
    }
  };

  const handleViewClick = (branch) => {
    setBranchToView(branch);
  };

  const getBranchStatusLabel = (status) => {
    return t(`hotelMgmt.status.${String(status).toLowerCase()}`);
  };

  const getCityLabel = (city) => {
    if (city === "all") return t("hotelMgmt.filter.allCities");
    return city;
  };

  const getStatusFilterLabel = (status) => {
    if (status === "all") return t("hotelMgmt.filter.allStatus");
    return getBranchStatusLabel(status);
  };

  const resolveBranchImage = (branch) => {
    const imageValue = String(branch?.image || "").trim();

    if (imageValue) {
      const normalizedImageValue = imageValue.replace(/\\/g, "/");
      const lowerImageValue = normalizedImageValue.toLowerCase();
      const fileName = lowerImageValue.split("/").pop();

      if (fileName && branchImageByFileName[fileName]) {
        return branchImageByFileName[fileName];
      }

      if (
        lowerImageValue.startsWith("http://") ||
        lowerImageValue.startsWith("https://") ||
        lowerImageValue.startsWith("data:") ||
        lowerImageValue.startsWith("blob:") ||
        normalizedImageValue.startsWith("/")
      ) {
        return normalizedImageValue;
      }
    }

    return fallbackBranchImage(branch) || "/placeholder-hotel.jpg";
  };

  return (
    <div
      className={`admin-theme admin-route-page flex min-h-screen ${
        darkMode
          ? "admin-theme-dark bg-gray-900 text-white"
          : "admin-theme-light bg-[#F8FAFC]"
      }`}
    >
      <AdminSidebar collapsed={collapsed} />

      <div className="flex-1">
        <AdminNavbar onToggleSidebar={handleToggleSidebar} />

        <div className="p-4 sm:p-6">
          {toast.show && (
            <div className="fixed right-6 top-24 z-[60]">
              <div
                className={`rounded-2xl border px-5 py-4 text-sm font-semibold shadow-xl ${
                  toast.type === "success"
                    ? "border-green-200 bg-green-50 text-green-700"
                    : toast.type === "error"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-blue-200 bg-blue-50 text-blue-700"
                }`}
              >
                {toast.message}
              </div>
            </div>
          )}

          <section className="space-y-6">
            <div
              className={`flex flex-col gap-4 rounded-3xl border p-6 shadow-sm md:flex-row md:items-center md:justify-between ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-[#C8D9E6]"
              }`}
            >
              <div>
                <h1
                  className={`text-2xl font-bold sm:text-3xl ${
                    darkMode ? "text-white" : "text-[#2F4156]"
                  }`}
                >
                  {t("hotelMgmt.title")}
                </h1>
                <p
                  className={`mt-2 text-sm sm:text-base ${
                    darkMode ? "text-gray-400" : "text-[#567C8D]"
                  }`}
                >
                  {t("hotelMgmt.subtitle")}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center justify-center rounded-2xl bg-[#2F4156] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#567C8D]"
              >
                + Add New Branch
              </button>
            </div>

            <div
              className={`admin-route-soft-panel grid gap-4 rounded-2xl p-4 shadow-sm md:grid-cols-3 ${
                darkMode ? "bg-gray-800" : "bg-[#C8D9E6]"
              }`}
            >
              <div>
                <label
                  className={`mb-2 block text-sm font-medium ${
                    darkMode ? "text-gray-300" : "text-[#2F4156]"
                  }`}
                >
                  {t("hotelMgmt.filter.searchBranch")}
                </label>
                <input
                  type="text"
                  placeholder={t("hotelMgmt.filter.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full rounded-2xl border border-transparent px-4 py-3 text-sm outline-none transition ${
                    darkMode
                      ? "bg-gray-700 text-white focus:border-gray-500"
                      : "bg-white text-[#2F4156] focus:border-[#567C8D]"
                  }`}
                />
              </div>

              <div>
                <label
                  className={`mb-2 block text-sm font-medium ${
                    darkMode ? "text-gray-300" : "text-[#2F4156]"
                  }`}
                >
                  {t("hotelMgmt.filter.city")}
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className={`w-full rounded-2xl border border-transparent px-4 py-3 text-sm outline-none transition ${
                    darkMode
                      ? "bg-gray-700 text-white focus:border-gray-500"
                      : "bg-white text-[#2F4156] focus:border-[#567C8D]"
                  }`}
                >
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {getCityLabel(city)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className={`mb-2 block text-sm font-medium ${
                    darkMode ? "text-gray-300" : "text-[#2F4156]"
                  }`}
                >
                  {t("hotelMgmt.filter.status")}
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className={`w-full rounded-2xl border border-transparent px-4 py-3 text-sm outline-none transition ${
                    darkMode
                      ? "bg-gray-700 text-white focus:border-gray-500"
                      : "bg-white text-[#2F4156] focus:border-[#567C8D]"
                  }`}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {getStatusFilterLabel(status)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div
                className={`rounded-3xl border p-10 text-center shadow-sm ${
                  darkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-[#D9E4EC]"
                }`}
              >
                <h3
                  className={`text-xl font-semibold ${
                    darkMode ? "text-white" : "text-[#2F4156]"
                  }`}
                >
                  Loading branches...
                </h3>
              </div>
            ) : filteredBranches.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredBranches.map((branch) => (
                  <div
                    key={branch._id || branch.id}
                    className={`overflow-hidden rounded-3xl border shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg ${
                      darkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-[#D9E4EC]"
                    }`}
                  >
                    <img
                      src={resolveBranchImage(branch)}
                      alt={branch.name}
                      className="h-52 w-full object-cover"
                      onError={(event) => {
                        const nextSrc = fallbackBranchImage(branch);
                        if (nextSrc && event.currentTarget.src !== nextSrc) {
                          event.currentTarget.src = nextSrc;
                          return;
                        }

                        event.currentTarget.src = "/placeholder-hotel.jpg";
                      }}
                    />

                    <div className="space-y-4 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2
                            className={`text-lg font-bold ${
                              darkMode ? "text-white" : "text-[#2F4156]"
                            }`}
                          >
                            {branch.name}
                          </h2>
                          <p
                            className={`mt-1 text-sm ${
                              darkMode ? "text-gray-400" : "text-[#567C8D]"
                            }`}
                          >
                            {branch.city}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            branch.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {getBranchStatusLabel(branch.status)}
                        </span>
                      </div>

                      <p
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-[#567C8D]"
                        }`}
                      >
                        {branch.address}
                      </p>

                      <div
                        className={`flex items-center gap-1 text-sm ${
                          darkMode ? "text-gray-200" : "text-[#2F4156]"
                        }`}
                      >
                        <span className="font-semibold">Rating:</span>
                        <span>{branch.rating}</span>
                      </div>

                      <div
                        className={`rounded-2xl p-3 text-sm ${
                          darkMode
                            ? "bg-gray-700 text-gray-200"
                            : "bg-[#F5EFEB] text-[#2F4156]"
                        }`}
                      >
                        <span className="font-semibold">Rooms Module:</span>{" "}
                        Managed separately in Room Management
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {(branch.amenities || []).slice(0, 6).map((amenity) => (
                          <span
                            key={amenity}
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              darkMode
                                ? "bg-gray-700 text-gray-200"
                                : "bg-[#F5EFEB] text-[#2F4156]"
                            }`}
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>

                      <p
                        className={`text-sm leading-6 ${
                          darkMode ? "text-gray-400" : "text-[#567C8D]"
                        }`}
                      >
                        {branch.description}
                      </p>

                      <div className="flex flex-wrap gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => handleViewClick(branch)}
                          className="rounded-2xl bg-[#567C8D] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2F4156]"
                        >
                          View Details
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEditClick(branch)}
                          className="rounded-2xl border border-[#567C8D] px-4 py-2 text-sm font-medium text-[#567C8D] transition hover:bg-[#567C8D] hover:text-white"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteClick(branch)}
                          className="rounded-2xl border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                        >
                          {t("hotelMgmt.actions.delete")}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className={`rounded-3xl border p-10 text-center shadow-sm ${
                  darkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-[#D9E4EC]"
                }`}
              >
                <h3
                  className={`text-xl font-semibold ${
                    darkMode ? "text-white" : "text-[#2F4156]"
                  }`}
                >
                  {t("hotelMgmt.empty.title")}
                </h3>
                <p
                  className={`mt-2 text-sm ${
                    darkMode ? "text-gray-400" : "text-[#567C8D]"
                  }`}
                >
                  {t("hotelMgmt.empty.subtitle")}
                </p>
              </div>
            )}

            {showAddForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
                <div
                  className={`relative w-full max-w-4xl overflow-hidden rounded-[30px] shadow-2xl ${
                    darkMode ? "bg-gray-900" : "bg-[#F5EFEB]"
                  }`}
                >
                  <div className="flex items-center justify-between bg-[#2F4156] px-6 py-5">
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        Add New Branch
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="flex h-10 w-10 items-center justify-center rounded-full text-white/90 transition hover:bg-white/10 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="max-h-[78vh] overflow-y-auto px-6 py-6">
                    <BranchForm
                      onSubmit={handleAddBranch}
                      onCancel={() => setShowAddForm(false)}
                      submitButtonText="Save Branch"
                      successMessage="Branch information saved successfully."
                    />
                  </div>
                </div>
              </div>
            )}

            {branchToEdit && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
                <div
                  className={`relative w-full max-w-4xl overflow-hidden rounded-[30px] shadow-2xl ${
                    darkMode ? "bg-gray-900" : "bg-[#F5EFEB]"
                  }`}
                >
                  <div className="flex items-center justify-between bg-[#2F4156] px-6 py-5">
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        Edit Branch
                      </h2>
                      <p className="mt-1 text-sm text-[#C8D9E6]">
                        Update the details of {branchToEdit.name}.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setBranchToEdit(null)}
                      className="flex h-10 w-10 items-center justify-center rounded-full text-white/90 transition hover:bg-white/10 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="max-h-[78vh] overflow-y-auto px-6 py-6">
                    <BranchForm
                      initialData={branchToEdit}
                      onSubmit={handleUpdateBranch}
                      onCancel={() => setBranchToEdit(null)}
                      submitButtonText="Update Branch"
                      successMessage="Branch information updated successfully."
                    />
                  </div>
                </div>
              </div>
            )}

            {branchToView && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
                <div
                  className={`relative w-full max-w-3xl overflow-hidden rounded-[30px] shadow-2xl ${
                    darkMode ? "bg-gray-900" : "bg-[#F5EFEB]"
                  }`}
                >
                  <div className="flex items-center justify-between bg-[#2F4156] px-6 py-5">
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        Branch Details
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={() => setBranchToView(null)}
                      className="flex h-10 w-10 items-center justify-center rounded-full text-white/90 transition hover:bg-white/10 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="max-h-[78vh] overflow-y-auto px-6 py-6">
                    <div
                      className={`space-y-6 rounded-[26px] p-6 shadow-sm ${
                        darkMode ? "bg-gray-800" : "bg-white"
                      }`}
                    >
                      <img
                        src={resolveBranchImage(branchToView)}
                        alt={branchToView.name}
                        className="h-64 w-full rounded-3xl object-cover"
                        onError={(event) => {
                          const nextSrc = fallbackBranchImage(branchToView);
                          if (nextSrc && event.currentTarget.src !== nextSrc) {
                            event.currentTarget.src = nextSrc;
                            return;
                          }

                          event.currentTarget.src = "/placeholder-hotel.jpg";
                        }}
                      />

                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3
                            className={`text-2xl font-bold ${
                              darkMode ? "text-white" : "text-[#2F4156]"
                            }`}
                          >
                            {branchToView.name}
                          </h3>
                          <p
                            className={`mt-1 ${
                              darkMode ? "text-gray-400" : "text-[#567C8D]"
                            }`}
                          >
                            {branchToView.city}, Egypt
                          </p>
                        </div>

                        <span
                          className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${
                            branchToView.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {branchToView.status}
                        </span>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div
                          className={`rounded-2xl border p-4 ${
                            darkMode
                              ? "border-gray-700 bg-gray-700"
                              : "border-[#C8D9E6] bg-[#F5EFEB]"
                          }`}
                        >
                          <p
                            className={`text-sm font-medium ${
                              darkMode ? "text-gray-300" : "text-[#567C8D]"
                            }`}
                          >
                            Address
                          </p>
                          <p
                            className={`mt-2 ${
                              darkMode ? "text-white" : "text-[#2F4156]"
                            }`}
                          >
                            {branchToView.address}
                          </p>
                        </div>

                        <div
                          className={`rounded-2xl border p-4 ${
                            darkMode
                              ? "border-gray-700 bg-gray-700"
                              : "border-[#C8D9E6] bg-[#F5EFEB]"
                          }`}
                        >
                          <p
                            className={`text-sm font-medium ${
                              darkMode ? "text-gray-300" : "text-[#567C8D]"
                            }`}
                          >
                            Rating
                          </p>
                          <p
                            className={`mt-2 ${
                              darkMode ? "text-white" : "text-[#2F4156]"
                            }`}
                          >
                            {branchToView.rating}
                          </p>
                        </div>

                        <div
                          className={`rounded-2xl border p-4 ${
                            darkMode
                              ? "border-gray-700 bg-gray-700"
                              : "border-[#C8D9E6] bg-[#F5EFEB]"
                          }`}
                        >
                          <p
                            className={`text-sm font-medium ${
                              darkMode ? "text-gray-300" : "text-[#567C8D]"
                            }`}
                          >
                            Phone
                          </p>
                          <p
                            className={`mt-2 ${
                              darkMode ? "text-white" : "text-[#2F4156]"
                            }`}
                          >
                            {branchToView.phone}
                          </p>
                        </div>

                        <div
                          className={`rounded-2xl border p-4 ${
                            darkMode
                              ? "border-gray-700 bg-gray-700"
                              : "border-[#C8D9E6] bg-[#F5EFEB]"
                          }`}
                        >
                          <p
                            className={`text-sm font-medium ${
                              darkMode ? "text-gray-300" : "text-[#567C8D]"
                            }`}
                          >
                            Email
                          </p>
                          <p
                            className={`mt-2 ${
                              darkMode ? "text-white" : "text-[#2F4156]"
                            }`}
                          >
                            {branchToView.email}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`rounded-2xl border p-4 ${
                          darkMode
                            ? "border-gray-700 bg-gray-700"
                            : "border-[#C8D9E6] bg-[#F5EFEB]"
                        }`}
                      >
                        <p
                          className={`text-sm font-medium ${
                            darkMode ? "text-gray-300" : "text-[#567C8D]"
                          }`}
                        >
                          Description
                        </p>
                        <p
                          className={`mt-2 leading-7 ${
                            darkMode ? "text-white" : "text-[#2F4156]"
                          }`}
                        >
                          {branchToView.description}
                        </p>
                      </div>

                      <div
                        className={`rounded-2xl border p-4 ${
                          darkMode
                            ? "border-gray-700 bg-gray-700"
                            : "border-[#C8D9E6] bg-[#F5EFEB]"
                        }`}
                      >
                        <p
                          className={`text-sm font-medium ${
                            darkMode ? "text-gray-300" : "text-[#567C8D]"
                          }`}
                        >
                          Amenities
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(branchToView.amenities || []).map((amenity) => (
                            <span
                              key={amenity}
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                darkMode
                                  ? "border border-gray-600 bg-gray-800 text-white"
                                  : "border border-[#C8D9E6] bg-white text-[#2F4156]"
                              }`}
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div
                        className={`rounded-2xl border p-4 ${
                          darkMode
                            ? "border-gray-700 bg-gray-700"
                            : "border-[#C8D9E6] bg-[#F5EFEB]"
                        }`}
                      >
                        <p
                          className={`text-sm font-medium ${
                            darkMode ? "text-gray-300" : "text-[#567C8D]"
                          }`}
                        >
                          Rooms
                        </p>
                        <p
                          className={`mt-2 text-sm ${
                            darkMode ? "text-gray-300" : "text-[#567C8D]"
                          }`}
                        >
                          Rooms are managed separately in the Room Management module to avoid data redundancy.
                        </p>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => {
                            setBranchToView(null);
                            setBranchToEdit(branchToView);
                          }}
                          className="rounded-2xl border border-[#567C8D] bg-white px-6 py-4 text-base font-semibold text-[#567C8D] transition hover:bg-[#567C8D] hover:text-white"
                        >
                          Edit Branch
                        </button>

                        <button
                          type="button"
                          onClick={() => setBranchToView(null)}
                          className="rounded-2xl bg-[#2F4156] px-6 py-4 text-base font-semibold text-white shadow-md transition hover:bg-[#567C8D]"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {branchToDelete && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                <div
                  className={`w-full max-w-md rounded-3xl border p-6 shadow-xl ${
                    darkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-[#D9E4EC]"
                  }`}
                >
                  <h3
                    className={`text-xl font-bold ${
                      darkMode ? "text-white" : "text-[#2F4156]"
                    }`}
                  >
                    {t("hotelMgmt.delete.title")}
                  </h3>

                  <p
                    className={`mt-3 text-sm leading-6 ${
                      darkMode ? "text-gray-400" : "text-[#567C8D]"
                    }`}
                  >
                    {t("hotelMgmt.delete.promptPrefix")}{" "}
                    <span
                      className={
                        darkMode
                          ? "font-semibold text-white"
                          : "font-semibold text-[#2F4156]"
                      }
                    >
                      {branchToDelete.name}
                    </span>
                    ?
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleConfirmDelete}
                      className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                      {t("hotelMgmt.delete.confirm")}
                    </button>

                    <button
                      type="button"
                      onClick={handleCancelDelete}
                      className="rounded-2xl border border-[#567C8D] px-5 py-3 text-sm font-semibold text-[#567C8D] transition hover:bg-[#567C8D] hover:text-white"
                    >
                      {t("hotelMgmt.delete.cancel")}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default HotelManagement;