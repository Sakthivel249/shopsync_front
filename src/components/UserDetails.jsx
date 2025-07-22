import React from 'react';

function UserDetails({ userData, onLogout }) {
    return (
        <div className="container">
            <div className="user-details-container">
                <h2>Welcome, {userData.employeeName}! 👋</h2>
                <div className="user-info">
                    <p><strong>Role:</strong> {userData.role}</p>
                    <p><strong>Permissions:</strong></p>
                    <ul>
                        {userData.options.map((option, index) => (
                            <li key={index}>{option}</li>
                        ))}
                    </ul>
                </div>
                <button onClick={onLogout}>Logout</button>
            </div>
        </div>
    );
}

export default UserDetails;