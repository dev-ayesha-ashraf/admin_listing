import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import useCrud from "../../lib/hooks/useCrud";
import { Tab } from "@headlessui/react";
import CreateListing from "../listings/CreateListing";
import ConfirmationModal from "../common/ConfirmationModal";
import FooterForm from "../common/FooterForm";
import PropertyTypeForm from "../common/PropertyTypeForm";
import BannerManager from "../banner/BannerManager";

const ListingsByCategory: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { items: listings = [], isLoading } = useCrud<any>("listings");

  const [showForm, setShowForm] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [category, setCategory] = useState<any | null>(null);

  const [footerData, setFooterData] = useState<any | null>(null);
  const [footerFormVisible, setFooterFormVisible] = useState(false);
  const [isEditingFooter, setIsEditingFooter] = useState(false);

  const [propertyTypes, setPropertyTypes] = useState<any[]>([]);
  const [editingPropertyType, setEditingPropertyType] = useState<any | null>(null);
  const [showPropertyTypeForm, setShowPropertyTypeForm] = useState(false);

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    listingId: null as string | null,
  });

  const API_URL = import.meta.env.VITE_API_URL;
  const IMAGE_API_URL = import.meta.env.VITE_IMAGE_API;

  const getImageUrl = (imagePath: string, type: "banner" | "default" = "default") => {
    if (!imagePath) return "/placeholder-image.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    const prefix = type === "banner" ? "/uploads/banners/" : "";
    return `${IMAGE_API_URL}${prefix}${imagePath}`;
  };

  const filteredListings = listings.filter(
    (listing: any) => listing.categoryId?.slug === slug
  );

  const fetchCategory = async () => {
    try {
      const res = await axios.get(`${API_URL}/categories`);
      const foundCategory = res.data.find((cat: any) => cat.slug === slug);
      if (foundCategory) {
        setCategoryId(foundCategory._id);
        setCategory(foundCategory);
      }
    } catch (err) {
      console.error("Failed to fetch category:", err);
    }
  };

  const fetchFooter = async () => {
    if (!categoryId) return;
    const res = await axios.get(`${API_URL}/footer`);
    const footer = res.data.find((item: any) => item.categoryId === categoryId);
    setFooterData(footer || null);
  };

  const fetchPropertyTypes = async () => {
    if (!categoryId) return;
    const res = await axios.get(`${API_URL}/property-types`);
    const filtered = res.data.filter((pt: any) => pt.categoryId === categoryId);
    setPropertyTypes(filtered);
  };

  const refreshListings = async () => {
    await axios.get(`${API_URL}/listings`);
    setShowForm(false);
  };

  const handleDelete = (listingId: string) => {
    setDeleteModal({ isOpen: true, listingId });
  };

  const confirmDelete = async () => {
    if (!deleteModal.listingId) return;
    try {
      await axios.delete(`${API_URL}/listings/${deleteModal.listingId}`);
      window.location.reload();
    } catch {
      alert("Failed to delete listing.");
    } finally {
      setDeleteModal({ isOpen: false, listingId: null });
    }
  };

  useEffect(() => {
    fetchCategory();
  }, [slug]);

  useEffect(() => {
    if (categoryId) {
      fetchFooter();
      if (slug === "realestate") fetchPropertyTypes();
    }
  }, [categoryId]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8 capitalize">Listings in: {slug}</h1>

      {!categoryId ? (
        <p>Loading category data...</p>
      ) : (
        <Tab.Group>
          <Tab.List className="flex space-x-4 mb-6 border-b pb-2">
            {["Listings", "Footer Info", slug === "realestate" && "Property Types", "Banners"]
              .filter(Boolean)
              .map((tabName, idx) => (
                <Tab
                  key={idx}
                  className={({ selected }) =>
                    selected
                      ? "text-blue-600 border-b-2 border-blue-600 pb-2"
                      : "text-gray-600 hover:text-blue-600"
                  }
                >
                  {tabName}
                </Tab>
              ))}
          </Tab.List>

          <Tab.Panels>
            {/* Listings Tab */}
            <Tab.Panel>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Listings</h2>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  {showForm ? "Cancel" : "Create Listing"}
                </button>
              </div>
              {showForm && categoryId && (
                <CreateListing categoryId={categoryId} onSuccess={refreshListings} />
              )}
              {isLoading ? (
                <p>Loading...</p>
              ) : filteredListings.length === 0 ? (
                <p>No listings found.</p>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredListings.map((listing: any) => (
                    <div key={listing._id} className="bg-white p-4 shadow rounded relative">
                      <img
                        src={getImageUrl(listing.images?.[0])}
                        className="w-full h-48 object-cover rounded mb-2"
                        alt={listing.title}
                      />
                      <h3 className="text-lg font-bold">{listing.title}</h3>
                      <p className="text-gray-600 text-sm">{listing.description}</p>
                      <p className="text-green-700 mt-1 font-bold">AWG {listing.price}</p>
                      <button
                        onClick={() => handleDelete(listing._id)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, listingId: null })}
                onConfirm={confirmDelete}
                title="Delete Listing"
                message="Are you sure you want to delete this listing?"
                confirmText="Delete"
              />
            </Tab.Panel>

            {/* Footer Info Tab */}
            <Tab.Panel>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Footer Info</h2>
                <button
                  onClick={() => {
                    setIsEditingFooter(!!footerData);
                    setFooterFormVisible(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {footerData ? "Edit Footer" : "Add Footer Info"}
                </button>
              </div>
              {footerData && (
                <div className="bg-white p-6 shadow rounded space-y-2">
                  <p><strong>Phone:</strong> {footerData.phone}</p>
                  <p><strong>Email:</strong> {footerData.email}</p>
                  <p><strong>Address:</strong> {footerData.address}</p>
                  <p><strong>About:</strong> {footerData.about}</p>
                </div>
              )}
              {footerFormVisible && (
                <FooterForm
                  categorySlug={slug}
                  initialData={isEditingFooter ? footerData : undefined}
                  onSuccess={() => {
                    setFooterFormVisible(false);
                    fetchFooter();
                  }}
                  onCancel={() => setFooterFormVisible(false)}
                />
              )}
            </Tab.Panel>

            {/* Property Types Tab */}
            {slug === "realestate" && (
              <Tab.Panel>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold">Property Types</h2>
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    onClick={() => {
                      setEditingPropertyType(null);
                      setShowPropertyTypeForm(true);
                    }}
                  >
                    Add Property Type
                  </button>
                </div>
                {propertyTypes.length === 0 ? (
                  <p>No property types found.</p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {propertyTypes.map((type) => (
                      <div key={type._id} className="bg-white p-4 shadow rounded">
                        <img
                          src={getImageUrl(type.image)}
                          alt={type.name}
                          className="w-full h-32 object-cover rounded mb-2"
                        />
                        <h3 className="font-semibold">{type.name}</h3>
                        <div className="flex gap-2 mt-2">
                          <button
                            className="bg-yellow-500 text-white px-2 py-1 rounded"
                            onClick={() => {
                              setEditingPropertyType(type);
                              setShowPropertyTypeForm(true);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="bg-red-600 text-white px-2 py-1 rounded"
                            onClick={async () => {
                              if (confirm("Delete this type?")) {
                                await axios.delete(`${API_URL}/property-types/${type._id}`);
                                fetchPropertyTypes();
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {showPropertyTypeForm && (
                  <PropertyTypeForm
                    initialData={editingPropertyType}
                    categoryId={categoryId}
                    onCancel={() => setShowPropertyTypeForm(false)}
                    onSuccess={() => {
                      setShowPropertyTypeForm(false);
                      fetchPropertyTypes();
                    }}
                  />
                )}
              </Tab.Panel>
            )}

            {/* Banners Tab */}
            <Tab.Panel>
              {categoryId && <BannerManager categoryId={categoryId} />}
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      )}
    </div>
  );
};

export default ListingsByCategory;
