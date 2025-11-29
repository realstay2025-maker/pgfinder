import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PlusIcon, SpeakerWaveIcon, TrashIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const OwnerNotices = () => {
    const { user } = useAuth();
    const [notices, setNotices] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ title: '', message: '', priority: 'normal' });

    const fetchNotices = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get('http://localhost:5000/api/owner/notices', config);
            setNotices(res.data);
        } catch (err) {
            console.error('Failed to fetch notices:', err);
        }
    };

    const createNotice = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post('http://localhost:5000/api/owner/notices', formData, config);
            setFormData({ title: '', message: '', priority: 'normal' });
            setShowForm(false);
            fetchNotices();
        } catch (err) {
            console.error('Failed to create notice:', err);
        }
    };

    const deleteNotice = async (id) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`http://localhost:5000/api/owner/notices/${id}`, config);
            fetchNotices();
        } catch (err) {
            console.error('Failed to delete notice:', err);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Notices & Announcements</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    New Notice
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <form onSubmit={createNotice}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                            <textarea
                                value={formData.message}
                                onChange={(e) => setFormData({...formData, message: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md h-24"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="normal">Normal</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                Create Notice
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {notices.map((notice) => (
                    <div key={notice._id} className="bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <SpeakerWaveIcon className="w-5 h-5 text-blue-600" />
                                    <h3 className="text-lg font-semibold">{notice.title}</h3>
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                        notice.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                        notice.priority === 'high' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {notice.priority}
                                    </span>
                                </div>
                                <p className="text-gray-700 mb-2">{notice.message}</p>
                                <p className="text-sm text-gray-500">
                                    {new Date(notice.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <button
                                onClick={() => deleteNotice(notice._id)}
                                className="text-red-600 hover:text-red-800"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OwnerNotices;