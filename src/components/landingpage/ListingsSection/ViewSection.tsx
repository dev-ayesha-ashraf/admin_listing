import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Listing as GlobalListing } from "../../../types/models";

const API_URL = import.meta.env.VITE_API_URL;
const IMAGE_API = import.meta.env.VITE_IMAGE_API;

const ViewSection = () => {
  const { categorySlug } = useParams();
  const [searchParams] = useSearchParams();
  const [listings, setListings] = useState<GlobalListing[]>([]);
  const [loading, setLoading] = useState(true);

  const limit = parseInt(searchParams.get("limit") || "3", 10);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await axios.get(`${API_URL}/listings?categorySlug=${categorySlug}`);

        const transformedListings: GlobalListing[] = res.data
          .slice(0, limit)
          .map((item: any) => ({
            id: item._id,
            title: item.title,
            description: item.description,
            price: item.price,
            images: item.images || [],
            location: item.location || "",
            categoryId: item.categoryId,
            subcategoryIds: item.subcategoryIds || [],
            sellerId: item.sellerId,
            attributes: item.attributes || {},
            properties: item.properties || {},
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          }));

        setListings(transformedListings);
      } catch (err) {
        console.error("Failed to fetch listings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [categorySlug, limit]);

  const getImageUrl = (imagePath?: string) =>
    imagePath?.startsWith("http")
      ? imagePath
      : imagePath
      ? `${IMAGE_API}/${imagePath}`
      : "https://via.placeholder.com/300x200?text=No+Image";

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/listings/${id}`);
      setListings((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Error deleting listing:", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-center text-gray-800 capitalize mb-10">
        {categorySlug} Listings
      </h1>

      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : listings.length > 0 ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="group bg-white rounded-2xl shadow-lg overflow-hidden relative hover:shadow-xl transition"
            >
              <div className="relative overflow-hidden">
                <img
                  src={getImageUrl(listing.images?.[0])}
                  alt={listing.title}
                  className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={() => handleDelete(listing.id)}
                  className="absolute top-3 right-3 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">
                  {listing.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-3 mb-2">
                  {listing.description}
                </p>
                <p className="text-green-600 font-bold">AWG {listing.price}</p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No listings found.</p>
      )}
    </div>
  );
};

export default ViewSection;
