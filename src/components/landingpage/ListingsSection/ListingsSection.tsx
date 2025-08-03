import React, { useEffect, useState } from "react";
import axios from "axios";
import type { Category } from "../../../types/models";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Eye, Trash2, XCircle } from "lucide-react";

const ListingSection = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [cardLimit, setCardLimit] = useState<number>(3);
    const [categories, setCategories] = useState<Category[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL;

    const fetchData = async () => {
        try {
            const [catRes, secRes] = await Promise.all([
                fetch(`${API_URL}/categories`),
                fetch(`${API_URL}/listing-sections`)
            ]);

            if (!catRes.ok || !secRes.ok) throw new Error("Fetch error");

            setCategories(await catRes.json());
            setSections(await secRes.json());
        } catch (err) {
            console.error("Error:", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { title, category, cardLimit };
            const res = await axios.post(`${API_URL}/listing-sections`, payload);
            if (![200, 201].includes(res.status)) throw new Error();

            alert("✅ Created successfully!");
            setTitle(""); setCategory(""); setCardLimit(3);
            setShowForm(false);
            fetchData();
        } catch (err) {
            alert("❌ Error creating section");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this section?")) return;
        try {
            await axios.delete(`${API_URL}/listing-sections/${id}`);
            setSections(sections.filter((s) => s._id !== id));
        } catch {
            alert("❌ Delete failed");
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
            <div className="flex items-center justify-between mb-10">
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                    ✨ Listing Sections
                </h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300"
                >
                    {showForm ? <XCircle className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                    {showForm ? "Close" : "New Section"}
                </button>
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 mb-10"
                    >
                        <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-3">
                            <div className="col-span-3 md:col-span-1">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    placeholder="e.g. Trending Nails"
                                />
                            </div>
                            <div className="col-span-3 md:col-span-1">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    required
                                    className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat.slug}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-3 md:col-span-1">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Card Limit</label>
                                <input
                                    type="number"
                                    min={1}
                                    value={cardLimit}
                                    onChange={(e) => setCardLimit(Number(e.target.value))}
                                    className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div className="col-span-3 text-right">
                                <button
                                    type="submit"
                                    className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 shadow-md transition"
                                >
                                    ✅ Submit
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Listing sections */}
            <div className="grid gap-6 sm:grid-cols-2">
                {sections.length > 0 ? (
                    sections.map((section) => (
                        <motion.div
                            key={section._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="group relative p-5 bg-white border border-gray-100 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300"
                        >
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                {section.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                                <strong>Category:</strong> {section.category}
                            </p>
                            <p className="text-sm text-gray-600">
                                <strong>Card Limit:</strong> {section.cardLimit}
                            </p>

                            <div className="mt-4 flex gap-3">
                                <button
                                    onClick={() =>
                                        navigate(`/view-section/${section.category}?limit=${section.cardLimit}`)
                                    }
                                    className="flex items-center gap-1 px-4 py-2 text-sm bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition"
                                >
                                    <Eye size={16} /> View
                                </button>
                                <button
                                    onClick={() => handleDelete(section._id)}
                                    className="flex items-center gap-1 px-4 py-2 text-sm bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                                >
                                    <Trash2 size={16} /> Delete
                                </button>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="text-center text-gray-500 col-span-full py-6">
                        No listing sections found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListingSection;
