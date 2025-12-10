import { useEffect, useState } from 'react'
import { getItems, createItem, updateItem, deleteItem } from '../services/api'
import Modal from '../components/Modal'
import '../styles/BillsList.css'

function Items() {
    const [items, setItems] = useState([])
    const [filteredItems, setFilteredItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [searchTerm, setSearchTerm] = useState('')

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentId, setCurrentId] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        hsn_code: '',
        price: ''
    })

    useEffect(() => {
        fetchItems()
    }, [])

    const fetchItems = async () => {
        setLoading(true)
        try {
            const response = await getItems()
            setItems(response.data)
            setFilteredItems(response.data)
        } catch (err) {
            console.error('Error fetching items:', err)
            setError('Failed to load items')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredItems(items)
        } else {
            const filtered = items.filter((item) =>
                item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.hsn_code?.toLowerCase().includes(searchTerm.toLowerCase())
            )
            setFilteredItems(filtered)
        }
    }, [searchTerm, items])

    const handleAddNew = () => {
        setFormData({ name: '', hsn_code: '', price: '' })
        setCurrentId(null)
        setIsModalOpen(true)
    }

    const handleEdit = (item) => {
        setFormData({
            name: item.name,
            hsn_code: item.hsn_code || '',
            price: item.price || ''
        })
        setCurrentId(item.id)
        setIsModalOpen(true)
    }

    const handleDelete = async (itemId) => {
        if (!window.confirm('Are you sure you want to delete this item?')) {
            return
        }

        try {
            await deleteItem(itemId)
            fetchItems()
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete item')
        }
    }

    const handleSave = async (e) => {
        e.preventDefault()
        try {
            if (currentId) {
                await updateItem(currentId, formData)
            } else {
                await createItem(formData)
            }
            setIsModalOpen(false)
            fetchItems()
        } catch (err) {
            console.error(err)
            alert('Failed to save item')
        }
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(price)
    }

    if (loading) {
        return (
            <div className="bills-list-page">
                <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading items...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bills-list-page">
            <div className="page-header">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h1>Items Management</h1>
                        <p>Manage all items and their pricing</p>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={handleAddNew}
                    >
                        + ADD ITEM
                    </button>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {/* Search Bar */}
            <div className="card mb-4" style={{ border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-lg)' }}>
                <div className="card-body">
                    <div className="d-flex align-items-center gap-2">
                        <div style={{ flex: 1, position: 'relative' }}>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search Item Name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ paddingLeft: '40px' }}
                            />
                            <span style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                fontSize: '18px',
                                opacity: 0.5
                            }}>
                                🔍
                            </span>
                        </div>
                        <button className="btn btn-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <div className="bills-table-section">
                {filteredItems.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📦</div>
                        <h3>No Items Found</h3>
                        <p>
                            {searchTerm
                                ? `No items match your search "${searchTerm}"`
                                : 'No items found. Click "ADD ITEM" to create one.'}
                        </p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="bills-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '10%' }}>ITEM ID</th>
                                    <th style={{ width: '50%' }}>ITEM NAME</th>
                                    <th style={{ width: '25%' }}>HSN CODE</th>
                                    <th style={{ width: '15%' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>
                                            <div style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                                                {index + 1}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '14px' }}>
                                                {item.name}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center" style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                                                {item.hsn_code || '-'}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="btn btn-sm btn-primary"
                                                    style={{ padding: '6px 12px' }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="btn btn-sm btn-danger"
                                                    style={{ padding: '6px 12px' }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentId ? 'Edit Item' : 'Add New Item'}
                footer={
                    <div className="d-flex justify-content-end gap-2">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            onClick={handleSave}
                        >
                            {currentId ? 'Update Item' : 'Add Item'}
                        </button>
                    </div>
                }
            >
                <form onSubmit={handleSave} className="row g-3">
                    <div className="col-12">
                        <label className="form-label">Item Name</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="col-12">
                        <label className="form-label">HSN Code</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.hsn_code}
                            onChange={(e) => setFormData({ ...formData, hsn_code: e.target.value })}
                        />
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default Items
