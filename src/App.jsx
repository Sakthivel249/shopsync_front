import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import AdminDashboard from './components/admin/AdminDashboard';
import CashierDashboard from './components/cashier/CashierDashboard'; // Import Cashier Dashboard
import StorekeeperDashboard from './components/storekeeper/StorekeeperDashboard'; // Import Storekeeper Dashboard
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

    // This function now determines which dashboard to show based on the user's role.
    const renderContent = () => {
        if (!userData) {
            return <LoginForm onLogin={handleLogin} error={error} isLoading={isLoading} />;
        }

        switch (userData.role) {
            case 'ADMIN':
                return <AdminDashboard userData={userData} onLogout={handleLogout} />;
            case 'CASHIER':
                return <CashierDashboard userData={userData} onLogout={handleLogout} />;
            case 'STOREKEEPER':
                return <StorekeeperDashboard userData={userData} onLogout={handleLogout} />;
            default:
                // A fallback for any other roles that might exist
                return (
                    <div className="container">
                        <h2>Welcome, {userData.employeeName}</h2>
                        <p>Your role ({userData.role}) does not have a specific dashboard assigned.</p>
                        <button onClick={handleLogout} style={{width: 'auto', padding: '10px 20px'}}>Logout</button>
                    </div>
                );
        }
    }

    return (
        <div className="App">
            {renderContent()}
        </div>
    );
}

export default App;