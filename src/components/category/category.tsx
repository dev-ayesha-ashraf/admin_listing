import React, { useState } from "react";
import useCrud from "../../lib/hooks/useCrud";
import { commonStyles } from "../../lib/styles/common";
import ConfirmationModal from "../common/ConfirmationModal";
import EditModal from "../common/EditModal";
import { FaEdit, FaTrash } from "react-icons/fa";

const CategoryComponent: React.FC = () => {
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    categoryId: null as string | null,
  });

  const [editModal, setEditModal] = useState({
    isOpen: false,
    categoryId: null as string | null,
    currentName: "",
    currentDescription: "",
  });

  const {
    items: categories = [],
    isLoading,
    error,
    createItemAsync,
    updateItem,
    deleteItem,
    isCreating,
    isUpdating,
  } = useCrud<any>("categories");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;

    try {
      await createItemAsync({
        name: newCategory.name,
        description: newCategory.description,
      });
      setNewCategory({ name: "", description: "" });
    } catch (err: any) {
      console.error("Error creating category:", err?.response?.data || err.message);
      alert("Failed to create category. Please try again.");
    }
  };

  const handleDelete = (categoryId: string) => {
    setDeleteModal({ isOpen: true, categoryId });
  };

  const confirmDelete = () => {
    if (deleteModal.categoryId) {
      deleteItem(deleteModal.categoryId);
    }
  };

  const handleEdit = (category: any) => {
    setEditModal({
      isOpen: true,
      categoryId: category._id,
      currentName: category.name,
      currentDescription: category.description || "",
    });
  };

  const confirmEdit = (updatedData: { name: string; description: string }) => {
    if (editModal.categoryId) {
      updateItem({
        id: editModal.categoryId,
        data: updatedData,
      });
    }
  };

  if (isLoading) {
    return <div className={commonStyles.loadingContainer}><p>Loading...</p></div>;
  }

  if (error) {
    return <div className={commonStyles.errorContainer}><p>Error: {error.message}</p></div>;
  }

  return (
    <div className={`${commonStyles.container} p-4 sm:p-6`}>
      <h1 className={commonStyles.heading.h1}>Categories</h1>

      <form className="mb-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <input
            type="text"
            value={newCategory.name}
            onChange={(e) => setNewCategory((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Enter category name"
            className={commonStyles.input}
            disabled={isCreating}
          />
          <textarea
            value={newCategory.description}
            onChange={(e) => setNewCategory((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Enter category description"
            className={commonStyles.input}
            disabled={isCreating}
          />

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
                Adding...
              </>
            ) : (
              "Add Category"
            )}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {categories.length > 0 ? (
          categories.map((category) => (
            <div
              key={category._id}
              className={`${commonStyles.listItem} flex justify-between items-start`}
            >
              <div>
                <h3 className={commonStyles.heading.h3}>{category.name}</h3>
                {category.slug && (
                  <p className="text-sm text-gray-500">Slug: {category.slug}</p>
                )}
                {category.description && (
                  <p className="text-sm text-gray-600">{category.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(category)}
                  className={commonStyles.button.secondary}
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(category._id)}
                  className={commonStyles.button.danger}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No categories found.</p>
        )}
      </div>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, categoryId: null })}
        onConfirm={confirmDelete}
        title="Delete Category"
        message="Are you sure you want to delete this category?"
        confirmText="Delete"
      />

      <EditModal
        isOpen={editModal.isOpen}
        onClose={() =>
          setEditModal({
            isOpen: false,
            categoryId: null,
            currentName: "",
            currentDescription: "",
          })
        }
        onConfirm={(data) =>
          confirmEdit({
            name: data.name,
            description: data.description,
          })
        }
        title="Edit Category"
        isLoading={isUpdating}
        initialData={{
          name: editModal.currentName,
          description: editModal.currentDescription,
        }}
      />
    </div>
  );
};

export default CategoryComponent;
