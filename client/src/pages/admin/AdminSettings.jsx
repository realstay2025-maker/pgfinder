import React, { useState } from 'react';
import { CogIcon, BellIcon, ShieldCheckIcon, CircleStackIcon, UserIcon, KeyIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { THEME } from '../../config/theme';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const AdminSettings = () => {
    const { user } = useAuth();
    const [settings, setSettings] = useState({
        notifications: {
            emailNotifications: true,
            pushNotifications: false,
            weeklyReports: true
        },
        security: {
            twoFactorAuth: false,
            sessionTimeout: '30',
            passwordExpiry: '90'
        },
        system: {
            maintenanceMode: false,
            autoBackup: true,
            backupFrequency: 'daily'
        }
    });

    const handleToggle = (section, key) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: !prev[section][key]
            }
        }));
    };

    const handleChange = (section, key, value) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value
            }
        }));
    };

    const handleSaveSettings = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${API_ENDPOINTS.ADMIN}/settings`, settings, config);
            alert('Settings saved successfully!');
        } catch (err) {
            alert('Failed to save settings: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="p-6 min-h-screen" style={{backgroundColor: '#f8fafc'}}>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2 flex items-center" style={{color: THEME.primary.base}}>
                    <CogIcon className="w-10 h-10 mr-3" style={{color: THEME.secondary.base}} />
                    Admin Settings
                </h1>
                <p className="text-gray-600 text-lg">Configure system settings and preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {/* Profile Settings */}
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <UserIcon className="w-6 h-6 mr-3 text-blue-600" />
                        Profile Settings
                    </h2>
                    <div className="space-y-6">
                        <div className="flex items-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mr-6">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{user?.name}</h3>
                                <p className="text-gray-600">{user?.email}</p>
                                <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold rounded-full">
                                    🔥 SUPER ADMIN
                                </span>
                            </div>
                        </div>
                        <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200">
                            Update Profile
                        </button>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <BellIcon className="w-6 h-6 mr-3 text-green-600" />
                        Notifications
                    </h2>
                    <div className="space-y-4">
                        {[
                            { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email' },
                            { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser push notifications' },
                            { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Weekly system reports' }
                        ].map(({ key, label, desc }) => (
                            <div key={key} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-100">
                                <div>
                                    <h4 className="font-semibold text-gray-900">{label}</h4>
                                    <p className="text-sm text-gray-600">{desc}</p>
                                </div>
                                <button
                                    onClick={() => handleToggle('notifications', key)}
                                    className={`w-12 h-6 rounded-full transition-colors ${
                                        settings.notifications[key] ? 'bg-green-500' : 'bg-gray-300'
                                    }`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                                        settings.notifications[key] ? 'translate-x-6' : 'translate-x-0.5'
                                    }`} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Security Settings */}
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <ShieldCheckIcon className="w-6 h-6 mr-3 text-red-600" />
                        Security
                    </h2>
                    <div className="space-y-6">
                        <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-100">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-gray-900">Two-Factor Authentication</h4>
                                <button
                                    onClick={() => handleToggle('security', 'twoFactorAuth')}
                                    className={`w-12 h-6 rounded-full transition-colors ${
                                        settings.security.twoFactorAuth ? 'bg-red-500' : 'bg-gray-300'
                                    }`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                                        settings.security.twoFactorAuth ? 'translate-x-6' : 'translate-x-0.5'
                                    }`} />
                                </button>
                            </div>
                            <p className="text-sm text-gray-600">Add extra security to your account</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                                <select
                                    value={settings.security.sessionTimeout}
                                    onChange={(e) => handleChange('security', 'sessionTimeout', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500"
                                >
                                    <option value="15">15 minutes</option>
                                    <option value="30">30 minutes</option>
                                    <option value="60">1 hour</option>
                                    <option value="120">2 hours</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Password Expiry (days)</label>
                                <select
                                    value={settings.security.passwordExpiry}
                                    onChange={(e) => handleChange('security', 'passwordExpiry', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500"
                                >
                                    <option value="30">30 days</option>
                                    <option value="60">60 days</option>
                                    <option value="90">90 days</option>
                                    <option value="never">Never</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Settings */}
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <CircleStackIcon className="w-6 h-6 mr-3 text-purple-600" />
                        System
                    </h2>
                    <div className="space-y-6">
                        <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-100">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-gray-900">Maintenance Mode</h4>
                                <button
                                    onClick={() => handleToggle('system', 'maintenanceMode')}
                                    className={`w-12 h-6 rounded-full transition-colors ${
                                        settings.system.maintenanceMode ? 'bg-yellow-500' : 'bg-gray-300'
                                    }`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                                        settings.system.maintenanceMode ? 'translate-x-6' : 'translate-x-0.5'
                                    }`} />
                                </button>
                            </div>
                            <p className="text-sm text-gray-600">Put system in maintenance mode</p>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl border border-blue-100">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-gray-900">Auto Backup</h4>
                                <button
                                    onClick={() => handleToggle('system', 'autoBackup')}
                                    className={`w-12 h-6 rounded-full transition-colors ${
                                        settings.system.autoBackup ? 'bg-blue-500' : 'bg-gray-300'
                                    }`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                                        settings.system.autoBackup ? 'translate-x-6' : 'translate-x-0.5'
                                    }`} />
                                </button>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">Automatically backup system data</p>
                            {settings.system.autoBackup && (
                                <select
                                    value={settings.system.backupFrequency}
                                    onChange={(e) => handleChange('system', 'backupFrequency', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="hourly">Hourly</option>
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                </select>
                            )}
                        </div>
                    </div>
                </div>

                {/* Change Password */}
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-lg flex flex-col justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <KeyIcon className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Change Password</h2>
                        <p className="text-gray-600 mb-6">Update your password to keep your account secure</p>
                        <Link to="/admin/change-password" className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200">
                            Change Password
                        </Link>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 text-center">
                <button 
                    onClick={handleSaveSettings}
                    className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-12 py-4 rounded-2xl font-bold text-lg hover:from-green-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                    💾 Save All Settings
                </button>
            </div>
        </div>
    );
};

export default AdminSettings;