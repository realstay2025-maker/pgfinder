import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DocumentTextIcon, ArrowDownTrayIcon, PlusIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const OwnerInvoices = () => {
    const { user } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        tenantId: '',
        month: new Date().toISOString().slice(0, 7),
        rent: '',
        electricity: '',
        water: '',
        maintenance: '',
        other: ''
    });

    const fetchInvoices = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get('http://localhost:5000/api/owner/invoices', config);
            setInvoices(res.data);
        } catch (err) {
            console.error('Failed to fetch invoices:', err);
        }
    };

    const fetchTenants = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get('http://localhost:5000/api/properties/available-tenants', config);
            setTenants(res.data);
        } catch (err) {
            console.error('Failed to fetch tenants:', err);
        }
    };

    const generateInvoice = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post('http://localhost:5000/api/owner/invoices', formData, config);
            setFormData({
                tenantId: '',
                month: new Date().toISOString().slice(0, 7),
                rent: '',
                electricity: '',
                water: '',
                maintenance: '',
                other: ''
            });
            setShowForm(false);
            fetchInvoices();
        } catch (err) {
            console.error('Failed to generate invoice:', err);
        }
    };

    const downloadInvoice = async (id) => {
        try {
            const config = { 
                headers: { Authorization: `Bearer ${user.token}` },
                responseType: 'blob'
            };
            const res = await axios.get(`http://localhost:5000/api/owner/invoices/${id}/download`, config);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Failed to download invoice:', err);
        }
    };

    useEffect(() => {
        fetchInvoices();
        fetchTenants();
    }, []);

    const calculateTotal = () => {
        const { rent, electricity, water, maintenance, other } = formData;
        return (parseFloat(rent || 0) + parseFloat(electricity || 0) + 
                parseFloat(water || 0) + parseFloat(maintenance || 0) + 
                parseFloat(other || 0)).toFixed(2);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Invoice Management</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Generate Invoice
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <form onSubmit={generateInvoice}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tenant</label>
                                <select
                                    value={formData.tenantId}
                                    onChange={(e) => setFormData({...formData, tenantId: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                >
                                    <option value="">Select Tenant</option>
                                    {tenants.map(tenant => (
                                        <option key={tenant._id} value={tenant._id}>
                                            {tenant.name} - {tenant.roomNumber}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                                <input
                                    type="month"
                                    value={formData.month}
                                    onChange={(e) => setFormData({...formData, month: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Rent (₹)</label>
                                <input
                                    type="number"
                                    value={formData.rent}
                                    onChange={(e) => setFormData({...formData, rent: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Electricity (₹)</label>
                                <input
                                    type="number"
                                    value={formData.electricity}
                                    onChange={(e) => setFormData({...formData, electricity: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Water (₹)</label>
                                <input
                                    type="number"
                                    value={formData.water}
                                    onChange={(e) => setFormData({...formData, water: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance (₹)</label>
                                <input
                                    type="number"
                                    value={formData.maintenance}
                                    onChange={(e) => setFormData({...formData, maintenance: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Other Charges (₹)</label>
                            <input
                                type="number"
                                value={formData.other}
                                onChange={(e) => setFormData({...formData, other: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div className="mt-4 p-3 bg-gray-50 rounded-md">
                            <p className="text-lg font-semibold">Total: ₹{calculateTotal()}</p>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                Generate Invoice
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-lg shadow">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {invoices.map((invoice) => (
                                <tr key={invoice._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        #{invoice.invoiceNumber}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {invoice.tenantName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(invoice.month).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        ₹{invoice.totalAmount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                                            invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => downloadInvoice(invoice._id)}
                                            className="flex items-center text-blue-600 hover:text-blue-900"
                                        >
                                            <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                                            Download
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OwnerInvoices;