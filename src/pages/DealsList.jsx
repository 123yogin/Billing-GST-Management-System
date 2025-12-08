import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDeals } from '../services/api'
import '../styles/BillsList.css'

function DealsList() {
  const navigate = useNavigate()
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    customer_name: '',
    deal_number: '',
    status: ''
  })

  useEffect(() => {
    fetchDeals()
  }, [])

  const fetchDeals = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.date_from) params.date_from = filters.date_from
      if (filters.date_to) params.date_to = filters.date_to
      if (filters.customer_name) params.customer_name = filters.customer_name
      if (filters.deal_number) params.deal_number = filters.deal_number
      if (filters.status) params.status = filters.status

      const response = await getDeals(params)
      setDeals(response.data)
    } catch (err) {
      console.error('Error fetching deals:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({ ...filters, [name]: value })
  }

  const handleApplyFilters = () => {
    fetchDeals()
  }

  const handleResetFilters = () => {
    setFilters({
      date_from: '',
      date_to: '',
      customer_name: '',
      deal_number: '',
      status: ''
    })
    setTimeout(fetchDeals, 100)
  }

  const calculateTotalPending = (deal) => {
    return deal.installments
      .filter(inst => inst.status === 'unpaid')
      .reduce((sum, inst) => sum + parseFloat(inst.pending_amount || 0), 0)
  }

  if (loading) {
    return <div className="text-center p-5">Loading deals...</div>
  }

  return (
    <div className="bills-list-page">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1>Deals & Loans</h1>
            <p>Manage all deals with interest calculations</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/deal/create')}
          >
            + Create New Deal
          </button>
        </div>
      </div>

      <div className="filters-section">
        <h3>Filters</h3>
        <div className="filter-row">
          <div className="filter-group">
            <label>Date From</label>
            <input
              type="date"
              name="date_from"
              value={filters.date_from}
              onChange={handleFilterChange}
              className="form-control"
            />
          </div>
          <div className="filter-group">
            <label>Date To</label>
            <input
              type="date"
              name="date_to"
              value={filters.date_to}
              onChange={handleFilterChange}
              className="form-control"
            />
          </div>
          <div className="filter-group">
            <label>Customer Name</label>
            <input
              type="text"
              name="customer_name"
              value={filters.customer_name}
              onChange={handleFilterChange}
              className="form-control"
              placeholder="Search customer..."
            />
          </div>
          <div className="filter-group">
            <label>Deal Number</label>
            <input
              type="text"
              name="deal_number"
              value={filters.deal_number}
              onChange={handleFilterChange}
              className="form-control"
              placeholder="Search deal number..."
            />
          </div>
          <div className="filter-group">
            <label>Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="form-control"
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="filter-actions">
            <button className="btn btn-primary" onClick={handleApplyFilters}>
              Apply Filters
            </button>
            <button className="btn btn-secondary" onClick={handleResetFilters}>
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="bills-table-section">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Deal Number</th>
              <th>Customer Name</th>
              <th>Deal Date</th>
              <th>Total Amount</th>
              <th>Interest %</th>
              <th>Pending Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {deals.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center">
                  No deals found
                </td>
              </tr>
            ) : (
              deals.map((deal) => {
                const pending = calculateTotalPending(deal)
                return (
                  <tr key={deal.id}>
                    <td>{deal.deal_number}</td>
                    <td>{deal.customer_name}</td>
                    <td>{deal.deal_date}</td>
                    <td>₹{parseFloat(deal.total_amount).toFixed(2)}</td>
                    <td>{parseFloat(deal.interest_percentage).toFixed(2)}%</td>
                    <td>₹{pending.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${deal.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                        {deal.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => navigate(`/deal/${deal.id}/details`)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DealsList
