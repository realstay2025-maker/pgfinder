import React from 'react';

const amenityOptions = [
  { value: 'wifi', label: 'WiFi', icon: '📶' },
  { value: 'ac', label: 'Air Conditioning', icon: '❄️' },
  { value: 'parking', label: 'Parking', icon: '🚗' },
  { value: 'laundry', label: 'Laundry', icon: '👕' },
  { value: 'kitchen', label: 'Kitchen', icon: '🍳' },
  { value: 'gym', label: 'Gym', icon: '💪' },
  { value: 'security', label: '24/7 Security', icon: '🔒' },
  { value: 'power_backup', label: 'Power Backup', icon: '🔋' },
  { value: 'water_supply', label: '24/7 Water', icon: '💧' },
  { value: 'cleaning', label: 'Cleaning Service', icon: '🧹' }
];

const AmenitiesSection = ({ selectedAmenities = [], onAmenitiesChange }) => {
  const handleAmenityChange = (amenityValue, isChecked) => {
    const newAmenities = isChecked
      ? [...selectedAmenities, amenityValue]
      : selectedAmenities.filter(a => a !== amenityValue);
    onAmenitiesChange(newAmenities);
  };

  return (
    <section className="border-b pb-4">
      <h2 className="text-lg md:text-xl font-semibold mb-3 text-gray-800">Property Amenities</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {amenityOptions.map(amenity => (
          <label key={amenity.value} className="flex items-center space-x-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              checked={selectedAmenities.includes(amenity.value)}
              onChange={(e) => handleAmenityChange(amenity.value, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-lg">{amenity.icon}</span>
            <span className="text-sm font-medium">{amenity.label}</span>
          </label>
        ))}
      </div>
    </section>
  );
};

export default AmenitiesSection;