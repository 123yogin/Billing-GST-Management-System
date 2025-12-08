import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SkeletonTable } from '../components/Skeleton'
import { downloadDealerBillPDF, downloadFarmerBillPDF, getDealerBills, getFarmerBills } from '../services/api'
import '../styles/BillsList.css'

function BillsList() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('farmer')
  const [farmerBills, setFarmerBills] = useState([])
  const [dealerBills, setDealerBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    customer_name: '',
    bill_id: ''
  })

  useEffect(() => {
    loadBills()
  }, [activeTab, filters])

  const loadBills = async () => {
    setLoading(true)
    try {
      if (activeTab === 'farmer') {
        const response = await getFarmerBills(filters)
        setFarmerBills(response.data)
      } else {
        const response = await getDealerBills(filters)
        setDealerBills(response.data)
      }
    } catch (error) {
      alert('Error loading bills: ' + (error.response?.data?.error || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value })
  }

  const handleView = (billId, type) => {
    navigate(`/bill/${type}/${billId}/print`)
  }

  const handleDownloadPDF = async (billId, type) => {
    try {
      const response = type === 'farmer' 
        ? await downloadFarmerBillPDF(billId)
        : await downloadDealerBillPDF(billId)
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${type}_bill_${billId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      alert('Error downloading PDF: ' + (error.response?.data?.error || error.message))
    }
  }

  const bills = activeTab === 'farmer' ? farmerBills : dealerBills

  return (
    <div className="bills-list-page">
      <div className="page-header">
        <h1>Bills List</h1>
      </div>

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'farmer' ? 'active' : ''}`}
          onClick={() => setActiveTab('farmer')}
        >
          Farmer Bills
        </button>
        <button
          className={`tab-button ${activeTab === 'dealer' ? 'active' : ''}`}
          onClick={() => setActiveTab('dealer')}
        >
          Dealer Bills
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Filters</h3>
        </div>
        <div className="card-body">
          <div className="filters-grid">
            <div className="filter-group">
              <label className="form-label">Date From</label>
              <input
                type="date"
                className="form-control"
                value={filters.date_from}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label className="form-label">Date To</label>
              <input
                type="date"
                className="form-control"
                value={filters.date_to}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label className="form-label">Customer Name</label>
              <input
                type="text"
                className="form-control"
                value={filters.customer_name}
                onChange={(e) => handleFilterChange('customer_name', e.target.value)}
                placeholder="Search customer..."
              />
            </div>
            <div className="filter-group">
              <label className="form-label">Bill ID</label>
              <input
                type="text"
                className="form-control"
                value={filters.bill_id}
                onChange={(e) => handleFilterChange('bill_id', e.target.value)}
                placeholder="Search bill ID..."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {loading ? (
            <SkeletonTable />
          ) : bills.length === 0 ? (
            <div className="empty-state">
              <p>No bills found</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Bill ID</th>
                    <th>Date</th>
                    <th>Customer Name</th>
                    {activeTab === 'dealer' ? (
                      <>
                        <th className="text-end">Grand Total</th>
                        <th className="text-end">GST Amount</th>
                      </>
                    ) : (
                      <th className="text-end">Final Total</th>
                    )}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((bill) => (
                    <tr key={bill.id}>
                      <td>{bill.bill_id}</td>
                      <td>{bill.date}</td>
                      <td>{bill.customer_name}</td>
                      {activeTab === 'dealer' ? (
                        <>
                          <td className="text-end">₹{bill.grand_total.toFixed(2)}</td>
                          <td className="text-end">₹{bill.gst_amount.toFixed(2)}</td>
                        </>
                      ) : (
                        <td className="text-end">₹{bill.final_total.toFixed(2)}</td>
                      )}
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleView(bill.bill_id, activeTab)}
                          >
                            View
                          </button>
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => window.print()}
                          >
                            Print
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDownloadPDF(bill.bill_id, activeTab)}
                          >
                            PDF
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
    </div>
  )
}

export default BillsList

