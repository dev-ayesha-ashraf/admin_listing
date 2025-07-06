import React, { useEffect, useState } from 'react';
import { commonStyles } from '../../lib/styles/common';
import { Attribute } from '../../types/models';
import { FaPlus, FaTrash } from 'react-icons/fa';

interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: {
        name: string;
        slug: string;
        attributes: Attribute[];
        properties: any;
        subcategories: Array<{ id: string; name: string }>;
    }) => void;
    title: string;
    initialData: {
        name: string;
        slug: string;
        attributes: Attribute[];
        properties: any;
        subcategories: Array<{ id: string; name: string }>;
    };
    isLoading?: boolean;
}

const EditModal: React.FC<EditModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    initialData,
    isLoading = false
}) => {
    const [name, setName] = useState(initialData.name);
    const [slug, setSlug] = useState(initialData.slug);
    const [attributes, setAttributes] = useState(initialData.attributes);
    const [properties, setProperties] = useState(initialData.properties);
    const [subcategories, setSubcategories] = useState(initialData.subcategories);

    useEffect(() => {
        if (isOpen) {
            setName(initialData.name);
            setSlug(initialData.slug);
            setAttributes(initialData.attributes);
            setProperties(initialData.properties);
            setSubcategories(initialData.subcategories);
        }
    }, [isOpen, initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm({
            name,
            slug,
            attributes,
            properties,
            subcategories
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 px-2">
            <div className="bg-white rounded-lg p-4 sm:p-6 w-full sm:max-w-md md:max-w-lg shadow-lg">
                <h3 className={`${commonStyles.heading.h3} text-base sm:text-lg md:text-xl`}>{title}</h3>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={commonStyles.input}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Slug
                        </label>
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            className={commonStyles.input}
                            placeholder="Enter category slug"
                        />
                    </div>

                    {/* Subcategory Inputs */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Subcategories</h4>
                        {subcategories.map((sub, idx) => (
                            <div key={sub.id} className="flex gap-2 items-center">
                                <input
                                    type="text"
                                    value={sub.name}
                                    onChange={(e) => {
                                        const updatedSubs = [...subcategories];
                                        updatedSubs[idx].name = e.target.value;
                                        setSubcategories(updatedSubs);
                                    }}
                                    placeholder="Subcategory name"
                                    className={commonStyles.input + ' flex-1'}
                                />
                                <button
                                    type="button"
                                    className={commonStyles.button.danger + ' p-2'}
                                    onClick={() =>
                                        setSubcategories(subcategories.filter((_, i) => i !== idx))
                                    }
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            className={commonStyles.button.secondary + ' text-sm'}
                            onClick={() => {
                                const newSub = {
                                    id: Math.random().toString(36).substring(2, 9),
                                    name: "",
                                };
                                setSubcategories([...subcategories, newSub]);
                            }}
                        >
                            <FaPlus className="mr-1 inline" /> Add Subcategory
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className={commonStyles.button.secondary + ' w-full sm:w-auto'}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={commonStyles.button.primary + ' w-full sm:w-auto'}
                            disabled={isLoading}
                        >
                            {isLoading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditModal;
