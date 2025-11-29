// client/src/pages/owner/BankSetupPage.jsx
import React, { useState, useEffect } from 'react';
import { CreditCardIcon, CheckCircleIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const BankSetupPage = () => {
    const { user } = useAuth();
    const [bankDetails, setBankDetails] = useState({
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        branchName: '',
        accountType: 'savings'
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Mock existing bank details
        const mockBankDetails = {
            accountHolderName: user?.name || '',
            accountNumber: '****1234',
            ifscCode: 'HDFC0001234',
            bankName: 'HDFC Bank',
            branchName: 'Main Branch',
            accountType: 'savings'
        };
        setBankDetails(mockBankDetails);
    }, [user]);

    const handleChange = (e) => {
        setBankDetails({ ...bankDetails, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            // Mock save operation
            await new Promise(resolve => setTimeout(resolve, 1000));
            setMessage('Bank details updated successfully!');
            setIsEditing(false);
        } catch (err) {
            setMessage('Failed to update bank details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <CreditCardIcon className="w-8 h-8 mr-2 text-blue-600" />
                    Bank Account Setup
                </h1>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Edit Details
                    </button>
                )}
            </div>
            
            {message && (
                <div className={`p-4 mb-6 rounded-lg ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <div className="flex items-center">
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                        {message}
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-lg p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Account Holder Name
                            </label>
                            <input
                                type="text"
                                name="accountHolderName"
                                value={bankDetails.accountHolderName}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                                placeholder="Enter account holder name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Account Number
                            </label>
                            <input
                                type="text"
                                name="accountNumber"
                                value={bankDetails.accountNumber}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                                placeholder="Enter account number"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                IFSC Code
                            </label>
                            <input
                                type="text"
                                name="ifscCode"
                                value={bankDetails.ifscCode}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                                placeholder="Enter IFSC code"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Bank Name
                            </label>
                            <input
                                type="text"
                                name="bankName"
                                value={bankDetails.bankName}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                                placeholder="Enter bank name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Branch Name
                            </label>
                            <input
                                type="text"
                                name="branchName"
                                value={bankDetails.branchName}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                                placeholder="Enter branch name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Account Type
                            </label>
                            <select
                                name="accountType"
                                value={bankDetails.accountType}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                            >
                                <option value="savings">Savings Account</option>
                                <option value="current">Current Account</option>
                            </select>
                        </div>
                    </div>

                    {isEditing && (
                        <div className="flex space-x-4 pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors font-medium"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </form>

                {!isEditing && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center">
                            <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                            <span className="text-green-800 font-medium">Bank details are configured and ready for payments</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BankSetupPage;