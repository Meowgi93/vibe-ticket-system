import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import HomePage from "./pages/HomePage";
import ConcertsPage from "./pages/ConcertsPage";
import ConcertDetailPage from "./pages/ConcertDetailPage";
import SignInPage from "./pages/SignInPage";
import MyTicketsPage from "./pages/MyTicketsPage";
import AboutPage from "./pages/AboutPage";
import ProfilePage from "./pages/ProfilePage";
import StaticPage from "./pages/StaticPage";
import PrintTicketPage from "./pages/PrintTicketPage";
import ChallengePage from "./pages/ChallengePage";

/* ── Admin ── */
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminConcerts from "./admin/pages/AdminConcerts";
import AdminTickets from "./admin/pages/AdminTickets";
import AdminUsers from "./admin/pages/AdminUsers";
import AdminBanners from "./admin/pages/AdminBanners";
import AdminSecurity from "./admin/pages/AdminSecurity";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* ── Print Route (No Layout) ── */}
          <Route path="/tickets/:id/print" element={<PrintTicketPage />} />

          {/* ── Public Routes (with Navbar + Footer) ── */}
          <Route
            path="/*"
            element={
              <div className="min-h-screen bg-surface-950 text-gray-200">
                <Navbar />
                <main>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/concerts" element={<ConcertsPage />} />
                    <Route path="/concerts/:id" element={<ConcertDetailPage />} />
                    <Route path="/signin" element={<SignInPage />} />
                    <Route path="/challenge" element={<ChallengePage />} />
                    <Route path="/my-tickets" element={<MyTicketsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/support/help" element={<StaticPage title="Help Center" />} />
                    <Route path="/support/contact" element={<StaticPage title="Contact Us" />} />
                    <Route path="/support/faq" element={<StaticPage title="FAQs" />} />
                    <Route path="/legal/privacy" element={<StaticPage title="Privacy Policy" />} />
                    <Route path="/legal/terms" element={<StaticPage title="Terms of Service" />} />
                    <Route path="/legal/refund" element={<StaticPage title="Refund Policy" />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            }
          />

          {/* ── Admin Routes (with AdminLayout, NO Navbar/Footer) ── */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="concerts" element={<AdminConcerts />} />
            <Route path="tickets" element={<AdminTickets />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="security" element={<AdminSecurity />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
