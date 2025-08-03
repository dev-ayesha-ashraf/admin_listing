import React, { useState } from "react";
import { commonStyles } from "../../lib/styles/common";

interface Property {
    id: number;
    key: string;
    value: string;
}

interface PropertyManagerProps {
    properties: Property[];
    onPropertiesChange: (properties: Property[]) => void;
    disabled?: boolean;
}

const PropertyManager: React.FC<PropertyManagerProps> = ({
    properties,
    onPropertiesChange,
    disabled = false,
}) => {
    const [propertyKey, setPropertyKey] = useState("");
    const [propertyValue, setPropertyValue] = useState("");
    const [editPropertyId, setEditPropertyId] = useState<number | null>(null);

    const handleAddOrUpdateProperty = () => {
        if (!propertyKey.trim() || !propertyValue.trim()) {
            alert("Property key and value cannot be empty");
            return;
        }

        if (editPropertyId !== null) {
            onPropertiesChange(
                properties.map((prop) =>
                    prop.id === editPropertyId
                        ? { ...prop, key: propertyKey.trim(), value: propertyValue.trim() }
                        : prop
                )
            );
            setEditPropertyId(null);
        } else {
            const newProp: Property = {
                id: Date.now(),
                key: propertyKey.trim(),
                value: propertyValue.trim(),
            };
            onPropertiesChange([...properties, newProp]);
        }
        setPropertyKey("");
        setPropertyValue("");
    };

    const handleEditProperty = (id: number) => {
        const prop = properties.find((p) => p.id === id);
        if (prop) {
            setPropertyKey(prop.key);
            setPropertyValue(prop.value);
            setEditPropertyId(id);
        }
    };

    const handleDeleteProperty = (id: number) => {
        onPropertiesChange(properties.filter((p) => p.id !== id));
        if (editPropertyId === id) {
            setEditPropertyId(null);
            setPropertyKey("");
            setPropertyValue("");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Property Key"
                    value={propertyKey}
                    onChange={(e) => setPropertyKey(e.target.value)}
                    className={commonStyles.input}
                    disabled={disabled}
                />
                <input
                    type="text"
                    placeholder="Property Value"
                    value={propertyValue}
                    onChange={(e) => setPropertyValue(e.target.value)}
                    className={commonStyles.input}
                    disabled={disabled}
                />
                <button
                    type="button"
                    onClick={handleAddOrUpdateProperty}
                    className={commonStyles.button.primary}
                    disabled={disabled}
                >
                    {editPropertyId !== null ? "Update" : "Add"}
                </button>
                {editPropertyId !== null && (
                    <button
                        type="button"
                        onClick={() => {
                            setEditPropertyId(null);
                            setPropertyKey("");
                            setPropertyValue("");
                        }}
                        className={commonStyles.button.secondary}
                        disabled={disabled}
                    >
                        Cancel
                    </button>
                )}
            </div>

            {properties.length === 0 ? (
                <p className="text-gray-500 italic">No properties added.</p>
            ) : (
                <div className="space-y-2">
                    {properties.map(({ id, key, value }) => (
                        <div key={id} className={commonStyles.listItem}>
                            <span className="text-gray-700">
                                <strong>{key}:</strong> {value}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEditProperty(id)}
                                    className={commonStyles.button.secondary}
                                    disabled={disabled}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteProperty(id)}
                                    className={commonStyles.button.danger}
                                    disabled={disabled}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PropertyManager; 