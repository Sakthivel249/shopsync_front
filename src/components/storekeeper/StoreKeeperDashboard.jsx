import React, { useState } from 'react';
// We are re-using the components built for the admin
import ProductManagement from '../admin/ProductManagement';
import SectionManagement from '../admin/SectionManagement';

function StorekeeperDashboard({ userData, onLogout }) {
    const [activeView, setActiveView] = useState('products'); // Default to products

    const renderActiveView = () => {
        switch (activeView) {
            case 'products':
                return <ProductManagement userData={userData} />;
            case 'sections':
                return <SectionManagement userData={userData} />;

            default:
                return <ProductManagement userData={userData} />;
        }
    };

    return (
        <div className="admin-dashboard">
            <div className="sidebar">
                <h3>Storekeeper Panel</h3>
                <nav>
                    <ul>
                        <li
                            className={activeView === 'products' ? 'active' : ''}
                            onClick={() => setActiveView('products')}
                        >
                            Manage Products
                        </li>
                        <li
                            className={activeView === 'sections' ? 'active' : ''}
                            onClick={() => setActiveView('sections')}
                        >
                            Manage Sections
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

export default StorekeeperDashboard;