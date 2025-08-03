// components/banners/BannerForm.tsx

import React, { useState } from "react";
import axios from "axios";

interface Props {
  categoryId: string;
  initialData?: any;
  onCancel: () => void;
  onSuccess: () => void;
}

const BannerForm: React.FC<Props> = ({ categoryId, initialData, onCancel, onSuccess }) => {
  const [name, setName] = useState(initialData?.name || "");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("categoryId", categoryId);
    if (image) formData.append("image", image);

    try {
      if (initialData) {
        await axios.put(`${API_URL}/banners/${initialData._id}`, formData);
      } else {
        await axios.post(`${API_URL}/banners`, formData);
      }
      onSuccess();
    } catch (err) {
      console.error("Banner save failed", err);
      alert("Banner save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4 mt-4">
      <div>
        <label className="block mb-1 font-medium">Banner Name</label>
        <input
          type="text"
          value={name}
          required
          onChange={(e) => setName(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
          className="w-full"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {initialData ? "Update" : "Create"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default BannerForm;
