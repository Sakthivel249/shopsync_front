import React, { useState } from 'react';
import CreateReceipt from './CreateReceipt';
import ViewMyReceipts from './ViewMyReceipts';

function CashierDashboard({ userData, onLogout }) {
    const [activeView, setActiveView] = useState('create');

    const renderActiveView = () => {
        switch (activeView) {
            case 'create':
                return <CreateReceipt userData={userData} />;
            case 'view':
                return <ViewMyReceipts userData={userData} />;
            default:
                return <CreateReceipt userData={userData} />;
        }
    };

    return (
        <div className="admin-dashboard">
            <div className="sidebar">
                <h3>Cashier Panel</h3>
                <nav>
                    <ul>
                        <li
                            className={activeView === 'create' ? 'active' : ''}
                            onClick={() => setActiveView('create')}
                        >
                            Create Receipt
                        </li>
                        <li
                            className={activeView === 'view' ? 'active' : ''}
                            onClick={() => setActiveView('view')}
                        >
                            View My Receipts
                        </li>
                    </ul>
                </nav>
                <div className="sidebar-footer">
                    <p>Logged in as<br/><strong>{userData.employeeName}</strong></p>
                    <button onClick={onLogout} className="logout-btn">Logout</button>
                </div>
            </div>
            <div className="main-content">
                {renderActiveView()}
            </div>
        </div>
    );
}

export default CashierDashboard;