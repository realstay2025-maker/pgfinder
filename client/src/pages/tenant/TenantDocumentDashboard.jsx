// client/src/pages/tenant/TenantDocumentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import axios from 'axios';
import { DocumentTextIcon, ArrowDownTrayIcon, EyeIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const TenantDocumentsDashboard = () => {
    const { user } = useAuth();
    const [documents, setDocuments] = useState([]);
    const [leaseInfo, setLeaseInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            
            // Fetch tenant profile to get current data
            const profileRes = await axios.get(`${API_ENDPOINTS.TENANT}/profile`, config);
            const profile = profileRes.data;
            
            setLeaseInfo({
                propertyName: profile.pgName || 'Not Assigned',
                roomNumber: profile.roomNumber || 'Not Assigned',
                monthlyRent: profile.monthlyRent || 0,
                securityDeposit: profile.securityDeposit || 0
            });
            
            setDocuments([]);
        } catch (err) {
            console.error('Failed to fetch documents:', err);
            setLeaseInfo({
                propertyName: 'Not Available',
                roomNumber: 'Not Available',
                monthlyRent: 0,
                securityDeposit: 0
            });
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString();
    const formatCurrency = (amount) => `₹${new Intl.NumberFormat('en-IN').format(amount)}`;

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="h-32 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <DocumentTextIcon className="w-8 h-8 mr-2 text-emerald-600" />
                Documents & Lease
            </h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <CalendarIcon className="w-6 h-6 mr-2 text-emerald-600" />
                        Lease Details
                    </h2>
                    {leaseInfo && (
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Property:</span>
                                <span className="font-medium">{leaseInfo.propertyName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Room:</span>
                                <span className="font-medium">{leaseInfo.roomNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Monthly Rent:</span>
                                <span className="font-medium text-emerald-600">{formatCurrency(leaseInfo.monthlyRent)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Security Deposit:</span>
                                <span className="font-medium">{formatCurrency(leaseInfo.securityDeposit)}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Documents</h2>
                    <div className="space-y-3">
                        {documents.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                                <div className="flex items-center">
                                    <DocumentTextIcon className="w-6 h-6 text-gray-400 mr-3" />
                                    <div>
                                        <div className="font-medium text-gray-900">{doc.name}</div>
                                        <div className="text-sm text-gray-500">{doc.size}</div>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button className="text-emerald-600 hover:text-emerald-900">
                                        <EyeIcon className="w-5 h-5" />
                                    </button>
                                    <button className="text-blue-600 hover:text-blue-900">
                                        <ArrowDownTrayIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TenantDocumentsDashboard;