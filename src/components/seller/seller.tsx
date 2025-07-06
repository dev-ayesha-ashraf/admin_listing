import React, { useState, ChangeEvent, FormEvent } from "react";
import useCrud from "../../lib/hooks/useCrud";
import { commonStyles } from "../../lib/styles/common";
import { s3Uploader } from "../../lib/utils/s3Upload";
import { optimizeImage } from '../../lib/utils/imageOptimizer';
import { Seller } from "../../types/models";
import { uploadImage } from '../../lib/utils/imageUpload';

interface Property {
    id: string;
    key: string;
    value: string;
}

interface UploadProgress {
    total: number;
    completed: number;
    currentFile?: string;
}

interface CreateSellerData {
    name: string;
    email: string;
    phone: string;
    properties: Property[];
    image: string;
}

const SellerManager: React.FC = () => {
    const [name, setName] = useState("");
    const [properties, setProperties] = useState<Property[]>([]);
    const [image, setImage] = useState<string | undefined>(undefined);
    const [editPropertyId, setEditPropertyId] = useState<string | null>(null);
    const [propertyKey, setPropertyKey] = useState("");
    const [propertyValue, setPropertyValue] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress>({ total: 0, completed: 0 });
    const [newSeller, setNewSeller] = useState<CreateSellerData>({
        name: "",
        email: "",
        phone: "",
        properties: [],
        image: "",
    });

    const [imagePreview, setImagePreview] = useState<string>("");

    const {
        items: sellers,
        isLoading,
        error,
        createItem,
        updateItem,
        deleteItem,
        isCreating,
        isUpdating,
        isDeleting
    } = useCrud<Seller>('sellers');
    console.log(sellers)
    console.log(error)
    const handleAddOrUpdateProperty = () => {
        if (!propertyKey.trim() || !propertyValue.trim()) {
            alert("Property key and value cannot be empty");
            return;
        }
        if (editPropertyId !== null) {
            setProperties((prev) =>
                prev.map((prop) =>
                    prop.id === editPropertyId
                        ? { ...prop, key: propertyKey.trim(), value: propertyValue.trim() }
                        : prop
                )
            );
            setEditPropertyId(null);
        } else {
            const newProp: Property = {
                id: Date.now().toString(),
                key: propertyKey.trim(),
                value: propertyValue.trim(),
            };
            setProperties((prev) => [...prev, newProp]);
        }
        setPropertyKey("");
        setPropertyValue("");
    };

    const handleEditProperty = (id: string) => {
        const prop = properties.find((p) => p.id === id);
        if (prop) {
            setPropertyKey(prop.key);
            setPropertyValue(prop.value);
            setEditPropertyId(id);
        }
    };

    const handleDeleteProperty = (id: string) => {
        setProperties((prev) => prev.filter((p) => p.id !== id));
        if (editPropertyId === id) {
            setEditPropertyId(null);
            setPropertyKey("");
            setPropertyValue("");
        }
    };

    const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                setIsUploading(true);
                setUploadProgress({ total: 1, completed: 0, currentFile: file.name });

                // Create a preview
                const reader = new FileReader();
                reader.onloadend = () => {
                    const result = reader.result as string;
                    setImagePreview(result);
                };
                reader.readAsDataURL(file);

                // Optimize the image
                const optimizedBlob = await optimizeImage(file, {
                    maxWidth: 800,
                    maxHeight: 800,
                    quality: 0.8,
                    format: 'jpeg'
                });

                // Upload to server
                const imageUrl = await uploadImage(optimizedBlob, {
                    folderName: 'sellers'
                });

                setUploadProgress(prev => ({ ...prev, completed: 1 }));
                setImage(imageUrl);
                setNewSeller(prev => ({ ...prev, image: imageUrl }));
            } catch (error) {
                console.error('Error uploading image:', error);
                alert('Failed to upload image. Please try again.');
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
            properties: {
                ...properties.reduce((acc, prop) => ({
                    ...acc,
                    [prop.key]: prop.value
                }), {}),
                image: image || ""
            },
            email: newSeller.email,
            phone: newSeller.phone,
        };

        try {
            await createItem(sellerData);
            // Reset form
            setName("");
            setProperties([]);
            setImage(undefined);
            setPropertyKey("");
            setPropertyValue("");
            setEditPropertyId(null);
            setNewSeller({ name: "", email: "", phone: "", properties: [], image: "" });
            setImagePreview("");
        } catch (error) {
            console.error('Error saving seller:', error);
            alert('Failed to save seller. Please try again.');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewSeller(prev => ({ ...prev, [name]: value }));
    };

    if (isLoading) return (
        <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-gray-600 text-lg">Loading sellers...</div>
        </div>
    );

    if (error) return (
        <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-red-600 text-lg">Error loading sellers</div>
        </div>
    );

    return (
        <div className={commonStyles.container}>
            <h1 className={commonStyles.heading.h1}>Sellers</h1>

            <form onSubmit={handleSubmit} className="mb-8 animate-fadeIn bg-white rounded-lg shadow-lg p-6">
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                            type="text"
                            name="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Seller Name"
                            className={commonStyles.input}
                            disabled={isCreating || isUpdating}
                        />
                        <input
                            type="email"
                            name="email"
                            value={newSeller.email}
                            onChange={handleInputChange}
                            placeholder="Email Address"
                            className={commonStyles.input}
                            disabled={isCreating || isUpdating}
                        />
                        <input
                            type="tel"
                            name="phone"
                            value={newSeller.phone}
                            onChange={handleInputChange}
                            placeholder="Phone Number"
                            className={commonStyles.input}
                            disabled={isCreating || isUpdating}
                        />
                    </div>

                    <div className="space-y-4">
                        <h3 className={commonStyles.heading.h3}>Seller Image</h3>
                        <div className="flex items-center gap-4">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                                id="sellerImage"
                                disabled={isUploading}
                            />
                            <label
                                htmlFor="sellerImage"
                                className={`${commonStyles.button.secondary} cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isUploading ? 'Uploading...' : 'Choose Image'}
                            </label>
                            {isUploading && (
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-700">
                                            Uploading {uploadProgress.currentFile}...
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {uploadProgress.completed} of {uploadProgress.total}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{
                                                width: `${(uploadProgress.completed / uploadProgress.total) * 100}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                            {imagePreview && (
                                <div className="relative w-32 h-32">
                                    <img
                                        src={imagePreview}
                                        alt="Seller preview"
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImagePreview("");
                                            setImage(undefined);
                                            setNewSeller(prev => ({ ...prev, image: "" }));
                                        }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                    >
                                        ×
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-4">
                        <h3 className={commonStyles.heading.h3}>Properties</h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={propertyKey}
                                onChange={(e) => setPropertyKey(e.target.value)}
                                className={`${commonStyles.input} flex-1`}
                                placeholder="Property name"
                            />
                            <input
                                type="text"
                                value={propertyValue}
                                onChange={(e) => setPropertyValue(e.target.value)}
                                className={`${commonStyles.input} flex-1`}
                                placeholder="Property value"
                            />
                            <button
                                type="button"
                                onClick={handleAddOrUpdateProperty}
                                className={`${commonStyles.button.secondary} whitespace-nowrap`}
                            >
                                {editPropertyId ? 'Update Property' : 'Add Property'}
                            </button>
                        </div>
                        <div className="space-y-2">
                            {properties.map((prop) => (
                                <div key={prop.id} className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm">
                                    <span className="font-medium text-gray-900">{prop.key}:</span>
                                    <span className="text-gray-600 flex-1">{prop.value}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleEditProperty(prop.id)}
                                        className="text-blue-500 hover:text-blue-700 transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteProperty(prop.id)}
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4">
                        <button type="submit" className={commonStyles.button.primary}>
                            {isCreating || isUpdating ? 'Saving...' : 'Add Seller'}
                        </button>
                    </div>
                </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.isArray(sellers) && sellers.map((seller) => (
                    <div key={seller.id} className={`${commonStyles.card} animate-scaleIn`}>
                        <div className="space-y-4">
                            {seller.image && (
                                <div className="aspect-video w-full overflow-hidden rounded-lg">
                                    <img
                                        src={seller.image}
                                        alt={seller.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <h3 className={commonStyles.heading.h3}>{seller.name}</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            const newName = prompt("Enter new name:", seller.name);
                                            const newEmail = prompt("Enter new email:", seller.email);
                                            const newPhone = prompt("Enter new phone:", seller.phone);

                                            if (newName && newName !== seller.name) {
                                                updateItem({ id: seller.id, data: { name: newName } });
                                            }
                                            if (newEmail && newEmail !== seller.email) {
                                                updateItem({ id: seller.id, data: { email: newEmail } });
                                            }
                                            if (newPhone && newPhone !== seller.phone) {
                                                updateItem({ id: seller.id, data: { phone: newPhone } });
                                            }
                                        }}
                                        className={commonStyles.button.secondary}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (window.confirm("Are you sure you want to delete this seller?")) {
                                                deleteItem(seller.id);
                                            }
                                        }}
                                        className={commonStyles.button.danger}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="text-sm text-gray-600">
                                    <strong>Email:</strong> {seller.email}
                                </div>
                                <div className="text-sm text-gray-600">
                                    <strong>Phone:</strong> {seller.phone}
                                </div>
                            </div>

                            {seller.properties && seller.properties.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="font-medium text-gray-700">Properties:</h4>
                                    {seller.properties.map((prop) => (
                                        <div key={prop.id} className="text-sm text-gray-600">
                                            <strong>{prop.key}:</strong> {prop.value}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SellerManager;
