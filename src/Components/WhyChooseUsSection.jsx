import { MapPin, BedDouble, BadgePercent, Headset } from "lucide-react";

const features = [
  {
    id: 1,
    title: "Prime Locations",
    description:
      "Discover our hotels in carefully selected destinations that bring you closer to comfort, elegance, and convenience.",
    icon: MapPin,
  },
  {
    id: 2,
    title: "Luxury Rooms",
    description:
      "Enjoy beautifully designed rooms and suites crafted to offer relaxation, style, and a premium hospitality experience.",
    icon: BedDouble,
  },
  {
    id: 3,
    title: "Best Offers",
    description:
      "Take advantage of exclusive seasonal deals, special packages, and exceptional value tailored for every guest.",
    icon: BadgePercent,
  },
  {
    id: 4,
    title: "24/7 Service",
    description:
      "Our dedicated team is available around the clock to ensure your stay is smooth, comfortable, and memorable.",
    icon: Headset,
  },
];

export default function WhyChooseUsSection() {
  return (
    <section className="px-6 py-24 md:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#2f6fb3] dark:text-[#9fc0ec]">
            Why Choose Us
          </p>

          <h2 className="mt-4 font-serif text-4xl font-semibold text-[#16283c] dark:text-white md:text-5xl">
            Redefining Luxury Hospitality
          </h2>

          <p className="mt-5 text-base leading-8 text-[#3c5068] dark:text-white/70 md:text-lg">
            At Blue Waves Hotel, we combine premium comfort, elegant spaces,
            and exceptional service to create a stay that feels both relaxing
            and unforgettable.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.id}
                className="group rounded-3xl border border-[#26567E]/15 bg-white/75 p-8 shadow-[0_8px_30px_rgba(38,86,126,0.12)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-[#26567E]/35 hover:bg-white dark:border-white/15 dark:bg-white/5 dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)] dark:hover:border-white/30 dark:hover:bg-white/10"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#26567E]/15 bg-[#2f6fb3]/10 text-[#b9873e] shadow-inner transition-all duration-300 group-hover:scale-110 dark:border-white/15 dark:bg-white/10 dark:text-[#e6c386]">
                  <Icon size={28} />
                </div>

                <h3 className="mt-6 text-xl font-semibold text-[#16283c] dark:text-white">
                  {feature.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-[#3c5068] dark:text-white/65 md:text-base">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
