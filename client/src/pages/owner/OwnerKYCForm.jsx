import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/api';
import { DocumentTextIcon, CheckCircleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const OwnerKYCForm = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        panNumber: '',
        aadhaarNumber: '',
        gstNumber: '',
        businessAddress: ''
    });
    const [files, setFiles] = useState({});
    const [loading, setLoading] = useState(false);
    const [kycStatus, setKycStatus] = useState('pending');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchKYCData();
    }, []);

    const fetchKYCData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(`${API_ENDPOINTS.OWNER}/kyc`, config);
            if (res.data) {
                setFormData({
                    panNumber: res.data.panNumber || '',
                    aadhaarNumber: res.data.aadhaarNumber || '',
                    gstNumber: res.data.gstNumber || '',
                    businessAddress: res.data.businessAddress || ''
                });
                setKycStatus(res.data.kycStatus || 'pending');
            }
        } catch (err) {
            // KYC data not found, continue with empty form
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFiles({ ...files, [e.target.name]: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const formDataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                formDataToSend.append(key, formData[key]);
            });
            Object.keys(files).forEach(key => {
                if (files[key]) {
                    formDataToSend.append(key, files[key]);
                }
            });

            const config = { 
                headers: { 
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data'
                } 
            };
            
            await axios.post(`${API_ENDPOINTS.OWNER}/kyc`, formDataToSend, config);
            setSuccess('KYC details submitted successfully!');
            setKycStatus('pending');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit KYC details');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = () => {
        switch (kycStatus) {
            case 'verified':
                return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <CheckCircleIcon className="w-4 h-4 mr-1" /> Verified
                </span>;
            case 'rejected':
                return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    <XCircleIcon className="w-4 h-4 mr-1" /> Rejected
                </span>;
            default:
                return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    <ArrowPathIcon className="w-4 h-4 mr-1" /> Pending
                </span>;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                                <DocumentTextIcon className="w-8 h-8 mr-3 text-indigo-600" />
                                KYC Verification
                            </h1>
                            <p className="text-gray-600 mt-2">Complete your KYC to verify your business</p>
                        </div>
                        {getStatusBadge()}
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    PAN Number *
                                </label>
                                <input
                                    type="text"
                                    name="panNumber"
                                    value={formData.panNumber}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="ABCDE1234F"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Aadhaar Number *
                                </label>
                                <input
                                    type="text"
                                    name="aadhaarNumber"
                                    value={formData.aadhaarNumber}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="1234 5678 9012"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    GST Number (Optional)
                                </label>
                                <input
                                    type="text"
                                    name="gstNumber"
                                    value={formData.gstNumber}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="22AAAAA0000A1Z5"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Business Address *
                                </label>
                                <textarea
                                    name="businessAddress"
                                    value={formData.businessAddress}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Complete business address"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    PAN Card Document *
                                </label>
                                <input
                                    type="file"
                                    name="panCard"
                                    onChange={handleFileChange}
                                    accept="image/*,.pdf"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Aadhaar Card Document *
                                </label>
                                <input
                                    type="file"
                                    name="aadhaarCard"
                                    onChange={handleFileChange}
                                    accept="image/*,.pdf"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    GST Certificate (Optional)
                                </label>
                                <input
                                    type="file"
                                    name="gstCertificate"
                                    onChange={handleFileChange}
                                    accept="image/*,.pdf"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Business Proof (Optional)
                                </label>
                                <input
                                    type="file"
                                    name="businessProof"
                                    onChange={handleFileChange}
                                    accept="image/*,.pdf"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading || kycStatus === 'verified'}
                                className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Submitting...' : kycStatus === 'verified' ? 'Already Verified' : 'Submit KYC'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OwnerKYCForm;