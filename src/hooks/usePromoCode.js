import { useState } from "react";
import { validPromoCodes } from "../data/offersData";

const usePromoCode = () => {
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");

  const applyPromoCode = (code) => {
    const upperCode = code.trim().toUpperCase();
    setPromoError("");
    setPromoSuccess("");

    if (validPromoCodes[upperCode]) {
      setAppliedPromo({ code: upperCode, ...validPromoCodes[upperCode] });
      setPromoSuccess(`🎉 Promo code applied! ${validPromoCodes[upperCode].label}`);
    } else {
      setAppliedPromo(null);
      setPromoError("Invalid promo code. Please try again.");
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoSuccess("");
    setPromoError("");
  };

  return { appliedPromo, promoError, promoSuccess, applyPromoCode, removePromo };
};

export default usePromoCode;