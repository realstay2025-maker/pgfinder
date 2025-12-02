import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { MinusCircleIcon, PlusCircleIcon, PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';


const roomSharingOptions = ['single', 'double', 'triple', 'quad'];

const EditPropertyPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [propertyData, setPropertyData] = useState({
    title: '',
    description: '',
    address: { line1: '', city: '', state: '', zip: '' },
    roomTypes: [{ type: 'single', basePrice: '', availableCount: '' }],
  });
  
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPropertyData();
  }, [id]);

  const fetchPropertyData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get(`${API_URL}/${id}`, config);
      const property = res.data;
      
      setPropertyData({
        title: property.title || '',
        description: property.description || '',
        address: property.address || { line1: '', city: '', state: '', zip: '' },
        roomTypes: property.roomTypes || [{ type: 'single', basePrice: '', availableCount: '' }]
      });
      
    } catch (err) {
      console.error('Fetch property error:', err);
      setError('Failed to load property data');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files).slice(0, 5);
    setImages(selectedFiles);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setPropertyData({
        ...propertyData,
        [parent]: { ...propertyData[parent], [child]: value },
      });
    } else {
      setPropertyData({ ...propertyData, [name]: value });
    }
  };
  
  const handleRoomTypeChange = (index, field, value) => {
    const newRoomTypes = [...propertyData.roomTypes];
    newRoomTypes[index][field] = value;
    setPropertyData({ ...propertyData, roomTypes: newRoomTypes });
  };

  const addRoomType = () => {
    const usedTypes = propertyData.roomTypes.map(rt => rt.type);
    const nextType = roomSharingOptions.find(opt => !usedTypes.includes(opt));
    
    if (nextType) {
      setPropertyData({ 
        ...propertyData, 
        roomTypes: [...propertyData.roomTypes, { type: nextType, basePrice: '', availableCount: '' }] 
      });
    }
  };

  const removeRoomType = (index) => {
    const newRoomTypes = propertyData.roomTypes.filter((_, i) => i !== index);
    setPropertyData({ ...propertyData, roomTypes: newRoomTypes });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    
    formData.append('title', propertyData.title);
    formData.append('description', propertyData.description);
    formData.append('line1', propertyData.address.line1);
    formData.append('city', propertyData.address.city);
    formData.append('state', propertyData.address.state);
    formData.append('zip', propertyData.address.zip);
    formData.append('roomTypes', JSON.stringify(propertyData.roomTypes));

    if (images.length > 0) {
      images.forEach((file) => {
        formData.append('images', file);
      });
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`,
        },
      };

      await axios.put(`${API_URL}/${id}`, formData, config);
      
      setSuccess('Property updated successfully! Redirecting...');
      setTimeout(() => navigate('/owner/properties'), 1500);

    } catch (err) {
      console.error('Property update error:', err);
      setError(err.response?.data?.error || 'Failed to update property.');
    } finally {
      setLoading(false);
    }
  };
  
  const inputClass = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-primary-dark focus:border-primary-dark text-sm md:text-base";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-dark mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading property data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold text-primary-dark mb-4 md:mb-6 border-b pb-2">
        Edit Property Details
      </h1>
      <div className="max-w-4xl mx-auto bg-white p-4 md:p-6 lg:p-8 rounded-xl shadow-2xl">
        
        {error && <div className="bg-custom-red/10 border-l-4 border-custom-red text-custom-red p-3 mb-4 rounded text-sm">{error}</div>}
        {success && <div className="bg-accent-green/10 border-l-4 border-accent-green text-accent-green p-3 mb-4 rounded text-sm">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          
          {/* Basic Details */}
          <section className="border-b pb-4">
            <h2 className="text-lg md:text-xl font-semibold mb-3 text-gray-800">Basic Details</h2>
            <div className='space-y-4'>
              <div>
                <label htmlFor="title" className={labelClass}>Property Title <span className="text-custom-red">*</span></label>
                <input type="text" id="title" name="title" value={propertyData.title} onChange={handleInputChange} className={inputClass} required />
              </div>
              <div>
                <label htmlFor="description" className={labelClass}>Description / Amenities Overview</label>
                <textarea id="description" name="description" value={propertyData.description} onChange={handleInputChange} rows="3" className={inputClass}></textarea>
              </div>
            </div>
          </section>

          {/* Room Types */}
          <section className="border-b pb-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-2">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">Room Sharing Options & Pricing</h2>
              <button type="button" onClick={addRoomType} className="flex items-center text-primary-dark hover:text-blue-700 text-sm font-medium w-fit" disabled={propertyData.roomTypes.length >= roomSharingOptions.length}>
                <PlusCircleIcon className="w-4 h-4 md:w-5 md:h-5 mr-1" /> Add Option
              </button>
            </div>

            <div className='space-y-4'>
              {propertyData.roomTypes.map((roomType, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 bg-gray-50 p-3 md:p-4 rounded-lg border">
                  <div>
                    <label className={labelClass}>Sharing Type</label>
                    <select
                      value={roomType.type}
                      onChange={(e) => handleRoomTypeChange(index, 'type', e.target.value)}
                      className={inputClass}
                    >
                      {roomSharingOptions.map(opt => (
                        <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)} Sharing</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className={labelClass}>Base Price (₹/mo)</label>
                    <input
                      type="text"
                      placeholder="e.g., 8500"
                      value={roomType.basePrice}
                      onChange={(e) => handleRoomTypeChange(index, 'basePrice', e.target.value.replace(/[^0-9]/g, ''))}
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Rooms of this Type</label>
                    <input
                      type="text"
                      placeholder="e.g., 5"
                      value={roomType.availableCount}
                      onChange={(e) => handleRoomTypeChange(index, 'availableCount', e.target.value.replace(/[^0-9]/g, ''))}
                      className={inputClass}
                    />
                  </div>

                  <div className="flex items-end justify-start lg:justify-center">
                    <button
                      type="button"
                      onClick={() => removeRoomType(index)}
                      className="text-custom-red hover:text-red-700 flex items-center disabled:opacity-50 text-sm"
                      disabled={propertyData.roomTypes.length === 1}
                    >
                      <MinusCircleIcon className="w-4 h-4 md:w-5 md:h-5 mr-1" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          {/* Images */}
          <section className="border-b pb-4">
            <h2 className="text-lg md:text-xl font-semibold mb-3 text-gray-800 flex items-center">
              <PhotoIcon className="w-5 h-5 md:w-6 md:h-6 mr-2" /> Update Property Images (Optional)
            </h2>

            <div className="mb-4">
              <input
                type="file"
                name="images"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 p-2"
              />
              <p className="mt-1 text-xs text-gray-500">Select up to 5 new images to replace existing ones. Max size 5MB each.</p>
            </div>
            
            <div className="space-y-2">
              {images.map((file, index) => (
                <div key={file.name + index} className="flex items-center space-x-3 p-2 bg-gray-100 rounded">
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt={`Preview ${index + 1}`} 
                    className="w-12 h-9 md:w-16 md:h-12 object-cover rounded flex-shrink-0" 
                  />
                  <span className="text-xs md:text-sm truncate flex-grow min-w-0">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, i) => i !== index))}
                    className="text-custom-red hover:text-red-700 flex-shrink-0"
                  >
                    <TrashIcon className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
              ))}
              {images.length === 0 && <p className="text-gray-500 text-xs md:text-sm">No new images selected. Existing images will be kept.</p>}
            </div>
          </section>

          {/* Address */}
          <section className="border-b pb-4">
            <h2 className="text-lg md:text-xl font-semibold mb-3 text-gray-800">Address Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label htmlFor="line1" className={labelClass}>Address Line 1</label>
                <input type="text" id="line1" name="address.line1" value={propertyData.address.line1} onChange={handleInputChange} className={inputClass} required />
              </div>
              <div>
                <label htmlFor="city" className={labelClass}>City</label>
                <input type="text" id="city" name="address.city" value={propertyData.address.city} onChange={handleInputChange} className={inputClass} required />
              </div>
              <div>
                <label htmlFor="state" className={labelClass}>State</label>
                <input type="text" id="state" name="address.state" value={propertyData.address.state} onChange={handleInputChange} className={inputClass} required />
              </div>
              <div>
                <label htmlFor="zip" className={labelClass}>Zip/Postal Code</label>
                <input type="text" id="zip" name="address.zip" value={propertyData.address.zip} onChange={handleInputChange} className={inputClass} required />
              </div>
            </div>
          </section>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base md:text-lg font-medium text-white bg-accent-green hover:bg-green-600 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Updating...' : 'Update Property'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditPropertyPage;