import React, { useState } from 'react';
import { XMarkIcon, CheckIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../context/AuthContext';

const SubscriptionModal = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [selectedPlan, setSelectedPlan] = useState('free');
    const [loading, setLoading] = useState(false);

    const plans = {
        free: { price: 0, duration: '1 Month Free', discount: 100 },
        monthly: { price: 499, duration: '1 Month', discount: 0 },
        sixMonths: { price: 2499, duration: '6 Months', discount: 17 },
        yearly: { price: 4499, duration: '12 Months', discount: 25 }
    };

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`${API_ENDPOINTS.PROPERTIES}/subscribe`, {
                plan: selectedPlan,
                amount: plans[selectedPlan].price
            }, config);
            
            alert('Subscription activated successfully!');
            onClose();
        } catch (err) {
            alert('Subscription failed: ' + (err.response?.data?.message || err.message));
        }
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 max-w-6xl w-full border border-white/20 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Choose Your Plan
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {Object.entries(plans).map(([key, plan]) => (
                        <div
                            key={key}
                            onClick={() => setSelectedPlan(key)}
                            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                                selectedPlan === key
                                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            {key === 'free' ? (
                                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-1 rounded-full mb-2 w-fit font-bold">
                                    🎉 FREE TRIAL
                                </div>
                            ) : plan.discount > 0 && (
                                <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full mb-2 w-fit">
                                    {plan.discount}% OFF
                                </div>
                            )}
                            <h3 className="text-xl font-bold mb-2">{plan.duration}</h3>
                            <div className="text-3xl font-bold text-blue-600 mb-4">
                                {key === 'free' ? 'FREE' : `₹${plan.price}`}
                            </div>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center">
                                    <CheckIcon className="w-4 h-4 text-green-500 mr-2" />
                                    Unlimited Properties
                                </li>
                                <li className="flex items-center">
                                    <CheckIcon className="w-4 h-4 text-green-500 mr-2" />
                                    Payment Management
                                </li>
                                <li className="flex items-center">
                                    <CheckIcon className="w-4 h-4 text-green-500 mr-2" />
                                    Tenant Management
                                </li>
                                <li className="flex items-center">
                                    <CheckIcon className="w-4 h-4 text-green-500 mr-2" />
                                    24/7 Support
                                </li>
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubscribe}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 flex items-center justify-center"
                    >
                        <CreditCardIcon className="w-5 h-5 mr-2" />
                        {loading ? 'Processing...' : selectedPlan === 'free' ? 'Start Free Trial' : `Subscribe ₹${plans[selectedPlan].price}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionModal;