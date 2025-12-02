// client/src/pages/owner/OwnerPaymentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { CurrencyRupeeIcon, CalendarIcon, ArrowTrendingUpIcon, ExclamationTriangleIcon, BellIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const OwnerPaymentsDashboard = () => {
    const { user } = useAuth();
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProperty, setSelectedProperty] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [properties, setProperties] = useState([]);
    const [sendingReminder, setSendingReminder] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);
    
    useEffect(() => {
        if (selectedMonth) {
            fetchData();
        }
    }, [selectedMonth]);

    const fetchData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const [tenantsRes, propertiesRes] = await Promise.all([
                axios.get(`${API_ENDPOINTS.OWNER}/tenants-payments?month=${selectedMonth}`, config),
                axios.get(`${API_ENDPOINTS.PROPERTIES}/my`, config)
            ]);
            setTenants(tenantsRes.data);
            setProperties(propertiesRes.data);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    const sendReminder = async (tenantId) => {
        setSendingReminder(tenantId);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`${API_ENDPOINTS.OWNER}/send-reminder/${tenantId}`, {}, config);
            alert('Reminder sent successfully!');
        } catch (err) {
            console.error('Failed to send reminder:', err);
            alert('Failed to send reminder');
        } finally {
            setSendingReminder(null);
        }
    };

    const updatePaymentStatus = async (tenantId, status) => {
        setUpdatingStatus(tenantId);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${API_ENDPOINTS.OWNER}/payment-status/${tenantId}`, { status }, config);
            fetchData(); // Refresh data
            alert('Payment status updated successfully!');
        } catch (err) {
            console.error('Failed to update payment status:', err);
            alert(`Failed to update payment status: ${err.response?.data?.error || err.message}`);
        } finally {
            setUpdatingStatus(null);
        }
    };

    const formatCurrency = (amount) => `₹${new Intl.NumberFormat('en-IN').format(amount)}`;
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString();
    
    const getPaymentStatus = (tenant) => {
        if (!tenant.lastPayment) return { status: 'pending', color: 'yellow', text: 'No Payment' };
        
        const dueDate = new Date(tenant.nextDueDate);
        const today = new Date();
        const daysDiff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        
        if (tenant.lastPayment.status === 'paid') {
            return { status: 'paid', color: 'green', text: 'Paid' };
        } else if (daysDiff < 0) {
            return { status: 'overdue', color: 'red', text: `Overdue (${Math.abs(daysDiff)} days)` };
        } else if (daysDiff <= 3) {
            return { status: 'due_soon', color: 'orange', text: `Due in ${daysDiff} days` };
        } else {
            return { status: 'pending', color: 'yellow', text: 'Pending' };
        }
    };
    
    const filteredTenants = tenants.filter(tenant => {
        const propertyMatch = selectedProperty === 'all' || tenant.propertyId === selectedProperty;
        const statusMatch = selectedStatus === 'all' || getPaymentStatus(tenant).status === selectedStatus;
        return propertyMatch && statusMatch;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
                        <div className="h-64 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
            <div className="max-w-9xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center mb-6">
                        <CurrencyRupeeIcon className="w-10 h-10 mr-3 text-indigo-600" />
                        Tenant Payments
                    </h1>
                    
                    <div className="flex flex-wrap gap-4">
                        <select 
                            value={selectedProperty} 
                            onChange={(e) => setSelectedProperty(e.target.value)}
                            className="px-4 py-2 bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="all">All Properties</option>
                            {properties.map(property => (
                                <option key={property._id} value={property._id}>{property.title}</option>
                            ))}
                        </select>
                        
                        <select 
                            value={selectedStatus} 
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-4 py-2 bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="all">All Status</option>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                            <option value="overdue">Overdue</option>
                            <option value="due_soon">Due Soon</option>
                        </select>
                        
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="px-4 py-2 bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        
                        <button
                            onClick={() => {
                                setSelectedProperty('all');
                                setSelectedStatus('all');
                                setSelectedMonth(new Date().toISOString().slice(0, 7));
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg"
                        >
                            Clear Filters
                        </button>
                        
                        <div className="ml-auto flex items-center space-x-4 text-sm text-gray-600">
                            <span>{new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                            <span>•</span>
                            <span>Showing {filteredTenants.length} of {tenants.length} tenants</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
                    <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Tenant</th>
                                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Property</th>
                                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Room</th>
                                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Rent</th>
                                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Due Date</th>
                                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTenants.map((tenant) => {
                                    const paymentStatus = getPaymentStatus(tenant);
                                    return (
                                        <tr key={tenant._id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                        {tenant.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{tenant.name}</div>
                                                        <div className="text-sm text-gray-500">{tenant.phone}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="font-medium text-gray-900">{tenant.propertyTitle}</div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="font-medium text-gray-900">{tenant.roomNumber}</div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="font-semibold text-gray-900">{formatCurrency(tenant.rent || 0)}</div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                    paymentStatus.color === 'green' ? 'bg-green-100 text-green-800' :
                                                    paymentStatus.color === 'red' ? 'bg-red-100 text-red-800' :
                                                    paymentStatus.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {paymentStatus.color === 'green' && <CheckCircleIcon className="w-3 h-3 mr-1" />}
                                                    {paymentStatus.color === 'red' && <XCircleIcon className="w-3 h-3 mr-1" />}
                                                    {paymentStatus.text}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="text-sm text-gray-600">
                                                    {tenant.nextDueDate ? formatDate(tenant.nextDueDate) : 'N/A'}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center space-x-2">
                                                    <select
                                                        value={tenant.lastPayment?.status || 'pending'}
                                                        onChange={(e) => updatePaymentStatus(tenant._id, e.target.value)}
                                                        disabled={updatingStatus === tenant._id}
                                                        className="px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="paid">Paid</option>
                                                        <option value="partial">Partial</option>
                                                        <option value="overdue">Overdue</option>
                                                    </select>
                                                    {paymentStatus.status !== 'paid' && (
                                                        <button
                                                            onClick={() => sendReminder(tenant._id)}
                                                            disabled={sendingReminder === tenant._id}
                                                            className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-medium rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                                                        >
                                                            <BellIcon className="w-3 h-3 mr-1" />
                                                            {sendingReminder === tenant._id ? 'Sending...' : 'Remind'}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        
                        {filteredTenants.length === 0 && (
                            <div className="text-center py-12">
                                <CurrencyRupeeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">No tenants found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OwnerPaymentsDashboard;