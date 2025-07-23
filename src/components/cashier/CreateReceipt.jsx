import React, { useState } from 'react';

// This uses the cashier's endpoint for creation
const API_URL = 'http://localhost:8080/api/cashier/receipts';

function CreateReceipt({ userData }) {
    const [formData, setFormData] = useState({
        customerName: '',
        totalAmount: '',
        cashierEmail: userData.email, // Pre-filled and locked
        items: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const getAuthHeaders = () => ({
        'Content-Type': 'application/json',
        'loggedInEmail': userData.email,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const payload = {
            ...formData,
            totalAmount: parseFloat(formData.totalAmount),
            items: formData.items.split('\n').filter(item => item.trim() !== '')
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to create receipt');
            }

            setSuccess(`Receipt created successfully!`);
            // Reset form for the next sale
            setFormData({
                customerName: '',
                totalAmount: '',
                cashierEmail: userData.email,
                items: '',
            });

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="management-section">
            <h2>Create New Receipt</h2>
            <form onSubmit={handleSubmit}>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}

                <div className="input-group">
                    <label>Customer Name</label>
                    <input name="customerName" value={formData.customerName} onChange={handleChange} required />
                </div>
                <div className="input-group">
                    <label>Total Amount ($)</label>
                    <input type="number" step="0.01" name="totalAmount" value={formData.totalAmount} onChange={handleChange} required />
                </div>
                <div className="input-group">
                    <label>Items (one item per line)</label>
                    <textarea name="items" value={formData.items} onChange={handleChange} rows="6" required />
                </div>
                <div className="input-group">
                    <label>Cashier Email</label>
                    <input name="cashierEmail" value={formData.cashierEmail} readOnly disabled />
                </div>

                <button type="submit" className="add-new-btn" style={{width: '100%', marginTop: '1rem'}}>Submit Receipt</button>
            </form>
        </div>
    );
}

export default CreateReceipt;