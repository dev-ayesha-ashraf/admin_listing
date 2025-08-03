import React, { useState, ChangeEvent, FormEvent } from "react";
import useCrud from "../../lib/hooks/useCrud";
import { commonStyles } from "../../lib/styles/common";
import { optimizeImage } from '../../lib/utils/imageOptimizer';
import { uploadImage } from '../../lib/utils/imageUpload';
import { Seller } from "../../types/models";

interface UploadProgress {
  total: number;
  completed: number;
  currentFile?: string;
}

const SellerManager: React.FC = () => {
  const [name, setName] = useState("");
  const [image, setImage] = useState<string | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({ total: 0, completed: 0 });
  const [newSeller, setNewSeller] = useState({
    name: "",
    email: "",
    phone: "",
    image: "",
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [editingSeller, setEditingSeller] = useState<Seller | null>(null);

  const {
    items: sellers,
    isLoading,
    error,
    createItem,
    updateItem,
    deleteItem,
    isCreating
  } = useCrud<Seller>('sellers');

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);
        setUploadProgress({ total: 1, completed: 0, currentFile: file.name });

        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setImagePreview(result);
        };
        reader.readAsDataURL(file);

        const optimizedBlob = await optimizeImage(file, {
          maxWidth: 800,
          maxHeight: 800,
          quality: 0.8,
          format: 'jpeg'
        });

        const imageUrl = await uploadImage(optimizedBlob, {
          folderName: 'sellers'
        });

        setUploadProgress(prev => ({ ...prev, completed: 1 }));
        setImage(imageUrl);
        setNewSeller(prev => ({ ...prev, image: imageUrl }));
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image.');
        setImagePreview("");
        setImage(undefined);
        setNewSeller(prev => ({ ...prev, image: "" }));
      } finally {
        setIsUploading(false);
        setUploadProgress({ total: 0, completed: 0 });
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Seller name is required");
      return;
    }

    const sellerData: Partial<Seller> = {
      name: name.trim(),
      email: newSeller.email,
      phone: newSeller.phone,
      image: image || "",
    };

    try {
      await createItem(sellerData);
      setName("");
      setImage(undefined);
      setNewSeller({ name: "", email: "", phone: "", image: "" });
      setImagePreview("");
    } catch (error) {
      console.error('Error saving seller:', error);
      alert('Failed to save seller.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewSeller(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async () => {
    if (!editingSeller?.id) {
      console.error("Cannot update seller: ID is missing.");
      return;
    }

    const updatedSeller: Partial<Seller> = {
      name: editingSeller.name,
      email: editingSeller.email,
      phone: editingSeller.phone,
      image: editingSeller.image,
    };

    try {
      await updateItem({ id: editingSeller.id, data: updatedSeller });
      setEditingSeller(null);
    } catch (err) {
      console.error("Update error", err);
      alert("Failed to update seller.");
    }
  };

  if (isLoading) return <div className="text-center text-gray-600">Loading sellers...</div>;
  if (error) return <div className="text-center text-red-600">Failed to load sellers.</div>;

  return (
    <div className={commonStyles.container}>
      <h1 className={commonStyles.heading.h1}>Sellers</h1>

      {/* Create Seller Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className={commonStyles.input}
            disabled={isCreating}
          />
          <input
            type="email"
            name="email"
            value={newSeller.email}
            onChange={handleInputChange}
            placeholder="Email"
            className={commonStyles.input}
            disabled={isCreating}
          />
          <input
            type="tel"
            name="phone"
            value={newSeller.phone}
            onChange={handleInputChange}
            placeholder="Phone"
            className={commonStyles.input}
            disabled={isCreating}
          />
        </div>

        <button
          type="submit"
          disabled={isCreating}
          className={`w-full flex justify-center items-center gap-2 py-2 px-4 rounded text-white transition duration-200 ${
            isCreating
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
          }`}
        >
          {isCreating ? (
            <>
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
              Saving...
            </>
          ) : (
            "Add Seller"
          )}
        </button>
      </form>

      {/* Seller Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sellers?.map(seller => (
          <div key={seller.id} className="bg-white p-4 rounded-lg shadow space-y-3">
            {seller.image && (
              <img
                src={seller.image}
                alt={seller.name}
                className="w-full h-40 object-cover rounded"
              />
            )}
            <h3 className="text-lg font-semibold">{seller.name}</h3>
            <p className="text-sm text-gray-600">📧 {seller.email}</p>
            <p className="text-sm text-gray-600">📞 {seller.phone}</p>
            <div className="flex gap-2 mt-2">
              <button
                className={commonStyles.button.secondary}
                onClick={() => setEditingSeller(seller)}
              >
                Edit
              </button>
              <button
                className={commonStyles.button.danger}
                onClick={() => {
                  if (window.confirm("Are you sure?")) deleteItem(seller.id);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingSeller && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4 shadow-lg">
            <h2 className="text-xl font-bold mb-4">Edit Seller</h2>
            <input
              value={editingSeller.name}
              onChange={(e) => setEditingSeller({ ...editingSeller, name: e.target.value })}
              className={commonStyles.input}
              placeholder="Name"
            />
            <input
              value={editingSeller.email}
              onChange={(e) => setEditingSeller({ ...editingSeller, email: e.target.value })}
              className={commonStyles.input}
              placeholder="Email"
            />
            <input
              value={editingSeller.phone}
              onChange={(e) => setEditingSeller({ ...editingSeller, phone: e.target.value })}
              className={commonStyles.input}
              placeholder="Phone"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setEditingSeller(null)}
                className={commonStyles.button.secondary}
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                className={commonStyles.button.primary}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerManager;
