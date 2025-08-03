"use client";

import React, { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { Edit, Trash2, Eye, EyeOff, MoreHorizontal } from "lucide-react";
import { Banner, BannerType, BannerStatus } from "./types";

interface BannerTableProps {
  banners: Banner[];
  selectedBanners: string[];
  onSelectBanner: (bannerId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onEdit: (banner: Banner) => void;
  onDelete: (banner: Banner) => void;
  onToggleActive: (banner: Banner) => void;
  isLoading?: boolean;
}

const Checkbox = ({
  checked,
  indeterminate,
  onChange,
  disabled,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) => {
  return (
    <div className="relative">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
      />
      <div
        onClick={() => !disabled && onChange(!checked)}
        className={`w-4 h-4 rounded border-2 cursor-pointer flex items-center justify-center transition-colors ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:border-blue-400"
        } ${
          checked || indeterminate
            ? "bg-blue-600 border-blue-600"
            : "bg-white border-gray-300"
        }`}
      >
        {checked && (
          <svg
            className="w-3 h-3 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {indeterminate && !checked && (
          <div className="w-2 h-0.5 bg-white rounded"></div>
        )}
      </div>
    </div>
  );
};

const Badge = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
};

export const BannerTable: React.FC<BannerTableProps> = ({
  banners,
  selectedBanners,
  onSelectBanner,
  onSelectAll,
  onEdit,
  onDelete,
  onToggleActive,
  isLoading = false,
}) => {
  const getStatusColor = (status: BannerStatus) => {
    switch (status) {
      case "active":
        return "bg-green-500 text-white";
      case "inactive":
        return "bg-gray-500 text-white";
      case "scheduled":
        return "bg-blue-500 text-white";
      case "expired":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getTypeColor = (type: BannerType) => {
    switch (type) {
      case "hero":
        return "bg-purple-500 text-white";
      case "category":
        return "bg-blue-500 text-white";
      case "promotional":
        return "bg-orange-500 text-white";
      case "advertisement":
        return "bg-pink-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const allSelected =
    banners.length > 0 && selectedBanners.length === banners.length;
  const someSelected =
    selectedBanners.length > 0 && selectedBanners.length < banners.length;

  const IMAGE_API_URL = import.meta.env.VITE_API2_URL_IMAGE;
  console.log(IMAGE_API_URL);
  if (banners.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <div className="text-lg font-medium mb-2">No banners found</div>
        <div className="text-sm text-gray-400">
          Create your first banner to get started
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="w-12 px-6 py-3 text-left">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onChange={onSelectAll}
                disabled={isLoading}
              />
            </th>
            <th className="w-20 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Preview
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="w-36 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="w-40 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Performance
            </th>
            <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Updated
            </th>
            <th className="w-24 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {banners.map((banner) => (
            <tr
              key={banner.id}
              className={`hover:bg-gray-50 transition-colors ${
                isLoading ? "opacity-50" : ""
              }`}
            >
              <td className="px-6 py-4">
                <Checkbox
                  checked={selectedBanners.includes(banner.id)}
                  onChange={(checked) => onSelectBanner(banner.id, checked)}
                  disabled={isLoading}
                />
              </td>
              <td className="px-6 py-4">
                <div className="w-16 h-10 bg-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <img
                    src={`${IMAGE_API_URL}${banner.image} `}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA2NCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNDAiIGZpbGw9IiNGM0Y0RjYiLz48L3N2Zz4=";
                    }}
                  />
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="max-w-xs">
                  <div className="font-medium text-gray-900 truncate">
                    {banner.title}
                  </div>
                  {banner.subtitle && (
                    <div className="text-sm text-gray-500 truncate mt-1">
                      {banner.subtitle}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <Badge className={getTypeColor(banner.bannerType)}>
                  {banner.bannerType}
                </Badge>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(banner.status)}>
                    {banner.status}
                  </Badge>
                  <button
                    onClick={() => onToggleActive(banner)}
                    disabled={isLoading}
                    className="p-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={banner.isActive ? "Deactivate" : "Activate"}
                  >
                    {banner.isActive ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm">
                  <div className="font-medium text-gray-900">
                    CTR: {banner.conversionRate}%
                  </div>
                  <div className="text-gray-500 text-xs mt-1">
                    {banner?.clickCount?.toLocaleString()} clicks /{" "}
                    {banner.impressionCount?.toLocaleString()} views
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-500">
                  {banner?.createdAt ? banner.createdAt : ""}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(banner)}
                    disabled={isLoading}
                    className="p-2 rounded hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-blue-600 hover:text-blue-800"
                    title="Edit banner"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(banner)}
                    disabled={isLoading}
                    className="p-2 rounded hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-red-600 hover:text-red-800"
                    title="Delete banner"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
