import { useOffers } from "../Context/OffersContext";

function useAdminOffers() {
  // Get everything from the shared context
  const { offers, addOffer, deleteOffer, toggleOffer } = useOffers();

  // Return the same interface as before — AdminOffersPage doesn't need to change
  return { offers, addOffer, deleteOffer, toggleOffer };
}

export default useAdminOffers;
