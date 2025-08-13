import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaPlus,
  FaList,
  FaUsers,
  FaTags,
  FaChevronLeft,
  FaChevronRight,
  FaSignOutAlt,
  FaSignInAlt,
  FaHome,
  FaGlobe,
  FaChevronDown,
  FaChevronUp,
  FaImage,
  FaAlignJustify,
  FaBox,
  FaListUl
} from "react-icons/fa";
import { isLoggedIn, logout } from "../../lib/utils/auth";

interface SidebarProps {
  isCollapsed: boolean;
  onCollapseToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onCollapseToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isLandingPageOpen, setIsLandingPageOpen] = useState(false);

  const toggleSidebar = () => setIsOpen((open) => !open);
  const toggleLandingPage = () => setIsLandingPageOpen((open) => !open);

  const menuItems = [
    { path: "/", label: "Home", icon: <FaHome className="w-5 h-5" /> },
    { path: "/listings", label: "Listings", icon: <FaList className="w-5 h-5" /> },
    { path: "/categories", label: "Categories", icon: <FaTags className="w-5 h-5" /> },
    { path: "/pixels", label: "Pixel ID", icon: <FaPlus className="w-5 h-5" /> },
    { path: "/sellers", label: "Sellers", icon: <FaUsers className="w-5 h-5" /> },
  ];

  const landingPageItems = [
    { path: "/landing/banners", label: "Banners", icon: <FaImage className="w-4 h-4" /> },
    { path: "/landing/featured-products", label: "Featured Products", icon: <FaBox className="w-4 h-4" /> },
    { path: "/landing/footers", label: "Footers", icon: <FaAlignJustify className="w-4 h-4" /> },
    { path: "/landing/listingsSection", label: "Listings Sections", icon: <FaListUl className="w-4 h-4" /> },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleNavigation = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  // Check if current path is in landing page section
  const isLandingPageActive = location.pathname.startsWith('/landing') || location.pathname.startsWith('/main');

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-blue-600 text-white lg:hidden"
        aria-label="Toggle menu"
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={toggleSidebar} />}

      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-lg transform transition-all duration-300 ease-in-out z-40
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          ${isCollapsed ? "w-20" : "w-64"}
          lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b flex items-center justify-between">
            {!isCollapsed && <h1 className="text-2xl font-bold text-blue-600">Listing Industries</h1>}
            <button
              onClick={onCollapseToggle}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`flex items-center w-full text-left space-x-3 p-3 rounded-lg transition-colors ${
                      location.pathname === item.path
                        ? "bg-blue-100 text-blue-600"
                        : "hover:bg-gray-100"
                    }`}
                    title={isCollapsed ? item.label : ""}
                  >
                    {item.icon}
                    {!isCollapsed && <span>{item.label}</span>}
                  </button>
                </li>
              ))}

              {/* Landing Page with Dropdown */}
              <li>
                <button
                  onClick={isCollapsed ? () => handleNavigation("/landing") : toggleLandingPage}
                  className={`flex items-center w-full text-left space-x-3 p-3 rounded-lg transition-colors ${
                    isLandingPageActive
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-gray-100"
                  }`}
                  title={isCollapsed ? "Landing Page" : ""}
                >
                  <FaGlobe className="w-5 h-5" />
                  {!isCollapsed && (
                    <>
                      <span>Landing Page</span>
                      <div className="ml-auto">
                        {isLandingPageOpen ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
                      </div>
                    </>
                  )}
                </button>

                {/* Dropdown Items */}
                {!isCollapsed && isLandingPageOpen && (
                  <ul className="ml-6 mt-2 space-y-1">
                    {landingPageItems.map((item) => (
                      <li key={item.path}>
                        <button
                          onClick={() => handleNavigation(item.path)}
                          className={`flex items-center w-full text-left space-x-3 p-2 rounded-lg transition-colors ${
                            location.pathname === item.path
                              ? "bg-blue-50 text-blue-600 border-l-2 border-blue-600"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          {item.icon}
                          <span className="text-sm">{item.label}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>

              <li>
                {isLoggedIn() ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left space-x-3 p-3 rounded-lg text-red-600 hover:bg-red-100"
                    title={isCollapsed ? "Logout" : ""}
                  >
                    <FaSignOutAlt className="w-5 h-5" />
                    {!isCollapsed && <span>Logout</span>}
                  </button>
                ) : (
                  <button
                    onClick={handleLogin}
                    className="flex items-center w-full text-left space-x-3 p-3 rounded-lg text-green-600 hover:bg-green-100"
                    title={isCollapsed ? "Login" : ""}
                  >
                    <FaSignInAlt className="w-5 h-5" />
                    {!isCollapsed && <span>Login</span>}
                  </button>
                )}
              </li>
            </ul>
          </nav>

          {/* Footer with version info when expanded */}
          {!isCollapsed && (
            <div className="p-4 border-t">
              <div className="text-xs text-gray-500 text-center">
                <div className="font-medium">Admin Panel</div>
                <div>v1.0.0</div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;