import React, { useState, useRef, useEffect } from 'react';
import useCrud from '../../lib/hooks/useCrud';
import { commonStyles } from '../../lib/styles/common';
import { Category, Listing, Seller } from '../../types/models';
import { optimizeImage } from '../../lib/utils/imageOptimizer';
import { uploadImage, uploadMultipleImages } from '../../lib/utils/imageUpload';
import { FaPlus, FaTrash, FaTimes } from 'react-icons/fa';

interface CreateListingProps {
    onSuccess?: () => void;
}

interface Property {
    key: string;
    value: string;
}

interface UploadProgress {
    total: number;
    completed: number;
    currentFile?: string;
}

// Helper function to construct proper image URLs - consistent with ListingsPage
const getImageUrl = (imagePath: string): string => {
    if (!imagePath) {
        return '/placeholder-image.jpg';
    }
    if (imagePath.startsWith('http')) {
        return imagePath;
    }

    const baseUrl = import.meta.env.VITE_IMAGE_API;
    return `${baseUrl}${imagePath}`;
};

const CreateListing: React.FC<CreateListingProps> = ({ onSuccess }) => {
    const [newListing, setNewListing] = useState<Partial<Listing>>({
        title: '',
        description: '',
        price: undefined,
        images: [],
        location: '',
        categoryId: '',
        subcategoryIds: [] as string[],
        sellerId: '',
        attributes: {},
        properties: {},
    });

    const [imageUrl, setImageUrl] = useState('');
    const [newProperty, setNewProperty] = useState<Property>({ key: '', value: '' });
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress>({ total: 0, completed: 0 });
    const [selectedParentCategory, setSelectedParentCategory] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        items: categories = [],
        isLoading: isCategoriesLoading,
        error: categoriesError
    } = useCrud<Category>('categories');
    const { items: sellers = [] } = useCrud<Seller>('sellers');
    const { createItemAsync, isCreating } = useCrud<Listing>('listings');
    const rootCategories = categories.filter(cat =>
        !categories.some(otherCat =>
            Array.isArray(otherCat.subcategories) &&
            otherCat.subcategories.some(sub => sub.id === cat.id)
        )
    );
    const selectedParent = categories.find(cat => cat.id === selectedParentCategory);
    const subCategories = selectedParent?.subcategories || [];

    const handleParentCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const parentId = e.target.value;
        setSelectedParentCategory(parentId);
        setNewListing(prev => ({ ...prev, subcategoryIds: [] }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!newListing.title || !newListing.location || !selectedParentCategory || !newListing.sellerId) {
                alert('Please fill in all required fields (Title, Location, Category, and Seller)');
                return;
            }

            const validImages = (newListing.images || []).filter(url => url && typeof url === 'string');

            const listingData: Partial<Listing> = {
                title: newListing.title,
                description: newListing.description || undefined,
                price: newListing.price || undefined,
                images: validImages,
                location: newListing.location,
                categoryId: selectedParentCategory,
                subcategoryIds: newListing.subcategoryIds,
                sellerId: newListing.sellerId,
                attributes: newListing.attributes || {},
                properties: newListing.properties || undefined
            };

            console.log('Submitting listing data:', listingData);
            const createdListing = await createItemAsync(listingData);

            // Reset form
            setNewListing({
                title: '',
                description: '',
                price: undefined,
                images: [],
                location: '',
                categoryId: '',
                subcategoryIds: [],
                sellerId: '',
                attributes: {},
                properties: {},
            });
            setImageUrl('');
            setNewProperty({ key: '', value: '' });
            setSelectedParentCategory('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            onSuccess?.();
        } catch (err) {
            console.log('Error details:', err);
            alert('Failed to create listing. Please try again.');
        }
    };

    const addImageFromUrl = async () => {
        if (imageUrl.trim()) {
            try {
                setIsUploading(true);
                setUploadProgress({ total: 1, completed: 0, currentFile: 'URL Image' });

                // Fetch the image from URL
                const response = await fetch(imageUrl);
                const blob = await response.blob();
                const file = new File([blob], 'image.jpg', { type: blob.type });

                setUploadProgress(prev => ({ ...prev, completed: 0.5 }));

                // Optimize the image
                const optimizedBlob = await optimizeImage(file, {
                    maxWidth: 1200,
                    maxHeight: 1200,
                    quality: 0.8,
                    format: 'jpeg'
                });

                // Upload to server
                const uploadedImageUrl = await uploadImage(optimizedBlob, {
                    folderName: 'listings'
                });

                if (!uploadedImageUrl) {
                    throw new Error('Failed to get image URL from server');
                }

                setUploadProgress(prev => ({ ...prev, completed: 1 }));

                // Clean the URL - remove the full server URL if it's included in the response
                const baseUrl = import.meta.env.VITE_IMAGE_API;
                const strippedUrl = uploadedImageUrl.replace(baseUrl, '');

                setNewListing(prev => ({
                    ...prev,
                    images: [...(prev.images || []), strippedUrl]
                }));
                setImageUrl('');
            } catch (error) {
                console.error('Error uploading image from URL:', error);
                alert('Failed to upload image from URL');
            } finally {
                setIsUploading(false);
                setUploadProgress({ total: 0, completed: 0 });
            }
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            try {
                setIsUploading(true);
                const fileArray = Array.from(files);
                setUploadProgress({ total: fileArray.length, completed: 0 });

                console.log('Starting file upload...', {
                    fileCount: fileArray.length,
                    fileTypes: fileArray.map(f => f.type)
                });

                const optimizedFiles = await Promise.all(
                    fileArray.map(async (file, index) => {
                        console.log(`Optimizing file ${index + 1}/${fileArray.length}`);
                        const optimized = await optimizeImage(file, {
                            maxWidth: 1200,
                            maxHeight: 1200,
                            quality: 0.8,
                            format: 'jpeg'
                        });

                        const optimizedFile = new File(
                            [optimized],
                            `optimized-${file.name.replace(/\.[^/.]+$/, '')}.jpeg`,
                            {
                                type: 'image/jpeg',
                                lastModified: new Date().getTime()
                            }
                        );

                        return optimizedFile;
                    })
                );

                const imageUrls = await uploadMultipleImages(optimizedFiles, {
                    folderName: 'default',
                    format: 'jpeg'
                });

                // Clean the URLs - remove the full server URL if it's included in the response
                const baseUrl = import.meta.env.VITE_IMAGE_API;
                const strippedImageUrls = imageUrls.map(url =>
                    url.replace("http://77.237.237.132", '')
                );
                console.log(baseUrl)
                console.log('Upload complete, received URLs:', strippedImageUrls);

                if (strippedImageUrls.length === 0) {
                    throw new Error('No valid image URLs received from server');
                }

                setNewListing(prev => ({
                    ...prev,
                    images: [...(prev.images || []), ...strippedImageUrls]
                }));
            } catch (error) {
                console.error('Error uploading files:', error);
                alert(error instanceof Error ? error.message : 'Failed to upload images');
            } finally {
                setIsUploading(false);
                setUploadProgress({ total: 0, completed: 0 });
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        }
    };

    const removeImage = (index: number) => {
        setNewListing(prev => ({
            ...prev,
            images: prev.images?.filter((_, i) => i !== index)
        }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const addProperty = () => {
        if (newProperty.key.trim() && newProperty.value.trim()) {
            setNewListing(prev => ({
                ...prev,
                properties: {
                    ...prev.properties,
                    [newProperty.key.trim()]: newProperty.value.trim()
                }
            }));
            setNewProperty({ key: '', value: '' });
        }
    };

    const removeProperty = (key: string) => {
        setNewListing(prev => {
            const newProperties = { ...prev.properties };
            delete newProperties[key];
            return {
                ...prev,
                properties: newProperties
            };
        });
    };

    if (isCategoriesLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (categoriesError) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-red-500">
                    Error loading categories: {categoriesError.message}
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-start min-h-screen bg-gray-50 py-8">
            <div className="w-full max-w-3xl mx-4">
                <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Listing</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={newListing.title}
                                    onChange={(e) => setNewListing(prev => ({ ...prev, title: e.target.value }))}
                                    className={`${commonStyles.input} w-full`}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Price
                                </label>
                                <input
                                    type="number"
                                    value={newListing.price || ''}
                                    onChange={(e) => setNewListing(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                                    className={`${commonStyles.input} w-full`}
                                    step="0.01"
                                    min="0"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={newListing.description}
                                onChange={(e) => setNewListing(prev => ({ ...prev, description: e.target.value }))}
                                className={`${commonStyles.input} w-full`}
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    value={newListing.location}
                                    onChange={(e) => setNewListing(prev => ({ ...prev, location: e.target.value }))}
                                    className={`${commonStyles.input} w-full`}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Seller
                                </label>
                                <select
                                    value={newListing.sellerId}
                                    onChange={(e) => setNewListing(prev => ({ ...prev, sellerId: e.target.value }))}
                                    className={`${commonStyles.select} w-full`}
                                    required
                                >
                                    <option value="">Select a seller</option>
                                    {sellers.map(seller => (
                                        <option key={seller.id} value={seller.id}>
                                            {seller.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Parent Category
                                </label>
                                <select
                                    value={selectedParentCategory}
                                    onChange={handleParentCategoryChange}
                                    className={`${commonStyles.select} w-full`}
                                    required
                                >
                                    <option value="">Select a parent category</option>
                                    {rootCategories.map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {subCategories.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Subcategories
                                    </label>
                                    <div className="relative">
                                        <div className="flex flex-wrap gap-2 p-2 min-h-[42px] border rounded-md bg-white">
                                            {newListing.subcategoryIds?.map(subId => {
                                                const sub = subCategories.find(s => s.id === subId);
                                                return sub ? (
                                                    <div
                                                        key={sub.id}
                                                        className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
                                                    >
                                                        <span>{sub.name}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setNewListing(prev => ({
                                                                    ...prev,
                                                                    subcategoryIds: prev.subcategoryIds?.filter(id => id !== sub.id) || []
                                                                }));
                                                            }}
                                                            className="text-blue-600 hover:text-blue-800"
                                                        >
                                                            <FaTimes size={12} />
                                                        </button>
                                                    </div>
                                                ) : null;
                                            })}
                                            <select
                                                value=""
                                                onChange={(e) => {
                                                    const selectedId = e.target.value;
                                                    if (selectedId && !newListing.subcategoryIds?.includes(selectedId)) {
                                                        setNewListing(prev => ({
                                                            ...prev,
                                                            subcategoryIds: [...(prev.subcategoryIds || []), selectedId]
                                                        }));
                                                    }
                                                    e.target.value = ""; // Reset select
                                                }}
                                                className="flex-1 min-w-[120px] border-0 focus:ring-0 p-0 text-sm"
                                            >
                                                <option value="">Add subcategory...</option>
                                                {subCategories
                                                    .filter(sub => !newListing.subcategoryIds?.includes(sub.id))
                                                    .map(sub => (
                                                        <option key={sub.id} value={sub.id}>
                                                            {sub.name}
                                                        </option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Selected: {newListing.subcategoryIds?.length || 0} subcategories
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Images
                                </label>
                                <span className="text-sm text-gray-500">
                                    {newListing.images?.length || 0} images added
                                </span>
                            </div>
                            <div className="space-y-4">
                                {isUploading && (
                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-700">
                                                Uploading {uploadProgress.currentFile || 'files'}...
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
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm text-gray-600 mb-1">
                                            Upload Multiple Images
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileUpload}
                                                accept="image/*"
                                                multiple
                                                disabled={isUploading}
                                                className="block w-full text-sm text-gray-500
                                                    file:mr-4 file:py-2 file:px-4
                                                    file:rounded-full file:border-0
                                                    file:text-sm file:font-semibold
                                                    file:bg-blue-50 file:text-blue-700
                                                    hover:file:bg-blue-100
                                                    disabled:opacity-50"
                                            />
                                            <p className="mt-1 text-xs text-gray-500">
                                                Select multiple images at once
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm text-gray-600 mb-1">
                                            Or Add Image URLs
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={imageUrl}
                                                onChange={(e) => setImageUrl(e.target.value)}
                                                disabled={isUploading}
                                                className={`${commonStyles.input} flex-1`}
                                                placeholder="Enter image URL"
                                            />
                                            <button
                                                type="button"
                                                onClick={addImageFromUrl}
                                                disabled={isUploading}
                                                className={`${commonStyles.button.secondary} whitespace-nowrap`}
                                            >
                                                {isUploading ? 'Uploading...' : 'Add URL'}
                                            </button>
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Add one URL at a time
                                        </p>
                                    </div>
                                </div>
                                {newListing.images && newListing.images.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {newListing.images.map((image, index) => (
                                            <div key={index} className="relative group aspect-square">
                                                <img
                                                    src={getImageUrl(image)}
                                                    alt={`Listing ${index + 1}`}
                                                    className="w-full h-full object-cover rounded-lg"
                                                    onError={(e) => {
                                                        console.error('Failed to load image:', image);
                                                        console.error('Constructed URL:', getImageUrl(image));
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    ×
                                                </button>
                                                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                                                    Image {index + 1}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Custom Properties
                            </label>
                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={newProperty.key}
                                    onChange={(e) => setNewProperty(prev => ({ ...prev, key: e.target.value }))}
                                    className={`${commonStyles.input} flex-1`}
                                    placeholder="Property name"
                                />
                                <input
                                    type="text"
                                    value={newProperty.value}
                                    onChange={(e) => setNewProperty(prev => ({ ...prev, value: e.target.value }))}
                                    className={`${commonStyles.input} flex-1`}
                                    placeholder="Property value"
                                />
                                <button
                                    type="button"
                                    onClick={addProperty}
                                    className={`${commonStyles.button.secondary} whitespace-nowrap`}
                                >
                                    Add Property
                                </button>
                            </div>
                            <div className="space-y-2">
                                {Object.entries(newListing.properties || {}).map(([key, value]) => (
                                    <div key={key} className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm">
                                        <span className="font-medium text-gray-900">{key}:</span>
                                        <span className="text-gray-600 flex-1">{value}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeProperty(key)}
                                            className="text-red-500 hover:text-red-700 transition-colors"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                className={`${commonStyles.button.primary} px-8`}
                                disabled={isCreating || isUploading}
                            >
                                {isCreating ? 'Creating...' : 'Create Listing'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateListing;