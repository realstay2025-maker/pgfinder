import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ClockIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const AdminSubscriptionHistory = () => {
    const { ownerId } = useParams();
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, [ownerId]);

    const fetchHistory = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(`${API_ENDPOINTS.ADMIN}/subscription-history/${ownerId}`, config);
            setHistory(res.data);
        } catch (err) {
            console.error('Failed to fetch history:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Subscription History</h1>
            <div className="space-y-4">
                {history.map((sub) => (
                    <div key={sub._id} className="bg-white p-4 rounded-lg shadow border">
                        <div className="grid grid-cols-4 gap-4">
                            <div>Plan: {sub.plan}</div>
                            <div>Amount: ₹{sub.amount}</div>
                            <div>Status: {sub.status}</div>
                            <div>Period: {new Date(sub.startDate).toLocaleDateString()} - {new Date(sub.endDate).toLocaleDateString()}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminSubscriptionHistory;