// client/src/pages/owner/OwnerPaymentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { CurrencyRupeeIcon, CalendarIcon, ArrowTrendingUpIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const OwnerPaymentsDashboard = () => {
    const { user } = useAuth();
    const [paymentData, setPaymentData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPaymentData();
    }, []);

    const fetchPaymentData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get('http://localhost:5000/api/payments/owner/summary', config);
            setPaymentData(res.data);
        } catch (err) {
            console.error('Failed to fetch payment data:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => `₹${new Intl.NumberFormat('en-IN').format(amount)}`;
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="bg-white rounded-xl shadow-lg p-6">
                                <div className="h-16 bg-gray-200 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <CurrencyRupeeIcon className="w-8 h-8 mr-2 text-blue-600" />
                Payments & Revenue
            </h1>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-100">
                            <ArrowTrendingUpIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Collected</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(paymentData?.summary?.totalCollected || 0)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-yellow-100">
                            <CalendarIcon className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Pending</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(paymentData?.summary?.totalPending || 0)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100">
                            <CurrencyRupeeIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">This Month</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(paymentData?.summary?.thisMonthCollection || 0)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-red-100">
                            <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Overdue</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(paymentData?.summary?.overdueAmount || 0)}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Payments */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Payments</h2>
                    <div className="space-y-3">
                        {paymentData?.recentPayments?.map((payment) => (
                            <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <div className="font-medium text-gray-900">{payment.tenantName}</div>
                                    <div className="text-sm text-gray-500">{payment.property}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold text-green-600">{formatCurrency(payment.amount)}</div>
                                    <div className="text-sm text-gray-500">{formatDate(payment.date)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pending Payments */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Payments</h2>
                    <div className="space-y-3">
                        {paymentData?.pendingPayments?.map((payment) => (
                            <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <div className="font-medium text-gray-900">{payment.tenantName}</div>
                                    <div className="text-sm text-gray-500">{payment.property}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold text-yellow-600">{formatCurrency(payment.amount)}</div>
                                    <div className="text-sm text-gray-500">Due: {formatDate(payment.dueDate)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OwnerPaymentsDashboard;