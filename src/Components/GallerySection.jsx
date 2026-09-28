import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function GallerySection({ images }) {
  const [selectedImage, setSelectedImage] = useState(0);

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  // The Cairo pyramids photo is portrait, so bias its crop downward to keep
  // the sphinx + pyramids framed naturally; other images stay centered.
  const focusPosition = (src = "") =>
    /Cairo_Pyramids/i.test(src) ? "center 68%" : "center";

  const pad = (value) => String(value).padStart(2, "0");

  return (
    <section className="bg-gradient-to-b from-[#f6f9fd] via-[#edf4fb] to-[#f6f9fd] pt-28 pb-16 px-4 dark:from-[#0a1420] dark:via-[#0d1b2c] dark:to-[#0a1420] md:px-8 lg:px-12 xl:px-16 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Header: title on the left, navigation arrows on the right */}
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 flex items-center gap-3 text-[12px] md:text-sm uppercase tracking-[0.28em] text-[#2f6fb3] dark:text-[#9fc0ec]">
              <span className="h-px w-8 bg-[#2f6fb3]/50 dark:bg-[#9fc0ec]/60" />
              Our Spaces
            </p>
            <h1 className="mb-2 text-3xl md:text-4xl font-serif font-semibold text-[#16283c] dark:text-white dark:drop-shadow-[0_2px_25px_rgba(159,192,236,0.3)]">
              Discover Blue Waves
            </h1>
            <p className="max-w-xl text-sm md:text-base text-[#3c5068] dark:text-white/70 leading-relaxed">
              A glimpse into our elegant stays, refined interiors, and signature experiences.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-end">
            <button
              onClick={prevImage}
              aria-label="Previous image"
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-white ring-1 ring-[#26567E]/20 text-[#16283c] shadow-sm backdrop-blur-md transition-all duration-300 hover:bg-[#2f6fb3] hover:text-white dark:bg-[#0c1828]/70 dark:ring-white/15 dark:text-white dark:hover:bg-[#9fc0ec] dark:hover:text-[#0c1828]"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextImage}
              aria-label="Next image"
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-white ring-1 ring-[#26567E]/20 text-[#16283c] shadow-sm backdrop-blur-md transition-all duration-300 hover:bg-[#2f6fb3] hover:text-white dark:bg-[#0c1828]/70 dark:ring-white/15 dark:text-white dark:hover:bg-[#9fc0ec] dark:hover:text-[#0c1828]"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Main image on the left, vertical thumbnail rail on the right */}
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
          <div className="relative flex-1">
            <img
              src={images[selectedImage]}
              alt={`Gallery ${selectedImage + 1}`}
              style={{ objectPosition: focusPosition(images[selectedImage]) }}
              className="dbw-gallery-main w-full rounded-[24px] object-cover shadow-xl transition-all duration-500"
            />

            {/* Counter */}
            <div className="absolute left-4 top-4 rounded-lg bg-[#0c1828]/70 px-3.5 py-1.5 text-sm font-medium text-white ring-1 ring-white/15 shadow backdrop-blur-md">
              {pad(selectedImage + 1)} / {pad(images.length)}
            </div>
          </div>

          {/* Thumbnail rail: vertical on desktop, horizontal scroll on mobile */}
          <div className="dbw-gallery-rail flex flex-row gap-3 overflow-x-auto pb-2 lg:h-[520px] lg:w-[132px] lg:flex-col lg:overflow-y-auto lg:overflow-x-visible lg:pb-0 lg:pr-2">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                aria-label={`View image ${index + 1}`}
                className={`dbw-gallery-thumb-btn group relative overflow-hidden rounded-[14px] transition-all duration-300 ${
                  selectedImage === index
                    ? "ring-2 ring-[#9fc0ec]"
                    : "opacity-60 ring-1 ring-white/10 hover:opacity-100"
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  style={{ objectPosition: focusPosition(img) }}
                  className="dbw-gallery-thumb object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Responsive sizes live here (not Tailwind utilities) because the
          Tailwind Play CDN can emit a base arbitrary value after its responsive
          override, breaking base + lg:h-[...] on the same property. */}
      <style>
        {`
          .dbw-gallery-main { height: 280px; }
          /* Slim, on-theme scrollbar for the thumbnail rail (blue on dark navy). */
          .dbw-gallery-rail { scrollbar-width: thin; scrollbar-color: rgba(159, 192, 236, 0.5) transparent; }
          .dbw-gallery-rail::-webkit-scrollbar { width: 6px; height: 6px; }
          .dbw-gallery-rail::-webkit-scrollbar-track { background: rgba(159, 192, 236, 0.08); border-radius: 9999px; }
          .dbw-gallery-rail::-webkit-scrollbar-thumb { background: rgba(159, 192, 236, 0.45); border-radius: 9999px; }
          .dbw-gallery-rail::-webkit-scrollbar-thumb:hover { background: rgba(159, 192, 236, 0.75); }
          /* The thumbnail button is the flex item; fixing its flex basis keeps
             thumbnails from shrinking so the rail scrolls instead. */
          .dbw-gallery-thumb-btn { flex: 0 0 96px; height: 80px; }
          .dbw-gallery-thumb { width: 100%; height: 100%; }
          @media (min-width: 640px) {
            .dbw-gallery-main { height: 380px; }
            .dbw-gallery-thumb-btn { flex-basis: 112px; height: 96px; }
          }
          @media (min-width: 768px) {
            .dbw-gallery-main { height: 460px; }
          }
          @media (min-width: 1024px) {
            .dbw-gallery-main { height: 520px; }
            .dbw-gallery-thumb-btn { flex: 0 0 auto; width: 100%; height: 92px; }
          }
        `}
      </style>
    </section>
  );
}
