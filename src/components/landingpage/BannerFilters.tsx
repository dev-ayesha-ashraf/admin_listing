"use client"

import React, { useState } from 'react'
import { Search, Filter, X, ChevronDown } from 'lucide-react'

interface BannerFiltersProps {
    searchQuery: string
    onSearchChange: (query: string) => void
    filterStatus: string
    onFilterStatusChange: (status: string) => void
    filterType: string
    onFilterTypeChange: (type: string) => void
    totalCount: number
    filteredCount: number
    onReset: () => void
}

// Custom Select Component
const CustomSelect = ({
    value,
    onValueChange,
    options,
    placeholder
}: {
    value: string
    onValueChange: (value: string) => void
    options: { value: string, label: string }[]
    placeholder: string
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const selectedOption = options.find(opt => opt.value === value)

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between hover:border-gray-400 transition-colors"
            >
                <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Options */}
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-20 max-h-60 overflow-auto">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onValueChange(option.value)
                                    setIsOpen(false)
                                }}
                                className={`w-full px-3 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition-colors ${value === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

// Custom Badge Component
const Badge = ({
    children,
    variant = 'default'
}: {
    children: React.ReactNode
    variant?: 'default' | 'secondary'
}) => {
    const variantClasses = {
        default: 'bg-blue-100 text-blue-800',
        secondary: 'bg-gray-100 text-gray-800'
    }

    return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${variantClasses[variant]}`}>
            {children}
        </span>
    )
}

export const BannerFilters: React.FC<BannerFiltersProps> = ({
    searchQuery,
    onSearchChange,
    filterStatus,
    onFilterStatusChange,
    filterType,
    onFilterTypeChange,
    totalCount,
    filteredCount,
    onReset
}) => {
    const hasActiveFilters = searchQuery || filterStatus !== 'all' || filterType !== 'all'

    const statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'expired', label: 'Expired' }
    ]

    const typeOptions = [
        { value: 'all', label: 'All Types' },
        { value: 'hero', label: 'Hero' },
        { value: 'category', label: 'Category' },
        { value: 'promotional', label: 'Promotional' },
        { value: 'advertisement', label: 'Advertisement' }
    ]

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Filter className="h-5 w-5 text-gray-600" />
                        Filters
                    </h3>
                    {hasActiveFilters && (
                        <button
                            onClick={onReset}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        >
                            <X className="h-3 w-3" />
                            Reset
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span>
                        Showing {filteredCount.toLocaleString()} of {totalCount.toLocaleString()} banners
                    </span>
                    {hasActiveFilters && (
                        <Badge variant="secondary">
                            Filtered
                        </Badge>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Search */}
                    <div className="md:col-span-1">
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                            Search
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                id="search"
                                type="text"
                                placeholder="Search banners..."
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                            />
                            {searchQuery && (
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <button
                                        onClick={() => onSearchChange('')}
                                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <CustomSelect
                            value={filterStatus}
                            onValueChange={onFilterStatusChange}
                            options={statusOptions}
                            placeholder="Select status"
                        />
                    </div>

                    {/* Type Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Type
                        </label>
                        <CustomSelect
                            value={filterType}
                            onValueChange={onFilterTypeChange}
                            options={typeOptions}
                            placeholder="Select type"
                        />
                    </div>
                </div>

                {/* Active Filters Summary */}
                {hasActiveFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">Active filters:</span>

                            {searchQuery && (
                                <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs">
                                    <span>Search: "{searchQuery}"</span>
                                    <button
                                        onClick={() => onSearchChange('')}
                                        className="ml-1 hover:text-blue-900"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            )}

                            {filterStatus !== 'all' && (
                                <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs">
                                    <span>Status: {statusOptions.find(opt => opt.value === filterStatus)?.label}</span>
                                    <button
                                        onClick={() => onFilterStatusChange('all')}
                                        className="ml-1 hover:text-green-900"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            )}

                            {filterType !== 'all' && (
                                <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-xs">
                                    <span>Type: {typeOptions.find(opt => opt.value === filterType)?.label}</span>
                                    <button
                                        onClick={() => onFilterTypeChange('all')}
                                        className="ml-1 hover:text-purple-900"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}