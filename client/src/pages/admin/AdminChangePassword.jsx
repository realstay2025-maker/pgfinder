import React, { useState } from 'react';
import { KeyIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import usePageTitle from '../../hooks/usePageTitle';

const AdminChangePassword = () => {
    usePageTitle('Change Password');
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.newPassword !== formData.confirmPassword) {
            setMessage('New passwords do not match');
            setMessageType('error');
            return;
        }

        // Enhanced password validation
        const passwordErrors = [];
        if (formData.newPassword.length < 8) {
            passwordErrors.push('at least 8 characters');
        }
        if (!/(?=.*[a-z])/.test(formData.newPassword)) {
            passwordErrors.push('one lowercase letter');
        }
        if (!/(?=.*[A-Z])/.test(formData.newPassword)) {
            passwordErrors.push('one uppercase letter');
        }
        if (!/(?=.*\d)/.test(formData.newPassword)) {
            passwordErrors.push('one number');
        }
        if (!/(?=.*[@$!%*?&])/.test(formData.newPassword)) {
            passwordErrors.push('one special character (@$!%*?&)');
        }
        
        if (passwordErrors.length > 0) {
            setMessage(`Password must contain: ${passwordErrors.join(', ')}`);
            setMessageType('error');
            return;
        }

        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${API_ENDPOINTS.AUTH}/change-password`, {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            }, config);
            
            setMessage('Password changed successfully!');
            setMessageType('success');
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            
            // Clear message after 3 seconds
            setTimeout(() => {
                setMessage('');
                setMessageType('');
            }, 3000);
        } catch (err) {
            setMessage(err.response?.data?.error || 'Failed to change password');
            setMessageType('error');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-20 pb-10 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-lg">
                    <div className="flex items-center mb-6">
                        <KeyIcon className="w-8 h-8 mr-3 text-blue-600" />
                        <h1 className="text-3xl font-bold text-gray-900">Change Password</h1>
                    </div>
                    
                    <p className="text-gray-600 mb-6">Update your password to keep your account secure.</p>
                    
                    {message && (
                        <div className={`mb-6 p-4 rounded-lg ${messageType === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                            {message}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {['currentPassword', 'newPassword', 'confirmPassword'].map((field) => {
                            const fieldMap = {
                                currentPassword: { label: 'Current Password', key: 'current' },
                                newPassword: { label: 'New Password', key: 'new' },
                                confirmPassword: { label: 'Confirm New Password', key: 'confirm' }
                            };

                            const fieldInfo = fieldMap[field];
                            
                            return (
                                <div key={field} className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {fieldInfo.label}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords[fieldInfo.key] ? 'text' : 'password'}
                                            name={field}
                                            value={formData[field]}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                            placeholder={`Enter your ${fieldInfo.label.toLowerCase()}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility(fieldInfo.key)}
                                            className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                                        >
                                            {showPasswords[fieldInfo.key] ? (
                                                <EyeSlashIcon className="w-5 h-5" />
                                            ) : (
                                                <EyeIcon className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        <div className="bg-blue-50 rounded-lg p-4 mt-6 border border-blue-200">
                            <h3 className="font-semibold text-blue-900 mb-2">Password Requirements:</h3>
                            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                                <li>Minimum 8 characters</li>
                                <li>At least one uppercase letter (A-Z)</li>
                                <li>At least one lowercase letter (a-z)</li>
                                <li>At least one number (0-9)</li>
                                <li>At least one special character (@$!%*?&)</li>
                            </ul>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-8 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            {loading ? 'Updating...' : 'Change Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminChangePassword;
