// client/src/pages/tenant/TenantSubmitComplaint.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

import { API_ENDPOINTS } from '../../config/api';


const priorityOptions = ['Low', 'Medium', 'High', 'Urgent'];
const categoryOptions = ['Maintenance', 'Utility', 'Safety', 'Noise', 'Other'];

const TenantSubmitComplaint = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        category: 'Maintenance',
        priority: 'Low',
        propertyId: '',
        roomId: '',
    });
    const [leaseInfo, setLeaseInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const fetchLeaseInfo = async () => {
        setFetchLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(`${API_ENDPOINTS.TENANT}/profile`, config); 
            const info = res.data;
            
            setLeaseInfo(info);
            
            // Mock property and room IDs for now
            setFormData(prev => ({ 
                ...prev, 
                propertyId: '507f1f77bcf86cd799439011', 
                roomId: '507f1f77bcf86cd799439012' 
            }));
        } catch (err) {
            console.error("Lease Info Fetch Error:", err);
            // Use mock data as fallback
            setLeaseInfo({
                propertyName: user?.tenantProfile?.pgName || 'Your PG',
                roomNumber: 'Your Room'
            });
            setFormData(prev => ({ 
                ...prev, 
                propertyId: '507f1f77bcf86cd799439011', 
                roomId: '507f1f77bcf86cd799439012' 
            }));
        } finally {
            setFetchLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchLeaseInfo();
        }
    }, [user]);


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setError(null);

        // Simple validation check
        if (!formData.propertyId || !formData.roomId) {
            setError("Cannot submit: Property or Room ID is missing. Please contact management.");
            setLoading(false);
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(API_COMPLAINTS_URL, formData, config);

            setMessage("Complaint submitted successfully! Management has been notified.");
            
            // Reset form fields, keeping the IDs
            setFormData(prev => ({
                ...prev,
                subject: '',
                description: '',
                category: 'Maintenance',
                priority: 'Low',
            }));

        } catch (err) {
            console.error("Complaint Submission Error:", err);
            setError(err.response?.data?.error || 'Failed to submit complaint. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return <div className="p-4 md:p-6 text-lg md:text-xl">Loading your portal details...</div>;
    }

    if (error && !leaseInfo) {
        return <div className="p-4 md:p-6 text-custom-red border-l-4 border-custom-red bg-red-100/50 text-sm md:text-base">{error}</div>;
    }


    return (
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center flex-wrap">
                    <ExclamationCircleIcon className="w-6 h-6 md:w-8 md:h-8 mr-2 text-primary-dark flex-shrink-0" /> 
                    <span>Raise a New Issue</span>
                </h1>
                <p className="text-gray-600 text-sm md:text-base">Quickly report maintenance or other issues to your PG manager.</p>
            </div>
            
            {/* Status Messages */}
            {message && (
                <div className="bg-green-100 text-accent-green p-3 md:p-4 rounded-lg mb-4 font-semibold text-sm md:text-base">{message}</div>
            )}
            {error && (
                <div className="bg-red-100 text-custom-red p-3 md:p-4 rounded-lg mb-4 font-semibold text-sm md:text-base">{error}</div>
            )}
            
            {/* Tenant Info Display */}
            {leaseInfo && (
                <div className='bg-blue-50 p-3 md:p-4 rounded-lg border border-blue-200 mb-6 text-xs md:text-sm'>
                    You are submitting this complaint for <strong>{leaseInfo.propertyName}</strong> (Room <strong>{leaseInfo.roomNumber}</strong>).
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white p-4 md:p-6 rounded-xl shadow-lg space-y-4 md:space-y-5">
                
                {/* Subject */}
                <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject / Title of Issue <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        name="subject"
                        id="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        maxLength="100"
                        placeholder="e.g., Leaky faucet in bathroom"
                        required
                        className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-md text-sm md:text-base focus:ring-2 focus:ring-primary-dark focus:border-primary-dark"
                    />
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Detailed Description <span className="text-red-500">*</span></label>
                    <textarea
                        name="description"
                        id="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Describe the problem, when it started, and where it is located."
                        required
                        className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-md text-sm md:text-base focus:ring-2 focus:ring-primary-dark focus:border-primary-dark resize-none"
                    />
                </div>

                {/* Category and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            name="category"
                            id="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-md text-sm md:text-base focus:ring-2 focus:ring-primary-dark focus:border-primary-dark"
                        >
                            {categoryOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">Requested Priority</label>
                        <select
                            name="priority"
                            id="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-md text-sm md:text-base focus:ring-2 focus:ring-primary-dark focus:border-primary-dark"
                        >
                            {priorityOptions.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                </div>
                
                {/* Submit Button */}
                <div className="pt-2 md:pt-4">
                    <button
                        type="submit"
                        disabled={loading || fetchLoading || error}
                        className="w-full py-3 px-4 rounded-md text-white bg-primary-dark hover:bg-blue-900 transition font-semibold disabled:opacity-50 text-sm md:text-base"
                    >
                        {loading ? 'Submitting...' : 'Submit Complaint'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TenantSubmitComplaint;