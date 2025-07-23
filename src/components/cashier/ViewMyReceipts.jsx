import React, { useState, useEffect } from 'react';

// This uses the dedicated, secure endpoint for the cashier's own receipts
const API_URL = 'http://localhost:8080/api/cashier/receipts';

function ViewMyReceipts({ userData }) {
    const [receipts, setReceipts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const getAuthHeaders = () => ({
        'Content-Type': 'application/json',
        'loggedInEmail': userData.email,
    });

    useEffect(() => {
        const fetchReceipts = async () => {
            setIsLoading(true);
            setError('');
            try {
                const response = await fetch(API_URL, { headers: getAuthHeaders() });
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.error || 'Failed to fetch your receipts');
                }
                const data = await response.json();
                setReceipts(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReceipts();
    }, [userData.email]);

    const filteredReceipts = receipts.filter(receipt => {
        const idMatch = receipt.id.toString().includes(searchTerm);
        const nameMatch = receipt.customerName.toLowerCase().includes(searchTerm.toLowerCase());
        return idMatch || nameMatch;
    });

    // This function resets the search term, showing all receipts
    const handleClearFilter = () => {
        setSearchTerm('');
    };

    return (
        <div className="management-section">
            <h2>My Past Receipts</h2>

            <div className="filter-controls" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <div className="input-group" style={{ flexGrow: 1, margin: 0 }}>
                    <input
                        type="text"
                        placeholder="Search by ID or Customer Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    className="action-btn"
                    onClick={handleClearFilter}
                    style={{ width: 'auto', alignSelf: 'center' }}
                >
                    Show All My Receipts
                </button>
            </div>

            {error && <p className="error-message">{error}</p>}

            {isLoading ? <p>Loading receipts...</p> : (
                <table>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Customer Name</th>
                        <th>Date & Time</th>
                        <th>Total ($)</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredReceipts.length > 0 ? filteredReceipts.map(r => (
                        <tr key={r.id}>
                            <td>{r.id}</td>
                            <td>{r.customerName}</td>
                            <td>{new Date(r.dateTime).toLocaleString()}</td>
                            <td>{`$${r.totalAmount.toFixed(2)}`}</td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="4">
                                {searchTerm ? 'No receipts match your search.' : 'You have not created any receipts yet.'}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default ViewMyReceipts;