import React from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, ShieldCheckIcon, UserGroupIcon, CurrencyRupeeIcon, ClockIcon } from '@heroicons/react/24/outline';
import Header from '../components/Header';

const Services = () => {
    const services = [
        {
            icon: MagnifyingGlassIcon,
            title: 'Property Search',
            description: 'Advanced search filters to find PGs based on location, budget, amenities, and preferences.',
            features: ['Location-based search', 'Budget filters', 'Amenity matching', 'Room type selection']
        },
        {
            icon: ShieldCheckIcon,
            title: 'Verification Services',
            description: 'Comprehensive property and owner verification for safe and secure accommodations.',
            features: ['Property inspection', 'Owner background check', 'Legal document verification', 'Safety compliance']
        },
        {
            icon: UserGroupIcon,
            title: 'Tenant Management',
            description: 'Complete tenant lifecycle management from booking to move-out.',
            features: ['Online booking', 'Digital agreements', 'Payment tracking', 'Complaint resolution']
        },
        {
            icon: CurrencyRupeeIcon,
            title: 'Payment Solutions',
            description: 'Secure and convenient payment options for rent and deposits.',
            features: ['Online payments', 'Payment reminders', 'Transaction history', 'Receipt generation']
        },
        {
            icon: ClockIcon,
            title: '24/7 Support',
            description: 'Round-the-clock customer support for all your queries and concerns.',
            features: ['Live chat support', 'Phone assistance', 'Email support', 'Emergency helpline']
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-primary-dark to-blue-600 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold mb-4">Our Services</h1>
                    <p className="text-xl">Comprehensive solutions for all your PG accommodation needs</p>
                </div>
            </div>

            {/* Services Grid */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, index) => {
                        const Icon = service.icon;
                        return (
                            <div key={index} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition">
                                <div className="text-center mb-6">
                                    <Icon className="w-16 h-16 text-primary-dark mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                                    <p className="text-gray-600">{service.description}</p>
                                </div>
                                <ul className="space-y-2">
                                    {service.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center text-sm text-gray-700">
                                            <div className="w-2 h-2 bg-primary-dark rounded-full mr-3"></div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-primary-dark to-blue-600 rounded-2xl text-white p-12 text-center mt-16">
                    <h2 className="text-3xl font-bold mb-4">Ready to Find Your Perfect PG?</h2>
                    <p className="text-xl mb-8">Join thousands of satisfied customers who found their ideal accommodation through PGFinder</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/" className="bg-white text-primary-dark px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                            Browse Properties
                        </Link>
                        <Link to="/register" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-dark transition">
                            List Your Property
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Services;