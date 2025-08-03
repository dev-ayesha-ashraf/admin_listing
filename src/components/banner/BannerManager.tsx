

import React, { useEffect, useState } from "react";
import axios from "axios";
import BannerForm from "../common/BannerForm";
import ConfirmationModal from "../common/ConfirmationModal";
import { getImageUrl } from "../../utils/getImage";

interface Banner {
  _id: string;
  name: string;
  image: string;
}

const BannerManager = ({ categoryId }: { categoryId: string }) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    bannerId: null as string | null,
  });

  const API_URL = import.meta.env.VITE_API_URL;


  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/banners?category=${categoryId}`);
      setBanners(res.data);
    } catch (err) {
      console.error("Failed to fetch banners", err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBanner = async () => {
    if (!deleteModal.bannerId) return;
    try {
      await axios.delete(`${API_URL}/banners/${deleteModal.bannerId}`);
      fetchBanners();
    } catch {
      alert("Failed to delete banner");
    } finally {
      setDeleteModal({ isOpen: false, bannerId: null });
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [categoryId]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Banners</h2>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => {
            setEditingBanner(null);
            setShowForm(true);
          }}
        >
          Add Banner
        </button>
      </div>

      {isLoading ? (
        <p>Loading banners...</p>
      ) : banners.length === 0 ? (
        <p>No banners found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {banners.map((banner) => (
            <div key={banner._id} className="bg-white p-4 rounded shadow relative">
              <img
                src={getImageUrl(banner.image)}
                alt={banner.name}
                className="w-full h-32 object-cover mb-2 rounded"
              />
              <h3 className="font-semibold">{banner.name}</h3>
              <div className="flex gap-2 mt-2">
                <button
                  className="bg-yellow-500 text-white px-2 py-1 rounded"
                  onClick={() => {
                    setEditingBanner(banner);
                    setShowForm(true);
                  }}
                >
                  Edit
                </button>
                <button
                  className="bg-red-600 text-white px-2 py-1 rounded"
                  onClick={() =>
                    setDeleteModal({ isOpen: true, bannerId: banner._id })
                  }
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <BannerForm
          categoryId={categoryId}
          initialData={editingBanner}
          onCancel={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            fetchBanners();
          }}
        />
      )}

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, bannerId: null })}
        onConfirm={deleteBanner}
        title="Delete Banner"
        message="Are you sure you want to delete this banner?"
        confirmText="Delete"
      />
    </div>
  );
};

export default BannerManager;
