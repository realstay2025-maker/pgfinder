import React, { useState } from 'react';
import { KeyIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ChangePassword = () => {
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
            return;
        }

        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/change-password`, {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            }, config);
            
            setMessage('Password changed successfully!');
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setMessage(err.response?.data?.error || 'Failed to change password');
        }
        setLoading(false);
    };

    return (
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <KeyIcon className="w-6 h-6 mr-3 text-blue-600" />
                Change Password
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                {['currentPassword', 'newPassword', 'confirmPassword'].map((field) => {
                    const fieldMap = { currentPassword: { label: 'Current Password', key: 'current' },
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
                                    minLength={field !== 'currentPassword' ? 8 : undefined}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 pr-12"
                                    placeholder={field === 'newPassword' ? 'Min 8 chars, uppercase, lowercase, number, special char' : undefined}
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility(fieldInfo.key)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                >
                                    {showPasswords[fieldInfo.key] ? 
                                        <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    );
                })}
                
                {message && (
                    <div className={`p-3 rounded-xl text-sm ${
                        message.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                        {message}
                    </div>
                )}
                
                <div className="text-xs text-gray-600 mb-4">
                    <strong>Password Requirements:</strong>
                    <ul className="list-disc list-inside mt-1">
                        <li>At least 8 characters long</li>
                        <li>One uppercase and one lowercase letter</li>
                        <li>One number and one special character (@$!%*?&)</li>
                    </ul>
                </div>
                
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
                >
                    {loading ? 'Changing...' : 'Change Password'}
                </button>
            </form>
        </div>
    );
};

export default ChangePassword;