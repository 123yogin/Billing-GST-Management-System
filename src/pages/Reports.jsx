import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import '../styles/Reports.css'

const API_URL = 'http://localhost:5000/api'

function Reports() {
  const navigate = useNavigate()
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('farmer')

  useEffect(() => {
    // Set default dates (current month)
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    
    setFromDate(firstDay.toISOString().split('T')[0])
    setToDate(lastDay.toISOString().split('T')[0])
  }, [])

  useEffect(() => {
    if (fromDate && toDate) {
      fetchReportData()
    }
  }, [fromDate, toDate])

  const fetchReportData = async () => {
    if (!fromDate || !toDate) return

    if (new Date(fromDate) > new Date(toDate)) {
      setError('From date cannot be after To date')
      return
    }

    setLoading(true)
    setError('')
    try {
      const response = await axios.get(`${API_URL}/reports/bills`, {
        params: { from_date: fromDate, to_date: toDate }
      })
      setReportData(response.data)
    } catch (err) {
      setError('Error fetching report data: ' + (err.response?.data?.error || err.message))
      setReportData(null)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount)
  }

  return (
    <div className="reports-page">
      <div className="page-header">
        <h1>Reports</h1>
        <p>View bills data for selected date range</p>
      </div>

      <div className="date-filter-section">
        <div className="date-selectors-row">
          <div className="form-group">
            <label className="form-label">From Date</label>
            <input
              type="date"
              className="form-control"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">To Date</label>
            <input
              type="date"
              className="form-control"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => navigate(`/daily-ledger?from=${fromDate}&to=${toDate}`)}
          >
            Daily Ledger View
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <p>Loading report data...</p>
        </div>
      ) : reportData ? (
        <>
          <div className="tabs-container">
            <button
              className={`tab-btn ${activeTab === 'farmer' ? 'active' : ''}`}
              onClick={() => setActiveTab('farmer')}
            >
              Farmer Bills ({reportData.farmer_bills.length})
            </button>
            <button
              className={`tab-btn ${activeTab === 'dealer' ? 'active' : ''}`}
              onClick={() => setActiveTab('dealer')}
            >
              Dealer Bills ({reportData.dealer_bills.length})
            </button>
          </div>

          {activeTab === 'farmer' && (
            <div className="report-section">
              <div className="section-header">
                <h2>Farmer Bills</h2>
                <div className="total-badge">
                  Total: {formatCurrency(reportData.farmer_total)}
                </div>
              </div>
              {reportData.farmer_bills.length > 0 ? (
                <div className="table-container">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Bill ID</th>
                        <th>Customer Name</th>
                        <th>Items</th>
                        <th>Other Expense</th>
                        <th>Discount</th>
                        <th className="text-right">Final Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.farmer_bills.map((bill) => (
                        <tr key={bill.id}>
                          <td>{formatDate(bill.date)}</td>
                          <td className="bill-id-cell">{bill.bill_id}</td>
                          <td>{bill.customer_name}</td>
                          <td>
                            <div className="items-list">
                              {bill.items.map((item, idx) => (
                                <div key={idx} className="item-detail">
                                  {item.item} - {item.weight}kg × ₹{item.price}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="text-right">{formatCurrency(bill.other_expense)}</td>
                          <td className="text-right">{formatCurrency(bill.discount)}</td>
                          <td className="text-right amount-cell">{formatCurrency(bill.final_total)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="total-row">
                        <td colSpan="6" className="text-right"><strong>Grand Total:</strong></td>
                        <td className="text-right"><strong>{formatCurrency(reportData.farmer_total)}</strong></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="no-data">No farmer bills found for the selected date range</div>
              )}
            </div>
          )}

          {activeTab === 'dealer' && (
            <div className="report-section">
              <div className="section-header">
                <h2>Dealer Bills</h2>
                <div className="total-badge dealer">
                  Total: {formatCurrency(reportData.dealer_total)}
                </div>
              </div>
              {reportData.dealer_bills.length > 0 ? (
                <div className="table-container">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Bill ID</th>
                        <th>Customer Name</th>
                        <th>Items</th>
                        <th>GST %</th>
                        <th>CGST</th>
                        <th>SGST</th>
                        <th className="text-right">Grand Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.dealer_bills.map((bill) => (
                        <tr key={bill.id}>
                          <td>{formatDate(bill.date)}</td>
                          <td className="bill-id-cell">{bill.bill_id}</td>
                          <td>{bill.customer_name}</td>
                          <td>
                            <div className="items-list">
                              {bill.items.map((item, idx) => (
                                <div key={idx} className="item-detail">
                                  {item.item} - {item.weight}kg × ₹{item.price}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="text-center">{bill.gst_percentage}%</td>
                          <td className="text-right">{formatCurrency(bill.cgst)}</td>
                          <td className="text-right">{formatCurrency(bill.sgst)}</td>
                          <td className="text-right amount-cell">{formatCurrency(bill.grand_total)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="total-row">
                        <td colSpan="7" className="text-right"><strong>Grand Total:</strong></td>
                        <td className="text-right"><strong>{formatCurrency(reportData.dealer_total)}</strong></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="no-data">No dealer bills found for the selected date range</div>
              )}
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}

export default Reports

