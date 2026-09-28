import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import HotelCard from "../Components/HotelCard";
import { useAuth } from "../Context/AuthContext";
import { useFavorites } from "../Context/FavoritesContext";

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { token, isAuthenticated, isAuthLoading } = useAuth();
  const { favorites, isFavoritesLoading } = useFavorites();
  const [favoriteRooms, setFavoriteRooms] = useState([]);

  useEffect(() => {
    setFavoriteRooms(favorites);
  }, [favorites]);

  const handleFavoriteToggle = (action, room) => {
    if (action !== "removed") return;

    setFavoriteRooms((currentRooms) =>
      currentRooms.filter(
        (favoriteRoom) =>
          favoriteRoom._id !== room._id && favoriteRoom.roomId !== room._id
      )
    );
  };

  useEffect(() => {
    const fetchFavorites = async () => {
      if (isAuthLoading) {
        return;
      }

      if (!token || !isAuthenticated) {
        alert("Please login first to view your favorites.");
        navigate("/login");
        return;
      }
    };

    fetchFavorites();
  }, [token, isAuthenticated, isAuthLoading, navigate]);

  return (
    <div className="min-h-screen bg-[#f7fafd] pt-28 dark:bg-[#0a1420]">
      <Navbar />

      <div className="bg-[#CBD9E6] py-6 dark:bg-[#0c1828] md:py-8">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#5E7D96] dark:text-[#9fc0ec] md:text-sm">
            Blue Wave
          </p>

          <h1 className="mt-3 text-3xl font-semibold text-[#2C4A63] dark:text-white md:text-4xl">
            Favorite Rooms
          </h1>

          <p className="mt-3 text-sm text-[#5E7D96] dark:text-white/60 md:text-base">
            All rooms you saved will appear here.
          </p>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-12 lg:px-8">
        {isFavoritesLoading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[420px] animate-pulse rounded-3xl bg-white shadow-md dark:bg-[#0f1f33]"
              />
            ))}
          </div>
        ) : favoriteRooms.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {favoriteRooms.map((hotel) => (
              <HotelCard
                key={hotel._id}
                hotel={hotel}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-2xl rounded-3xl bg-white p-12 text-center shadow-md dark:bg-[#0f1f33] dark:ring-1 dark:ring-white/10">
            <h2 className="text-2xl font-bold text-[#2C4A63] dark:text-white">
              No favorite rooms yet
            </h2>
            <p className="mt-3 text-[#5E7D96] dark:text-white/60">
              Click the heart icon on any room to save it here.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
