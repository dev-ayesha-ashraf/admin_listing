import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaBars, FaTimes, FaPlus, FaList, FaUsers, FaTags, FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface SidebarProps {
    isCollapsed: boolean;
    onCollapseToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onCollapseToggle }) => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const toggleSidebar = () => setIsOpen((open) => !open);

    const menuItems = [
        { path: "/", label: "Listings", icon: <FaList className="w-5 h-5" /> },
        { path: "/create", label: "Create Listing", icon: <FaPlus className="w-5 h-5" /> },
        { path: "/categories", label: "Categories", icon: <FaTags className="w-5 h-5" /> },
        { path: "/sellers", label: "Sellers", icon: <FaUsers className="w-5 h-5" /> },
    ];

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
                                        onClick={() => {
                                            setIsOpen(false);
                                            navigate(item.path);
                                        }}
                                        className={`flex items-center w-full text-left space-x-3 p-3 rounded-lg transition-colors ${location.pathname === item.path ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
                                            }`}
                                        title={isCollapsed ? item.label : ""}
                                    >
                                        {item.icon}
                                        {!isCollapsed && <span>{item.label}</span>}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
