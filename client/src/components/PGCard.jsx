// client/src/components/PGCard.jsx
import React from 'react';
import { StarIcon, MapPinIcon } from '@heroicons/react/24/solid';
import { WifiIcon, HomeModernIcon, SwatchIcon } from '@heroicons/react/24/outline';

const amenityIcons = {
  wifi: WifiIcon,
  food: HomeModernIcon,
  laundry: SwatchIcon,
  // Add more icons as needed
};

const PGCard = ({ name, price, location, rating, amenities, imageUrl, id }) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 transform hover:scale-[1.01]">
      <div className="relative h-48">
        <img
          className="w-full h-full object-cover"
          src={imageUrl}
          alt={name}
        />
        <div className="absolute top-0 right-0 bg-primary-dark text-white text-sm font-semibold p-2 rounded-bl-lg">
          No Broker
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-gray-900 truncate">{name}</h3>
          <div className="flex items-center text-yellow-500 font-semibold text-sm ml-2">
            <StarIcon className="w-5 h-5 mr-1" />
            {rating}
          </div>
        </div>
        <p className="flex items-center text-gray-500 mt-1 text-sm">
          <MapPinIcon className="w-4 h-4 mr-1 text-custom-red" />
          {location}
        </p>

        <div className="mt-3 flex items-center justify-between border-t pt-3">
          <div className="text-2xl font-extrabold text-primary-dark">
            ₹{price.toLocaleString()}<span className="text-base font-normal text-gray-500">/mo</span>
          </div>
          <div className="flex space-x-2">
            {amenities.map(key => {
              const Icon = amenityIcons[key];
              return Icon ? (
                <div key={key} className="p-1 border border-gray-200 rounded-full text-gray-600 tooltip">
                  <Icon className="w-5 h-5" title={key} />
                </div>
              ) : null;
            })}
          </div>
        </div>
        
        <button 
          className="mt-4 w-full bg-accent-green text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition duration-150"
          onClick={() => alert(`Contacting owner for ${name}`)}
        >
          Contact Owner
        </button>
      </div>
    </div>
  );
};

export default PGCard;