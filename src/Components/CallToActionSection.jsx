import { Link } from "react-router-dom";

export default function CallToActionSection() {
  return (
    <section className="bg-[#2F4156] px-6 py-20 md:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl rounded-[36px] border border-white/10 bg-white/5 px-8 py-14 text-center shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-sm md:px-14">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#C8D9E6]">
          Your Next Stay Awaits
        </p>

        <h2 className="mt-4 font-serif text-3xl font-semibold leading-tight text-white md:text-5xl">
          Ready for Your Next Luxury Escape?
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
          Discover elegant rooms, exclusive offers, and unforgettable
          hospitality at Blue Waves Hotel.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/about"
            className="inline-flex items-center justify-center rounded-full bg-[#7ea0d6] px-8 py-3 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:text-[#2F4156]"
          >
            About Us
          </Link>

          <Link
            to="/hotelDetails"
            className="inline-flex items-center justify-center rounded-full border border-white/70 px-8 py-3 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:text-[#2F4156]"
          >
            Explore Hotels
          </Link>
        </div>
      </div>
    </section>
  );
}