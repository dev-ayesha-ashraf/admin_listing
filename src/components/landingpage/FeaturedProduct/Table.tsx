"use client"

import React, { useState } from 'react'
import { format } from 'date-fns'
import { Edit, Trash2, ExternalLink, MoreHorizontal } from 'lucide-react'
import { getImageUrl } from '../../../utils/getImage'
// import { FeaturedProduct } from './types'

interface FeaturedProductTableProps {
    products: any[]
    selectedProducts: string[]
    onSelectProduct: (productId: string, selected: boolean) => void
    onSelectAll: (selected: boolean) => void
    onEdit: (product: any) => void
    onDelete: (product: any) => void
    isLoading?: boolean
}

const Checkbox = ({
    checked,
    indeterminate,
    onChange,
    disabled
}: {
    checked: boolean
    indeterminate?: boolean
    onChange: (checked: boolean) => void
    disabled?: boolean
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
                className={`w-4 h-4 rounded border-2 cursor-pointer flex items-center justify-center transition-colors ${disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer hover:border-blue-400'
                    } ${checked || indeterminate
                        ? 'bg-blue-600 border-blue-600'
                        : 'bg-white border-gray-300'
                    }`}
            >
                {checked && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                )}
                {indeterminate && !checked && (
                    <div className="w-2 h-0.5 bg-white rounded"></div>
                )}
            </div>
        </div>
    )
}

export const FeaturedProductTable: React.FC<FeaturedProductTableProps> = ({
    products,
    selectedProducts,
    onSelectProduct,
    onSelectAll,
    onEdit,
    onDelete,
    isLoading = false
}) => {
    const allSelected = products.length > 0 && selectedProducts.length === products.length
    const someSelected = selectedProducts.length > 0 && selectedProducts.length < products.length
    if (products.length === 0) {
        return (
            <div className="text-center py-16 text-gray-500">
                <div className="text-lg font-medium mb-2">No featured products found</div>
                <div className="text-sm text-gray-400">Create your first featured product to get started</div>
            </div>
        )
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
                            Image
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product Name
                        </th>
                        <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                        </th>
                        <th className="w-40 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product Link
                        </th>
                        <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                        </th>
                        <th className="w-24 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                        <tr
                            key={product.id}
                            className={`hover:bg-gray-50 transition-colors ${isLoading ? 'opacity-50' : ''}`}
                        >
                            <td className="px-6 py-4">
                                <Checkbox
                                    checked={selectedProducts.includes(product.id)}
                                    onChange={(checked) => onSelectProduct(product.id, checked)}
                                    disabled={isLoading}
                                />
                            </td>
                            <td className="px-6 py-4">
                                <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden shadow-sm">
                                    <img
                                        src={getImageUrl(product.image_url)}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiNGM0Y0RjYiLz48L3N2Zz4='
                                        }}
                                    />
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="max-w-xs">
                                    <div className="font-medium text-gray-900 truncate">{product.name}</div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="font-semibold text-green-600">
                                    ${product.price}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="max-w-xs">
                                    <a
                                        href={product.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 text-sm truncate flex items-center gap-1"
                                        title={product.link}
                                    >
                                        <span className="truncate">
                                            {product.link?.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                                        </span>
                                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                    </a>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-gray-500">
                                    {product?.createdAt ? format(new Date(product.createdAt), 'MMM d, yyyy') : ""}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onEdit(product)}
                                        disabled={isLoading}
                                        className="p-2 rounded hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-blue-600 hover:text-blue-800"
                                        title="Edit product"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault()
                                            onDelete(product)
                                        }}
                                        disabled={isLoading}
                                        className="p-2 rounded hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-red-600 hover:text-red-800"
                                        title="Delete product"
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
    )
}

export default FeaturedProductTable