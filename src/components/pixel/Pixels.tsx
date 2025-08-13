import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

interface Category {
    _id: string;
    name: string;
    slug: string;
}

interface Pixel {
    _id: string;
    categoryId: Category;
    pixelId: string;
    createdAt: string;
}

const API_BASE = import.meta.env.VITE_API_URL;

const Pixels: React.FC = () => {
    const [pixels, setPixels] = useState<Pixel[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedCategory, setSelectedCategory] = useState("");
    const [pixelId, setPixelId] = useState("");
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchPixels();
        fetchCategories();
    }, []);

    const fetchPixels = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE}/pixel`);
            setPixels(res.data);
        } catch {
            setError("Failed to fetch pixels");
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${API_BASE}/categories`);
            setCategories(res.data);
        } catch {
            console.error("Failed to fetch categories");
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCategory || !pixelId) {
            alert("Please select a category and enter a Pixel ID");
            return;
        }
        try {
            setCreating(true);
            const res = await axios.post(`${API_BASE}/pixel`, {
                categoryId: selectedCategory,
                pixelId,
            });
            setPixels((prev) => [...prev, res.data]);
            setSelectedCategory("");
            setPixelId("");
        } catch {
            alert("Failed to create pixel");
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (categoryId: string, pixelId: string) => {
        if (!window.confirm("Are you sure you want to delete this Pixel?")) return;
        try {
            await axios.delete(`${API_BASE}/pixel/${categoryId}`);
            setPixels((prev) => prev.filter((p) => p._id !== pixelId));
        } catch {
            alert("Failed to delete pixel");
        }
    };

    if (loading) return <p className="p-4 animate-pulse text-blue-600">Loading pixels...</p>;
    if (error) return <p className="p-4 text-red-500">{error}</p>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Hero */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 text-center"
            >
                <h1 className="text-4xl md:text-5xl font-extrabold text-blue-600 drop-shadow-md">
                    Pixel Management
                </h1>
            </motion.div>

            {/* Form */}
            <motion.form
                onSubmit={handleCreate}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8 p-6 rounded-2xl bg-white/70 backdrop-blur-xl shadow-xl flex flex-col gap-4 md:flex-row md:items-end border border-gray-200"
            >
                <div className="flex-1">
                    <label className="block text-sm font-semibold mb-1 text-gray-700">
                        Category
                    </label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full border rounded-lg p-3 focus:ring-4 focus:ring-blue-300 focus:outline-none bg-white shadow-sm"
                    >
                        <option value="">Select category</option>
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex-1">
                    <label className="block text-sm font-semibold mb-1 text-gray-700">
                        Pixel ID
                    </label>
                    <input
                        type="text"
                        value={pixelId}
                        onChange={(e) => setPixelId(e.target.value)}
                        className="w-full border rounded-lg p-3 focus:ring-4 focus:ring-blue-300 focus:outline-none bg-white shadow-sm"
                        placeholder="Enter pixel ID"
                    />
                </div>

                <button
                    type="submit"
                    disabled={creating}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 hover:scale-105 transition-all duration-300 disabled:opacity-50"
                >
                    {creating ? "Saving..." : "Add Pixel"}
                </button>
            </motion.form>

            {/* Table */}
            <div className="overflow-x-auto bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200">
                <table className="min-w-full text-sm text-left">
                    <thead>
                        <tr className="bg-blue-50">
                            <th className="p-3 font-semibold text-blue-700">Category</th>
                            <th className="p-3 font-semibold text-blue-700">Pixel ID</th>
                            <th className="p-3 font-semibold text-blue-700">Created At</th>
                            <th className="p-3 font-semibold text-blue-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pixels.map((pixel, idx) => (
                            <motion.tr
                                key={pixel._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="hover:bg-blue-50 transition"
                            >
                                <td className="p-3">{pixel.categoryId?.name || "—"}</td>
                                <td className="p-3 font-mono text-blue-600">{pixel.pixelId}</td>
                                <td className="p-3">{new Date(pixel.createdAt).toLocaleString()}</td>
                                <td className="p-3">
                                    <button
                                        onClick={() => handleDelete(pixel.categoryId._id, pixel._id)}
                                        className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 hover:scale-110 transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>

                                </td>
                            </motion.tr>
                        ))}
                        {pixels.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-6 text-center text-gray-500 italic">
                                    No pixels found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Pixels;
