import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Layout from "./Components/Layout/Layout";
import ProtectedRoute from "./RoutesFront/ProtectedRoute";
import AdminRoute from "./RoutesFront/AdminRoute";

import ReviewRating from "./Pages/ReviewRating";
import ContactHelp from "./Pages/ContactHelp";
import About from "./Pages/About";
import AdminSettings from "./Pages/adminSettings";
import HotelListingPage from "./Pages/HotelListingPage";
import FavoritesPage from "./Pages/FavoritesPage";
import { FavoritesProvider } from "./Context/FavoritesContext";
import { AuthProvider } from "./Context/AuthContext";
import { OffersProvider } from "./Context/OffersContext";
import HotelManagement from "./Pages/HotelManagement";
import AddBranch from "./Pages/AddBranch";
import EditBranch from "./Pages/EditBranch";
import BranchDetails from "./Pages/BranchDetails";
import UserBranchDetails from "./Pages/UserBranchDetails";
import Profile from "./Pages/profile";
import UserManagement from "./Pages/UserManagement";
import RoomBooking from "./Pages/BookingCheckOut";
import AdminRoomManagement from "./Pages/AdminRoomManagement";
import OffersPage from "./Pages/OffersPage";
import AdminOffersPage from "./Pages/AdminOffersPage";
import AdminBookingManagement from "./Pages/AdminBookingManagement";
import Payment from "./Pages/Payment";
import AdminDashboard from "./Pages/AdminDashBoard";
import HotelDetails from "./Pages/HotelDetails";
import HomePage from "./Pages/HomePage";
import RegisterPage from "./Pages/RegisterPage";
import LoginPage from "./Pages/LoginPage";
import { UserProvider } from "./Context/UserContext";
import ChatBotWidget from "./Components/ChatBotWidget";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <FavoritesProvider>
          <OffersProvider>
            <BrowserRouter>
              <ScrollToTop />
              <ChatBotWidget />
              <Routes>
              {/* Public */}
              <Route path="/" element={<HomePage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/hotels" element={<HotelListingPage />} />
              <Route path="/hotelDetails" element={<HotelDetails />} />
              <Route path="/branches/:slug" element={<UserBranchDetails />} />
              <Route
                path="/hotelDetails/booking"
                element={
                  <ProtectedRoute blockAdmin>
                    <RoomBooking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/booking"
                element={
                  <ProtectedRoute blockAdmin>
                    <RoomBooking />
                  </ProtectedRoute>
                }
              />
              <Route path="/offers" element={<OffersPage />} />
              <Route
                path="/payment"
                element={
                  <ProtectedRoute blockAdmin>
                    <Payment />
                  </ProtectedRoute>
                }
              />

              {/* User protected */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Admin protected */}
              <Route
                path="/admin/dashboard"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/bookings"
                element={
                  <AdminRoute>
                    <AdminBookingManagement />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/rooms"
                element={
                  <AdminRoute>
                    <AdminRoomManagement />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/usermanagement"
                element={
                  <AdminRoute>
                    <UserManagement />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/hotels"
                element={
                  <AdminRoute>
                    <HotelManagement />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/hotels/add"
                element={
                  <AdminRoute>
                    <AddBranch />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/hotels/:id"
                element={
                  <AdminRoute>
                    <BranchDetails />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/hotels/edit/:id"
                element={
                  <AdminRoute>
                    <EditBranch />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/offers"
                element={
                  <AdminRoute>
                    <AdminOffersPage />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/settings"
                element={
                  <AdminRoute>
                    <AdminSettings />
                  </AdminRoute>
                }
              />

              {/* Layout routes */}
              <Route element={<Layout />}>
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/reviews" element={<ReviewRating />} />
                <Route path="/help" element={<ContactHelp />} />
                <Route path="/about" element={<About />} />
              </Route>
              </Routes>
            </BrowserRouter>
          </OffersProvider>
        </FavoritesProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;
