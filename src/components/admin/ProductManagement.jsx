import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8080/api/admin/products';

function ProductManagement({ userData }) {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const getAuthHeaders = () => ({
        'Content-Type': 'application/json',
        'loggedInEmail': userData.email,
    });

    const fetchProducts = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(API_URL, { headers: getAuthHeaders() });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to fetch products');
            }
            const data = await response.json();
            setProducts(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleCreateOrUpdate = async (productData) => {
        const isUpdating = !!editingProduct;
        const url = isUpdating ? `${API_URL}/${editingProduct.id}` : API_URL;
        const method = isUpdating ? 'PUT' : 'POST';

        // Convert numeric fields from string to number before sending
        const payload = {
            ...productData,
            price: parseFloat(productData.price),
            quantity: parseInt(productData.quantity, 10),
        };

        try {
            const response = await fetch(url, { method, headers: getAuthHeaders(), body: JSON.stringify(payload) });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || `Failed to ${isUpdating ? 'update' : 'create'} product`);
            }
            closeModal();
            await fetchProducts(); // Refresh the list
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                const response = await fetch(`${API_URL}/${productId}`, { method: 'DELETE', headers: getAuthHeaders() });
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.error || 'Failed to delete product');
                }
                await fetchProducts();
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const openModalForCreate = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
        setError('');
    };

    const openModalForEdit = (product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
        setError('');
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
        setError('');
    };

    return (
        <div className="management-section">
            <h2>Manage Products</h2>
            {error && !isModalOpen && <p className="error-message">{error}</p>}
            <button className="add-new-btn" onClick={openModalForCreate}>Add New Product</button>

            {isLoading ? <p>Loading...</p> : (
                <table>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Price ($)</th>
                        <th>Quantity</th>
                        <th>Category</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {products.map(p => (
                        <tr key={p.id}>
                            <td>{p.id}</td>
                            <td>{p.name}</td>
                            <td>{p.price.toFixed(2)}</td>
                            <td>{p.quantity}</td>
                            <td>{p.category}</td>
                            <td>
                                <button className="action-btn edit-btn" onClick={() => openModalForEdit(p)}>Edit</button>
                                <button className="action-btn delete-btn" onClick={() => handleDelete(p.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

            {isModalOpen && (
                <ProductFormModal
                    product={editingProduct}
                    onClose={closeModal}
                    onSubmit={handleCreateOrUpdate}
                    error={error}
                />
            )}
        </div>
    );
}

function ProductFormModal({ product, onClose, onSubmit, error }) {
    const [formData, setFormData] = useState({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price || '',
        quantity: product?.quantity || '',
        category: product?.category || ''
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
                    <h2>{product ? 'Edit Product' : 'Create New Product'}</h2>
                    {error && <p className="error-message">{error}</p>}
                    <div className="input-group">
                        <label>Product Name</label>
                        <input name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <label>Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows="3" />
                    </div>
                    <div className="input-group">
                        <label>Price</label>
                        <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <label>Quantity</label>
                        <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <label>Category</label>
                        <input name="category" value={formData.category} onChange={handleChange} required />
                    </div>
                    <div className="modal-actions">
                        <button type="submit" className="action-btn edit-btn">{product ? 'Update' : 'Create'}</button>
                        <button type="button" className="action-btn" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProductManagement;