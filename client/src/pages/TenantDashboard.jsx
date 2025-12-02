// client/src/pages/TenantDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CreditCardIcon, CalendarDaysIcon, HomeIcon } from '@heroicons/react/24/outline';
import { API_ENDPOINTS } from '../config/api';

// Replace with your actual key and script initialization logic
// In a production app, the key would come from the backend for security
const RAZORPAY_KEY_ID = 'rzp_test_XXXXXXXXXXXXXXXX'; 

const TenantDashboard = () => {
    const { user } = useAuth();
    const [dues, setDues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // MOCK DATA FETCH (In a real app, this fetches payments where status='due')
    useEffect(() => {
        // Placeholder data simulating an API call for outstanding dues
        const mockDues = [
            {
                _id: '60c72b2f9f1b4c0015b8d2b2', // IMPORTANT: This ID is needed for the API call
                propertyId: '1234',
                paymentMonth: '2025-11',
                amountPaid: 0,
                dueDate: '2025-11-05',
                amountDue: 8500,
                roomNumber: 'A-101'
            }
        ];
        
        setTimeout(() => {
            setDues(mockDues);
            setLoading(false);
        }, 1000);
    }, []);
    
    // --- Razorpay/Gateway Integration Logic ---
    const displayRazorpay = async (due) => {
        
        // 1. Call Backend to Initiate Order
        const paymentData = {
            paymentId: due._id, 
            amount: due.amountDue, 
        };
        
        let order;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.post(`${API_ENDPOINTS.PAYMENTS}/initiate`, paymentData, config);
            order = res.data;
        } catch (err) {
            alert('Failed to initiate payment order.');
            return;
        }
        
        // 2. Configure Gateway Checkout
        const options = {
            key: RAZORPAY_KEY_ID, 
            amount: order.amount * 100, // Amount in paise
            currency: order.currency,
            name: "PG Management",
            description: `Rent for ${due.paymentMonth}`,
            order_id: order.orderId, 
            handler: function (response) {
                // This handler is called on successful payment
                alert("Payment Successful! Transaction ID: " + response.razorpay_payment_id);
                // **NOTE:** The status update is handled by the Backend Webhook, 
                // but you can call an endpoint here to verify if needed.
                setDues(dues.filter(d => d._id !== due._id)); // Optimistically remove the due
            },
            prefill: {
                name: user.name,
                email: user.email,
            },
            theme: {
                color: '#3B82F6' // Primary blue color
            }
        };

        // 3. Launch Gateway Checkout
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
    };


    if (loading) return <div className="p-4 md:p-6 text-lg md:text-xl">Loading your tenant portal...</div>;
    if (error) return <div className="p-4 md:p-6 text-custom-red text-sm md:text-base">{error}</div>;

    return (
        <div className="p-4 md:p-6 lg:p-8 min-h-screen bg-gray-50">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6 border-b pb-2">Welcome, {user.name}!</h1>
            
            {/* Current Stay Info */}
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg mb-6 md:mb-8">
                <h2 className="text-lg md:text-xl font-semibold text-primary-dark flex items-center mb-3 md:mb-4">
                    <HomeIcon className="w-4 h-4 md:w-5 md:h-5 mr-2" /> My Current Stay
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-sm md:text-base text-gray-700">
                    <p><strong>Property:</strong> Your PG Name</p>
                    <p><strong>Room:</strong> A-101</p>
                    <p><strong>Monthly Rent:</strong> ₹8,500</p>
                    <p><strong>Lease Start:</strong> 2025-10-01</p>
                </div>
            </div>

            {/* Outstanding Dues Section */}
            <div className="mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-primary-dark mb-3 md:mb-4 flex items-center">
                    <CreditCardIcon className="w-5 h-5 md:w-6 md:h-6 mr-2" /> Outstanding Payments
                </h2>
                
                {dues.length === 0 ? (
                    <div className="p-4 md:p-6 bg-green-100 rounded-xl shadow-md text-center text-lg md:text-xl text-accent-green">
                        🎉 All clear! You have no outstanding dues.
                    </div>
                ) : (
                    <div className="space-y-3 md:space-y-4">
                        {dues.map((due) => (
                            <div key={due._id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-4 md:p-5 rounded-xl shadow-md border border-yellow-300 gap-3">
                                <div className="flex-1">
                                    <p className="text-base md:text-lg font-semibold text-gray-800">Rent for {due.paymentMonth}</p>
                                    <p className="text-xs md:text-sm text-gray-500 flex items-center mt-1">
                                        <CalendarDaysIcon className="w-3 h-3 md:w-4 md:h-4 mr-1" /> Due Date: {new Date(due.dueDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                    <p className="text-xl md:text-2xl font-extrabold text-custom-red">₹{due.amountDue.toLocaleString()}</p>
                                    <button
                                        onClick={() => displayRazorpay(due)}
                                        className="py-2 px-4 md:px-6 rounded-md text-white bg-primary-dark hover:bg-blue-700 transition text-sm md:text-base w-full sm:w-auto"
                                    >
                                        Pay Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {/* Payment History (Placeholder) */}
            <h2 className="text-xl md:text-2xl font-bold text-primary-dark mb-3 md:mb-4">Payment History</h2>
            <div className="p-4 md:p-6 bg-white rounded-xl shadow-md text-gray-500 text-sm md:text-base">
                Payment history coming soon...
            </div>
        </div>
    );
};

export default TenantDashboard;