import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8080/api/admin/receipts';

function ReceiptManagement({ userData }) {
    const [receipts, setReceipts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [viewingReceipt, setViewingReceipt] = useState(null); // To view details

    const getAuthHeaders = () => ({
        'Content-Type': 'application/json',
        'loggedInEmail': userData.email,
    });

    const fetchReceipts = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(API_URL, { headers: getAuthHeaders() });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to fetch receipts');
            }
            const data = await response.json();
            setReceipts(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReceipts();
    }, []);

    const handleCreate = async (receiptData) => {
        // Convert items from a string to a list of strings
        const payload = {
            ...receiptData,
            totalAmount: parseFloat(receiptData.totalAmount),
            items: receiptData.items.split('\n').filter(item => item.trim() !== '')
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to create receipt');
            }
            closeModal();
            await fetchReceipts(); // Refresh list
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (receiptId) => {
        if (window.confirm('Are you sure you want to delete this receipt?')) {
            try {
                const response = await fetch(`${API_URL}/${receiptId}`, { method: 'DELETE', headers: getAuthHeaders() });
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.error || 'Failed to delete receipt');
                }
                await fetchReceipts(); // Refresh list
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const closeModal = () => {
        setIsCreateModalOpen(false);
        setViewingReceipt(null);
        setError('');
    };

    return (
        <div className="management-section">
            <h2>Manage Receipts</h2>
            {error && !isCreateModalOpen && !viewingReceipt && <p className="error-message">{error}</p>}
            <button className="add-new-btn" onClick={() => setIsCreateModalOpen(true)}>Create New Receipt</button>

            {isLoading ? <p>Loading receipts...</p> : (
                <table>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Customer Name</th>
                        <th>Date & Time</th>
                        <th>Total ($)</th>
                        <th>Cashier Email</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {receipts.map(r => (
                        <tr key={r.id}>
                            <td>{r.id}</td>
                            <td>{r.customerName}</td>
                            <td>{new Date(r.dateTime).toLocaleString()}</td>
                            <td>{r.totalAmount.toFixed(2)}</td>
                            <td>{r.cashierEmail}</td>
                            <td>
                                <button className="action-btn edit-btn" onClick={() => setViewingReceipt(r)}>View</button>
                                <button className="action-btn delete-btn" onClick={() => handleDelete(r.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

            {isCreateModalOpen && (
                <ReceiptCreateModal
                    onClose={closeModal}
                    onSubmit={handleCreate}
                    error={error}
                    loggedInEmail={userData.email}
                />
            )}

            {viewingReceipt && (
                <ReceiptViewModal
                    receipt={viewingReceipt}
                    onClose={closeModal}
                />
            )}
        </div>
    );
}

function ReceiptCreateModal({ onClose, onSubmit, error, loggedInEmail }) {
    const [formData, setFormData] = useState({
        customerName: '',
        totalAmount: '',
        cashierEmail: loggedInEmail, // Pre-fill with logged-in user's email
        items: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <form onSubmit={handleSubmit}>
                    <h2>Create New Receipt</h2>
                    {error && <p className="error-message">{error}</p>}
                    <div className="input-group">
                        <label>Customer Name</label>
                        <input name="customerName" value={formData.customerName} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <label>Cashier Email</label>
                        <input name="cashierEmail" value={formData.cashierEmail} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <label>Total Amount</label>
                        <input type="number" step="0.01" name="totalAmount" value={formData.totalAmount} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <label>Items (one item per line)</label>
                        <textarea name="items" value={formData.items} onChange={handleChange} rows="5" required />
                    </div>
                    <div className="modal-actions">
                        <button type="submit" className="action-btn edit-btn">Create</button>
                        <button type="button" className="action-btn" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function ReceiptViewModal({ receipt, onClose }) {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Receipt Details (ID: {receipt.id})</h2>
                <div className="user-info">
                    <p><strong>Customer:</strong> {receipt.customerName}</p>
                    <p><strong>Date:</strong> {new Date(receipt.dateTime).toLocaleString()}</p>
                    <p><strong>Total:</strong> ${receipt.totalAmount.toFixed(2)}</p>
                    <p><strong>Cashier:</strong> {receipt.cashierEmail}</p>
                    <p><strong>Items Purchased:</strong></p>
                    <ul>
                        {receipt.items.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </div>
                <div className="modal-actions">
                    <button type="button" className="action-btn" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}

export default ReceiptManagement;