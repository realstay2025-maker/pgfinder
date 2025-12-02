import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon, CalendarIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const OwnerNotices = () => {
    const { user } = useAuth();
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNotice, setSelectedNotice] = useState(null);
    const [response, setResponse] = useState('');

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(`${API_ENDPOINTS.NOTICES}/owner`, config);
            setNotices(res.data);
        } catch (err) {
            console.error('Failed to fetch notices:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (noticeId, status) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${API_ENDPOINTS.NOTICES}/${noticeId}/status`, {
                status,
                ownerResponse: response
            }, config);
            
            alert(`Notice ${status} successfully!`);
            setSelectedNotice(null);
            setResponse('');
            fetchNotices();
        } catch (err) {
            alert('Failed to update notice status');
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-9xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                    Tenant Notices
                </h1>
                <p className="text-gray-600">Manage tenant leave notices and requests</p>
            </div>

            {notices.length === 0 ? (
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-12 text-center border border-white/20">
                    <ExclamationTriangleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No Notices</h3>
                    <p className="text-gray-500">No tenant notices have been submitted yet.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {notices.map((notice) => (
                        <div key={notice._id} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        {notice.tenantId?.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{notice.tenantId?.name}</h3>
                                        <p className="text-sm text-gray-600">{notice.tenantId?.phone}</p>
                                    </div>
                                </div>
                                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(notice.status)}`}>
                                    {notice.status.charAt(0).toUpperCase() + notice.status.slice(1)}
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-gray-500">Property:</span>
                                        <span className="text-sm font-semibold text-gray-900">{notice.propertyId?.title}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-gray-500">Room:</span>
                                        <span className="text-sm font-semibold text-gray-900">{notice.roomId?.roomNumber}</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <CalendarIcon className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm font-medium text-gray-500">Notice Date:</span>
                                        <span className="text-sm font-semibold text-gray-900">{new Date(notice.noticeDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <CalendarIcon className="w-4 h-4 text-red-600" />
                                        <span className="text-sm font-medium text-gray-500">Vacate Date:</span>
                                        <span className="text-sm font-semibold text-gray-900">{new Date(notice.vacateDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">Reason for Leaving:</p>
                                <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3">{notice.reason}</p>
                            </div>
                            
                            {notice.ownerResponse && (
                                <div className="mb-4">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Your Response:</p>
                                    <p className="text-sm text-gray-600 bg-blue-50 rounded-xl p-3">{notice.ownerResponse}</p>
                                </div>
                            )}
                            
                            {notice.status === 'pending' && (
                                <div className="flex gap-3 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => setSelectedNotice(notice)}
                                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 flex items-center justify-center shadow-lg"
                                    >
                                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => setSelectedNotice(notice)}
                                        className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 text-white py-3 rounded-xl font-semibold hover:from-red-700 hover:to-rose-700 transform hover:scale-105 transition-all duration-200 flex items-center justify-center shadow-lg"
                                    >
                                        <XCircleIcon className="w-5 h-5 mr-2" />
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Response Modal */}
            {selectedNotice && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white/90 backdrop-blur-lg rounded-3xl max-w-md w-full p-8 border border-white/20 shadow-2xl">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">
                            Respond to Notice
                        </h3>
                        
                        <div className="mb-4">
                            <p className="text-gray-600 mb-2">Tenant: <strong>{selectedNotice.tenantId?.name}</strong></p>
                            <p className="text-gray-600">Vacate Date: <strong>{new Date(selectedNotice.vacateDate).toLocaleDateString()}</strong></p>
                        </div>

                        <textarea
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            placeholder="Add your response (optional)..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 h-32 mb-6"
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => handleStatusUpdate(selectedNotice._id, 'approved')}
                                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-2xl font-semibold hover:from-green-700 hover:to-emerald-700"
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => handleStatusUpdate(selectedNotice._id, 'rejected')}
                                className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 text-white py-3 rounded-2xl font-semibold hover:from-red-700 hover:to-rose-700"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedNotice(null);
                                    setResponse('');
                                }}
                                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-2xl font-semibold hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerNotices;