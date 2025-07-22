import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import UserDetails from './components/UserDetails';
import AdminDashboard from './components/admin/AdminDashboard';
import './App.css';

function App() {
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (email, password) => {
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8080/api/employees/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            // Store the email along with the rest of the user data
            setUserData({ ...data, email: email });

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        setUserData(null);
        setError('');
    };

    const renderContent = () => {
        if (!userData) {
            return <LoginForm onLogin={handleLogin} error={error} isLoading={isLoading} />;
        }

        if (userData.role === 'ADMIN') {
            return <AdminDashboard userData={userData} onLogout={handleLogout} />;
        } else {
            return <UserDetails userData={userData} onLogout={handleLogout} />;
        }
    }

    return (
        <div className="App">
            {renderContent()}
        </div>
    );
}

export default App;