import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { InboxIcon, PhoneIcon, EnvelopeIcon, CalendarIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const OwnerInbox = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('contact');
    const [contactRequests, setContactRequests] = useState([]);
    const [bookingRequests, setBookingRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [response, setResponse] = useState('');

    const fetchRequests = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const [contactRes, bookingRes] = await Promise.all([
                axios.get('http://localhost:5000/api/owner/contact-requests', config),
                axios.get('http://localhost:5000/api/owner/booking-requests', config)
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
            await axios.put(`http://localhost:5000/api/owner/${type}-requests/${id}`, 
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
            const response = await axios.post(`http://localhost:5000/api/owner/booking-requests/${id}/convert`, {}, config);
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    {(activeTab === 'contact' ? contactRequests : bookingRequests).map((request) => (
                        <div key={request._id} className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md"
                             onClick={() => setSelectedRequest(request)}>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-gray-900">{request.name}</h3>
                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                                    {request.status}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p className="flex items-center">
                                    <EnvelopeIcon className="w-4 h-4 mr-2" />
                                    {request.email}
                                </p>
                                <p className="flex items-center">
                                    <PhoneIcon className="w-4 h-4 mr-2" />
                                    {request.phone}
                                </p>
                                <p>Property: {request.propertyTitle}</p>
                                {request.roomType && <p>Room: {request.roomType} sharing</p>}
                                {request.moveInDate && (
                                    <p className="flex items-center">
                                        <CalendarIcon className="w-4 h-4 mr-2" />
                                        {new Date(request.moveInDate).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {selectedRequest && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">Request Details</h3>
                        <div className="space-y-3 mb-4">
                            <p><strong>Name:</strong> {selectedRequest.name}</p>
                            <p><strong>Email:</strong> {selectedRequest.email}</p>
                            <p><strong>Phone:</strong> {selectedRequest.phone}</p>
                            <p><strong>Property:</strong> {selectedRequest.propertyTitle}</p>
                            {selectedRequest.message && (
                                <p><strong>Message:</strong> {selectedRequest.message}</p>
                            )}
                            {selectedRequest.roomType && (
                                <p><strong>Room Type:</strong> {selectedRequest.roomType} sharing</p>
                            )}
                            {selectedRequest.moveInDate && (
                                <p><strong>Move-in Date:</strong> {new Date(selectedRequest.moveInDate).toLocaleDateString()}</p>
                            )}
                            <p><strong>Status:</strong> 
                                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(selectedRequest.status)}`}>
                                    {selectedRequest.status}
                                </span>
                            </p>
                        </div>

                        {selectedRequest.status === 'pending' && (
                            <div className="space-y-4">
                                <textarea
                                    placeholder="Your response..."
                                    value={response}
                                    onChange={(e) => setResponse(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md h-24"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            if (activeTab === 'booking') {
                                                convertToTenant(selectedRequest._id);
                                            } else {
                                                updateRequest(selectedRequest._id, 'contacted', activeTab);
                                            }
                                        }}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                    >
                                        {activeTab === 'contact' ? 'Mark Contacted' : 'Approve & Send Login'}
                                    </button>
                                    <button
                                        onClick={() => updateRequest(selectedRequest._id, 
                                            activeTab === 'contact' ? 'closed' : 'rejected', activeTab)}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                    >
                                        {activeTab === 'contact' ? 'Close' : 'Reject'}
                                    </button>

                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OwnerInbox;