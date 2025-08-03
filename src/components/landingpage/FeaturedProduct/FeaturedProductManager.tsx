"use client"

import React, { useRef, useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { FeaturedProductForm } from './Form'
import { FeaturedProductTable } from './Table'
// import { FeaturedProduct, FeaturedProductFormData } from './t'
import {
    useFeaturedProducts,
    useCreateFeaturedProduct,
    useUpdateFeaturedProduct,
    useDeleteFeaturedProduct
} from '../../../hooks/useFeaturedProducts'
const initialFormData: any = {
    name: '',
    image: '',
    price: '',
    link: '',
    image_url: ''
}

// Modal Component
const Modal = ({
    isOpen,
    onClose,
    title,
    description,
    children
}: {
    isOpen: boolean
    onClose: () => void
    title: string
    description?: string
    children: React.ReactNode
}) => {
    if (!isOpen) return null

    return (
        <div className="fixed h-screen inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className="fixed inset-0 bg-gray-100 bg-opacity-10 transition-opacity"
                    onClick={onClose}
                />
                <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                            {description && (
                                <p className="mt-1 text-sm text-gray-500">{description}</p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}

// AlertDialog Component
const AlertDialog = ({
    isOpen,
    onClose,
    title,
    description,
    onConfirm,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDestructive = false,
    isLoading = false
}: {
    isOpen: boolean
    onClose: () => void
    title: string
    description: string
    onConfirm: () => void
    confirmText?: string
    cancelText?: string
    isDestructive?: boolean
    isLoading?: boolean
}) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className="fixed inset-0 bg-gray-100 bg-opacity-10 transition-opacity"
                    onClick={onClose}
                />
                <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                        <p className="text-sm text-gray-500 mb-6">{description}</p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={(e) => {
                                    onConfirm()
                                    e.preventDefault()
                                }}
                                disabled={isLoading}
                                className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${isDestructive
                                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                                    }`}
                            >
                                {isLoading ? 'Loading...' : confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Simple Search Component
const ProductFilters = ({
    searchQuery,
    onSearchChange,
    totalCount,
    filteredCount,
    onReset
}: {
    searchQuery: string
    onSearchChange: (query: string) => void
    totalCount: number
    filteredCount: number
    onReset: () => void
}) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex-1 max-w-md">
                        <label htmlFor="search" className="sr-only">
                            Search products
                        </label>
                        <input
                            id="search"
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                            {filteredCount === totalCount
                                ? `${totalCount} products`
                                : `${filteredCount} of ${totalCount} products`
                            }
                        </span>

                        {searchQuery && (
                            <button
                                onClick={onReset}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export const FeaturedProductManager: React.FC = () => {
    // React Query hooks
    const { data: products, isLoading: productsLoading, error } = useFeaturedProducts()
    const createProduct = useCreateFeaturedProduct()
    const updateProduct = useUpdateFeaturedProduct()
    const deleteProduct = useDeleteFeaturedProduct()

    // Local state for UI
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedProducts, setSelectedProducts] = useState<string[]>([])

    // Dialog states
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false)
    const [deletingProduct, setDeletingProduct] = useState<any | null>(null)

    // Form states
    const [formData, setFormData] = useState<any>(initialFormData)
    const [editingProduct, setEditingProduct] = useState<any | null>(null)
    const deletingProductRef = useRef<any | null>(null)


    // Filter products based on search
    const filteredProducts = products?.data?.filter(product => {
        const matchesSearch = searchQuery === '' ||
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.price.toLowerCase().includes(searchQuery.toLowerCase())

        return matchesSearch
    }) || []

    // Loading state for any mutation
    const isMutating = createProduct.isLoading || updateProduct.isLoading || deleteProduct.isLoading

    // Form handlers
    const handleFormChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (editingProduct) {
                // Update existing product
                await updateProduct.mutateAsync({
                    id: editingProduct.id,
                    data: {
                        name: formData.name,
                        image_url: typeof formData.image === 'string' ? formData.image : '',
                        price: formData.price,
                        link_url: formData.link
                    }
                })
                setIsEditDialogOpen(false)
            } else {
                // Create new product
                if (!formData.image) {
                    throw new Error('Image is required')
                }

                const imageUrl = typeof formData.image === 'string' ? formData.image : ''

                if (!imageUrl) {
                    throw new Error('Please upload an image first')
                }

                await createProduct.mutateAsync({
                    name: formData.name,
                    image_url: imageUrl,
                    price: formData.price,
                    link_url: formData.link
                })
                setIsCreateDialogOpen(false)
            }
            resetForm()
        } catch (error) {
            console.error('Error submitting form:', error)
            alert('Failed to save product. Please try again.')
        }
    }

    const resetForm = () => {
        setFormData(initialFormData)
        setEditingProduct(null)
    }

    const handleEdit = (product: any) => {
        setEditingProduct(product)
        setFormData({
            name: product.name,
            image: product.image_url,
            price: product.price,
            link: product.link_url,
            image_url: product.image_url
        })
        setIsEditDialogOpen(true)
    }

    const handleDelete = (product: any) => {
        console.log('Setting deletingProductRef to:', product)
        deletingProductRef.current = product
        setIsDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        const product = deletingProductRef.current
        console.log('confirmDelete called, product from ref:', product)

        if (!product) {
            console.log('No product in ref, aborting delete')
            return
        }

        try {
            console.log('Deleting product with ID:', product._id)
            await deleteProduct.mutateAsync(product._id)
            setIsDeleteDialogOpen(false)
            deletingProductRef.current = null
        } catch (error) {
            console.error('Error deleting product:', error)
        }
    }

    const handleBulkDelete = async () => {
        if (selectedProducts.length === 0) return

        try {
            // Delete all selected products
            await Promise.all(
                selectedProducts.map(id => deleteProduct.mutateAsync(id))
            )
            setSelectedProducts([])
            setIsBulkDeleteDialogOpen(false)
        } catch (error) {
            console.error('Error bulk deleting products:', error)
        }
    }

    const handleSelectProduct = (productId: string, selected: boolean) => {
        setSelectedProducts(prev =>
            selected
                ? [...prev, productId]
                : prev.filter(id => id !== productId)
        )
    }

    const handleSelectAll = (selected: boolean) => {
        setSelectedProducts(selected ? filteredProducts.map(p => p.id) : [])
    }

    const handleResetFilters = () => {
        setSearchQuery('')
    }

    const handleCancel = () => {
        setIsCreateDialogOpen(false)
        setIsEditDialogOpen(false)
        resetForm()
    }


    // Error handling
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Products</h2>
                    <p className="text-gray-600">Please try refreshing the page</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto py-8 px-4 space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Featured Products</h1>
                        <p className="text-gray-600 mt-2">
                            Manage your featured products and showcase your best offerings
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            resetForm()
                            setIsCreateDialogOpen(true)
                        }}
                        disabled={isMutating}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Featured Product
                    </button>
                </div>

                {/* Loading State */}
                {productsLoading && (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">Loading products...</span>
                    </div>
                )}

                {/* Filters */}
                {!productsLoading && (
                    <ProductFilters
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        totalCount={products?.data?.length || 0}
                        filteredCount={filteredProducts.length}
                        onReset={handleResetFilters}
                    />
                )}

                {/* Bulk Actions */}
                {!productsLoading && selectedProducts.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <span className="text-sm text-gray-600">
                                    {selectedProducts.length} product(s) selected
                                </span>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setSelectedProducts([])}
                                        disabled={isMutating}
                                        className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Clear Selection
                                    </button>
                                    <button
                                        onClick={() => setIsBulkDeleteDialogOpen(true)}
                                        disabled={isMutating}
                                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Trash2 className="mr-1.5 h-4 w-4" />
                                        Delete Selected
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Product Table */}
                {!productsLoading && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <FeaturedProductTable
                            products={filteredProducts}
                            selectedProducts={selectedProducts}
                            onSelectProduct={handleSelectProduct}
                            onSelectAll={handleSelectAll}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            isLoading={isMutating}
                        />
                    </div>
                )}

                {/* Create Product Modal */}
                <Modal
                    isOpen={isCreateDialogOpen}
                    onClose={handleCancel}
                    title="Add Featured Product"
                    description="Fill in the details below to add a new featured product"
                >
                    <div className="p-6">
                        <FeaturedProductForm
                            formData={formData}
                            onSubmit={handleSubmit}
                            onChange={handleFormChange}
                            onCancel={handleCancel}
                            isEditing={false}
                            isLoading={createProduct.isLoading}
                        />
                    </div>
                </Modal>

                {/* Edit Product Modal */}
                <Modal
                    isOpen={isEditDialogOpen}
                    onClose={handleCancel}
                    title="Edit Featured Product"
                    description="Update the product details below"
                >
                    <div className="p-6">
                        <FeaturedProductForm
                            formData={formData}
                            onSubmit={handleSubmit}
                            onChange={handleFormChange}
                            onCancel={handleCancel}
                            isEditing={true}
                            isLoading={updateProduct.isLoading}
                        />
                    </div>
                </Modal>

                {/* Delete Confirmation Dialog */}
                <AlertDialog
                    isOpen={isDeleteDialogOpen}
                    onClose={() => setIsDeleteDialogOpen(false)}
                    title="Are you absolutely sure?"
                    description={`This action cannot be undone. This will permanently delete the featured product "${deletingProduct?.name}" from your website.`}
                    onConfirm={confirmDelete}
                    confirmText="Delete"
                    cancelText="Cancel"
                    isDestructive={true}
                    isLoading={deleteProduct.isLoading}
                />

                {/* Bulk Delete Confirmation Dialog */}
                <AlertDialog
                    isOpen={isBulkDeleteDialogOpen}
                    onClose={() => setIsBulkDeleteDialogOpen(false)}
                    title="Are you absolutely sure?"
                    description={`This action cannot be undone. This will permanently delete ${selectedProducts.length} selected featured product(s) from your website.`}
                    onConfirm={handleBulkDelete}
                    confirmText="Delete"
                    cancelText="Cancel"
                    isDestructive={true}
                    isLoading={isMutating}
                />
            </div>
        </div>
    )
}

export default FeaturedProductManager