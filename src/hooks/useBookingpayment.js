export const calculateNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;

  const start = new Date(checkIn + "T00:00:00");
  const end = new Date(checkOut + "T00:00:00");

  const diffTime = end.getTime() - start.getTime();
  const days = diffTime / (1000 * 60 * 60 * 24);

  return Math.max(0, Math.ceil(days));
};

export const calculateTotal = (nights, price) => {
  return nights * price;
};