import { motion } from "framer-motion";
import { Heart, MapPin, Star, Users, BedDouble, Bath } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../Context/AuthContext";
import { useFavorites } from "../Context/FavoritesContext";
import { getSafeRoomImage } from "../utils/roomMedia";
import {
  badgeAvailable,
  badgeBooked,
  cardAmenityPill,
  cardAmenityRow,
  cardBody,
  cardButton,
  cardButtonShimmer,
  cardEyebrow,
  cardFooter,
  cardIconButton,
  cardImage,
  cardImageScrim,
  cardMedia,
  cardMetaIcon,
  cardMetaText,
  cardPrice,
  cardPriceUnit,
  cardRatingPill,
  cardShell,
  cardSpecItem,
  cardSpecRow,
  cardTitle,
} from "./cardSystem";

export default function HotelCard({ hotel, onFavoriteToggle }) {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favoriteActive = isFavorite(hotel._id);

  const handleFavoriteClick = async () => {
    if (!token || !isAuthenticated) {
      alert("Please login first to add favorites.");
      navigate("/login");
      return;
    }

    try {
      const action = await toggleFavorite(hotel);
      onFavoriteToggle?.(action, hotel);
    } catch (error) {
      console.error("Favorite error:", error.message);
      alert(error.message);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={cardShell}
    >
      <div className={cardMedia}>
        <img
          src={getSafeRoomImage(hotel)}
          onError={(e) => {
            e.currentTarget.src = getSafeRoomImage({ type: hotel.type });
          }}
          alt={hotel.roomName}
          className={cardImage}
        />
        <div className={cardImageScrim} />

        <span
          className={hotel.available ? badgeAvailable : badgeBooked}
        >
          {hotel.available ? "Available" : "Booked"}
        </span>

        <motion.button
          onClick={handleFavoriteClick}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.85 }}
          transition={{ type: "spring", stiffness: 500, damping: 18 }}
          className={cardIconButton}
          aria-label={
            favoriteActive ? "Remove from favorites" : "Add to favorites"
          }
        >
          <Heart
            size={18}
            className={
              favoriteActive ? "fill-red-500 text-red-500" : "text-slate-600"
            }
          />
        </motion.button>
      </div>

      <div className={cardBody}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className={cardEyebrow}>
              {hotel.branch}
            </p>
            <h3 className={cardTitle}>
              {hotel.roomName}
            </h3>
          </div>

          <div className={cardRatingPill}>
            <Star size={14} className="fill-amber-400 text-amber-400" />
            {hotel.rating}
          </div>
        </div>

        <p className={cardMetaText}>
          <MapPin size={15} className={cardMetaIcon} />
          {hotel.location}
        </p>

        <div className={cardAmenityRow}>
          {(hotel.amenities || []).map((item, index) => (
            <span
              key={index}
              className={cardAmenityPill}
            >
              {item}
            </span>
          ))}
        </div>

        <div className={cardSpecRow}>
          <span className={cardSpecItem}>
            <BedDouble size={16} className={cardMetaIcon} />
            {hotel.beds} Beds
          </span>
          <span className={cardSpecItem}>
            <Bath size={16} className={cardMetaIcon} />
            {hotel.baths} Baths
          </span>
          <span className={cardSpecItem}>
            <Users size={16} className={cardMetaIcon} />
            {hotel.guests} Guests
          </span>
        </div>

        <div className={cardFooter}>
          <p className={cardPrice}>
            ${hotel.price}
            <span className={cardPriceUnit}>
              {" "}
              / night
            </span>
          </p>

          <Link
            to="/booking"
            state={{ room: hotel }}
            className={cardButton}
          >
            <span className={cardButtonShimmer} />
            Book Now
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
