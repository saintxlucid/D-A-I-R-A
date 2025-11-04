import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Redirect } from 'react-router-dom';

const Index = () => {
    const isAuthenticated = useAuthStore((s) => !!s.token);
    
    if (isAuthenticated) {
        return <Redirect to="/feed" />;
    }
    
    return (<div>
        <h1>Welcome to our application</h1>
        <p>Please log in.</p>
    </div>);
};

export default Index;