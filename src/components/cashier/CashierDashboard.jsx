import React from 'react';
// Import the admin's receipt management component
import ReceiptManagement from './ReceiptManagement1.jsx';

function CashierDashboard({ userData, onLogout }) {
    return (
        <div className="admin-dashboard">
            <div className="sidebar">
                <h3>Cashier Panel</h3>
                <nav>
                    <ul>
                        {/* The sidebar is simplified as there's only one view now */}
                        <li className="active">Manage Receipts</li>
                    </ul>
                </nav>
                <div className="sidebar-footer">
                    <p>Logged in as<br/><strong>{userData.employeeName}</strong></p>
                    <button onClick={onLogout} className="logout-btn">Logout</button>
                </div>
            </div>
            <div className="main-content">
                {/* Render the same component the admin uses */}
                <ReceiptManagement userData={userData} />
            </div>
        </div>
    );
}

export default CashierDashboard;