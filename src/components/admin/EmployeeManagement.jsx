import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8080/api/admin/employees';

function EmployeeManagement({ userData }) {
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // State for the modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [viewingEmployee, setViewingEmployee] = useState(null);

    const getAuthHeaders = () => ({
        'Content-Type': 'application/json',
        'loggedInEmail': userData.email,
    });

    const fetchEmployees = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(API_URL, { headers: getAuthHeaders() });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to fetch employees');
            }
            const data = await response.json();
            setEmployees(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleCreateOrUpdate = async (employeeData) => {
        const isUpdating = !!editingEmployee;
        const url = isUpdating ? `${API_URL}/${editingEmployee.id}` : API_URL;
        const method = isUpdating ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(employeeData),
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || `Failed to ${isUpdating ? 'update' : 'create'} employee`);
            }
            closeModal();
            await fetchEmployees();
        } catch (err) {
            // Set error in the form modal
            setError(err.message);
        }
    };

    const handleDelete = async (employeeId) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            try {
                const response = await fetch(`${API_URL}/${employeeId}`, {
                    method: 'DELETE',
                    headers: getAuthHeaders(),
                });
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.error || 'Failed to delete employee');
                }
                await fetchEmployees();
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const openModalForCreate = () => {
        setEditingEmployee(null);
        setIsModalOpen(true);
        setError('');
    };

    const openModalForEdit = (employee) => {
        setEditingEmployee(employee);
        setIsModalOpen(true);
        setError('');
    };

    // Close all modals and reset states
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingEmployee(null);
        setViewingEmployee(null);
        setError('');
    };

    return (
        <div className="management-section">
            <h2>Manage Employees</h2>
            {error && !isModalOpen && !viewingEmployee && <p className="error-message">{error}</p>}
            <button className="add-new-btn" onClick={openModalForCreate}>Add New Employee</button>

            {isLoading ? <p>Loading employees...</p> : (
                <table>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {employees.map(emp => (
                        <tr key={emp.id}>
                            <td>{emp.id}</td>
                            <td>{emp.f_name}</td>
                            <td>{emp.l_name}</td>
                            <td>{emp.email}</td>
                            <td><span className={`role-badge role-${emp.role.toLowerCase()}`}>{emp.role}</span></td>
                            <td>
                                {/* ADDED THE "VIEW" BUTTON HERE */}
                                <button className="action-btn view-btn" onClick={() => setViewingEmployee(emp)}>View</button>
                                <button className="action-btn edit-btn" onClick={() => openModalForEdit(emp)}>Edit</button>
                                <button className="action-btn delete-btn" onClick={() => handleDelete(emp.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

            {isModalOpen && (
                <EmployeeFormModal
                    employee={editingEmployee}
                    onClose={closeModal}
                    onSubmit={handleCreateOrUpdate}
                    error={error}
                />
            )}

            {/* ADDED THE VIEW MODAL RENDER LOGIC */}
            {viewingEmployee && (
                <EmployeeViewModal
                    employee={viewingEmployee}
                    onClose={closeModal}
                />
            )}
        </div>
    );
}

// ADDED THE VIEW MODAL COMPONENT
function EmployeeViewModal({ employee, onClose }) {
    if (!employee) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Employee Details</h2>
                <div className="user-info" style={{ backgroundColor: '#fff', padding: 0 }}>
                    <p><strong>ID:</strong> {employee.id}</p>
                    <p><strong>Name:</strong> {employee.f_name} {employee.l_name}</p>
                    <p><strong>Email:</strong> {employee.email}</p>
                    <p><strong>Phone:</strong> {employee.phoneNo}</p>
                    <p><strong>Address:</strong> {employee.address}</p>
                    <p><strong>Role:</strong> {employee.role}</p>
                    <p><strong>Salary:</strong> ${employee.salary ? employee.salary.toLocaleString() : 'N/A'}</p>
                </div>
                <div className="modal-actions">
                    <button type="button" className="action-btn" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}


function EmployeeFormModal({ employee, onClose, onSubmit, error }) {
    const [formData, setFormData] = useState({
        f_name: employee?.f_name || '',
        l_name: employee?.l_name || '',
        address: employee?.address || '',
        email: employee?.email || '',
        phoneNo: employee?.phoneNo || '',
        salary: employee?.salary || '',
        password: '',
        role: employee?.role || 'CASHIER',
    });

    const isUpdating = !!employee;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSend = { ...formData };
        if (isUpdating && !dataToSend.password) {
            delete dataToSend.password;
        }
        dataToSend.phoneNo = Number(dataToSend.phoneNo);
        dataToSend.salary = Number(dataToSend.salary);
        onSubmit(dataToSend);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <form onSubmit={handleSubmit}>
                    <h2>{isUpdating ? 'Edit Employee' : 'Create New Employee'}</h2>
                    {error && <p className="error-message">{error}</p>}
                    <div className="input-group">
                        <label>First Name</label>
                        <input name="f_name" value={formData.f_name} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <label>Last Name</label>
                        <input name="l_name" value={formData.l_name} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <label>Address</label>
                        <input name="address" value={formData.address} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <label>Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <label>Phone Number</label>
                        <input type="number" name="phoneNo" value={formData.phoneNo} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <label>Salary</label>
                        <input type="number" name="salary" value={formData.salary} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <label>Password {isUpdating && "(Leave blank to keep unchanged)"}</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} required={!isUpdating} />
                    </div>
                    <div className="input-group">
                        <label>Role</label>
                        <select name="role" value={formData.role} onChange={handleChange}>
                            <option value="CASHIER">Cashier</option>
                            <option value="STOREKEEPER">StoreKeeper</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>
                    <div className="modal-actions">
                        <button type="submit" className="action-btn edit-btn">{isUpdating ? 'Update' : 'Create'}</button>
                        <button type="button" className="action-btn" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EmployeeManagement;