import React, { useState, useEffect } from 'react';
import { commonStyles } from '../../lib/styles/common';

interface SimpleEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (newValue: string) => void;
    title: string;
    initialValue: string;
    confirmText?: string;
    cancelText?: string;
    inputLabel?: string;
}

const SimpleEditModal: React.FC<SimpleEditModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    initialValue,
    confirmText = 'Save',
    cancelText = 'Cancel',
    inputLabel = 'Name'
}) => {
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        if (isOpen) {
            setValue(initialValue);
        }
    }, [isOpen, initialValue]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (value.trim() && value !== initialValue) {
            onConfirm(value.trim());
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
                <h3 className={commonStyles.heading.h3}>{title}</h3>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {inputLabel}
                        </label>
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className={commonStyles.input}
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className={commonStyles.button.secondary}
                        >
                            {cancelText}
                        </button>
                        <button
                            type="submit"
                            className={commonStyles.button.primary}
                        >
                            {confirmText}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SimpleEditModal; 