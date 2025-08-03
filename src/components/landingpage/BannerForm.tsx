"use client"

import React, { useState, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import { Calendar, ChevronDown, X, Upload, Image as ImageIcon } from 'lucide-react'
import { BannerFormData, BannerType, BannerStatus } from './types'
import api2 from '../../utils/api2'

interface BannerFormProps {
    formData: BannerFormData
    onSubmit: (e: React.FormEvent) => void
    onChange: (field: string, value: any) => void
    onCancel: () => void
    isEditing: boolean
    isLoading?: boolean
}

export const BannerForm: React.FC<BannerFormProps> = ({
    formData,
    onSubmit,
    onChange,
    onCancel,
    isEditing,
    isLoading = false
}) => {
    const [showStartCalendar, setShowStartCalendar] = useState(false)
    const [showEndCalendar, setShowEndCalendar] = useState(false)
    const [showTypeDropdown, setShowTypeDropdown] = useState(false)
    const [showStatusDropdown, setShowStatusDropdown] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [uploadProgress, setUploadProgress] = useState<number>(0)
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const IMAGE_API_URL = import.meta.env.VITE_API2_URL_IMAGE;


    useEffect(() => {
        if (formData.image) {
            if (formData.image.startsWith('http://') || formData.image.startsWith('https://')) {
                setImagePreview(formData.image)
            } else {
                const fullImageUrl = IMAGE_API_URL ? `${IMAGE_API_URL}/${formData.image}` : formData.image
                setImagePreview(fullImageUrl)
            }
        } else {
            setImagePreview(null)
        }
    }, [formData.image, IMAGE_API_URL])

    const handleFileUpload = async (file: File) => {
        if (!file) return

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)')
            return
        }

        const maxSize = 5 * 1024 * 1024
        if (file.size > maxSize) {
            alert('File size must be less than 5MB')
            return
        }

        setIsUploading(true)
        setUploadProgress(0)

        try {
            const uploadFormData = new FormData()
            uploadFormData.append('files', file)
            uploadFormData.append('folderName', 'banners')
            uploadFormData.append('format', 'jpeg')

            const response = await api2.post('/uploads', uploadFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                        setUploadProgress(progress)
                    }
                }
            })

            const result = response.data
            console.log(result)

            const uploadedFile = result.data.files[0]
            const fullImageUrl = IMAGE_API_URL ? `${IMAGE_API_URL}/${uploadedFile.url}` : uploadedFile.url

            onChange('image', uploadedFile.url)
            setImagePreview(fullImageUrl)
            setUploadProgress(100)
        } catch (error) {
            console.error('Upload error:', error)
            alert('Failed to upload image. Please try again.')
        } finally {
            setIsUploading(false)
            setTimeout(() => setUploadProgress(0), 1000)
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleFileUpload(file)
        }
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file) {
            handleFileUpload(file)
        }
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
    }

    const handleRemoveImage = () => {
        onChange('image', '')
        setImagePreview(null)
    }

    const DatePicker = ({
        selectedDate,
        onDateChange,
        isOpen,
        onToggle
    }: {
        selectedDate?: Date,
        onDateChange: (date: Date) => void,
        isOpen: boolean,
        onToggle: () => void
    }) => {
        const today = new Date()
        const currentMonth = selectedDate || today
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()

        const daysInMonth = new Date(year, month + 1, 0).getDate()
        const firstDayOfMonth = new Date(year, month, 1).getDay()

        const days = []

        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="p-2"></div>)
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day)
            const isSelected = selectedDate &&
                date.getDate() === selectedDate.getDate() &&
                date.getMonth() === selectedDate.getMonth() &&
                date.getFullYear() === selectedDate.getFullYear()

            days.push(
                <button
                    key={day}
                    type="button"
                    onClick={() => {
                        onDateChange(date)
                        onToggle()
                    }}
                    className={`p-2 text-sm rounded hover:bg-blue-100 ${isSelected ? 'bg-blue-500 text-white' : 'text-gray-700'
                        }`}
                >
                    {day}
                </button>
            )
        }

        return (
            <div className={`absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4 ${isOpen ? 'block' : 'hidden'}`}>
                <div className="text-center font-medium mb-4">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
                <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 mb-2">
                    <div className="text-center p-1">Su</div>
                    <div className="text-center p-1">Mo</div>
                    <div className="text-center p-1">Tu</div>
                    <div className="text-center p-1">We</div>
                    <div className="text-center p-1">Th</div>
                    <div className="text-center p-1">Fr</div>
                    <div className="text-center p-1">Sa</div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {days}
                </div>
            </div>
        )
    }

    const CustomSelect = ({
        value,
        onValueChange,
        options,
        placeholder,
        isOpen,
        onToggle
    }: {
        value: string
        onValueChange: (value: string) => void
        options: { value: string, label: string }[]
        placeholder: string
        isOpen: boolean
        onToggle: () => void
    }) => (
        <div className="relative">
            <button
                type="button"
                onClick={onToggle}
                disabled={isLoading}
                className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
            >
                <span className={value ? 'text-gray-900' : 'text-gray-500'}>
                    {value ? options.find(opt => opt.value === value)?.label : placeholder}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-auto">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                onValueChange(option.value)
                                onToggle()
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )

    const bannerTypeOptions = [
        { value: 'hero', label: 'Hero' },
        { value: 'category', label: 'Category' },
        { value: 'promotional', label: 'Promotional' },
        { value: 'advertisement', label: 'Advertisement' }
    ]

    const statusOptions = [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'expired', label: 'Expired' }
    ]

    return (
        <div className="w-full h-screen  px-4 sm:px-6 lg:px-8 sm:max-w-4xl sm:mx-auto">
            <form onSubmit={onSubmit} className="space-y-6 sm:space-y-8 py-4 sm:py-0">
                {/* Basic Information Section */}
                <div className="space-y-4 sm:space-y-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                        Basic Information
                    </h3>

                    <div className="space-y-4 sm:grid sm:grid-cols-1 md:grid-cols-2 sm:gap-6 sm:space-y-0">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                Title *
                            </label>
                            <input
                                id="title"
                                type="text"
                                value={formData.title}
                                onChange={(e) => onChange('title', e.target.value)}
                                required
                                placeholder="Enter banner title"
                                disabled={isLoading}
                                className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-2">
                                Subtitle
                            </label>
                            <input
                                id="subtitle"
                                type="text"
                                value={formData.subtitle}
                                onChange={(e) => onChange('subtitle', e.target.value)}
                                placeholder="Enter banner subtitle"
                                disabled={isLoading}
                                className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => onChange('description', e.target.value)}
                            placeholder="Enter banner description"
                            rows={3}
                            disabled={isLoading}
                            className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed resize-vertical text-base sm:text-sm"
                        />
                    </div>

                    <div className="space-y-4 sm:grid sm:grid-cols-1 md:grid-cols-2 sm:gap-6 sm:space-y-0">
                        <div>
                            <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-2">
                                Discount
                            </label>
                            <input
                                id="discount"
                                type="text"
                                value={formData.discount}
                                onChange={(e) => onChange('discount', e.target.value)}
                                placeholder="e.g., 50%"
                                disabled={isLoading}
                                className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="buttonText" className="block text-sm font-medium text-gray-700 mb-2">
                                Button Text
                            </label>
                            <input
                                id="buttonText"
                                type="text"
                                value={formData.buttonText}
                                onChange={(e) => onChange('buttonText', e.target.value)}
                                placeholder="e.g., Shop Now"
                                disabled={isLoading}
                                className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Media & Links Section */}
                <div className="space-y-4 sm:space-y-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                        Media & Links
                    </h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Banner Image *
                        </label>

                        <div
                            className={`relative border-2 border-dashed rounded-lg p-4 sm:p-6 transition-colors ${isUploading
                                ? 'border-blue-400 bg-blue-50'
                                : 'border-gray-300 hover:border-gray-400'
                                }`}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                                disabled={isLoading || isUploading}
                            />

                            {imagePreview ? (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full max-w-sm h-32 sm:h-32 object-cover rounded-lg border border-gray-200 shadow-sm mx-auto"
                                            onError={(e) => {
                                                console.error('Image failed to load:', imagePreview)
                                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDMwMCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIxMjgiIGZpbGw9IiNGM0Y0RjYiLz48dGV4dCB4PSIxNTAiIHk9IjY0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUNBM0FGIiBmb250LWZhbWlseT0ic3lzdGVtLXVpIiBmb250LXNpemU9IjE0Ij5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+'
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 sm:p-1 hover:bg-red-600"
                                            disabled={isLoading || isUploading}
                                        >
                                            <X className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </button>
                                    </div>
                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isLoading || isUploading}
                                            className="text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50 text-sm"
                                        >
                                            Change Image
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="flex flex-col items-center">
                                        {isUploading ? (
                                            <>
                                                <Upload className="h-10 w-10 sm:h-12 sm:w-12 text-blue-400 animate-pulse mb-4" />
                                                <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 mb-4">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${uploadProgress}%` }}
                                                    ></div>
                                                </div>
                                                <p className="text-sm text-gray-600">Uploading... {uploadProgress}%</p>
                                            </>
                                        ) : (
                                            <>
                                                <ImageIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-4" />
                                                <div className="space-y-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        disabled={isLoading}
                                                        className="bg-blue-600 text-white px-4 py-2.5 sm:py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                                    >
                                                        Upload Image
                                                    </button>
                                                    <p className="text-sm text-gray-500 hidden sm:block">
                                                        or drag and drop your image here
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        PNG, JPG, GIF, WebP up to 5MB
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-2">
                            Link URL
                        </label>
                        <input
                            id="link"
                            type="url"
                            value={formData.link}
                            onChange={(e) => onChange('link', e.target.value)}
                            placeholder="Enter destination URL"
                            disabled={isLoading}
                            className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-sm"
                        />
                    </div>
                </div>

                {/* Styling Section */}
                <div className="space-y-4 sm:space-y-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                        Styling
                    </h3>

                    <div className="space-y-4 sm:grid sm:grid-cols-1 md:grid-cols-2 sm:gap-6 sm:space-y-0">
                        <div>
                            <label htmlFor="bgGradient" className="block text-sm font-medium text-gray-700 mb-2">
                                Background Gradient
                            </label>
                            <input
                                id="bgGradient"
                                type="text"
                                value={formData.bgGradient}
                                onChange={(e) => onChange('bgGradient', e.target.value)}
                                placeholder="CSS gradient value"
                                disabled={isLoading}
                                className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="textColor" className="block text-sm font-medium text-gray-700 mb-2">
                                Text Color
                            </label>
                            <div className="flex gap-2">
                                <input
                                    id="textColor"
                                    type="color"
                                    value={formData.textColor}
                                    onChange={(e) => onChange('textColor', e.target.value)}
                                    disabled={isLoading}
                                    className="w-16 sm:w-20 h-12 sm:h-10 border border-gray-300 rounded cursor-pointer disabled:cursor-not-allowed"
                                />
                                <input
                                    type="text"
                                    value={formData.textColor}
                                    onChange={(e) => onChange('textColor', e.target.value)}
                                    placeholder="#000000"
                                    disabled={isLoading}
                                    className="flex-1 px-3 py-3 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Configuration Section */}
                <div className="space-y-4 sm:space-y-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                        Configuration
                    </h3>

                    <div className="space-y-4 sm:grid sm:grid-cols-1 md:grid-cols-3 sm:gap-6 sm:space-y-0">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Banner Type
                            </label>
                            <CustomSelect
                                value={formData.bannerType}
                                onValueChange={(value) => onChange('bannerType', value as BannerType)}
                                options={bannerTypeOptions}
                                placeholder="Select banner type"
                                isOpen={showTypeDropdown}
                                onToggle={() => setShowTypeDropdown(!showTypeDropdown)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <CustomSelect
                                value={formData.status}
                                onValueChange={(value) => onChange('status', value as BannerStatus)}
                                options={statusOptions}
                                placeholder="Select status"
                                isOpen={showStatusDropdown}
                                onToggle={() => setShowStatusDropdown(!showStatusDropdown)}
                            />
                        </div>
                        <div>
                            <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2">
                                Display Order
                            </label>
                            <input
                                id="order"
                                type="number"
                                value={formData.order}
                                onChange={(e) => onChange('order', parseInt(e.target.value) || 0)}
                                min="0"
                                disabled={isLoading}
                                className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-4 sm:grid sm:grid-cols-1 md:grid-cols-2 sm:gap-6 sm:space-y-0">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Date
                            </label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowStartCalendar(!showStartCalendar)}
                                    disabled={isLoading}
                                    className="w-full px-3 py-3 sm:py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-base sm:text-sm"
                                >
                                    <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                                    <span className={formData.startDate ? 'text-gray-900' : 'text-gray-500'}>
                                        {formData.startDate ? format(formData.startDate, 'PPP') : 'Pick a date'}
                                    </span>
                                </button>
                                <DatePicker
                                    selectedDate={formData.startDate}
                                    onDateChange={(date) => onChange('startDate', date)}
                                    isOpen={showStartCalendar}
                                    onToggle={() => setShowStartCalendar(!showStartCalendar)}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Date
                            </label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowEndCalendar(!showEndCalendar)}
                                    disabled={isLoading}
                                    className="w-full px-3 py-3 sm:py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-base sm:text-sm"
                                >
                                    <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                                    <span className={formData.endDate ? 'text-gray-900' : 'text-gray-500'}>
                                        {formData.endDate ? format(formData.endDate, 'PPP') : 'Pick a date'}
                                    </span>
                                </button>
                                <DatePicker
                                    selectedDate={formData.endDate}
                                    onDateChange={(date) => onChange('endDate', date)}
                                    isOpen={showEndCalendar}
                                    onToggle={() => setShowEndCalendar(!showEndCalendar)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            type="button"
                            onClick={() => onChange('isActive', !formData.isActive)}
                            disabled={isLoading}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${formData.isActive ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                        <label className="text-sm font-medium text-gray-700">
                            Active
                        </label>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading || isUploading}
                        className="w-full sm:w-auto px-4 py-3 sm:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading || isUploading || !formData.image}
                        className="w-full sm:w-auto px-4 py-3 sm:py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
                    >
                        {isLoading ? 'Saving...' : (isEditing ? 'Update Banner' : 'Create Banner')}
                    </button>
                </div>
            </form>
        </div>
    )
}