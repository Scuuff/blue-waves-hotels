import { useState, useEffect } from "react";

const useCountdown = (targetDate) => {
  const calculateTimeLeft = () => {
    const difference = new Date(targetDate) - new Date();
    // Number.isNaN guards a missing/unparseable date — without it the NaN
    // falls through and the timer renders NaN:NaN instead of Expired.
    if (Number.isNaN(difference) || difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      expired: false,
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
};

export default useCountdown;