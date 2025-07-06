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

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});

const App = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen flex bg-gray-50">
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onCollapseToggle={() => setIsSidebarCollapsed((prev) => !prev)}
          />
          <main
            className={`flex-1 transition-all duration-300 ease-in-out ${
              isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
            }`}
          >
            <div className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<ListingsPage />} />
                <Route path="/listings" element={<ListingsPage />} />
                <Route path="/create" element={<CreateListing />} />
                <Route path="/categories" element={<CategoryManager />} />
                <Route path="/sellers" element={<SellerManager />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
