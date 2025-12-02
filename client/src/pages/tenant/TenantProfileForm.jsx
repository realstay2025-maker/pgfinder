// client/src/pages/tenant/TenantProfileForm.jsx
import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { 
    UserIcon, 
    PhoneIcon, 
    MapPinIcon, 
    BriefcaseIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    DocumentTextIcon,
    CameraIcon,
    IdentificationIcon
} from '@heroicons/react/24/outline';
import ChangePassword from '../../components/ChangePassword';

const TenantProfileForm = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState({
        pgName: '',
        phone: '',
        address: '',
        permanentAddress: '',
        emergencyContact: '',
        occupation: '',
        occupationType: 'working', // working or student
        aadhaarNumber: '',
        companyName: '',
        collegeName: ''
    });
    const [files, setFiles] = useState({
        aadhaarCard: null,
        photo: null
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(`${API_ENDPOINTS.TENANT}/profile`, config);
            setProfile({
                pgName: res.data.pgName || user?.pgName || '',
                phone: res.data.phone || '',
                address: res.data.address || '',
                permanentAddress: res.data.permanentAddress || '',
                emergencyContact: res.data.emergencyContact || '',
                occupation: res.data.occupation || '',
                occupationType: res.data.occupationType || 'working',
                aadhaarNumber: res.data.aadhaarNumber || '',
                companyName: res.data.companyName || '',
                collegeName: res.data.collegeName || ''
            });
            setIsCompleted(res.data.profileCompleted);
        } catch (err) {
            console.error('Failed to fetch profile:', err);
        }
    };

    const validateForm = () => {
        const errors = [];
        
        // Phone validation
        if (!profile.phone || !/^[6-9]\d{9}$/.test(profile.phone)) {
            errors.push('Please enter a valid 10-digit Indian mobile number');
        }
        
        // Aadhaar validation
        if (!profile.aadhaarNumber || profile.aadhaarNumber.length !== 12) {
            errors.push('Aadhaar number must be exactly 12 digits');
        }
        
        // Emergency contact validation
        if (!profile.emergencyContact || !/^[6-9]\d{9}$/.test(profile.emergencyContact)) {
            errors.push('Please enter a valid emergency contact number');
        }
        
        // Address validation
        if (!profile.address || profile.address.trim().length < 10) {
            errors.push('Current address must be at least 10 characters');
        }
        
        if (!profile.permanentAddress || profile.permanentAddress.trim().length < 10) {
            errors.push('Permanent address must be at least 10 characters');
        }
        
        // Occupation type specific validation
        if (profile.occupationType === 'working' && (!profile.companyName || profile.companyName.trim().length < 2)) {
            errors.push('Company name is required for working professionals');
        }
        
        if (profile.occupationType === 'student' && (!profile.collegeName || profile.collegeName.trim().length < 2)) {
            errors.push('College/University name is required for students');
        }
        
        // File validation
        if (!files.aadhaarCard) {
            errors.push('Aadhaar card document is required');
        }
        
        if (!files.photo) {
            errors.push('Profile photo is required');
        }
        
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            setMessage(validationErrors.join('. '));
            return;
        }
        
        setLoading(true);
        setMessage('');

        try {
            const formData = new FormData();
            
            // Append profile data
            Object.keys(profile).forEach(key => {
                formData.append(key, profile[key]);
            });
            
            // Append files
            if (files.aadhaarCard) {
                formData.append('aadhaarCard', files.aadhaarCard);
            }
            if (files.photo) {
                formData.append('photo', files.photo);
            }

            const config = { 
                headers: { 
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data'
                } 
            };
            const res = await axios.put(`${API_ENDPOINTS.TENANT}/profile`, formData, config);
            
            setMessage('Profile updated successfully!');
            setIsCompleted(res.data.profileCompleted);
            
            if (res.data.profileCompleted) {
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        } catch (err) {
            setMessage(err.response?.data?.error || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const { name, files: selectedFiles } = e.target;
        if (selectedFiles && selectedFiles[0]) {
            const file = selectedFiles[0];
            
            // Check file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                setMessage('File size must be less than 5MB');
                return;
            }
            
            // Check file type
            if (name === 'aadhaarCard') {
                const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
                if (!validTypes.includes(file.type)) {
                    setMessage('Aadhaar card must be an image (JPG, PNG) or PDF file');
                    return;
                }
            } else if (name === 'photo') {
                const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
                if (!validTypes.includes(file.type)) {
                    setMessage('Photo must be an image file (JPG, PNG)');
                    return;
                }
            }
            
            setFiles({ ...files, [name]: file });
            setMessage(''); // Clear any previous error
        }
    };

    return (
        <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-lg">
                <div className="flex items-center mb-6">
                    <UserIcon className="w-8 h-8 text-emerald-600 mr-3" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Complete Your Profile</h2>
                        <p className="text-gray-600">Fill in your details to enroll in PG services</p>
                    </div>
                </div>

                {!isCompleted && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                        <div className="flex">
                            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 mr-2" />
                            <p className="text-yellow-800 text-sm">
                                Please complete your profile to be eligible for PG assignment by owners.
                            </p>
                        </div>
                    </div>
                )}

                {isCompleted && (
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
                        <div className="flex">
                            <CheckCircleIcon className="w-5 h-5 text-green-400 mr-2" />
                            <p className="text-green-800 text-sm">
                                Profile completed! You are now eligible for PG assignment.
                            </p>
                        </div>
                    </div>
                )}

                {message && (
                    <div className={`p-4 mb-6 rounded-md ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <MapPinIcon className="w-4 h-4 inline mr-1" />
                            Selected PG
                        </label>
                        <div className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
                            {profile.pgName || 'Not selected'}
                        </div>
                    </div>

                    {/* Photo Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <CameraIcon className="w-4 h-4 inline mr-1" />
                            Profile Photo
                        </label>
                        <input
                            type="file"
                            name="photo"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                        {files.photo && (
                            <p className="text-sm text-green-600 mt-1">Selected: {files.photo.name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <PhoneIcon className="w-4 h-4 inline mr-1" />
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={profile.phone}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, ''); // Only digits
                                if (value.length <= 10) {
                                    setProfile({ ...profile, phone: value });
                                }
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="Enter 10-digit mobile number"
                            maxLength="10"
                            required
                        />
                        {profile.phone && (profile.phone.length !== 10 || !/^[6-9]/.test(profile.phone)) && (
                            <p className="text-sm text-red-600 mt-1">Enter valid 10-digit mobile number starting with 6-9</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <MapPinIcon className="w-4 h-4 inline mr-1" />
                            Current Address
                        </label>
                        <textarea
                            name="address"
                            value={profile.address}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="Enter your current address"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <PhoneIcon className="w-4 h-4 inline mr-1" />
                            Emergency Contact
                        </label>
                        <input
                            type="tel"
                            name="emergencyContact"
                            value={profile.emergencyContact}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, ''); // Only digits
                                if (value.length <= 10) {
                                    setProfile({ ...profile, emergencyContact: value });
                                }
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="Enter 10-digit emergency contact"
                            maxLength="10"
                            required
                        />
                        {profile.emergencyContact && (profile.emergencyContact.length !== 10 || !/^[6-9]/.test(profile.emergencyContact)) && (
                            <p className="text-sm text-red-600 mt-1">Enter valid 10-digit number starting with 6-9</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <MapPinIcon className="w-4 h-4 inline mr-1" />
                            Permanent Address
                        </label>
                        <textarea
                            name="permanentAddress"
                            value={profile.permanentAddress}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="Enter your permanent address"
                            required
                        />
                    </div>

                    {/* Aadhaar Details */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <IdentificationIcon className="w-4 h-4 inline mr-1" />
                            Aadhaar Number
                        </label>
                        <input
                            type="text"
                            name="aadhaarNumber"
                            value={profile.aadhaarNumber}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                                if (value.length <= 12) {
                                    setProfile({ ...profile, aadhaarNumber: value });
                                }
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="Enter 12-digit Aadhaar number"
                            maxLength="12"
                            pattern="[0-9]{12}"
                            required
                        />
                        {profile.aadhaarNumber && profile.aadhaarNumber.length !== 12 && (
                            <p className="text-sm text-red-600 mt-1">Aadhaar number must be exactly 12 digits</p>
                        )}
                    </div>

                    {/* Aadhaar Card Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <DocumentTextIcon className="w-4 h-4 inline mr-1" />
                            Aadhaar Card (PDF/Image)
                        </label>
                        <input
                            type="file"
                            name="aadhaarCard"
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            required
                        />
                        {files.aadhaarCard && (
                            <p className="text-sm text-green-600 mt-1">Selected: {files.aadhaarCard.name}</p>
                        )}
                    </div>

                    {/* Occupation Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <BriefcaseIcon className="w-4 h-4 inline mr-1" />
                            Occupation Type
                        </label>
                        <select
                            name="occupationType"
                            value={profile.occupationType}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            required
                        >
                            <option value="working">Working Professional</option>
                            <option value="student">Student</option>
                        </select>
                    </div>

                    {/* Conditional Fields based on Occupation Type */}
                    {profile.occupationType === 'working' ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <BriefcaseIcon className="w-4 h-4 inline mr-1" />
                                Company Name
                            </label>
                            <input
                                type="text"
                                name="companyName"
                                value={profile.companyName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                placeholder="Enter your company name"
                                required
                            />
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <BriefcaseIcon className="w-4 h-4 inline mr-1" />
                                College/University Name
                            </label>
                            <input
                                type="text"
                                name="collegeName"
                                value={profile.collegeName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                placeholder="Enter your college/university name"
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <BriefcaseIcon className="w-4 h-4 inline mr-1" />
                            Job Title/Course
                        </label>
                        <input
                            type="text"
                            name="occupation"
                            value={profile.occupation}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder={profile.occupationType === 'working' ? 'Your job title/designation' : 'Your course/field of study'}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 transition-colors font-medium"
                    >
                        {loading ? 'Updating...' : isCompleted ? 'Update Profile' : 'Complete Profile'}
                    </button>
                </form>
            </div>
            
            {/* Change Password */}
            <ChangePassword />
            </div>
        </div>
    );
};

export default TenantProfileForm;