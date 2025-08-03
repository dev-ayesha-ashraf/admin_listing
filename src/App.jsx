import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Sidebar from "./components/layout/Sidebar";
import ListingsPage from "./components/listings/ListingsPage";
import CreateListing from "./components/listings/CreateListing";
import CategoryManager from "./components/category/category";
import SellerManager from "./components/seller/seller";
import HomePage from "./components/common/Home";
import LoginPage from "./components/common/LoginPage";
// import PrivateRoute from "./components/auth/PrivateRoute"; // ← Commented out
import ListingsByCategory from "./components/listings/ListingByCategory";
import { AuthProvider } from "./context/AuthContext";
import { BannerManager } from "./components/landingpage/BannerManager";
import FeaturedProductManager from "./components/landingpage/FeaturedProduct/FeaturedProductManager";
import ListingSection from "./components/landingpage/ListingsSection/ListingsSection";
import ViewSection from "./components/landingpage/ListingsSection/ViewSection";
const queryClient = new QueryClient();

const App = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex bg-gray-50">
            <Sidebar
              isCollapsed={isSidebarCollapsed}
              onCollapseToggle={() => setIsSidebarCollapsed((prev) => !prev)}
            />
            <main
              className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
                }`}
            >
              <div className="container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />

                  {/* Auth disabled for these routes */}
                  <Route path="/listings" element={<ListingsPage />} />
                  <Route path="/create" element={<CreateListing />} />
                  <Route path="/categories" element={<CategoryManager />} />


                  <Route
                    path="/listings/category/:slug"
                    element={<ListingsByCategory />}
                  />
                  <Route path="/sellers" element={<SellerManager />} />
                  {/* Landing Page Management Routes */}
                  <Route path="/landing/banners" element={<BannerManager />} />
                  <Route
                    path="/landing/featured-products"
                    element={<FeaturedProductManager />}
                  />
                  <Route path="/landing/listingsSection" element={<ListingSection />} />
                  <Route path="/view-section/:categorySlug" element={<ViewSection />} />
                  <Route path="*" element={<Navigate to="/" replace />} />

                </Routes>
              </div>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
