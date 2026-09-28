import { motion } from "framer-motion";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

const selectShell =
  "w-full appearance-none rounded-2xl border border-[#dfe8f2] bg-white/80 px-4 py-3.5 pr-11 text-[15px] text-[#1d3252] outline-none transition-colors duration-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/30 dark:border-white/10 dark:bg-white/[0.04] dark:text-white";

function FilterField({ label, value, onChange, children }) {
  return (
    <div>
      <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-[#6a83a6] dark:text-gold-300/80">
        {label}
      </label>
      <div className="relative">
        <select value={value} onChange={onChange} className={selectShell}>
          {children}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gold-500"
        />
      </div>
    </div>
  );
}

export default function FilterSidebar({
  filters,
  setFilters,
  resetFilters,
  branchOptions = [],
  typeOptions = [],
}) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="h-fit rounded-[28px] border border-[#e9eff6] bg-white/90 p-6 shadow-[0_16px_40px_rgba(20,40,70,0.08)] backdrop-blur-sm lg:sticky lg:top-28 dark:border-white/10 dark:bg-[#0f1f33]/90"
    >
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1d3252] text-gold-300 dark:bg-gold-400/15">
          <SlidersHorizontal size={17} />
        </span>
        <div>
          <h3 className="font-serif text-2xl font-semibold text-[#1d3252] dark:text-white">
            Refine
          </h3>
          <p className="text-xs uppercase tracking-[0.2em] text-[#8fa3bd] dark:text-white/40">
            Your stay
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <FilterField
          label="Room Type"
          value={filters.type || ""}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="">All Types</option>
          {typeOptions.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </FilterField>

        <FilterField
          label="Branch"
          value={filters.branch || ""}
          onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
        >
          <option value="">All Branches</option>
          {branchOptions.map((branch) => (
            <option key={branch} value={branch}>
              {branch}
            </option>
          ))}
        </FilterField>

        <FilterField
          label="Minimum Rating"
          value={filters.rating || ""}
          onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
        >
          <option value="">All Ratings</option>
          <option value="4">4.0+</option>
          <option value="4.5">4.5+</option>
          <option value="4.8">4.8+</option>
        </FilterField>

        <FilterField
          label="Guests"
          value={filters.guests || ""}
          onChange={(e) => setFilters({ ...filters, guests: e.target.value })}
        >
          <option value="">Any</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
          <option value="5">5+</option>
        </FilterField>

        <FilterField
          label="Sort By"
          value={filters.sortBy || ""}
          onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
        >
          <option value="">Default</option>
          <option value="low-high">Price Low to High</option>
          <option value="high-low">Price High to Low</option>
          <option value="rating">Top Rated</option>
        </FilterField>

        <motion.button
          onClick={resetFilters}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 420, damping: 22 }}
          className="mt-2 w-full rounded-2xl border border-gold-400/40 bg-gold-400/10 py-3.5 font-semibold text-gold-600 transition-colors hover:bg-gold-400/20 dark:text-gold-300"
        >
          Reset Filters
        </motion.button>
      </div>
    </motion.aside>
  );
}
