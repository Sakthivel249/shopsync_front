import React, { useState } from 'react';
import EmployeeManagement from './EmployeeManagement';

// Placeholder components for other sections
const ProductManagement = () => <div className="management-section"><h2>Manage Products</h2><p>Product management interface goes here.</p></div>;
const SectionManagement = () => <div className="management-section"><h2>Manage Sections</h2><p>Section management interface goes here.</p></div>;
const ReceiptManagement = () => <div className="management-section"><h2>Manage Receipts</h2><p>Receipt management interface goes here.</p></div>;

function AdminDashboard({ userData, onLogout }) {
    const [activeView, setActiveView] = useState('employees');

    const renderActiveView = () => {
        switch (activeView) {
            case 'employees':
                return <EmployeeManagement userData={userData} />;
            case 'products':
                return <ProductManagement />;
            case 'sections':
                return <SectionManagement />;
            case 'receipts':
                return <ReceiptManagement />;
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