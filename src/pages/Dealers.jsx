import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteDealer, getDealers } from '../services/api'
import '../styles/BillsList.css'

function Dealers() {
  const [dealers, setDealers] = useState([])
  const [filteredDealers, setFilteredDealers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchDealers()
  }, [])

  const fetchDealers = async () => {
    setLoading(true)
    try {
      const response = await getDealers()
      setDealers(response.data)
      setFilteredDealers(response.data)
    } catch (err) {
      console.error('Error fetching dealers:', err)
      setError('Failed to load dealers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredDealers(dealers)
    } else {
      const filtered = dealers.filter((dealer) =>
        dealer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dealer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dealer.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dealer.khata_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dealer.gstin?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredDealers(filtered)
    }
  }, [searchTerm, dealers])

  const handleEdit = (dealerId) => {
    navigate(`/dealers/${dealerId}/edit`)
  }

  const handleAddNew = () => {
    navigate('/dealers/add')
  }

  const handleDelete = async (dealerId) => {
    if (!window.confirm('Are you sure you want to delete this dealer?')) {
      return
    }

    try {
      await deleteDealer(dealerId)
      fetchDealers()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete dealer')
    }
  }

  const formatPhone = (phone) => {
    if (!phone) return '-'
    return phone
  }

  const formatGSTIN = (gstin) => {
    if (!gstin) return '-'
    return gstin.toUpperCase()
  }

  if (loading) {
    return (
      <div className="bills-list-page">
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading dealers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bills-list-page">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1>Dealers Management</h1>
            <p>Manage all dealers and their information</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleAddNew}
          >
            + Add New Dealer
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card" style={{ border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-lg)' }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: '13px', margin: 0 }}>Total Dealers</p>
                  <h3 style={{ margin: 0, fontSize: '28px', fontWeight: 600 }}>{dealers.length}</h3>
                </div>
                <div style={{ fontSize: '32px', opacity: 0.3 }}>👥</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card" style={{ border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-lg)' }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: '13px', margin: 0 }}>With GSTIN</p>
                  <h3 style={{ margin: 0, fontSize: '28px', fontWeight: 600 }}>
                    {dealers.filter(d => d.gstin && d.gstin.trim() !== '').length}
                  </h3>
                </div>
                <div style={{ fontSize: '32px', opacity: 0.3 }}>📋</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card" style={{ border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-lg)' }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: '13px', margin: 0 }}>Showing</p>
                  <h3 style={{ margin: 0, fontSize: '28px', fontWeight: 600 }}>{filteredDealers.length}</h3>
                </div>
                <div style={{ fontSize: '32px', opacity: 0.3 }}>🔍</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card mb-4" style={{ border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-lg)' }}>
        <div className="card-body">
          <div className="d-flex align-items-center gap-2">
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search dealers by name, phone, address, khata number, or GSTIN..."
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
            {searchTerm && (
              <button
                className="btn btn-secondary"
                onClick={() => setSearchTerm('')}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dealers Table */}
      <div className="bills-table-section">
        {filteredDealers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No Dealers Found</h3>
            <p>
              {searchTerm 
                ? `No dealers match your search "${searchTerm}"` 
                : 'No dealers found. Click "Add New Dealer" to create one.'}
            </p>
            {searchTerm && (
              <button
                className="btn btn-primary mt-3"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="table-container">
            <table className="bills-table">
              <thead>
                <tr>
                  <th style={{ width: '20%' }}>Dealer Name</th>
                  <th style={{ width: '12%' }}>Phone</th>
                  <th style={{ width: '25%' }}>Address</th>
                  <th style={{ width: '12%' }}>Khata No</th>
                  <th style={{ width: '15%' }}>GSTIN</th>
                  <th style={{ width: '16%', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDealers.map((dealer) => (
                  <tr key={dealer.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {dealer.name}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontFamily: 'monospace', fontSize: '13px' }}>
                        {formatPhone(dealer.phone)}
                      </div>
                    </td>
                    <td>
                      <div style={{ 
                        maxWidth: '300px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: '13px',
                        color: 'var(--color-text-secondary)'
                      }}>
                        {dealer.address || '-'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontFamily: 'monospace', fontSize: '13px' }}>
                        {dealer.khata_no || '-'}
                      </div>
                    </td>
                    <td>
                      <div style={{ 
                        fontFamily: 'monospace', 
                        fontSize: '12px',
                        fontWeight: 500,
                        color: dealer.gstin ? 'var(--color-primary)' : 'var(--color-text-secondary)'
                      }}>
                        {formatGSTIN(dealer.gstin)}
                      </div>
                    </td>
                    <td>
                      <div className="table-actions" style={{ justifyContent: 'center' }}>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleEdit(dealer.id)}
                          title="Edit dealer"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(dealer.id)}
                          title="Delete dealer"
                        >
                          🗑️ Delete
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
    </div>
  )
}

export default Dealers
