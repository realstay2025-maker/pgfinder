import React from 'react';
import { useAuth } from '../context/AuthContext';

const AuthDebug = () => {
    const { user } = useAuth();
    
    return (
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <h3 className="font-bold mb-2">Auth Debug Info:</h3>
            <pre className="text-sm">
                {JSON.stringify({
                    user: user ? {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        hasToken: !!user.token,
                        tokenLength: user.token?.length
                    } : null,
                    localStorage: localStorage.getItem('userInfo') ? 'exists' : 'missing'
                }, null, 2)}
            </pre>
        </div>
    );
};

export default AuthDebug;