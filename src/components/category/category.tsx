import React, { useState } from "react";
import useCrud from "../../lib/hooks/useCrud";
import { commonStyles } from "../../lib/styles/common";
import ConfirmationModal from "../common/ConfirmationModal";
import EditModal from "../common/EditModal";
import { Category, Attribute } from "../../types/models";
import { FaPlus, FaEdit, FaTrash, FaChevronDown, FaChevronRight } from "react-icons/fa";

const CategoryComponent: React.FC = () => {
    const [newCategory, setNewCategory] = useState({
        name: "",
        slug: "",
        attributes: [] as Array<{ name: string; type: string; required: boolean }>,
        properties: null as any,
        subcategories: [] as Array<{ id: string; name: string }>
    });

    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        categoryId: string | null;
    }>({
        isOpen: false,
        categoryId: null,
    });

    const [editModal, setEditModal] = useState<{
        isOpen: boolean;
        categoryId: string | null;
        currentName: string;
        currentSlug: string;
        currentAttributes: Attribute[];
        currentProperties: any;
        currentSubcategories: Array<{ id: string; name: string }>;
    }>({
        isOpen: false,
        categoryId: null,
        currentName: "",
        currentSlug: "",
        currentAttributes: [],
        currentProperties: null,
        currentSubcategories: []
    });

    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    const {
        items: categories = [],
        isLoading,
        error,
        createItemAsync,
        updateItem,
        deleteItem,
        isCreating,
        isUpdating
    } = useCrud<Category>("categories");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newCategory.name.trim()) {
            try {
                console.log("Creating new category:", newCategory);

                const categoryData = {
                    name: newCategory.name,
                    slug: newCategory.slug,
                    attributes: newCategory.attributes.map(attr => ({
                        ...attr,
                        id: Math.random().toString(36).substr(2, 9),
                    })),
                    properties: newCategory.properties,
                    subcategories: newCategory.subcategories
                };

                await createItemAsync(categoryData);

                // Reset form after successful creation
                setNewCategory({
                    name: "",
                    slug: "",
                    attributes: [],
                    properties: null,
                    subcategories: []
                });

                console.log("Category created successfully");
            } catch (err: any) {
                console.error("Error creating category:", err?.response?.data || err.message);
                alert("Failed to create category. Please try again.");
            }
        }
    };

    const handleDelete = (categoryId: string) => {
        setDeleteModal({
            isOpen: true,
            categoryId,
        });
    };

    const handleEdit = (category: Category) => {
        setEditModal({
            isOpen: true,
            categoryId: category.id,
            currentName: category.name,
            currentSlug: category.slug || "",
            currentAttributes: category.attributes || [],
            currentProperties: category.properties,
            currentSubcategories: category.subcategories
        });
    };

    const confirmDelete = () => {
        if (deleteModal.categoryId) {
            deleteItem(deleteModal.categoryId);
        }
    };

    const confirmEdit = (updatedData: {
        name: string;
        slug: string;
        attributes: Attribute[];
        properties: any;
        subcategories: Array<{ id: string; name: string }>;
    }) => {
        if (editModal.categoryId) {
            updateItem({
                id: editModal.categoryId,
                data: updatedData
            });
        }
    };

    const toggleExpand = (categoryId: string) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId);
            } else {
                newSet.add(categoryId);
            }
            return newSet;
        });
    };

    const renderCategory = (category: Category, level: number = 0) => {
        const isExpanded = expandedCategories.has(category.id);
        const hasSubcategories = category.subcategories.length > 0;

        return (
            <div key={category.id} className="space-y-2">
                <div className={`${commonStyles.listItem} pl-${level * 4}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                            {hasSubcategories && (
                                <button
                                    onClick={() => toggleExpand(category.id)}
                                    className="p-1 hover:bg-gray-100 rounded"
                                >
                                    {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                                </button>
                            )}
                            <h3 className={commonStyles.heading.h3}>{category.name}</h3>
                            {category.slug && (
                                <span className="text-sm text-gray-500 truncate">({category.slug})</span>
                            )}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={() => handleEdit(category)}
                                className={commonStyles.button.secondary}
                            >
                                <FaEdit />
                            </button>
                            <button
                                onClick={() => handleDelete(category.id)}
                                className={commonStyles.button.danger}
                            >
                                <FaTrash />
                            </button>
                        </div>
                    </div>

                    {category.attributes && category.attributes.length > 0 && (
                        <div className="mt-2 pl-4 sm:pl-6">
                            <h4 className="text-sm font-medium text-gray-600">Attributes:</h4>
                            <ul className="mt-1 space-y-1">
                                {category.attributes.map((attr) => (
                                    <li key={attr.id} className="text-sm text-gray-500">
                                        {attr.name} ({attr.type}) {attr.required ? '(Required)' : ''}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {category.properties && (
                        <div className="mt-2 pl-4 sm:pl-6 overflow-auto">
                            <h4 className="text-sm font-medium text-gray-600">Properties:</h4>
                            <pre className="text-sm text-gray-500 whitespace-pre-wrap break-words">
                                {JSON.stringify(category.properties, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>

                {isExpanded && hasSubcategories && (
                    <div className="pl-6">
                        {category.subcategories.map((sub) => (
                            <div key={sub.id} className="text-sm text-gray-500">
                                {sub.name}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    if (isLoading) return (
        <div className={commonStyles.loadingContainer}>
            <p className={commonStyles.loadingText}>Loading...</p>
        </div>
    );

    if (error) return (
        <div className={commonStyles.errorContainer}>
            <p className={commonStyles.errorText}>Error: {error.message}</p>
        </div>
    );

    return (
        <div className={`${commonStyles.container} p-4 sm:p-6`}>
            <h1 className={commonStyles.heading.h1}>Categories</h1>

            <form className="mb-6">
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="text"
                            value={newCategory.name}
                            onChange={(e) =>
                                setNewCategory((prev) => ({ ...prev, name: e.target.value }))
                            }
                            placeholder="Enter category name"
                            className={commonStyles.input}
                            disabled={isCreating}
                        />
                        <input
                            type="text"
                            value={newCategory.slug}
                            onChange={(e) =>
                                setNewCategory((prev) => ({ ...prev, slug: e.target.value }))
                            }
                            placeholder="Enter category slug"
                            className={commonStyles.input}
                            disabled={isCreating}
                        />
                    </div>

                    {/* Subcategory Inputs */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Subcategories</h4>
                        {newCategory.subcategories.map((sub, idx) => (
                            <div key={sub.id} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                                <input
                                    type="text"
                                    value={sub.name}
                                    onChange={(e) => {
                                        const updatedSubs = [...newCategory.subcategories];
                                        updatedSubs[idx].name = e.target.value;
                                        setNewCategory((prev) => ({
                                            ...prev,
                                            subcategories: updatedSubs,
                                        }));
                                    }}
                                    placeholder="Subcategory name"
                                    className={commonStyles.input}
                                />
                                <button
                                    type="button"
                                    className={commonStyles.button.danger}
                                    onClick={() => {
                                        setNewCategory((prev) => ({
                                            ...prev,
                                            subcategories: prev.subcategories.filter(
                                                (_, i) => i !== idx
                                            ),
                                        }));
                                    }}
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            className={commonStyles.button.secondary}
                            onClick={() => {
                                const newSub = {
                                    id: Math.random().toString(36).substring(2, 9),
                                    name: "",
                                };
                                setNewCategory((prev) => ({
                                    ...prev,
                                    subcategories: [...prev.subcategories, newSub],
                                }));
                            }}
                        >
                            <FaPlus className="mr-1 inline" /> Add Subcategory
                        </button>
                    </div>

                    <div>
                        <button
                            className={commonStyles.button.primary}
                            disabled={isCreating}
                            onClick={(e) => handleSubmit(e)}
                        >
                            {isCreating ? "Adding..." : "Add"}
                        </button>
                    </div>
                </div>
            </form>

            <div className="space-y-4">
                {categories.length > 0 ? categories.map((category) => renderCategory(category)) : <p>no item is found</p>}

            </div>

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, categoryId: null })}
                onConfirm={confirmDelete}
                title="Delete Category"
                message="Are you sure you want to delete this category? This action cannot be undone."
                confirmText="Delete"
            />

            <EditModal
                isOpen={editModal.isOpen}
                onClose={() =>
                    setEditModal({
                        isOpen: false,
                        categoryId: null,
                        currentName: "",
                        currentSlug: "",
                        currentAttributes: [],
                        currentProperties: null,
                        currentSubcategories: []
                    })
                }
                onConfirm={confirmEdit}
                title="Edit Category"
                isLoading={isUpdating}
                initialData={{
                    name: editModal.currentName,
                    slug: editModal.currentSlug,
                    attributes: editModal.currentAttributes,
                    properties: editModal.currentProperties,
                    subcategories: editModal.currentSubcategories
                }}
            />
        </div>
    );

};

export default CategoryComponent;
