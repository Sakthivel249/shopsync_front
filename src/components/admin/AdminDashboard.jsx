import React, { useState } from 'react';
import EmployeeManagement from './EmployeeManagement';
import ProductManagement from './ProductManagement';
import SectionManagement from './SectionManagement';
import ReceiptManagement from './ReceiptManagement'; // Import the final component

function AdminDashboard({ userData, onLogout }) {
    const [activeView, setActiveView] = useState('employees');

    const renderActiveView = () => {
        switch (activeView) {
            case 'employees':
                return <EmployeeManagement userData={userData} />;
            case 'products':
                return <ProductManagement userData={userData} />;
            case 'sections':
                return <SectionManagement userData={userData} />;
            case 'receipts':
                return <ReceiptManagement userData={userData} />; // Use the final component
            default:
                return <EmployeeManagement userData={userData} />;
        }
    };

    return (
        <div className="admin-dashboard">
            <div className="sidebar">
                <h3>Admin Panel</h3>
                <nav>
                    <ul>
                        <li className={activeView === 'employees' ? 'active' : ''} onClick={() => setActiveView('employees')}>
                            Manage Employees
                        </li>
                        <li className={activeView === 'products' ? 'active' : ''} onClick={() => setActiveView('products')}>
                            Manage Products
                        </li>
                        <li className={activeView === 'sections' ? 'active' : ''} onClick={() => setActiveView('sections')}>
                            Manage Sections
                        </li>
                        <li className={activeView === 'receipts' ? 'active' : ''} onClick={() => setActiveView('receipts')}>
                            Manage Receipts
                        </li>
                    </ul>
                </nav>
                <div className="sidebar-footer">
                    <p>Logged in as<br /><strong>{userData.employeeName}</strong></p>
                    <button onClick={onLogout} className="logout-btn">Logout</button>
                </div>
            </div>
            <div className="main-content">
                {renderActiveView()}
            </div>
        </div>
    );
}

export default AdminDashboard;