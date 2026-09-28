import React, { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import GallerySection from "../Components/GallerySection";
import BranchesSection from "../Components/BranchesSection";
import AmenitiesSection from "../Components/AmenitiesSection";
import PrimeLocationSection from "../Components/PrimeLocationSection";
import {
  locations,
  hotelName,
  galleryImages,
  hotelAmenities,
} from "../data/hotels";
import Footer from "../Components/Footer";
import { apiGet } from "../services/apiClient";
import { normalizeHotelBranch } from "../utils/hotelBranches";
import { getFallbackBranches } from "../utils/catalogFallbacks";

export default function HotelDetails() {
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadBranches = async () => {
      try {
        const data = await apiGet("/hotels");
        if (!isMounted) return;

        const normalizedBranches = Array.isArray(data?.hotels) && data.hotels.length > 0
          ? data.hotels
              .filter((hotel) => hotel?.status !== "Inactive")
              .map(normalizeHotelBranch)
          : getFallbackBranches();

        setBranches(normalizedBranches);
      } catch {
        if (isMounted) {
          setBranches(getFallbackBranches());
        }
      }
    };

    loadBranches();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      <GallerySection images={galleryImages} />
      <BranchesSection branches={branches} />
      <AmenitiesSection amenities={hotelAmenities} />
      <PrimeLocationSection hotelName={hotelName} locations={locations} />

      <Footer />
    </div>
  );
}
