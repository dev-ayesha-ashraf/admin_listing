import React, { useState, useEffect } from "react";
import axios from "axios";

interface FooterFormProps {
  categorySlug: string;
  initialData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const FooterForm: React.FC<FooterFormProps> = ({
  categorySlug,
  initialData,
  onSuccess,
  onCancel,
}) => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    address: "",
    about: "",
    categoryId: "",
  });

  // Set initial form values when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        email: initialData.email || "",
        phone: initialData.phone || "",
        address: initialData.address || "",
        about: initialData.about || "",
        categoryId: initialData.categoryId || "",
      });
    }
  }, [initialData]);

  // Fetch categories and set categoryId if not editing
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_URL}/categories`);
        setCategories(res.data);

        if (!initialData) {
          const matched = res.data.find((cat: any) => cat.slug === categorySlug);
          console.log("Category matched from slug:", matched);

          if (matched) {
            setFormData((prev) => ({
              ...prev,
              categoryId: matched._id, 
            }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };

    fetchCategories();
  }, [API_URL, categorySlug, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (initialData) {
        await axios.put(`${API_URL}/footer/${initialData._id}`, formData);
      } else {
        await axios.post(`${API_URL}/footer`, formData);
      }

      onSuccess?.();
    } catch (err) {
      console.error("Failed to submit footer data", err);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">
        {initialData ? "Edit Footer Info" : "Add Footer Info"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">About</label>
          <textarea
            name="about"
            value={formData.about}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows={4}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            name="categoryId"
            value={formData.categoryId}
            disabled
            className="w-full p-2 border rounded bg-gray-100 text-gray-600 cursor-not-allowed"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 mt-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Saving..." : initialData ? "Update Footer" : "Create Footer"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default FooterForm;