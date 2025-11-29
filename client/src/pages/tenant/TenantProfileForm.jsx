// client/src/pages/tenant/TenantProfileForm.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { 
    UserIcon, 
    PhoneIcon, 
    MapPinIcon, 
    BriefcaseIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import ChangePassword from '../../components/ChangePassword';

const TenantProfileForm = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState({
        pgName: '',
        phone: '',
        address: '',
        emergencyContact: '',
        occupation: ''
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
            const res = await axios.get('http://localhost:5000/api/tenant/profile', config);
            setProfile({
                pgName: res.data.pgName || user?.pgName || '',
                phone: res.data.phone || '',
                address: res.data.address || '',
                emergencyContact: res.data.emergencyContact || '',
                occupation: res.data.occupation || ''
            });
            setIsCompleted(res.data.profileCompleted);
        } catch (err) {
            console.error('Failed to fetch profile:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.put('http://localhost:5000/api/tenant/profile', profile, config);
            
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

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <PhoneIcon className="w-4 h-4 inline mr-1" />
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={profile.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="Enter your phone number"
                            required
                        />
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
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="Emergency contact number"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <BriefcaseIcon className="w-4 h-4 inline mr-1" />
                            Occupation
                        </label>
                        <input
                            type="text"
                            name="occupation"
                            value={profile.occupation}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="Your occupation/profession"
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