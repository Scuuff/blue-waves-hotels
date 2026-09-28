import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MapPin, Star, Sparkles } from "lucide-react";
import BranchRoomsSection from "../Components/BranchRoomsSection";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { apiGet } from "../services/apiClient";
import { normalizeRoomRecord } from "../utils/roomMedia";
import { normalizeHotelBranch } from "../utils/hotelBranches";
import { branchDetails as staticBranchDetails } from "../data/hotels";
import { getFallbackRooms } from "../utils/catalogFallbacks";

export default function UserBranchDetails() {
  const { slug } = useParams();

  const [rooms, setRooms] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [roomsError, setRoomsError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchBranchData = async () => {
      try {
        setLoadingRooms(true);
        setRoomsError("");
        const [hotelsData, roomsData] = await Promise.all([
          apiGet("/hotels").catch(() => ({ hotels: [] })),
          apiGet("/rooms").catch(() => []),
        ]);

        if (!isMounted) return;

        const apiBranches = Array.isArray(hotelsData?.hotels)
          ? hotelsData.hotels
              .filter((hotel) => hotel?.status !== "Inactive")
              .map(normalizeHotelBranch)
          : [];
        const fallbackBranches = staticBranchDetails.map((branch) => ({
          _id: branch.slug,
          id: branch.slug,
          slug: branch.slug,
          title: branch.title,
          name: branch.title,
          description: branch.description,
          image: branch.image,
          fallbackImage: branch.image,
          badge: branch.badge,
          features: branch.features || [],
          amenities: branch.features || [],
          location: branch.title.replace(" Branch", ""),
        }));
        const matchedBranch =
          [...apiBranches, ...fallbackBranches].find((branch) => branch.slug === slug) || null;

        setSelectedBranch(matchedBranch || null);
        const normalizedRooms = Array.isArray(roomsData) && roomsData.length > 0
          ? roomsData.map(normalizeRoomRecord)
          : getFallbackRooms();
        setRooms(normalizedRooms);
      } catch (error) {
        console.error("Error fetching rooms:", error);
        if (isMounted) {
          setSelectedBranch(null);
          setRooms([]);
          setRoomsError("Failed to load branch data.");
        }
      } finally {
        if (isMounted) {
          setLoadingRooms(false);
        }
      }
    };

    fetchBranchData();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loadingRooms && !selectedBranch) {
    return (
      <>
        <Navbar />
        <section className="min-h-screen bg-[#edf7ff] pt-36 px-6 md:px-10 lg:px-12">
          <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-sm p-8 text-center text-[#5f6f8c]">
            Loading branch details...
          </div>
        </section>
        <Footer />
      </>
    );
  }

  if (!selectedBranch) {
    return (
      <>
        <Navbar />
        <section className="min-h-screen bg-[#edf7ff] pt-36 px-6 md:px-10 lg:px-12">
          <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-sm p-8">
            <h1 className="text-3xl font-serif text-[#0b2b6f] mb-3">
              Branch Not Found
            </h1>
            <p className="text-[#5f6f8c] mb-6">
              The branch you are trying to view does not exist.
            </p>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  const roomDescriptionByType = {
    Standard:
      "A comfortable and elegant room designed for a relaxing stay with essential luxury touches.",
    Deluxe:
      "A refined room experience with upgraded comfort, stylish interiors, and enhanced amenities.",
    Suite:
      "A spacious suite offering premium comfort, extra living space, and a more elevated stay.",
    Penthouse:
      "An exclusive luxury experience with exceptional space, premium features, and top-tier comfort.",
  };

  const branchRooms = rooms
    .filter((room) => room.branch === selectedBranch.title || room.branch === selectedBranch.name)
    .map((room) => ({
      ...room,
      cardDescription: roomDescriptionByType[room.type] || room.roomName,
      badge:
        room.type === "Deluxe"
          ? "Popular"
          : room.type === "Penthouse"
          ? "Luxury"
          : "",
    }));

  const branchLocationText =
    selectedBranch.destination || selectedBranch.location || "Egypt";
  const branchHighlights =
    selectedBranch.features.length > 0
      ? selectedBranch.features
      : ["24/7 Front Desk", "Premium Hospitality", "Luxury Stay"];
  const branchAmenities =
    selectedBranch.amenities.length > 0
      ? selectedBranch.amenities
      : ["Free WiFi", "Room Service", "Front Desk"];

  return (
    <>
      <Navbar />

      <section className="min-h-screen bg-[#edf7ff] pt-36 pb-16 px-6 md:px-10 lg:px-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="overflow-hidden rounded-[28px] bg-white shadow-md border border-[#e9eff6]">
            <div className="relative">
              <img
                src={selectedBranch.image}
                alt={selectedBranch.title}
                onError={(event) => {
                  if (
                    selectedBranch.fallbackImage &&
                    event.currentTarget.src !== selectedBranch.fallbackImage
                  ) {
                    event.currentTarget.src = selectedBranch.fallbackImage;
                  }
                }}
                className="w-full h-[280px] md:h-[420px] object-cover"
              />

              {selectedBranch.badge && (
                <span className="absolute top-5 right-5 bg-[#f4a51c] text-white text-xs font-semibold px-4 py-2 rounded-full shadow">
                  {selectedBranch.badge}
                </span>
              )}
            </div>

            <div className="p-6 md:p-8">
              <div className="max-w-4xl">
                <h1 className="text-3xl md:text-5xl font-serif text-[#0b2b6f] mb-3">
                  {selectedBranch.title}
                </h1>

                <div className="flex items-center gap-2 text-[#5f6f8c] mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>{branchLocationText}</span>
                </div>

                <p className="text-[#5f6f8c] leading-8 max-w-4xl mb-8">
                  {selectedBranch.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5 text-[#5f6f8c]">
                  <p className="text-lg md:text-xl leading-8">
                    <span className="font-semibold text-[#0b2b6f] text-xl md:text-xl">
                      Branch Type:
                    </span>{" "}
                    {selectedBranch.badge}
                  </p>

                  <p className="text-lg md:text-xl leading-8">
                    <span className="font-semibold text-[#0b2b6f] text-xl md:text-xl">
                      Destination:
                    </span>{" "}
                    {branchLocationText}
                  </p>

                  <p className="text-lg md:text-xl leading-8">
                    <span className="font-semibold text-[#0b2b6f] text-xl md:text-xl">
                      Experiences:
                    </span>{" "}
                    {branchHighlights.length}
                  </p>

                  <p className="text-lg md:text-xl leading-8 flex items-center gap-2">
                    <span className="font-semibold text-[#0b2b6f] text-xl md:text-xl">
                      Luxury Level:
                    </span>
                    <Star className="w-4 h-4 fill-[#f4a51c] text-[#f4a51c]" />
                    <span className="text-[#0b2b6f] font-medium">
                      Premium
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-[#e9eff6] xl:col-span-1">
              <h3 className="text-2xl font-serif text-[#0b2b6f] mb-4">
                Branch Highlights
              </h3>

              <div className="space-y-3">
                {branchHighlights.map((feature) => (
                  <div
                    key={feature}
                    className="group/item flex items-center gap-3 rounded-2xl bg-[#d9ecff] px-4 py-3 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_8px_20px_rgba(47,111,179,0.18)]"
                  >
                    <Sparkles className="w-4 h-4 text-[#2f6fb3] transition-transform duration-300 group-hover/item:scale-110" />
                    <span className="text-[#0b1f44] text-sm font-medium transition-all duration-300 group-hover/item:text-[0.98rem]">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm border border-[#e9eff6] xl:col-span-2">
              <h3 className="text-2xl font-serif text-[#0b2b6f] mb-2">
                Services & Amenities
              </h3>

              <p className="text-[#5f6f8c] text-sm mb-5">
                Discover the facilities and services available at this branch.
              </p>

              <div className="flex flex-wrap gap-3">
                {branchAmenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="rounded-full bg-[#cfe8f3] px-4 py-2 text-sm font-medium text-[#0b2b6f] transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-[0_8px_20px_rgba(47,111,179,0.18)]"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {loadingRooms ? (
        <div className="px-6 pb-12 text-center text-[#5f6f8c]">Loading rooms...</div>
      ) : roomsError ? (
        <div className="px-6 pb-12 text-center text-red-500">{roomsError}</div>
      ) : (
        <BranchRoomsSection rooms={branchRooms} />
      )}

      <Footer />
    </>
  );
}
