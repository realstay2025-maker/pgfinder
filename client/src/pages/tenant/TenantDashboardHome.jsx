// client/src/pages/tenant/TenantDashboardHome.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
    CurrencyRupeeIcon, 
    HomeModernIcon, 
    ExclamationCircleIcon, 
    CalendarDaysIcon,
    ArrowPathIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';


const API_BASE_URL = 'http://localhost:5000/api';
const formatCurrency = (amount) => `₹${new Intl.NumberFormat('en-IN').format(amount)}`;
const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

const TenantDashboardHome = () => {
    const { user } = useAuth();
    const [data, setData] = useState({ payments: null, lease: null, complaints: null });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            
            // Fetch real payment data
            const paymentRes = await axios.get(`${API_BASE_URL}/payments/tenant/my-payments`, config);
            
            // Fetch real lease info
            const leaseRes = await axios.get(`${API_BASE_URL}/tenant/my-lease-info`, config);
            
            // Fetch complaints count
            const complaintsRes = await axios.get(`${API_BASE_URL}/complaints/tenant/my-complaints`, config);
            
            setData({ 
                payments: paymentRes.data, 
                lease: leaseRes.data,
                complaints: complaintsRes.data
            });

        } catch (err) {
            console.error("Dashboard Fetch Error:", err.response?.data?.error || err.message);
            // Set fallback data even on error
            setData({ 
                payments: { summary: { totalDues: 0, nextDueDate: null, nextDueAmount: 0 } }, 
                lease: { propertyName: 'Not Available', roomNumber: 'N/A' },
                complaints: []
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    if (loading) {
        return <div className="p-10 text-xl text-center">Loading your personalized dashboard...</div>;
    }





    const { payments, lease, complaints } = data;
    const paymentSummary = payments?.summary || {};
    const hasDues = paymentSummary.totalDues > 0;
    
    // Get real complaints count
    const openComplaintsCount = complaints?.filter(c => c.status === 'pending' || c.status === 'in_progress')?.length || 0; 

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-extrabold text-gray-900">👋 Welcome back, {user?.name || 'Tenant'}!</h1>
                <button 
                    onClick={fetchData}
                    className="flex items-center py-2 px-4 rounded-md text-primary-dark bg-gray-200 hover:bg-gray-300 transition text-sm"
                >
                    <ArrowPathIcon className="w-4 h-4 mr-2" /> Refresh
                </button>
            </div>
            
            {/* ALERT BOX for Dues */}
            {hasDues && (
                <div className="bg-custom-red/10 border-l-4 border-custom-red p-4 mb-8 rounded-lg shadow-sm">
                    <p className="font-semibold text-custom-red flex items-center">
                        <ExclamationCircleIcon className="w-5 h-5 mr-2" />
                        Action Required: You have **{formatCurrency(paymentSummary.totalDues)}** in outstanding dues.
                        <Link to="/tenant/payments" className="ml-4 text-primary-dark underline hover:text-blue-700">View Payments</Link>
                    </p>
                </div>
            )}

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Lease Info Card */}
                <div className="p-6 rounded-xl shadow-lg bg-white border border-gray-100">
                    <p className="text-sm font-medium text-gray-600 flex items-center">
                        <HomeModernIcon className="w-5 h-5 mr-2 text-primary-dark" /> Current Residence
                    </p>
                    <h3 className="text-2xl font-bold mt-2 text-gray-900 truncate">
                        {lease?.propertyName || 'Lease Pending'}
                    </h3>
                    <p className="text-md text-gray-500">Room: **{lease?.roomNumber || 'N/A'}**</p>
                    <Link to="/tenant/documents" className="mt-3 inline-block text-sm text-accent-green hover:text-green-700 font-semibold">
                        View Lease Documents
                    </Link>
                </div>

                {/* Next Payment Card */}
                <div className="p-6 rounded-xl shadow-lg bg-white border border-gray-100">
                    <p className="text-sm font-medium text-gray-600 flex items-center">
                        <CalendarDaysIcon className="w-5 h-5 mr-2 text-primary-dark" /> Next Payment Due
                    </p>
                    <h3 className="text-2xl font-bold mt-2 text-gray-900">
                        {paymentSummary.nextDueDate ? formatDate(paymentSummary.nextDueDate) : 'N/A'}
                    </h3>
                    <p className="text-md text-gray-500">Amount: **{formatCurrency(paymentSummary.nextDueAmount)}**</p>
                    <Link to="/tenant/payments" className="mt-3 inline-block text-sm text-primary-dark hover:text-blue-700 font-semibold">
                        Make a Payment
                    </Link>
                </div>

                {/* Open Complaints Card */}
                <div className="p-6 rounded-xl shadow-lg bg-white border border-gray-100">
                    <p className="text-sm font-medium text-gray-600 flex items-center">
                        <ExclamationCircleIcon className="w-5 h-5 mr-2 text-primary-dark" /> Open Issues
                    </p>
                    <h3 className="text-2xl font-bold mt-2 text-gray-900">
                        {openComplaintsCount}
                    </h3>
                    <p className="text-md text-gray-500">Awaiting Manager Action</p>
                    <Link to="/tenant/submit-complaint" className="mt-3 inline-block text-sm text-primary-dark hover:text-blue-700 font-semibold">
                        Raise a New Issue
                    </Link>
                </div>

            </div>
            {/* Future sections like Notices/Announcements go here */}
        </div>
    );
};

export default TenantDashboardHome;