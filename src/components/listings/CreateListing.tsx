import React, { useEffect, useState } from "react";
import axios from "axios";

type CreateListingProps = {
  onSuccess: () => Promise<void>;
  categorySlug?: string;
  categoryId?: string;
};


const CreateListing: React.FC<CreateListingProps> = ({
  onSuccess,
  categorySlug,
  categoryId: categoryIdProp,
}) => {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string>(categoryIdProp || "");
  const [listingType, setListingType] = useState("");
  const [sellerId, setSellerId] = useState("");
  const [images, setImages] = useState<FileList | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);

  const [categories, setCategories] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL;
  useEffect(() => {
    if (categoryIdProp) {
      setCategoryId(categoryIdProp);
    }
  }, [categoryIdProp]);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/categories`)
      .then((res) => {
        setCategories(res.data);

        let matchedCategory = null;

        if (categoryIdProp) {
          matchedCategory = res.data.find((cat: any) => cat._id === categoryIdProp);
          setCategoryId(categoryIdProp);
        } else if (categorySlug) {
          matchedCategory = res.data.find((cat: any) => cat.slug === categorySlug);
          if (matchedCategory) setCategoryId(matchedCategory._id);
        }

        setSelectedCategory(matchedCategory || null);
      })
      .catch((err) => console.error("Failed to fetch categories:", err));

    axios
      .get(`${API_BASE_URL}/sellers`)
      .then((res) => setSellers(res.data))
      .catch((err) => console.error("Failed to fetch sellers:", err));
  }, [API_BASE_URL, categorySlug, categoryIdProp]);


  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("price", price);
    formData.append("description", description);
    formData.append("categoryId", categoryId);
    formData.append("listingType", listingType);
    formData.append("sellerId", sellerId);

    if (images) {
      Array.from(images).forEach((image) => formData.append("images", image));
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/listings`, formData);
      console.log("Listing created successfully:", res.data);
      setSuccessMessage("Listing added successfully ✅");
      await onSuccess();

      // Reset form
      setTitle("");
      setPrice("");
      setDescription("");
      setCategoryId("");
      setListingType("");
      setSellerId("");
      setImages(null);
    } catch (err) {
      console.error("Error creating listing:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white shadow rounded mb-10">
      <h1 className="text-2xl font-bold mb-4">Create New Listing</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium">Category</label>
          <select
            value={categoryId}
            onChange={(e) => {
              const selectedId = e.target.value;
              setCategoryId(selectedId);
              const matched = categories.find((cat) => cat._id === selectedId);
              setSelectedCategory(matched || null);
            }}
            disabled={!!categoryIdProp}
            required
            className="w-full px-4 py-2 border rounded-lg bg-gray-100"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>



        </div>

        {selectedCategory?.name?.toLowerCase() !== "nails" && (
          <div>
            <label className="block text-sm font-medium">Listing Type</label>
            <select
              value={listingType}
              onChange={(e) => setListingType(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">Select Listing Type</option>
              <option value="rent">Rent</option>
              <option value="sale">Sale</option>
              <option value="lease">Lease</option>
              <option value="auction">Auction</option>
            </select>
          </div>
        )}


        <div>
          <label className="block text-sm font-medium">Seller</label>
          <select
            value={sellerId}
            onChange={(e) => setSellerId(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="">Select Seller</option>
            {sellers.map((seller) => (
              <option key={seller._id} value={seller._id}>
                {seller.name} ({seller.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Upload Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setImages(e.target.files)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 rounded-lg text-white transition duration-200 ${isSubmitting
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
            }`}
        >
          {isSubmitting ? (
            <span className="flex justify-center items-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                ></path>
              </svg>
              Submitting...
            </span>
          ) : (
            "Submit Listing"
          )}
        </button>

        {successMessage && (
          <div className="mt-4 p-3 rounded bg-green-100 text-green-800 border border-green-300 text-center">
            {successMessage}
          </div>
        )}
      </form>
    </div>
  );
};

export default CreateListing;
