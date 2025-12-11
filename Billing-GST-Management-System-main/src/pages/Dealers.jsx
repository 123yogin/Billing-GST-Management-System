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
                  <th style={{ width: '5%' }}>ID</th>
                  <th style={{ width: '25%' }}>Name</th>
                  <th style={{ width: '15%' }}>Phone No.</th>
                  <th style={{ width: '20%' }}>Address</th>
                  <th style={{ width: '15%' }}>GSTIN</th>
                  <th style={{ width: '10%' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredDealers.map((dealer, index) => (
                  <tr key={dealer.id}>
                    <td>
                      <div style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                        {index + 1}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div style={{
                          width: '32px',
                          height: '32px',
                          backgroundColor: '#f3f4f6',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '12px',
                          color: '#6b7280'
                        }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '14px' }}>
                            {dealer.name}
                          </div>
                          <div className="d-flex gap-2" style={{ fontSize: '11px', marginTop: '2px' }}>
                            <span
                              onClick={() => handleEdit(dealer.id)}
                              style={{ cursor: 'pointer', color: 'var(--color-primary)', textDecoration: 'underline' }}
                            >
                              Edit
                            </span>

                            <span
                              onClick={() => handleDelete(dealer.id)}
                              style={{ cursor: 'pointer', color: '#ef4444', textDecoration: 'underline' }}
                            >
                              Delete
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center" style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                        <span style={{ marginRight: '8px', color: '#10b981' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                          </svg>
                        </span>
                        {formatPhone(dealer.phone)}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center" style={{
                        maxWidth: '250px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: '13px',
                        color: 'var(--color-text-secondary)'
                      }}>
                        <span style={{ marginRight: '8px', color: '#6b7280' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                        </span>
                        {dealer.address || '-'}
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
                      <span className="badge" style={{
                        backgroundColor: '#dcfce7',
                        color: '#166534',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 500
                      }}>
                        Active
                      </span>
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
