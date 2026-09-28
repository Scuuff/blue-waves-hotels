import { Link } from "react-router-dom";
import { ArrowRight, BedDouble, Maximize, Sparkles, Users } from "lucide-react";
import hotels from "../data/hotels";
import { amenityIcon } from "../utils/amenityIcons";
import HeadingDivider from "./HeadingDivider";
import {
  badgeNeutral,
  cardAmenityPill,
  cardAmenityRow,
  cardBodyColumn,
  cardEyebrow,
  cardFooter,
  cardImage,
  cardImageScrim,
  cardLinkAction,
  cardMedia,
  cardMetaIcon,
  cardPrice,
  cardPriceUnit,
  cardShellColumn,
  cardSpecItem,
  cardSpecRow,
  cardTitle,
} from "./cardSystem";

const featuredRooms = hotels.filter((r) => r.featured).slice(0, 3);

export default function RoomTypesPreview() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#f6f9fd] via-[#edf4fb] to-[#f6f9fd] px-6 py-24 dark:from-[#0a1420] dark:via-[#0d1b2c] dark:to-[#0a1420] md:px-10 lg:px-16">
      {/* Ambient blue glows */}
      <div className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-[#9fc0ec]/20 blur-3xl dark:bg-[#9fc0ec]/10" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-96 w-96 rounded-full bg-[#3b6fae]/10 blur-3xl dark:bg-[#3b6fae]/15" />

      <div className="relative mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.35em] text-[#2f6fb3] dark:text-[#9fc0ec]">
            <Sparkles size={16} />
            Room Types
          </p>

          <h2 className="mt-4 font-serif text-4xl font-semibold text-[#16283c] dark:text-white dark:drop-shadow-[0_2px_25px_rgba(159,192,236,0.3)] md:text-5xl">
            Discover Your Perfect Stay
          </h2>

          <HeadingDivider />

          <p className="mt-6 text-base leading-8 text-[#3c5068] dark:text-white/70 md:text-lg">
            Explore a selection of our real room categories, designed for
            comfort, elegance, and memorable moments.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {featuredRooms.map((room) => (
            <Link
              to="/hotels"
              key={room.id}
              className={cardShellColumn}
            >
              <div className={cardMedia}>
                <img
                  src={room.image}
                  alt={room.roomName}
                  className={cardImage}
                />
                <div className={cardImageScrim} />

                <div className={badgeNeutral}>{room.type}</div>
              </div>

              <div className={cardBodyColumn}>
                <p className={cardEyebrow}>{room.branch}</p>
                <h3 className={cardTitle}>{room.roomName}</h3>

                <div className={cardAmenityRow}>
                  {room.amenities.slice(0, 3).map((a) => {
                    const Icon = amenityIcon(a);
                    return (
                      <span key={a} className={cardAmenityPill}>
                        <Icon size={13} className={cardMetaIcon} />
                        {a}
                      </span>
                    );
                  })}
                </div>

                <div className={cardSpecRow}>
                  <span className={cardSpecItem}>
                    <Users size={15} className={cardMetaIcon} />
                    {room.guests} guests
                  </span>
                  <span className={cardSpecItem}>
                    <BedDouble size={15} className={cardMetaIcon} />
                    {room.beds} bed{room.beds > 1 ? "s" : ""}
                  </span>
                  <span className={cardSpecItem}>
                    <Maximize size={15} className={cardMetaIcon} />
                    {room.size} sq ft
                  </span>
                </div>

                <div className={`${cardFooter} mt-auto pt-6`}>
                  <p className={cardPrice}>
                    ${room.price}
                    <span className={cardPriceUnit}> / night</span>
                  </p>

                  <span className={cardLinkAction}>
                    View Room
                    <ArrowRight
                      size={16}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/hotels"
            className="inline-flex items-center gap-2 rounded-full bg-[#2f6fb3] px-8 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#26567E] dark:bg-[#9fc0ec] dark:text-[#0c1828] dark:hover:bg-[#7ea0d6]"
          >
            View All Rooms
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
