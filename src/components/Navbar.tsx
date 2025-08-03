import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
    const location = useLocation();

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    return (
        <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="text-2xl font-bold text-blue-600">
                                LISTING App
                            </Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link
                                to="/"
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/')
                                    ? 'border-blue-500 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                            >
                                Listings
                            </Link>
                            <Link
                                to="/create"
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/create')
                                    ? 'border-blue-500 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                            >
                                Create Listing
                            </Link>
                            <Link
                                to="/categories"
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/categories')
                                    ? 'border-blue-500 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                            >
                                Categories
                            </Link>
                            <Link
                                to="/sellers"
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/sellers')
                                    ? 'border-blue-500 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                            >
                                Sellers
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div className="sm:hidden">
                <div className="pt-2 pb-3 space-y-1">
                    <Link
                        to="/"
                        className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive('/')
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                            }`}
                    >
                        Listings
                    </Link>
                    <Link
                        to="/create"
                        className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive('/create')
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                            }`}
                    >
                        Create Listing
                    </Link>
                    <Link
                        to="/categories"
                        className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive('/categories')
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                            }`}
                    >
                        Categories
                    </Link>
                    <Link
                        to="/sellers"
                        className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive('/sellers')
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                            }`}
                    >
                        Sellers
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 