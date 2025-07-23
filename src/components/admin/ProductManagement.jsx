import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8080/api/admin/products';
const SECTIONS_API_URL = 'http://localhost:8080/api/admin/sections';

function ProductManagement({ userData }) {
    const [products, setProducts] = useState([]);
    const [sections, setSections] = useState([]); // State to hold sections
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const getAuthHeaders = () => ({
        'Content-Type': 'application/json',
        'loggedInEmail': userData.email,
    });

    // This function now fetches both products and sections
    const fetchData = async () => {
        setIsLoading(true);
        setError('');
        try {
            const [productsResponse, sectionsResponse] = await Promise.all([
                fetch(API_URL, { headers: getAuthHeaders() }),
                fetch(SECTIONS_API_URL, { headers: getAuthHeaders() })
            ]);

            if (!productsResponse.ok) throw new Error('Failed to fetch products');
            if (!sectionsResponse.ok) throw new Error('Failed to fetch sections');

            const productsData = await productsResponse.json();
            const sectionsData = await sectionsResponse.json();

            setProducts(productsData);
            setSections(sectionsData);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateOrUpdate = async (productData) => {
        // Find the full section object to send to the backend
        const section = sections.find(s => s.id === parseInt(productData.sectionId));
        const payload = { ...productData, section };
        delete payload.sectionId; // Clean up the temporary ID

        const isUpdating = !!editingProduct;
        const url = isUpdating ? `${API_URL}/${editingProduct.id}` : API_URL;
        const method = isUpdating ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, { method, headers: getAuthHeaders(), body: JSON.stringify(payload) });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || `Failed to ${isUpdating ? 'update' : 'create'} product`);
            }
            closeModal();
            await fetchData();
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
                await fetchData();
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const openModalForCreate = () => { setEditingProduct(null); setIsModalOpen(true); setError(''); };
    const openModalForEdit = (product) => { setEditingProduct(product); setIsModalOpen(true); setError(''); };
    const closeModal = () => { setIsModalOpen(false); setEditingProduct(null); setError(''); };

    return (
        <div className="management-section">
            <h2>Manage Products</h2>
            {error && !isModalOpen && <p className="error-message">{error}</p>}
            <button className="add-new-btn" onClick={openModalForCreate}>Add New Product</button>

            {isLoading ? <p>Loading...</p> : (
                <div>
                    {/* --- THIS IS THE NEW LOGIC TO GROUP PRODUCTS BY SECTION --- */}
                    {sections.map(section => {
                        const productsInSection = products.filter(p => p.section?.id === section.id);

                        if (productsInSection.length === 0) return null; // Don't show empty sections

                        return (
                            <div key={section.id} className="section-group">
                                <h3 className="section-header">{section.name}</h3>
                                <table>
                                    <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Price ($)</th>
                                        <th>Quantity</th>
                                        <th>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {productsInSection.map(p => (
                                        <tr key={p.id}>
                                            <td>{p.id}</td>
                                            <td>{p.name}</td>
                                            <td>{p.price.toFixed(2)}</td>
                                            <td>{p.quantity}</td>
                                            <td>
                                                <button className="action-btn edit-btn" onClick={() => openModalForEdit(p)}>Edit</button>
                                                <button className="action-btn delete-btn" onClick={() => handleDelete(p.id)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })}
                </div>
            )}

            {isModalOpen && (
                <ProductFormModal
                    product={editingProduct}
                    sections={sections}
                    onClose={closeModal}
                    onSubmit={handleCreateOrUpdate}
                    error={error}
                />
            )}
        </div>
    );
}

// The Product Form Modal is also updated to use a dropdown for sections
function ProductFormModal({ product, sections, onClose, onSubmit, error }) {
    const [formData, setFormData] = useState({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price || '',
        quantity: product?.quantity || '',
        // Use sectionId for the dropdown state
        sectionId: product?.section?.id || (sections.length > 0 ? sections[0].id : '')
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
                        <label>Section</label>
                        {/* This is now a dropdown menu */}
                        <select name="sectionId" value={formData.sectionId} onChange={handleChange} required>
                            {sections.length > 0 ? (
                                sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
                            ) : (
                                <option disabled>No sections available</option>
                            )}
                        </select>
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