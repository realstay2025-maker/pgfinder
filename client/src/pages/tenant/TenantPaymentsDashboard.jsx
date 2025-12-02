// client/src/pages/tenant/TenantPaymentsDashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
    CurrencyRupeeIcon, 
    CalendarDaysIcon, 
    ArrowPathIcon,
    ExclamationTriangleIcon,
    DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

import { API_ENDPOINTS } from '../../config/api';

const formatCurrency = (amount) => `₹${new Intl.NumberFormat('en-IN').format(amount)}`;
const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

// Helper component for status badge
const getStatusBadge = (status) => {
    let style = 'bg-gray-100 text-gray-800';
    if (status === 'due') style = 'bg-blue-100 text-blue-800';
    if (status === 'overdue' || status === 'partial') style = 'bg-custom-red/20 text-custom-red font-semibold';
    if (status === 'paid') style = 'bg-accent-green/20 text-accent-green';
    return <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${style}`}>{status.toUpperCase()}</span>;
};

const TenantPaymentsDashboard = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPayments = async () => {
        setLoading(true);
        setError(null);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const [paymentsRes, invoicesRes] = await Promise.all([
                axios.get(API_TENANT_PAYMENTS, config),
                axios.get(`${API_ENDPOINTS.TENANT}/invoices`, config)
            ]);
            setData(paymentsRes.data);
            setInvoices(invoicesRes.data);
        } catch (err) {
            console.error("Tenant Payments Fetch Error:", err);
            setError(err.response?.data?.error || "Failed to load payment records.");
        } finally {
            setLoading(false);
        }
    };
    
    const downloadInvoice = async (invoiceId, invoiceNumber) => {
        try {
            const config = { 
                headers: { Authorization: `Bearer ${user.token}` },
                responseType: 'blob'
            };
            const res = await axios.get(`${API_ENDPOINTS.TENANT}/invoice/${invoiceId}/pdf`, config);
            
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `invoice-${invoiceNumber}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download error:', err);
            alert('Failed to download invoice');
        }
    };

    useEffect(() => {
        if (user) {
            fetchPayments();
        }
    }, [user]);

    if (loading) {
        return <div className="p-6 text-xl">Loading Payments Dashboard...</div>;
    }

    if (error || !data) {
        return <div className="p-6 text-custom-red border-l-4 border-custom-red bg-red-100/50">{error || "No payment data available."}</div>;
    }
    
    const { payments, summary } = data;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h1 className="text-3xl font-bold text-gray-800">Rent & Financial Overview</h1>
                <button 
                    onClick={fetchPayments}
                    className="flex items-center py-2 px-4 rounded-md text-primary-dark bg-gray-200 hover:bg-gray-300 transition"
                >
                    <ArrowPathIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Summary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                
                {/* Total Dues Card */}
                <div className="p-6 rounded-xl shadow-lg bg-red-50 border border-custom-red/50">
                    <p className="text-sm font-medium text-gray-700">Total Outstanding Dues</p>
                    <p className="text-3xl font-extrabold flex items-center mt-1 text-custom-red">
                        <CurrencyRupeeIcon className="w-8 h-8 mr-2" />
                        {formatCurrency(summary.totalDues)}
                    </p>
                    {summary.totalDues > 0 && (
                         <p className="text-xs mt-2 text-custom-red flex items-center">
                            <ExclamationTriangleIcon className="w-4 h-4 mr-1"/> Please settle the balance immediately.
                        </p>
                    )}
                </div>

                {/* Next Payment Card */}
                <div className="p-6 rounded-xl shadow-lg bg-blue-50 border border-blue-200">
                    <p className="text-sm font-medium text-gray-700">Next Due Amount</p>
                    <p className="text-3xl font-bold flex items-center mt-1 text-primary-dark">
                        <CurrencyRupeeIcon className="w-8 h-8 mr-2" />
                        {formatCurrency(summary.nextDueAmount)}
                    </p>
                </div>
                
                {/* Next Due Date Card */}
                <div className="p-6 rounded-xl shadow-lg bg-green-50 border border-green-200">
                    <p className="text-sm font-medium text-gray-700">Next Due Date</p>
                    <p className="text-3xl font-bold flex items-center mt-1 text-accent-green">
                        <CalendarDaysIcon className="w-8 h-8 mr-2" />
                        {summary.nextDueDate ? formatDate(summary.nextDueDate) : 'N/A'}
                    </p>
                </div>
            </div>

            {/* Payment History Table */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Payment History</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Due</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Paid</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {payments.map((p) => (
                                <tr key={p._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {formatDate(p.dueDate)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatCurrency(p.amountDue)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatCurrency(p.amountPaid)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                                        {formatCurrency(p.amountDue - p.amountPaid)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {getStatusBadge(p.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {p.status === 'paid' ? (
                                            (() => {
                                                const invoice = invoices.find(inv => 
                                                    inv.month === new Date(p.dueDate).getMonth() + 1 && 
                                                    inv.year === new Date(p.dueDate).getFullYear()
                                                );
                                                return invoice ? (
                                                    <button 
                                                        onClick={() => downloadInvoice(invoice._id, invoice.invoiceNumber)}
                                                        className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full hover:bg-green-200 transition-colors"
                                                    >
                                                        <DocumentArrowDownIcon className="w-4 h-4 mr-1" />
                                                        Invoice
                                                    </button>
                                                ) : null;
                                            })()
                                        ) : (
                                            <span className="text-gray-400 text-xs">Pending</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TenantPaymentsDashboard;