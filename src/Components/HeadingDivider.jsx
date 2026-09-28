// Decorative ornament shown beneath a section heading:
// fading lines meeting a layered, glowing diamond at the center.
export default function HeadingDivider({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`mt-5 flex items-center justify-center ${className}`}
    >
      <span className="h-px w-24 bg-gradient-to-r from-transparent to-[#2f6fb3]/60 dark:to-[#9fc0ec]/70 md:w-36" />

      <span className="relative mx-3 flex h-4 w-4 items-center justify-center">
        {/* Outlined diamond */}
        <span className="absolute h-3.5 w-3.5 rotate-45 border border-[#2f6fb3]/60 shadow-[0_0_14px_3px_rgba(47,111,179,0.35)] dark:border-[#9fc0ec]/70 dark:shadow-[0_0_14px_3px_rgba(159,192,236,0.5)]" />
        {/* Glowing core diamond */}
        <span className="h-1.5 w-1.5 rotate-45 bg-[#2f6fb3] shadow-[0_0_10px_2px_rgba(47,111,179,0.7)] dark:bg-[#9fc0ec] dark:shadow-[0_0_10px_2px_rgba(159,192,236,0.9)]" />
      </span>

      <span className="h-px w-24 bg-gradient-to-l from-transparent to-[#2f6fb3]/60 dark:to-[#9fc0ec]/70 md:w-36" />
    </div>
  );
}
