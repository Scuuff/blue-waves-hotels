import AlexBranchImg from "../assets/Images/Alex_Branch.png";
import AinElSokhnaBranchImg from "../assets/Images/Ain_El_Sokhna_Branch.png";
import CairoBranchImg from "../assets/Images/Cairo_Pyramids.jpg";
import MarsaAlamBranchImg from "../assets/Images/MrasaAlam_Branch.avif";
import SharmBranchImg from "../assets/Images/Sharm_Branch.png";
import { getSafeRoomImage } from "./roomMedia";

// Public-folder images, prefixed with the deploy base (e.g. /blue-waves-hotels/ on GitHub Pages).
const IMAGES = `${import.meta.env.BASE_URL}Images/`;

const branchImageByKey = {
  "alexa branch": AlexBranchImg,
  "alexandria branch": AlexBranchImg,
  alexandria: AlexBranchImg,
  "cairo branch": CairoBranchImg,
  cairo: CairoBranchImg,
  "sharm el sheikh branch": SharmBranchImg,
  "sharm el sheikh": SharmBranchImg,
  sharm: SharmBranchImg,
  "ain el sokhna branch": AinElSokhnaBranchImg,
  "ain el sokhna": AinElSokhnaBranchImg,
  sokhna: AinElSokhnaBranchImg,
  "marsa alam branch": MarsaAlamBranchImg,
  "marsa alam": MarsaAlamBranchImg,
};

// The Cairo branch uses a tall (portrait) pyramids photo, so its crop is
// biased downward to keep the sphinx + pyramids centered in the wide card.
const branchImagePositionByKey = {
  "cairo branch": "center 68%",
  cairo: "center 68%",
};

function branchImagePosition(hotel = {}) {
  const nameKey = String(hotel.name || "").trim().toLowerCase();
  const cityKey = String(hotel.city || "").trim().toLowerCase();

  return branchImagePositionByKey[nameKey] || branchImagePositionByKey[cityKey] || "center";
}

const branchImageByFileName = {
  "alex_branch.png": AlexBranchImg,
  "cairo_branch.png": CairoBranchImg,
  "sharm_branch.png": SharmBranchImg,
  "ain_el_sokhna_branch.png": AinElSokhnaBranchImg,
  "mrasaalam_branch.avif": MarsaAlamBranchImg,
};

function fallbackBranchImage(hotel = {}) {
  const nameKey = String(hotel.name || "").trim().toLowerCase();
  const cityKey = String(hotel.city || "").trim().toLowerCase();

  return branchImageByKey[nameKey] || branchImageByKey[cityKey] || "";
}

function normalizeImagePath(image = "") {
  if (!image || typeof image !== "string") {
    return "";
  }

  const trimmedImage = image.trim().replace(/\\/g, "/");
  const lowerImage = trimmedImage.toLowerCase();
  const fileName = lowerImage.split("/").pop();

  if (!trimmedImage) return "";
  if (import.meta.env.BASE_URL !== "/" && trimmedImage.startsWith(import.meta.env.BASE_URL)) return trimmedImage;
  if (fileName && branchImageByFileName[fileName]) {
    return branchImageByFileName[fileName];
  }
  if (trimmedImage.startsWith("/images/")) {
    return `${IMAGES}${trimmedImage.slice("/images/".length)}`;
  }
  if (lowerImage.includes("/images/")) {
    return `${IMAGES}${trimmedImage.slice(lowerImage.lastIndexOf("/images/") + "/images/".length)}`;
  }
  if (lowerImage.startsWith("images/")) {
    return `${IMAGES}${trimmedImage.slice("images/".length)}`;
  }
  if (
    trimmedImage.startsWith("/") ||
    trimmedImage.startsWith("http://") ||
    trimmedImage.startsWith("https://") ||
    trimmedImage.startsWith("data:")
  ) {
    return trimmedImage;
  }

  if (lowerImage.includes("assets/images/") && fileName) {
    return `${IMAGES}${fileName}`;
  }

  return `${IMAGES}${trimmedImage}`;
}

export function slugifyBranchName(name = "") {
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function inferBranchBadge(city = "", address = "") {
  const content = `${city} ${address}`.toLowerCase();

  if (
    content.includes("sharm") ||
    content.includes("marsa") ||
    content.includes("sokhna") ||
    content.includes("bay") ||
    content.includes("coast")
  ) {
    return "Resort";
  }

  if (content.includes("cairo") || content.includes("alex")) {
    return "City";
  }

  return "Branch";
}

export function normalizeHotelBranch(hotel = {}) {
  const amenities = Array.isArray(hotel.amenities) ? hotel.amenities : [];
  const fallbackImage = fallbackBranchImage(hotel) || getSafeRoomImage(hotel.rooms?.[0] || { type: "Deluxe" });
  const image =
    normalizeImagePath(hotel.image) ||
    fallbackImage;
  const name = hotel.name || "Branch";
  const city = hotel.city || "";
  const address = hotel.address || "";
  const badge = inferBranchBadge(city, address);

  return {
    _id: hotel._id || hotel.id,
    id: hotel._id || hotel.id,
    slug: slugifyBranchName(name),
    name,
    title: name,
    hotelName: hotel.hotelName || "Blue Wave Hotel",
    city,
    address,
    location: city ? `${city}, Egypt` : address || "Egypt",
    destination: address || (city ? `${city}, Egypt` : "Egypt"),
    description:
      hotel.description ||
      `Enjoy a premium stay at ${name} with signature Blue Wave hospitality.`,
    image,
    fallbackImage,
    imagePosition: branchImagePosition(hotel),
    badge,
    features: amenities.slice(0, 4),
    amenities,
    status: hotel.status || "Active",
    rating: Number(hotel.rating) || 0,
    phone: hotel.phone || "Phone not available",
    email: hotel.email || "Email not available",
    rooms: Array.isArray(hotel.rooms) ? hotel.rooms : [],
  };
}
