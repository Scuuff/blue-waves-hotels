import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../services/apiClient";
import { normalizeRoomRecord } from "../utils/roomMedia";

function OfferFormModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: "",
    type: "Bundle",
    badge: "Most Popular",
    discount: "",
    originalPrice: "",
    expiryDate: "",
    roomId: "",
    description: "",
  });

  const [isActive, setIsActive] = useState(false);
  const [errors, setErrors] = useState({});
  const [rooms, setRooms] = useState([]);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadRooms = async () => {
      try {
        const data = await apiGet("/rooms");
        if (!isMounted) return;
        setRooms(Array.isArray(data) ? data.map(normalizeRoomRecord) : []);
      } catch (error) {
        console.error("Failed to load rooms for offers:", error.message);
        if (isMounted) setRooms([]);
      }
    };

    loadRooms();
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedRoom = useMemo(
    () => rooms.find((room) => String(room.id) === String(formData.roomId)),
    [rooms, formData.roomId]
  );

  const isFormValid =
    formData.title.trim() !== "" &&
    formData.discount !== "" &&
    Number(formData.discount) >= 1 &&
    Number(formData.discount) <= 99 &&
    formData.originalPrice !== "" &&
    Number(formData.originalPrice) >= 1 &&
    formData.expiryDate !== "" &&
    formData.roomId !== "" &&
    isActive;

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Offer title is required";
    if (!formData.roomId) newErrors.roomId = "Please select a room";
    if (!formData.discount) newErrors.discount = "Discount is required";
    else if (Number(formData.discount) < 1 || Number(formData.discount) > 99)
      newErrors.discount = "Discount must be between 1% and 99%";
    if (!formData.originalPrice) newErrors.originalPrice = "Original price is required";
    else if (Number(formData.originalPrice) < 1)
      newErrors.originalPrice = "Price must be greater than 0";
    if (!formData.expiryDate) newErrors.expiryDate = "Expiry date is required";
    else if (new Date(formData.expiryDate) <= new Date())
      newErrors.expiryDate = "Expiry date must be in the future";
    if (!isActive) newErrors.active = "Please confirm by ticking the checkbox";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");

      await onSubmit({
        ...formData,
        active: true,
        pricePerNight: Math.round(formData.originalPrice * (1 - formData.discount / 100)),
      });
      onClose();
    } catch (error) {
      setSubmitError(error.message || "Failed to create offer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#b8d2e7]/80 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[20px] bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="text-2xl font-bold text-[#1565a8]">+</div>
          <h2 className="text-xl font-bold text-[#1565a8]">Add New Offer</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#1565a8]">Offer Title</label>
            <input
              className="w-full rounded-xl border border-[#e2e8f0] bg-[#f5f9fc] px-4 py-3 text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1565a8]/20"
              placeholder="e.g. Royal Suite Escape"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                setErrors({ ...errors, title: "" });
              }}
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#1565a8]">Description</label>
            <textarea
              rows={3}
              placeholder="e.g. Book 2 nights and enjoy a complimentary breakfast with sea view..."
              value={formData.description}
              className="w-full resize-none rounded-xl border border-[#e2e8f0] bg-[#f5f9fc] px-4 py-3 text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1565a8]/20"
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1565a8]">Offer Type</label>
              <select
                className="w-full rounded-xl border border-[#e2e8f0] bg-[#f5f9fc] px-4 py-3 text-sm text-slate-500 focus:outline-none"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option>Bundle</option>
                <option>Discount</option>
                <option>Package</option>
                <option>Seasonal</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1565a8]">Badge</label>
              <select
                className="w-full rounded-xl border border-[#e2e8f0] bg-[#f5f9fc] px-4 py-3 text-sm text-slate-500 focus:outline-none"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              >
                <option>Most Popular</option>
                <option>Limited Rooms</option>
                <option>Romantic</option>
                <option>Weekday Deal</option>
                <option>Summer Special</option>
                <option>Family</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#1565a8]">Database Room</label>
            <select
              className="w-full rounded-xl border border-[#e2e8f0] bg-[#f5f9fc] px-4 py-3 text-sm text-slate-500 focus:outline-none"
              value={formData.roomId}
              onChange={(e) => {
                const nextRoom = rooms.find((room) => String(room.id) === String(e.target.value));
                setFormData({
                  ...formData,
                  roomId: e.target.value,
                  title: nextRoom ? nextRoom.roomName : formData.title,
                  originalPrice: nextRoom ? nextRoom.price : formData.originalPrice,
                  description: nextRoom ? nextRoom.description : formData.description,
                });
                setErrors({ ...errors, roomId: "", originalPrice: "" });
              }}
            >
              <option value="">- Select a room -</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.branch} - {room.roomName} (${room.price}/night)
                </option>
              ))}
            </select>
            {errors.roomId && <p className="mt-1 text-xs text-red-500">{errors.roomId}</p>}
            {selectedRoom && (
              <p className="mt-2 text-xs text-[#5b9bd5]">
                {selectedRoom.type} - {selectedRoom.guests} guests - {selectedRoom.location}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1565a8]">Discount (%)</label>
              <input
                type="number"
                placeholder="e.g. 25"
                value={formData.discount}
                className="w-full rounded-xl border border-[#e2e8f0] bg-[#f5f9fc] px-4 py-3 text-sm placeholder:text-slate-300 focus:outline-none"
                onChange={(e) => {
                  setFormData({ ...formData, discount: e.target.value });
                  setErrors({ ...errors, discount: "" });
                }}
              />
              {errors.discount && <p className="mt-1 text-xs text-red-500">{errors.discount}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1565a8]">Original Price ($)</label>
              <input
                type="number"
                placeholder="e.g. 799"
                value={formData.originalPrice}
                className="w-full rounded-xl border border-[#e2e8f0] bg-[#f5f9fc] px-4 py-3 text-sm placeholder:text-slate-300 focus:outline-none"
                onChange={(e) => {
                  setFormData({ ...formData, originalPrice: e.target.value });
                  setErrors({ ...errors, originalPrice: "" });
                }}
              />
              {errors.originalPrice && <p className="mt-1 text-xs text-red-500">{errors.originalPrice}</p>}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#1565a8]">Expiry Date</label>
            <input
              type="date"
              value={formData.expiryDate}
              className="w-full rounded-xl border border-[#e2e8f0] bg-[#f5f9fc] px-4 py-3 text-sm text-slate-400 focus:outline-none"
              onChange={(e) => {
                setFormData({ ...formData, expiryDate: e.target.value });
                setErrors({ ...errors, expiryDate: "" });
              }}
            />
            {errors.expiryDate && <p className="mt-1 text-xs text-red-500">{errors.expiryDate}</p>}
          </div>

          <div className="flex items-center gap-4">
            <label
              htmlFor="activeCheckbox"
              className="relative h-[3em] w-[3em] flex-shrink-0 cursor-pointer rounded-[1.2em] bg-[#b3fffa] shadow-[inset_-1px_1px_4px_0px_#f0fffe,inset_1px_-1px_4px_0px_#00bdb0,-1px_2px_4px_0px_#00bdb0]"
            >
              <input
                type="checkbox"
                id="activeCheckbox"
                checked={isActive}
                onChange={(e) => {
                  setIsActive(e.target.checked);
                  setErrors({ ...errors, active: "" });
                }}
                className="peer appearance-none"
              />
              <span className="absolute left-1/2 top-1/2 h-[2em] w-[2em] -translate-x-1/2 -translate-y-1/2 rounded-[0.8em] bg-[#ccfffc] shadow-[inset_-1px_1px_4px_0px_#f0fffe,inset_1px_-1px_4px_0px_#00bdb0,-1px_1px_2px_0px_#00bdb0] duration-[200ms] peer-checked:shadow-[inset_1px_-1px_4px_0px_#f0fffe,inset_-1px_1px_4px_0px_#00bdb0]" />
              <svg fill="#00756d" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" className="absolute left-1/2 top-1/2 h-[2em] w-[2em] -translate-x-1/2 -translate-y-1/2 transition-opacity peer-checked:opacity-0">
                <path d="M697.4 759.2l61.8-61.8L573.8 512l185.4-185.4-61.8-61.8L512 450.2 326.6 264.8l-61.8 61.8L450.2 512 264.8 697.4l61.8 61.8L512 573.8z" />
              </svg>
              <svg fill="#00756d" viewBox="-3.2 -3.2 38.40 38.40" xmlns="http://www.w3.org/2000/svg" className="absolute left-1/2 top-1/2 h-[2em] w-[2em] -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity peer-checked:opacity-100">
                <path d="M5 16.577l2.194-2.195 5.486 5.484L24.804 7.743 27 9.937l-14.32 14.32z" />
              </svg>
            </label>

            <div>
              <p className="text-sm font-semibold text-[#1565a8]">Confirm & Set as Active</p>
              <p className="mt-0.5 text-xs text-[#5b9bd5]">
                {isActive
                  ? "Ready to submit - offer will be visible to users"
                  : "Tick to confirm and enable the Add Offer button"}
              </p>
              {errors.active && <p className="mt-1 text-xs text-red-500">{errors.active}</p>}
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="group relative flex items-center overflow-hidden rounded-md bg-red-400 px-6 py-3 font-medium transition-all"
            >
              <span className="absolute right-0 top-0 inline-block h-4 w-4 rounded bg-red-500 transition-all duration-500 ease-in-out group-hover:-mr-4 group-hover:-mt-4">
                <span className="absolute right-0 top-0 h-5 w-5 translate-x-1/2 -translate-y-1/2 rotate-45 bg-white" />
              </span>
              <span className="absolute bottom-0 left-0 inline-block h-4 w-4 rotate-180 rounded bg-red-500 transition-all duration-500 ease-in-out group-hover:-mb-4 group-hover:-ml-4">
                <span className="absolute right-0 top-0 h-5 w-5 translate-x-1/2 -translate-y-1/2 rotate-45 bg-white" />
              </span>
              <span className="absolute bottom-0 left-0 h-full w-full -translate-x-full rounded-md bg-red-300 transition-all duration-500 ease-in-out delay-200 group-hover:translate-x-0" />
              <span className="relative w-full text-left text-white transition-colors duration-200 ease-in-out group-hover:text-white">Cancel</span>
            </button>

            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="rounded-lg bg-[#1565a8] px-8 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-200 transition-colors hover:bg-[#1e40af] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSubmitting ? "Adding..." : "Add Offer"}
            </button>
          </div>

          {submitError && (
            <p className="mt-3 text-sm font-medium text-red-500">{submitError}</p>
          )}
        </form>
      </div>
    </div>
  );
}

export default OfferFormModal;
