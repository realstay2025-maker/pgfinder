import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ExclamationTriangleIcon, CalendarIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const TenantGiveNotice = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        vacateDate: '',
        reason: ''
    });
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasActiveNotice, setHasActiveNotice] = useState(false);

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(`${API_ENDPOINTS.NOTICES}/tenant`, config);
            setNotices(res.data);
            setHasActiveNotice(res.data.some(notice => notice.status === 'pending'));
        } catch (err) {
            console.error('Failed to fetch notices:', err);
        }
    };

    const canSubmitNotice = () => {
        const today = new Date();
        return today.getDate() <= 5;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`${API_ENDPOINTS.NOTICES}/submit`, formData, config);
            alert('Notice submitted successfully!');
            setFormData({ vacateDate: '', reason: '' });
            fetchNotices();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to submit notice');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            case 'approved': return 'text-green-600 bg-green-100';
            case 'rejected': return 'text-red-600 bg-red-100';
            case 'revoked': return 'text-gray-600 bg-gray-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const handleRevokeNotice = async (noticeId) => {
        if (!window.confirm('Are you sure you want to revoke this notice?')) return;
        
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${API_ENDPOINTS.NOTICES}/${noticeId}/revoke`, {}, config);
            alert('Notice revoked successfully!');
            fetchNotices();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to revoke notice');
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
                    Give Notice to Leave PG
                </h1>
                <p className="text-gray-600">Submit your notice to vacate the PG accommodation</p>
            </div>

            {!hasActiveNotice && canSubmitNotice() ? (
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20 mb-8">
                    <div className="flex items-center mb-6">
                        <ExclamationTriangleIcon className="w-8 h-8 text-orange-500 mr-3" />
                        <h2 className="text-2xl font-bold text-gray-900">Submit Notice</h2>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <CalendarIcon className="w-4 h-4 inline mr-2" />
                                Intended Vacate Date
                            </label>
                            <input
                                type="date"
                                value={formData.vacateDate}
                                onChange={(e) => setFormData({...formData, vacateDate: e.target.value})}
                                min={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">Minimum 30 days notice required</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <DocumentTextIcon className="w-4 h-4 inline mr-2" />
                                Reason for Leaving
                            </label>
                            <textarea
                                value={formData.reason}
                                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                                placeholder="Please provide reason for leaving..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 h-32"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-4 rounded-2xl font-semibold hover:from-red-700 hover:to-orange-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Submit Notice'}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8">
                    <div className="flex items-center">
                        <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 mr-3" />
                        <p className="text-yellow-800 font-medium">
                            {hasActiveNotice 
                                ? 'You have an active notice pending. Please wait for owner\'s response.'
                                : 'Notice can only be submitted during the first 5 days of the month.'
                            }
                        </p>
                    </div>
                </div>
            )}

            {/* Notice History */}
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Notice History</h2>
                
                {notices.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No notices submitted yet</p>
                ) : (
                    <div className="space-y-4">
                        {notices.map((notice) => (
                            <div key={notice._id} className="border border-gray-200 rounded-2xl p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            Notice Date: {new Date(notice.noticeDate).toLocaleDateString()}
                                        </p>
                                        <p className="text-gray-600">
                                            Vacate Date: {new Date(notice.vacateDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(notice.status)}`}>
                                        {notice.status.charAt(0).toUpperCase() + notice.status.slice(1)}
                                    </span>
                                </div>
                                
                                <div className="mb-4">
                                    <p className="text-sm font-medium text-gray-700 mb-1">Reason:</p>
                                    <p className="text-gray-600">{notice.reason}</p>
                                </div>
                                
                                {notice.ownerResponse && (
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-sm font-medium text-gray-700 mb-1">Owner Response:</p>
                                        <p className="text-gray-600">{notice.ownerResponse}</p>
                                    </div>
                                )}
                                
                                {notice.status === 'pending' && (
                                    <div className="mt-4">
                                        <button
                                            onClick={() => handleRevokeNotice(notice._id)}
                                            className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-2 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transform hover:scale-105 transition-all duration-200"
                                        >
                                            Revoke Notice
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TenantGiveNotice;