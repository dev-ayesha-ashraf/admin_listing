import React from "react";
import useCrud from "../../lib/hooks/useCrud";
import { commonStyles } from "../../lib/styles/common";
import { Link } from "react-router-dom"; // or `next/link` if you're in Next.js

const HomePage: React.FC = () => {
  const {
    items: categories = [],
    isLoading: isLoadingCategories,
    error: errorCategories,
  } = useCrud<any>("categories");

  const {
    items: sellers = [],
    isLoading: isLoadingSellers,
    error: errorSellers,
  } = useCrud<any>("sellers");

  return (
    <div className={`${commonStyles.container} space-y-12 py-10`}>
      <h1 className={commonStyles.heading.h1}></h1>

      <section>
        <h2 className={commonStyles.heading.h2}>Categories</h2>

        {isLoadingCategories ? (
          <p className="text-gray-500">Loading categories...</p>
        ) : errorCategories ? (
          <p className="text-red-600">Failed to load categories.</p>
        ) : categories.length === 0 ? (
          <p className="text-gray-500">No categories found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
            {categories.map((category: any) => (
              <div
                key={category._id}
                className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 border border-gray-200 shadow-xl hover:shadow-2xl transition-transform hover:-translate-y-1"
              >
                <div className="absolute top-4 right-4 bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                  {category.slug}
                </div>

                <h3 className="text-2xl font-bold text-gray-800 mb-3">{category.name}</h3>

                <p className="text-gray-600 text-sm leading-relaxed mb-5 line-clamp-3">
                  {category.description || "No description available."}
                </p>

                <Link
                  to={`/listings/category/${category.slug}`}
                  className="inline-flex items-center justify-center w-full bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors duration-200"
                >
                  View Listings →
                </Link>

              </div>
            ))}
          </div>
        )}
      </section>



      {/* Sellers Table */}
      <section>
        <h2 className={commonStyles.heading.h2}>Sellers</h2>

        {isLoadingSellers ? (
          <p className="text-gray-500">Loading sellers...</p>
        ) : errorSellers ? (
          <p className="text-red-600">Failed to load sellers.</p>
        ) : sellers.length === 0 ? (
          <p className="text-gray-500">No sellers found.</p>
        ) : (
          <div className="overflow-x-auto bg-white shadow rounded-lg">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                </tr>
              </thead>
              <tbody>
                {sellers.map((seller: any, index: number) => (
                  <tr key={seller.id} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-4">{index + 1}</td>
                    <td className="py-3 px-4">{seller.name}</td>
                    <td className="py-3 px-4">{seller.email || "—"}</td>
                    <td className="py-3 px-4">{seller.phone || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
