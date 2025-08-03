import React, { useState } from 'react';
import { commonStyles } from '../../lib/styles/common';
import CreateListing from './CreateListing';
import useCrud from '../../lib/hooks/useCrud';
import { Listing, Seller } from '../../types/models';
import ConfirmationModal from '../common/ConfirmationModal';
import SimpleEditModal from '../common/SimpleEditModal';

const ListingsPage: React.FC = () => {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; listingId: string | null }>({
        isOpen: false,
        listingId: null
    });
    const [editModal, setEditModal] = useState<{ isOpen: boolean; listing: Listing | null }>({
        isOpen: false,
        listing: null
    });

    const { items: listings = [], isLoading, error, deleteItem, updateItem } = useCrud<Listing>('listings');
    const { items: sellers = [] } = useCrud<Seller>('sellers');
    console.log(listings)

    const getSellerName = (sellerId: string) => {
        const seller = sellers.find(s => s.id === sellerId);
        return seller ? seller.name : 'Unknown Seller';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Helper function to construct full image URL
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

    const handleDelete = (listingId: string) => {
        setDeleteModal({ isOpen: true, listingId });
    };

    const confirmDelete = () => {
        if (deleteModal.listingId) {
            deleteItem(deleteModal.listingId);
        }
    };

    const handleEdit = (listing: Listing) => {
        setEditModal({ isOpen: true, listing });
    };

    const confirmEdit = (newTitle: string) => {
        if (editModal.listing) {
            updateItem({
                id: editModal.listing.id,
                data: { title: newTitle }
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500 p-4">
                Error loading listings: {error.message}
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Listings</h1>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className={`${commonStyles.button.primary} px-6`}
                >
                    {showCreateForm ? 'Cancel' : 'Add Listing'}
                </button>
            </div>

            {showCreateForm && (
                <div className="mb-8">
                    <CreateListing onSuccess={async () => { setShowCreateForm(false); }} />
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                    <div key={listing.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                        <div className="relative">
                            <div className="aspect-w-16 aspect-h-9">
                                {listing.images && listing.images.length > 0 ? (
                                    <div className="relative h-48">
                                        <img
                                            src={getImageUrl(listing.images[0])}
                                            alt={listing.title}
                                            className="w-full h-full object-cover"
                                        />
                                        {listing.images.length > 1 && (
                                            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                                                +{listing.images.length - 1} more
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                                        <span className="text-gray-400">No image</span>
                                    </div>
                                )}
                            </div>
                            <div className="absolute top-2 right-2 flex gap-2">
                                <button
                                    onClick={() => handleEdit(listing)}
                                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                                    title="Edit listing"
                                >
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handleDelete(listing.id)}
                                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                                    title="Delete listing"
                                >
                                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{listing.title}</h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{listing.description}</p>
                            <div className="flex items-center text-sm text-gray-500 mb-2">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {getSellerName(listing.sellerId)}
                            </div>
                            <div className="text-xs text-gray-400">
                                Listed on {formatDate(listing.createdAt)}
                            </div>
                            {listing.properties && Object.keys(listing.properties).length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(listing.properties).map(([key, value]) => (
                                            <span key={key} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                                                {key}: {value}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, listingId: null })}
                onConfirm={confirmDelete}
                title="Delete Listing"
                message="Are you sure you want to delete this listing? This action cannot be undone."
                confirmText="Delete"
            />

            <SimpleEditModal
                isOpen={editModal.isOpen}
                onClose={() => setEditModal({ isOpen: false, listing: null })}
                onConfirm={confirmEdit}
                title="Edit Listing"
                initialValue={editModal.listing?.title || ''}
                inputLabel="Listing Title"
            />
        </div>
    );
};

export default ListingsPage;