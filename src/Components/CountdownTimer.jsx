import useCountdown from "../hooks/useCountdown";

const CountdownTimer = ({ expiresAt }) => {
  const { days, hours, minutes, seconds, expired } = useCountdown(expiresAt);

  if (expired) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#e57373]">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#e57373]" />
        Offer Expired
      </div>
    );
  }

  const digit = "text-sm font-black text-[#1a1a2e] dark:text-[#cfe0f5]";
  const colon = "font-black text-[#1a1a2e] dark:text-[#cfe0f5]";

  return (
    <div className="flex items-center gap-2 rounded-xl bg-[#b6dbf0] px-3 py-2 dark:bg-[#9fc0ec]/15">
      <span className="mr-1 text-[9px] font-bold uppercase tracking-widest text-[#1a1a2e] dark:text-[#9fc0ec]">
        Ends in
      </span>
      <span className={digit}>{String(days).padStart(2, "0")}</span>
      <span className={colon}>:</span>
      <span className={digit}>{String(hours).padStart(2, "0")}</span>
      <span className={colon}>:</span>
      <span className={digit}>{String(minutes).padStart(2, "0")}</span>
      <span className={colon}>:</span>
      <span className={digit}>{String(seconds).padStart(2, "0")}</span>
    </div>
  );
};

export default CountdownTimer;
