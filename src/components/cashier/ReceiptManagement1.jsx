import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8080/api/admin/receipts';
const PRODUCTS_API_URL = 'http://localhost:8080/api/admin/products';

function ReceiptManagement1({ userData }) {
    const [receipts, setReceipts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [viewingReceipt, setViewingReceipt] = useState(null);

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
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(receiptData)
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to create receipt');
            }
            closeModal();
            await fetchReceipts();
        } catch (err) {
            // This error will be displayed inside the modal
            throw err;
        }
    };

    // The handleDelete function has been removed

    const closeModal = () => {
        setIsCreateModalOpen(false);
        setViewingReceipt(null);
        setError('');
    };

    return (
        <div className="management-section">
            <h2>Manage Receipts</h2>
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
                                <button className="action-btn view-btn" onClick={() => setViewingReceipt(r)}>View</button>
                                {/* The Delete button has been removed */}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

            {isCreateModalOpen && (
                <ReceiptPOSModal
                    onClose={closeModal}
                    onSubmit={handleCreate}
                    userData={userData}
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


// This is the new, advanced Point-of-Sale modal
function ReceiptPOSModal({ onClose, onSubmit, userData }) {
    const [allProducts, setAllProducts] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');

    // Fetch all products when the modal opens
    useEffect(() => {
        const fetchProducts = async () => {
            const headers = { 'loggedInEmail': userData.email };
            try {
                const response = await fetch(PRODUCTS_API_URL, { headers });
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.error || "Could not load products.");
                }
                const data = await response.json();
                setAllProducts(data);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchProducts();
    }, [userData.email]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const addToCart = (product) => {
        setCartItems(prevItems => {
            const exist = prevItems.find(item => item.product.id === product.id);
            if (exist) {
                return prevItems.map(item =>
                    item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevItems, { product, quantity: 1 }];
        });
        setSearchTerm(''); // Clear search after adding
    };

    const updateQuantity = (productId, amount) => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.product.id === productId ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item
            )
        );
    };

    const removeFromCart = (productId) => {
        setCartItems(prevItems => prevItems.filter(item => item.product.id !== productId));
    };

    const totalAmount = cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);

    const searchResults = searchTerm && Array.isArray(allProducts)
        ? allProducts.filter(p => {
            const nameMatch = p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase());
            const idMatch = p.id != null && p.id.toString().includes(searchTerm);
            return nameMatch || idMatch;
        })
        : [];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (cartItems.length === 0) {
            setError('Please add at least one item to the receipt.');
            return;
        }

        const receiptData = {
            customerName,
            totalAmount,
            cashierEmail: userData.email,
            // Format items into strings to match your current backend model
            items: cartItems.map(item => `${item.quantity} x ${item.product.name}`)
        };

        try {
            await onSubmit(receiptData);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content pos-modal">
                <form onSubmit={handleSubmit}>
                    <h2>Create New Receipt (POS)</h2>
                    {error && <p className="error-message">{error}</p>}

                    <div className="input-group">
                        <label>Customer Name</label>
                        <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
                    </div>

                    <div className="input-group product-search">
                        <label>Search Products (by Name or ID)</label>
                        <input value={searchTerm} onChange={handleSearchChange} placeholder="e.g., Lux Soap or 2" />
                        {searchResults.length > 0 && (
                            <ul className="search-results">
                                {searchResults.slice(0, 5).map(p => (
                                    <li key={p.id} onClick={() => addToCart(p)}>
                                        <span>{p.name}</span>
                                        <span>${p.price.toFixed(2)}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="cart-items">
                        <h4>Items</h4>
                        {cartItems.length === 0 ? <p className="empty-cart">Cart is empty</p> : (
                            <table className="cart-table">
                                <tbody>
                                {cartItems.map(item => (
                                    <tr key={item.product.id}>
                                        <td>{item.product.name}</td>
                                        <td>
                                            <button type="button" onClick={() => updateQuantity(item.product.id, -1)}>-</button>
                                            <span>{item.quantity}</span>
                                            <button type="button" onClick={() => updateQuantity(item.product.id, 1)}>+</button>
                                        </td>
                                        <td>${(item.product.price * item.quantity).toFixed(2)}</td>
                                        <td><button type="button" onClick={() => removeFromCart(item.product.id)} className="remove-btn">&times;</button></td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div className="total-amount">
                        <strong>Total:</strong>
                        <span>${totalAmount.toFixed(2)}</span>
                    </div>

                    <div className="modal-actions">
                        <button type="submit" className="action-btn edit-btn">Create Receipt</button>
                        <button type="button" className="action-btn" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// This component is for viewing details and remains the same
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

export default ReceiptManagement1;