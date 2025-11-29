import React from 'react';
import { Link } from 'react-router-dom';
import { UserGroupIcon, ShieldCheckIcon, StarIcon } from '@heroicons/react/24/outline';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AboutUs = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-primary-dark to-blue-600 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold mb-4">About PGFinder</h1>
                    <p className="text-xl">Your trusted partner in finding the perfect PG accommodation</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                        <p className="text-lg text-gray-700 mb-4">
                            PGFinder is dedicated to simplifying the process of finding quality PG accommodations. 
                            We connect students and working professionals with verified, safe, and affordable housing options.
                        </p>
                        <p className="text-lg text-gray-700">
                            Our platform ensures transparency, reliability, and convenience for both tenants and property owners.
                        </p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8">
                        <div className="grid grid-cols-2 gap-6 text-center">
                            <div>
                                <div className="text-3xl font-bold text-primary-dark">1000+</div>
                                <div className="text-gray-600">Properties</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-primary-dark">5000+</div>
                                <div className="text-gray-600">Happy Tenants</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-primary-dark">50+</div>
                                <div className="text-gray-600">Cities</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-primary-dark">4.8</div>
                                <div className="text-gray-600">Rating</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center p-6">
                        <ShieldCheckIcon className="w-16 h-16 text-primary-dark mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Verified Properties</h3>
                        <p className="text-gray-600">All properties are thoroughly verified for safety and quality standards.</p>
                    </div>
                    <div className="text-center p-6">
                        <UserGroupIcon className="w-16 h-16 text-primary-dark mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Trusted Community</h3>
                        <p className="text-gray-600">Join thousands of satisfied tenants and property owners in our community.</p>
                    </div>
                    <div className="text-center p-6">
                        <StarIcon className="w-16 h-16 text-primary-dark mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Best Experience</h3>
                        <p className="text-gray-600">User-friendly platform with 24/7 support for seamless experience.</p>
                    </div>
                </div>
            </div>
            
            <Footer />
        </div>
    );
};

export default AboutUs;