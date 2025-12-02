// client/src/pages/owner/ComplaintResolutionModal.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

import { API_ENDPOINTS } from '../../config/api';

const ComplaintResolutionModal = ({ complaint, onClose, onUpdateSuccess }) => {
    const { user } = useAuth();
    const [status, setStatus] = useState(complaint.status);
    const [priority, setPriority] = useState(complaint.priority);
    const [resolutionNotes, setResolutionNotes] = useState(complaint.resolutionNotes || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const updatePayload = {
                status,
                priority,
                resolutionNotes
            };

            await axios.put(`${API_COMPLAINT_URL}/${complaint._id}`, updatePayload, config);
            
            // Call the success handler to refresh the parent list
            onUpdateSuccess();

        } catch (err) {
            console.error("Complaint Update Error:", err);
            setError(err.response?.data?.error || 'Failed to update complaint.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl overflow-y-auto max-h-[90vh]">
                <h3 className="text-2xl font-bold mb-4 text-primary-dark border-b pb-2">Resolve Issue: {complaint.subject}</h3>
                <p className="text-sm text-gray-500 mb-4">Reported by: **{complaint.tenantId.name}** in Room **{complaint.roomId.roomNumber}**</p>
                
                {error && (
                    <div className="bg-red-100 text-custom-red p-3 rounded-md mb-4 text-sm">{error}</div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Complaint Description */}
                    <div className='bg-gray-50 p-4 rounded-lg border'>
                        <p className='font-semibold text-gray-700 mb-2'>Description:</p>
                        <p className='text-sm text-gray-600 italic'>{complaint.description}</p>
                    </div>

                    {/* Status and Priority */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select name="status" value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 border rounded-md" required>
                                <option value="Open">Open</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Closed">Closed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Priority</label>
                            <select name="priority" value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full px-3 py-2 border rounded-md" required>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Urgent">Urgent</option>
                            </select>
                        </div>
                    </div>

                    {/* Resolution Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Resolution Notes</label>
                        <textarea 
                            name="resolutionNotes" 
                            value={resolutionNotes} 
                            onChange={(e) => setResolutionNotes(e.target.value)} 
                            rows="3" 
                            placeholder="Enter steps taken and final resolution..."
                            className="w-full px-3 py-2 border rounded-md"
                        />
                    </div>

                    
                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="py-2 px-4 rounded-md text-white bg-primary-dark hover:bg-blue-900 transition disabled:opacity-50">
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ComplaintResolutionModal;