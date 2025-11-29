import React from 'react';
import { UserIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import ChangePassword from '../../components/ChangePassword';

const OwnerProfile = () => {
    const { user } = useAuth();

    return (
        <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2 flex items-center">
                    <UserIcon className="w-10 h-10 mr-3 text-purple-600" />
                    Profile Settings
                </h1>
                <p className="text-gray-600 text-lg">Manage your account settings and preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Profile Info */}
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <UserIcon className="w-6 h-6 mr-3 text-blue-600" />
                        Profile Information
                    </h2>
                    <div className="space-y-6">
                        <div className="flex items-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mr-6">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{user?.name}</h3>
                                <p className="text-gray-600">{user?.email}</p>
                                <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold rounded-full">
                                    🏠 PG OWNER
                                </span>
                            </div>
                        </div>
                        <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200">
                            Update Profile
                        </button>
                    </div>
                </div>

                {/* Change Password */}
                <ChangePassword />
            </div>
        </div>
    );
};

export default OwnerProfile;