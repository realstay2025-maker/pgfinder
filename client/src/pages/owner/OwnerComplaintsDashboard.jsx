import React, { useState, useEffect, useMemo } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { 
    ExclamationCircleIcon, 
    WrenchScrewdriverIcon,
    CheckCircleIcon,
    ArrowPathIcon,
    EllipsisVerticalIcon,
    TagIcon,
    HomeModernIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

// API endpoint to fetch all complaints for the owner


const STATUSES = {
    pending: { color: 'text-red-600 bg-red-100', name: 'Pending' },
    in_progress: { color: 'text-yellow-600 bg-yellow-100', name: 'In Progress' },
    resolved: { color: 'text-green-600 bg-green-100', name: 'Resolved' },
};

// --- Metric Card Component ---
const ComplaintMetricCard = ({ title, value, color, icon: Icon }) => (
    <div className="bg-white p-4 rounded-xl shadow-md border-b-4 border-gray-100 transition duration-300 hover:shadow-lg">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            </div>
            <Icon className={`w-6 h-6 ${color} opacity-70`} />
        </div>
    </div>
);


const OwnerComplaintsDashboard = () => {
    const { user } = useAuth();
    const [allComplaints, setAllComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const fetchComplaints = async () => {
        if (!user || user.role !== 'pg_owner') {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(`${API_ENDPOINTS.COMPLAINTS}/owner`, config);
            setAllComplaints(res.data);
        } catch (err) {
            console.error("Fetch Complaints Error:", err.response?.data?.error || err.message);
            setError("Failed to load complaints. Check the /api/complaints/owner/all backend route.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, [user]);

    // Use useMemo to filter and calculate metrics efficiently
    const { filteredComplaints, metrics } = useMemo(() => {
        const initialMetrics = { total: 0, pending: 0, resolved: 0 };
        
        const currentMetrics = allComplaints.reduce((acc, complaint) => {
            acc.total++;
            if (complaint.status === 'pending') acc.pending++;
            if (complaint.status === 'resolved') acc.resolved++;
            return acc;
        }, initialMetrics);

        const filtered = allComplaints
            .filter(complaint => filterStatus === 'all' || complaint.status === filterStatus)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by newest first

        return { filteredComplaints: filtered, metrics: currentMetrics };
    }, [allComplaints, filterStatus]);


    const renderStatusBadge = (status) => {
        const statusInfo = STATUSES[status] || { color: 'text-gray-600 bg-gray-100', name: 'Unknown' };
        return (
            <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                {statusInfo.name}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="p-8 text-xl text-center flex items-center justify-center min-h-[400px]">
                <ArrowPathIcon className="w-8 h-8 mr-3 animate-spin text-blue-800" /> Loading Complaints...
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <ExclamationCircleIcon className="w-6 h-6 md:w-8 md:h-8 mr-2 text-red-600" />
                Complaint Management
            </h1>
            
            {error && (
                <div className="p-4 mb-4 text-red-700 border-l-4 border-red-500 bg-red-100/50 rounded-md shadow-sm">
                    <p className="font-semibold">Error:</p>
                    <p className="text-sm">{error}</p>
                    <button onClick={fetchComplaints} className="mt-2 text-xs text-blue-800 hover:underline">Click to Reload</button>
                </div>
            )}

            {/* --- 1. Metric Cards --- */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <ComplaintMetricCard 
                    title="Total Complaints" 
                    value={metrics.total} 
                    icon={ExclamationCircleIcon} 
                    color="text-gray-600"
                />
                <ComplaintMetricCard 
                    title="Pending" 
                    value={metrics.pending} 
                    icon={WrenchScrewdriverIcon} 
                    color="text-red-600"
                />
                <ComplaintMetricCard 
                    title="Resolved" 
                    value={metrics.resolved} 
                    icon={CheckCircleIcon} 
                    color="text-green-600"
                />
            </div>

            {/* --- 2. Complaint List and Filter --- */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 border-b pb-4">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2 sm:mb-0">All Complaints</h2>
                    
                    {/* Status Filter */}
                    <div className="flex space-x-2 text-sm">
                        {['all', 'pending', 'in_progress', 'resolved'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-3 py-1 rounded-full font-medium transition duration-150 ${
                                    filterStatus === status 
                                        ? 'bg-blue-600 text-white shadow-md' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')} ({status === 'all' ? metrics.total : allComplaints.filter(c => c.status === status).length})
                            </button>
                        ))}
                    </div>
                </div>

                {filteredComplaints.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        <p>No complaints found for the selected filter status.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room/Property</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported On</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredComplaints.map(complaint => (
                                    <tr key={complaint._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {complaint.subject}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 flex items-center">
                                                <HomeModernIcon className="w-4 h-4 mr-1 text-blue-500" />
                                                {complaint.propertyTitle || 'N/A'} 
                                            </div>
                                            <div className="text-xs text-gray-500 flex items-center">
                                                <TagIcon className="w-3 h-3 mr-1 text-gray-400" />
                                                Room {complaint.roomNumber || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {renderStatusBadge(complaint.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(complaint.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                onClick={() => { setSelectedComplaint(complaint); setShowModal(true); }}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                <EllipsisVerticalIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Complaint Details Modal */}
            {showModal && selectedComplaint && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Complaint Details</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                ×
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-gray-900">Subject</h4>
                                <p className="text-gray-600">{selectedComplaint.subject}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Description</h4>
                                <p className="text-gray-600">{selectedComplaint.description}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-semibold text-gray-900">Category</h4>
                                    <p className="text-gray-600">{selectedComplaint.category}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Priority</h4>
                                    <p className="text-gray-600">{selectedComplaint.priority}</p>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Update Status</h4>
                                <div className="flex space-x-2 mt-2">
                                    {['pending', 'in_progress', 'resolved'].map(status => (
                                        <button
                                            key={status}
                                            onClick={async () => {
                                                try {
                                                    const config = { headers: { Authorization: `Bearer ${user.token}` } };
                                                    await axios.put(`${API_ENDPOINTS.COMPLAINTS}/${selectedComplaint._id}/status`, { status }, config);
                                                    setAllComplaints(prev => prev.map(c => c._id === selectedComplaint._id ? {...c, status} : c));
                                                    setShowModal(false);
                                                } catch (err) {
                                                    console.error('Failed to update status:', err);
                                                }
                                            }}
                                            className={`px-3 py-1 rounded text-sm font-medium ${
                                                selectedComplaint.status === status
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                        >
                                            {status.replace('_', ' ').toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-end mt-6">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerComplaintsDashboard;