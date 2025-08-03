"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Upload, Image as ImageIcon, ExternalLink } from "lucide-react";
import api2 from "../../../utils/api2";

interface FeaturedProductFormData {
    name: string;
    image: string;
    price: string;
    link: string;
}

interface FeaturedProductFormProps {
    formData: FeaturedProductFormData;
    onSubmit: (e: React.FormEvent) => void;
    onChange: (field: string, value: any) => void;
    onCancel: () => void;
    isEditing: boolean;
    isLoading?: boolean;
}

export const FeaturedProductForm: React.FC<FeaturedProductFormProps> = ({
    formData,
    onSubmit,
    onChange,
    onCancel,
    isEditing,
    isLoading = false,
}) => {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const IMAGE_API_URL = import.meta.env.VITE_API2_URL_IMAGE;

    useEffect(() => {
        if (formData.image_url) {
            if (
                formData.image.startsWith("http://") ||
                formData.image.startsWith("https://")
            ) {
                setImagePreview(formData.image);
            } else {
                const fullImageUrl = IMAGE_API_URL
                    ? `${IMAGE_API_URL}${formData.image_url}`
                    : formData.image_url;
                setImagePreview(fullImageUrl);
            }
        } else {
            setImagePreview(null);
        }
    }, [formData.image, IMAGE_API_URL]);

    const handleFileUpload = async (file: File) => {
        if (!file) return;

        // Validate file type
        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp",
        ];
        if (!allowedTypes.includes(file.type)) {
            alert("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
            return;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            alert("File size must be less than 5MB");
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append("files", file);
            formData.append("folderName", "featured-products");
            formData.append("format", "jpeg");

            const response = await api2.post("/uploads", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const progress = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setUploadProgress(progress);
                    }
                },
            });

            const result = response.data;
            console.log(result);

            // Update form data with the uploaded file URL
            const uploadedFile = result.data.files[0];
            const fullImageUrl = IMAGE_API_URL
                ? `${IMAGE_API_URL}${uploadedFile.url}`
                : uploadedFile.url;

            onChange("image", uploadedFile.url);
            setImagePreview(fullImageUrl);
            setUploadProgress(100);
        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setIsUploading(false);
            setTimeout(() => setUploadProgress(0), 1000);
        }
    };

    // Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    // Handle drag and drop
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };
    console.log(formData);
    // Initialize image preview

    // Format price input to ensure it's a valid number
    const handlePriceChange = (value: string) => {
        // Remove any non-numeric characters except decimal point
        const numericValue = value.replace(/[^0-9.]/g, "");

        // Ensure only one decimal point
        const parts = numericValue.split(".");
        if (parts.length > 2) {
            const formatted = parts[0] + "." + parts.slice(1).join("");
            onChange("price", formatted);
        } else {
            onChange("price", numericValue);
        }
    };

    return (
        <div className="max-w-2xl h-screen mx-auto">
            <form onSubmit={onSubmit} className="space-y-8">
                {/* Product Information */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                        Product Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Product Name *
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => onChange("name", e.target.value)}
                                required
                                placeholder="Enter product name"
                                disabled={isLoading}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="price"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Price *
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500">$</span>
                                <input
                                    id="price"
                                    type="text"
                                    value={formData.price}
                                    onChange={(e) => handlePriceChange(e.target.value)}
                                    required
                                    placeholder="0.00"
                                    disabled={isLoading}
                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="link"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Product Link *
                        </label>
                        <div className="relative">
                            <input
                                id="link"
                                type="url"
                                value={formData.link}
                                onChange={(e) => onChange("link", e.target.value)}
                                required
                                placeholder="https://example.com/product"
                                disabled={isLoading}
                                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <ExternalLink className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            Enter the full URL where customers can view or purchase this
                            product
                        </p>
                    </div>
                </div>

                {/* Product Image */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                        Product Image
                    </h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product Image *
                        </label>

                        {/* Upload Area */}
                        <div
                            className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${isUploading
                                ? "border-blue-400 bg-blue-50"
                                : "border-gray-300 hover:border-gray-400"
                                }`}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                                disabled={isLoading || isUploading}
                            />

                            {imagePreview ? (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <img
                                            src={imagePreview}
                                            alt="Product preview"
                                            className="w-full max-w-xs h-48 object-cover rounded-lg border border-gray-200 shadow-sm mx-auto"
                                            onError={(e) => {
                                                e.currentTarget.style.display = "none";
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onChange("image", "");
                                                setImagePreview(null);
                                            }}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isLoading || isUploading}
                                            className="text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                                        >
                                            Change Image
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="flex flex-col items-center">
                                        {isUploading ? (
                                            <>
                                                <Upload className="h-12 w-12 text-blue-400 animate-pulse mb-4" />
                                                <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 mb-4">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${uploadProgress}%` }}
                                                    ></div>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    Uploading... {uploadProgress}%
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
                                                <div className="space-y-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        disabled={isLoading}
                                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        Upload Product Image
                                                    </button>
                                                    <p className="text-sm text-gray-500">
                                                        or drag and drop your image here
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        PNG, JPG, GIF, WebP up to 5MB
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {formData.name && formData.price && imagePreview && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                            Preview
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <div className="flex items-center space-x-4">
                                <img
                                    src={imagePreview}
                                    alt={formData.name}
                                    className="w-16 h-16 object-cover rounded-lg border"
                                />
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">{formData.name}</h4>
                                    <p className="text-lg font-semibold text-blue-600">
                                        ${formData.price}
                                    </p>
                                    {formData.link && (
                                        <a
                                            href={formData.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-gray-500 hover:text-blue-600 inline-flex items-center"
                                        >
                                            View Product <ExternalLink className="ml-1 h-3 w-3" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading || isUploading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={
                            isLoading ||
                            isUploading ||
                            !formData.name ||
                            !formData.price ||
                            !formData.image ||
                            !formData.link
                        }
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading
                            ? "Saving..."
                            : isEditing
                                ? "Update Product"
                                : "Create Featured Product"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FeaturedProductForm;
