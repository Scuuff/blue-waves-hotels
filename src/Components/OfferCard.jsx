import { getSafeRoomImage } from "../utils/roomMedia";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CountdownTimer from "./CountdownTimer";
import { useAuth } from "../Context/AuthContext";
import { isOfferExpired } from "../utils/offerStatus";
import {
  badgeNeutral,
  cardAmenityPill,
  cardBodyColumn,
  cardButton,
  cardButtonShimmer,
  cardDescription,
  cardEyebrow,
  cardFooter,
  cardImage,
  cardImageScrim,
  cardMedia,
  cardPrice,
  cardPriceStrike,
  cardPriceUnit,
  cardShellColumn,
  cardTitle,
} from "./cardSystem";

const OfferCard = ({ offer, appliedPromo, steamHover = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // The countdown already says "Offer Expired" — make that mean something
  // instead of leaving a live Book Now button on a dead deal.
  const expired = isOfferExpired(offer);

  const finalPrice = appliedPromo
    ? (offer.discountedPrice * (1 - appliedPromo.discount / 100)).toFixed(0)
    : offer.discountedPrice;

  // Book Now — navigates to booking page (login required). Shared by the
  // resting button and the Steam-style hover overlay button.
  const handleBookNow = (e) => {
    e.stopPropagation();

    if (expired) return;

    const discountedPrice = Number(finalPrice);

    // Build a room object from the offer's hotel data so BookingCheckOut works
    const room = {
      _id:       offer.roomId,
      image:     offer.image,
      price:     discountedPrice,
      originalPrice: Number(offer.originalPrice) || discountedPrice,
      discountedPrice,
      discountPercent: Number(offer.discountPercent) || 0,
      offerBadge: offer.badge,
      offerTitle: offer.title,
      roomName:  offer.roomName,
      branch:    offer.branch,
      guests:    offer.guests,
      beds:      offer.beds,
      baths:     offer.baths,
      size:      offer.size,
      rating:    offer.rating,
      amenities: offer.amenities || [],
    };

    // Guests must log in first
    if (!isAuthenticated) {
      alert("Please log in or create an account to book this offer.");
      navigate("/login", { state: { from: "/offers", pendingRoom: room } });
      return;
    }

    navigate("/booking", { state: { room } });
  };

  return (
    <div
      className={`${cardShellColumn} relative cursor-pointer`}
      style={{
        transition: "transform 0.3s ease",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className={cardMedia}>
        <img
          src={offer.image}
          alt={offer.title}
          onError={(e) => {
            e.currentTarget.src = getSafeRoomImage({ type: offer.type || "Standard" });
          }}
          className={cardImage}
        />
        <div className={cardImageScrim} />
        {/* Category tag */}
        <span className={badgeNeutral}>{offer.tag}</span>
        {/* Discount badge */}
        <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#1d3252] backdrop-blur-md">
          -{offer.discountPercent}%
        </div>
      </div>

      {/* Content */}
      <div className={cardBodyColumn}>
        {/* Room name + branch pulled from hotels.js */}
        {offer.roomName && (
          <p className={cardEyebrow}>
            {offer.roomName} · {offer.branch}
          </p>
        )}
        <h3 className={cardTitle}>{offer.title}</h3>

        <p className={`${cardDescription} flex-1`}>{offer.description}</p>

        {/* Features */}
        <div className="mt-4 flex flex-wrap gap-2">
          {(offer.features || []).map((f, i) => (
            <span key={i} className={cardAmenityPill}>
              {f}
            </span>
          ))}
        </div>

        {/* Countdown */}
        <div className="mt-4">
          <CountdownTimer expiresAt={offer.expiresAt} />
        </div>

        {/* Price */}
        <div className={`${cardFooter} items-end border-t border-dashed border-[#e3ebf4] pt-4 dark:border-white/10`}>
          <div>
            <span className={cardPriceStrike}>${offer.originalPrice}</span>
            <div className="flex items-baseline gap-1">
              <span className={cardPrice}>
                ${finalPrice}
              </span>
              <span className={cardPriceUnit}> / night</span>
            </div>
            {appliedPromo && (
              <span className="text-xs font-semibold text-[#567C8D] dark:text-[#9fc0ec]">
                Extra {appliedPromo.discount}% off!
              </span>
            )}
          </div>

          {/* Book Now — navigates to booking page (login required) */}
          <button
            onClick={handleBookNow}
            disabled={expired}
            className={`${cardButton} text-sm`}
          >
            <span className={cardButtonShimmer} />
            <span className="relative z-10">
              {expired ? "Offer Ended" : "Book Now"}
            </span>
          </button>
        </div>
      </div>

      {/* Steam-style hover overlay — reveals only the image, discounted price,
          and Book Now. Opt-in via the `steamHover` prop. */}
      {steamHover && (
        <div
          className="absolute inset-0 flex flex-col justify-end"
          style={{
            zIndex: 40,
            opacity: isHovered ? 1 : 0,
            pointerEvents: isHovered ? "auto" : "none",
            transition: "opacity 0.45s ease",
          }}
        >
          {/* Full-bleed room image */}
          <img
            src={offer.image}
            alt={offer.title}
            onError={(e) => {
              e.currentTarget.src = getSafeRoomImage({ type: offer.type || "Standard" });
            }}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              transform: isHovered ? "scale(1.05)" : "scale(1.12)",
              transition: "transform 0.7s ease",
            }}
          />

          {/* Subtle gradient overlay for legibility */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(26,26,46,0.92) 0%, rgba(26,26,46,0.45) 42%, rgba(26,26,46,0.10) 100%)",
            }}
          />

          {/* Discount badge */}
          <div
            className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#1d3252] backdrop-blur-md"
          >
            -{offer.discountPercent}%
          </div>

          {/* Bottom bar: price + Book Now — anchored to the bottom so it can't
              spill past the card's rounded corners */}
          <div
            className="absolute inset-x-0 bottom-0 z-10 p-5 flex items-center justify-between gap-3"
            style={{
              transform: isHovered ? "translateY(0)" : "translateY(14px)",
              transition: "transform 0.45s ease",
            }}
          >
            <div>
              <span
                className="line-through text-xs"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                ${offer.originalPrice}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-3xl font-semibold text-white">${finalPrice}</span>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>
                  /night
                </span>
              </div>
            </div>

            <button
              onClick={handleBookNow}
              disabled={expired}
              className={`${cardButton} text-sm`}
            >
              <span className={cardButtonShimmer} />
              {expired ? "Offer Ended" : "Book Now"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferCard;
