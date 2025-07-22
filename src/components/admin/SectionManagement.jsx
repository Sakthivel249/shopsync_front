import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8080/api/admin/sections';

function SectionManagement({ userData }) {
    const [sections, setSections] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSection, setEditingSection] = useState(null);

    const getAuthHeaders = () => ({
        'Content-Type': 'application/json',
        'loggedInEmail': userData.email,
    });

    const fetchSections = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(API_URL, { headers: getAuthHeaders() });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to fetch sections');
            }
            const data = await response.json();
            setSections(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSections();
    }, []);

    const handleCreateOrUpdate = async (sectionData) => {
        const isUpdating = !!editingSection;
        const url = isUpdating ? `${API_URL}/${editingSection.id}` : API_URL;
        const method = isUpdating ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, { method, headers: getAuthHeaders(), body: JSON.stringify(sectionData) });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || `Failed to ${isUpdating ? 'update' : 'create'} section`);
            }
            closeModal();
            await fetchSections();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (sectionId) => {
        if (window.confirm('Are you sure you want to delete this section? This may affect products in this section.')) {
            try {
                const response = await fetch(`${API_URL}/${sectionId}`, { method: 'DELETE', headers: getAuthHeaders() });
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.error || 'Failed to delete section');
                }
                await fetchSections();
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const openModalForCreate = () => {
        setEditingSection(null);
        setIsModalOpen(true);
        setError('');
    };

    const openModalForEdit = (section) => {
        setEditingSection(section);
        setIsModalOpen(true);
        setError('');
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingSection(null);
        setError('');
    };

    return (
        <div className="management-section">
            <h2>Manage Sections</h2>
            {error && !isModalOpen && <p className="error-message">{error}</p>}
            <button className="add-new-btn" onClick={openModalForCreate}>Add New Section</button>

            {isLoading ? <p>Loading sections...</p> : (
                <table>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {sections.map(s => (
                        <tr key={s.id}>
                            <td>{s.id}</td>
                            <td>{s.name}</td>
                            <td>{s.description}</td>
                            <td>
                                <button className="action-btn edit-btn" onClick={() => openModalForEdit(s)}>Edit</button>
                                <button className="action-btn delete-btn" onClick={() => handleDelete(s.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

            {isModalOpen && (
                <SectionFormModal
                    section={editingSection}
                    onClose={closeModal}
                    onSubmit={handleCreateOrUpdate}
                    error={error}
                />
            )}
        </div>
    );
}

function SectionFormModal({ section, onClose, onSubmit, error }) {
    const [formData, setFormData] = useState({
        name: section?.name || '',
        description: section?.description || '',
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
                    <h2>{section ? 'Edit Section' : 'Create New Section'}</h2>
                    {error && <p className="error-message">{error}</p>}
                    <div className="input-group">
                        <label>Section Name</label>
                        <input name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <label>Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows="4" />
                    </div>
                    <div className="modal-actions">
                        <button type="submit" className="action-btn edit-btn">{section ? 'Update' : 'Create'}</button>
                        <button type="button" className="action-btn" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SectionManagement;