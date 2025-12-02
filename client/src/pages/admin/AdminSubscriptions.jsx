import React, { useState, useEffect } from 'react';
import { CreditCardIcon, UserIcon, CalendarIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const AdminSubscriptions = () => {
    const { user } = useAuth();
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(`${API_ENDPOINTS.ADMIN}/subscriptions`, config);
            setSubscriptions(res.data);
        } catch (err) {
            console.error('Failed to fetch subscriptions:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateSubscriptionStatus = async (subscriptionId, status) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${API_ENDPOINTS.ADMIN}/subscriptions/${subscriptionId}`, { status }, config);
            fetchSubscriptions();
            alert(`Subscription ${status} successfully!`);
        } catch (err) {
            alert('Failed to update subscription');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'text-green-600 bg-green-100';
            case 'expired': return 'text-red-600 bg-red-100';
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2 flex items-center">
                    <CreditCardIcon className="w-8 h-8 mr-3 text-purple-600" />
                    Subscription Management
                </h1>
                <p className="text-gray-600">Manage PG owner subscriptions and billing</p>
            </div>

            <div className="grid gap-6">
                {subscriptions.map((subscription) => (
                    <div key={subscription._id} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                    {subscription.ownerId?.name?.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{subscription.ownerId?.name}</h3>
                                    <p className="text-sm text-gray-600">{subscription.ownerId?.email}</p>
                                </div>
                            </div>
                            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(subscription.status)}`}>
                                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-500">Plan:</span>
                                    <span className="text-sm font-semibold text-gray-900">{subscription.plan}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-500">Amount:</span>
                                    <span className="text-sm font-semibold text-gray-900">₹{subscription.amount}</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <CalendarIcon className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-medium text-gray-500">Start Date:</span>
                                    <span className="text-sm font-semibold text-gray-900">{new Date(subscription.startDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <CalendarIcon className="w-4 h-4 text-red-600" />
                                    <span className="text-sm font-medium text-gray-500">End Date:</span>
                                    <span className="text-sm font-semibold text-gray-900">{new Date(subscription.endDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-500">Properties:</span>
                                    <span className="text-sm font-semibold text-gray-900">{subscription.ownerId?.ownerProfile?.pgCount || 0}</span>
                                </div>
                            </div>
                        </div>
                        
                        {subscription.status === 'pending' && (
                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => updateSubscriptionStatus(subscription._id, 'active')}
                                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 flex items-center justify-center"
                                >
                                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                                    Activate
                                </button>
                                <button
                                    onClick={() => updateSubscriptionStatus(subscription._id, 'expired')}
                                    className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 text-white py-3 rounded-xl font-semibold hover:from-red-700 hover:to-rose-700 flex items-center justify-center"
                                >
                                    <XCircleIcon className="w-5 h-5 mr-2" />
                                    Reject
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {subscriptions.length === 0 && (
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-12 text-center border border-white/20">
                    <CreditCardIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No Subscriptions</h3>
                    <p className="text-gray-500">No subscription requests have been submitted yet.</p>
                </div>
            )}
        </div>
    );
};

export default AdminSubscriptions;