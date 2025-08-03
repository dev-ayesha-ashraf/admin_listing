// components/banner/BannerManager.tsx
"use client"

import React, { useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { BannerForm } from './BannerForm'
import { BannerTable } from './BannerTable'
import { BannerFilters } from './BannerFilters'
import { Banner, BannerFormData } from './types'
import {
    useBanners,
    useCreateBanner,
    useUpdateBanner,
    useDeleteBanner
} from '../../hooks/useBanners'

const initialFormData: BannerFormData = {
    title: '',
    subtitle: '',
    description: '',
    discount: '',
    image: '',
    link: '',
    buttonText: '',
    bgGradient: '',
    textColor: '#000000',
    bannerType: 'hero',
    status: 'active',
    order: 0,
    startDate: undefined,
    endDate: undefined,
    targetAudience: [],
    isActive: true
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
            {/* Mobile: full screen, Desktop: centered with padding */}
            <div className="min-h-full sm:flex sm:min-h-full sm:items-center sm:justify-center sm:p-4">
                <div
                    className="fixed inset-0 bg-gray-100 bg-opacity-10 transition-opacity"
                    onClick={onClose}
                />
                {/* Mobile: full screen, Desktop: constrained */}
                <div className="relative w-full min-h-full bg-white sm:min-h-0 sm:rounded-lg sm:shadow-xl sm:max-w-4xl sm:max-h-[90vh] overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                        <div>
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{title}</h2>
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

                    {/* Content - scrollable */}
                    <div className="overflow-y-auto h-[calc(100vh-73px)] sm:max-h-[calc(90vh-120px)]">
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
        <div className="fixed h-screen inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className="fixed inset-0  bg-opacity-50 transition-opacity"
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
                                onClick={onConfirm}
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

export const BannerManager: React.FC = () => {
    // React Query hooks
    const { data: banners, isLoading: bannersLoading, error } = useBanners()
    const createBanner = useCreateBanner()
    const updateBanner = useUpdateBanner()
    const deleteBanner = useDeleteBanner()

    // Local state for UI
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState<string>('all')
    const [filterType, setFilterType] = useState<string>('all')
    const [selectedBanners, setSelectedBanners] = useState<string[]>([])

    // Dialog states
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false)
    const [deletingBanner, setDeletingBanner] = useState<Banner | null>(null)

    // Form states
    const [formData, setFormData] = useState<BannerFormData>(initialFormData)
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null)

    console.log("these are banners")
    console.log(banners)
    console.log(formData)
    // Filter banners based on search and filters
    const filteredBanners = banners?.data?.filter(banner => {
        const matchesSearch = searchQuery === '' ||
            banner.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            banner.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            banner.description?.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = filterStatus === 'all' || banner.status === filterStatus
        const matchesType = filterType === 'all' || banner.bannerType === filterType

        return matchesSearch && matchesStatus && matchesType
    }) || []

    // Loading state for any mutation
    const isMutating = createBanner.isLoading || updateBanner.isLoading || deleteBanner.isLoading

    // Form handlers
    const handleFormChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (editingBanner) {
                // Update existing banner
                await updateBanner.mutateAsync({
                    id: editingBanner.id,
                    data: {
                        title: formData.title,
                        description: formData.description,
                        image_url: typeof formData.image === 'string' ? formData.image : '',
                        link_url: formData.link,
                        is_active: formData.isActive,
                        position: formData.order
                    }
                })
                setIsEditDialogOpen(false)
            } else {
                // Create new banner
                if (!formData.image) {
                    throw new Error('Image is required')
                }

                const imageUrl = typeof formData.image === 'string' ? formData.image : ''

                if (!imageUrl) {
                    throw new Error('Please upload an image first')
                }

                await createBanner.mutateAsync({
                    title: formData.title,
                    description: formData.description,
                    image_url: imageUrl,
                    link_url: formData.link,
                    is_active: formData.isActive,
                    position: formData.order,
                    bannerType: formData.bannerType
                })
                setIsCreateDialogOpen(false)
            }
            resetForm()
        } catch (error) {
            console.error('Error submitting form:', error)
            alert('Failed to save banner. Please try again.')
        }
    }

    const resetForm = () => {
        setFormData(initialFormData)
        setEditingBanner(null)
    }

    const handleEdit = (banner: Banner) => {
        setEditingBanner(banner)
        setFormData({
            title: banner.title,
            subtitle: banner.subtitle || '',
            description: banner.description || '',
            discount: banner.discount || '',
            image: banner.image,
            link: banner.link || '',
            buttonText: banner.buttonText || '',
            bgGradient: banner.bgGradient || '',
            textColor: banner.textColor,
            bannerType: banner.bannerType,
            status: banner.status,
            order: banner.order,
            startDate: banner.startDate,
            endDate: banner.endDate,
            targetAudience: banner.targetAudience,
            isActive: banner.isActive
        })
        setIsEditDialogOpen(true)
    }

    const handleDelete = (banner: Banner) => {
        setDeletingBanner(banner)
        setIsDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!deletingBanner) return

        try {
            await deleteBanner.mutateAsync(deletingBanner.id)
            setIsDeleteDialogOpen(false)
            setDeletingBanner(null)
        } catch (error) {
            console.error('Error deleting banner:', error)
        }
    }

    const handleBulkDelete = async () => {
        if (selectedBanners.length === 0) return

        try {
            // Delete all selected banners
            await Promise.all(
                selectedBanners.map(id => deleteBanner.mutateAsync(id))
            )
            setSelectedBanners([])
            setIsBulkDeleteDialogOpen(false)
        } catch (error) {
            console.error('Error bulk deleting banners:', error)
        }
    }

    const handleToggleActive = async (banner: Banner) => {
        try {
            await updateBanner.mutateAsync({
                id: banner.id,
                data: { is_active: !banner.is_active }
            })
        } catch (error) {
            console.error('Error toggling banner status:', error)
        }
    }

    const handleSelectBanner = (bannerId: string, selected: boolean) => {
        setSelectedBanners(prev =>
            selected
                ? [...prev, bannerId]
                : prev.filter(id => id !== bannerId)
        )
    }

    const handleSelectAll = (selected: boolean) => {
        setSelectedBanners(selected ? filteredBanners.map(b => b.id) : [])
    }

    const handleResetFilters = () => {
        setSearchQuery('')
        setFilterStatus('all')
        setFilterType('all')
    }

    const handleCancel = () => {
        setIsCreateDialogOpen(false)
        setIsEditDialogOpen(false)
        resetForm()
    }

    console.log(error)

    // Error handling
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Banners</h2>
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
                        <h1 className="text-3xl font-bold text-gray-900">Banner Management</h1>
                        <p className="text-gray-600 mt-2">
                            Create and manage your website banners and promotional content
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
                        Create Banner
                    </button>
                </div>

                {/* Loading State */}
                {bannersLoading && (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">Loading banners...</span>
                    </div>
                )}

                {/* Filters */}
                {!bannersLoading && (
                    <BannerFilters
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        filterStatus={filterStatus}
                        onFilterStatusChange={setFilterStatus}
                        filterType={filterType}
                        onFilterTypeChange={setFilterType}
                        totalCount={banners?.data?.length || 0}
                        filteredCount={filteredBanners.length}
                        onReset={handleResetFilters}
                    />
                )}

                {/* Bulk Actions */}
                {!bannersLoading && selectedBanners.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <span className="text-sm text-gray-600">
                                    {selectedBanners.length} banner(s) selected
                                </span>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setSelectedBanners([])}
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

                {/* Banner Table */}
                {!bannersLoading && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <BannerTable
                            banners={filteredBanners}
                            selectedBanners={selectedBanners}
                            onSelectBanner={handleSelectBanner}
                            onSelectAll={handleSelectAll}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onToggleActive={handleToggleActive}
                            isLoading={isMutating}
                        />
                    </div>
                )}

                {/* Create Banner Modal */}
                {/* Create Banner Modal */}
                <Modal
                    isOpen={isCreateDialogOpen}
                    onClose={handleCancel}
                    title="Create New Banner"
                    description="Fill in the details below to create a new banner for your website"
                >
                    <div className="bg-white">
                        <BannerForm
                            formData={formData}
                            onSubmit={handleSubmit}
                            onChange={handleFormChange}
                            onCancel={handleCancel}
                            isEditing={false}
                            isLoading={createBanner.isLoading}
                        />
                    </div>
                </Modal>

                {/* Edit Banner Modal */}
                <Modal
                    isOpen={isEditDialogOpen}
                    onClose={handleCancel}
                    title="Edit Banner"
                    description="Update the banner details below"
                >
                    <div className="bg-white">
                        <BannerForm
                            formData={formData}
                            onSubmit={handleSubmit}
                            onChange={handleFormChange}
                            onCancel={handleCancel}
                            isEditing={true}
                            isLoading={updateBanner.isLoading}
                        />
                    </div>
                </Modal>
                <AlertDialog
                    isOpen={isDeleteDialogOpen}
                    onClose={() => setIsDeleteDialogOpen(false)}
                    title="Are you absolutely sure?"
                    description={`This action cannot be undone. This will permanently delete the banner "${deletingBanner?.title}" from your website.`}
                    onConfirm={confirmDelete}
                    confirmText="Delete"
                    cancelText="Cancel"
                    isDestructive={true}
                    isLoading={deleteBanner.isLoading}
                />

                {/* Bulk Delete Confirmation Dialog */}
                <AlertDialog
                    isOpen={isBulkDeleteDialogOpen}
                    onClose={() => setIsBulkDeleteDialogOpen(false)}
                    title="Are you absolutely sure?"
                    description={`This action cannot be undone. This will permanently delete ${selectedBanners.length} selected banner(s) from your website.`}
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