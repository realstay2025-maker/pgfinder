import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { InboxIcon, PhoneIcon, EnvelopeIcon, CalendarIcon, UserPlusIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const OwnerInbox = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('contact');
    const [contactRequests, setContactRequests] = useState([]);
    const [bookingRequests, setBookingRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [response, setResponse] = useState('');

    const fetchRequests = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const [contactRes, bookingRes] = await Promise.all([
                axios.get(`${API_ENDPOINTS.OWNER}/contact-requests`, config),
                axios.get(`${API_ENDPOINTS.OWNER}/booking-requests`, config)
            ]);
            setContactRequests(contactRes.data);
            // Filter out converted bookings
            setBookingRequests(bookingRes.data.filter(booking => booking.status !== 'converted'));
        } catch (err) {
            console.error('Failed to fetch requests:', err);
        }
    };

    const updateRequest = async (id, status, type) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${API_ENDPOINTS.OWNER}/${type}-requests/${id}`, 
                { status, ownerResponse: response }, config);
            setSelectedRequest(null);
            setResponse('');
            fetchRequests();
        } catch (err) {
            console.error('Failed to update request:', err);
        }
    };

    const convertToTenant = async (id) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const response = await axios.post(`${API_ENDPOINTS.OWNER}/booking-requests/${id}/convert`, {}, config);
            alert(`Booking approved! System-generated password sent to ${response.data.email}`);
            fetchRequests();
        } catch (err) {
            console.error('Failed to convert booking:', err);
            alert('Failed to approve booking. Please try again.');
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const getStatusColor = (status) => {
        switch(status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'contacted': case 'approved': return 'bg-green-100 text-green-800';
            case 'closed': case 'rejected': return 'bg-gray-100 text-gray-800';
            case 'converted': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6">
            <div className="flex items-center mb-6">
                <InboxIcon className="w-8 h-8 text-blue-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
            </div>

            <div className="flex space-x-1 mb-6">
                <button
                    onClick={() => setActiveTab('contact')}
                    className={`px-4 py-2 rounded-lg font-medium ${
                        activeTab === 'contact' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                >
                    Contact Requests ({contactRequests.length})
                </button>
                <button
                    onClick={() => setActiveTab('booking')}
                    className={`px-4 py-2 rounded-lg font-medium ${
                        activeTab === 'booking' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                >
                    Booking Requests ({bookingRequests.length})
                </button>
            </div>

            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                <div className="max-h-[70vh] overflow-y-auto">
                    <div className="divide-y divide-gray-200">
                        {(activeTab === 'contact' ? contactRequests : bookingRequests).map((request) => (
                            <div key={request._id} className="p-4 hover:bg-gray-50/50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-lg font-bold text-gray-900">{request.name}</h3>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(request.status)}`}>
                                                    {request.status}
                                                </span>
                                                <button
                                                    onClick={() => {
                                                        setSelectedRequest(request);
                                                        setShowModal(true);
                                                    }}
                                                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                                >
                                                    <EyeIcon className="w-3 h-3 mr-1" />
                                                    View
                                                </button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-2">
                                            <div className="flex items-center">
                                                <EnvelopeIcon className="w-4 h-4 mr-2" />
                                                <span>{request.email}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <PhoneIcon className="w-4 h-4 mr-2" />
                                                <span>{request.phone}</span>
                                            </div>
                                            <div>Property: <span className="font-medium">{request.propertyTitle}</span></div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                            {request.roomType && <div>Room: <span className="font-medium">{request.roomType} sharing</span></div>}
                                            {request.moveInDate && (
                                                <div className="flex items-center">
                                                    <CalendarIcon className="w-4 h-4 mr-2" />
                                                    <span>{new Date(request.moveInDate).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Request Details Modal */}
            {showModal && selectedRequest && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white/90 backdrop-blur-lg rounded-3xl max-w-2xl w-full p-8 border border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Request Details</h3>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setSelectedRequest(null);
                                    setResponse('');
                                }}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="space-y-4 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Name</label>
                                    <p className="text-gray-900">{selectedRequest.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Status</label>
                                    <div>
                                        <span className={`px-3 py-1 text-sm rounded-full font-medium ${getStatusColor(selectedRequest.status)}`}>
                                            {selectedRequest.status}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Email</label>
                                    <p className="text-gray-900">{selectedRequest.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Phone</label>
                                    <p className="text-gray-900">{selectedRequest.phone}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Property</label>
                                    <p className="text-gray-900">{selectedRequest.propertyTitle}</p>
                                </div>
                                {selectedRequest.roomType && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Room Type</label>
                                        <p className="text-gray-900">{selectedRequest.roomType} sharing</p>
                                    </div>
                                )}
                                {selectedRequest.moveInDate && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Move-in Date</label>
                                        <p className="text-gray-900">{new Date(selectedRequest.moveInDate).toLocaleDateString()}</p>
                                    </div>
                                )}
                            </div>
                            {selectedRequest.message && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Message</label>
                                    <p className="text-gray-900 bg-gray-50 rounded-xl p-4">{selectedRequest.message}</p>
                                </div>
                            )}
                        </div>

                        {selectedRequest.status === 'pending' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Your Response</label>
                                    <textarea
                                        placeholder="Your response..."
                                        value={response}
                                        onChange={(e) => setResponse(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            if (activeTab === 'booking') {
                                                convertToTenant(selectedRequest._id);
                                            } else {
                                                updateRequest(selectedRequest._id, 'contacted', activeTab);
                                            }
                                            setShowModal(false);
                                        }}
                                        className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold"
                                    >
                                        {activeTab === 'contact' ? 'Mark Contacted' : 'Approve & Send Login'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            updateRequest(selectedRequest._id, 
                                                activeTab === 'contact' ? 'closed' : 'rejected', activeTab);
                                            setShowModal(false);
                                        }}
                                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold"
                                    >
                                        {activeTab === 'contact' ? 'Close' : 'Reject'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerInbox;