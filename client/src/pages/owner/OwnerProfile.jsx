import React, { useState } from 'react';
import { UserIcon, DocumentCheckIcon, CogIcon, ShieldCheckIcon, KeyIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import OwnerKYCForm from './OwnerKYCForm';
import usePageTitle from '../../hooks/usePageTitle';

const OwnerProfile = () => {
    usePageTitle('My Profile');
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { id: 'profile', label: 'Profile', icon: UserIcon },
        { id: 'security', label: 'Security', icon: ShieldCheckIcon },
        { id: 'kyc', label: 'KYC', icon: DocumentCheckIcon }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
            {/* Header */}
            <div className="max-w-4xl mx-auto mb-8">
                <div className="text-center mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-lg">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">{user?.name}</h1>
                    <p className="text-gray-600 mb-4">{user?.email}</p>
                    <span className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium rounded-full shadow-lg">
                        🏠 PG Owner
                    </span>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-100">
                        <div className="flex space-x-2">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                                            activeTab === tab.id
                                                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                                                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                        }`}
                                    >
                                        <Icon className="w-5 h-5 mr-2" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto">
                {activeTab === 'profile' && (
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6">
                            <h2 className="text-2xl font-bold text-white flex items-center">
                                <UserIcon className="w-7 h-7 mr-3" />
                                Profile Information
                            </h2>
                        </div>
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                    <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                                        {user?.name}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                    <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                                        {user?.email}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                                    <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                                        PG Owner
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                                    <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-6">
                            <h2 className="text-2xl font-bold text-white flex items-center">
                                <ShieldCheckIcon className="w-7 h-7 mr-3" />
                                Security Settings
                            </h2>
                        </div>
                        <div className="p-8">
                            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <KeyIcon className="w-6 h-6 text-blue-600 mr-3" />
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Change Password</h3>
                                            <p className="text-sm text-gray-600">Update your password to keep your account secure</p>
                                        </div>
                                    </div>
                                    <Link to="/owner/change-password" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200">
                                        Change Password
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'kyc' && (
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6">
                            <h2 className="text-2xl font-bold text-white flex items-center">
                                <DocumentCheckIcon className="w-7 h-7 mr-3" />
                                KYC Verification
                            </h2>
                        </div>
                        <div className="">
                            <OwnerKYCForm />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OwnerProfile;