import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { WrenchScrewdriverIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const OwnerMaintenance = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [filter, setFilter] = useState('all');

    const fetchRequests = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get('http://localhost:5000/api/owner/maintenance', config);
            setRequests(res.data);
        } catch (err) {
            console.error('Failed to fetch maintenance requests:', err);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`http://localhost:5000/api/owner/maintenance/${id}`, { status }, config);
            fetchRequests();
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const filteredRequests = requests.filter(req => 
        filter === 'all' || req.status === filter
    );

    const getStatusColor = (status) => {
        switch(status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Maintenance Requests</h1>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                >
                    <option value="all">All Requests</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                </select>
            </div>

            <div className="space-y-4">
                {filteredRequests.map((request) => (
                    <div key={request._id} className="bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <WrenchScrewdriverIcon className="w-5 h-5 text-blue-600" />
                                    <h3 className="text-lg font-semibold">{request.title}</h3>
                                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                                        {request.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <p className="text-gray-700 mb-2">{request.description}</p>
                                <div className="text-sm text-gray-500 space-y-1">
                                    <p>Property: {request.propertyName}</p>
                                    <p>Room: {request.roomNumber}</p>
                                    <p>Tenant: {request.tenantName}</p>
                                    <p>Requested: {new Date(request.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {request.status === 'pending' && (
                                    <button
                                        onClick={() => updateStatus(request._id, 'in_progress')}
                                        className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        <ClockIcon className="w-4 h-4 mr-1" />
                                        Start
                                    </button>
                                )}
                                {request.status === 'in_progress' && (
                                    <button
                                        onClick={() => updateStatus(request._id, 'completed')}
                                        className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                                    >
                                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                                        Complete
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OwnerMaintenance;