import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import Modal from '../components/Modal'
import '../styles/DailyLedger.css'

const API_URL = 'http://localhost:5000/api'

function DailyLedger() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [showDateModal, setShowDateModal] = useState(true)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [currentDate, setCurrentDate] = useState('')
  const [ledgerData, setLedgerData] = useState(null)
  const [availableDates, setAvailableDates] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if dates are passed via URL params
    const fromParam = searchParams.get('from')
    const toParam = searchParams.get('to')
    
    if (fromParam && toParam) {
      // Use dates from URL params and skip modal
      setFromDate(fromParam)
      setToDate(toParam)
      setShowDateModal(false)
      fetchAvailableDates(fromParam, toParam)
    } else {
      // Set default dates (current month)
      const today = new Date()
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      
      setFromDate(firstDay.toISOString().split('T')[0])
      setToDate(lastDay.toISOString().split('T')[0])
    }
  }, [])

  const fetchAvailableDates = async (from, to) => {
    try {
      const response = await axios.get(`${API_URL}/reports/date-range`, {
        params: { from_date: from, to_date: to }
      })
      setAvailableDates(response.data.dates)
      if (response.data.dates.length > 0) {
        setCurrentDate(response.data.dates[0])
        await fetchLedgerData(response.data.dates[0])
      } else {
        setError('No bills found in the selected date range')
      }
    } catch (err) {
      setError('Error fetching dates: ' + (err.response?.data?.error || err.message))
    }
  }

  const fetchLedgerData = async (date) => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.get(`${API_URL}/reports/daily-ledger`, {
        params: { date }
      })
      setLedgerData(response.data)
    } catch (err) {
      setError('Error fetching ledger data: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleDateSubmit = () => {
    if (!fromDate || !toDate) {
      alert('Please select both from and to dates')
      return
    }
    if (new Date(fromDate) > new Date(toDate)) {
      alert('From date cannot be after To date')
      return
    }
    setShowDateModal(false)
    fetchAvailableDates(fromDate, toDate)
  }

  const handlePreviousDate = () => {
    const currentIndex = availableDates.indexOf(currentDate)
    if (currentIndex > 0) {
      const prevDate = availableDates[currentIndex - 1]
      setCurrentDate(prevDate)
      fetchLedgerData(prevDate)
    }
  }

  const handleNextDate = () => {
    const currentIndex = availableDates.indexOf(currentDate)
    if (currentIndex < availableDates.length - 1) {
      const nextDate = availableDates[currentIndex + 1]
      setCurrentDate(nextDate)
      fetchLedgerData(nextDate)
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
    <div className="daily-ledger-page">
      {showDateModal && (
        <Modal
          isOpen={showDateModal}
          title="Select Date Range"
          onClose={() => navigate('/reports')}
        >
          <div className="date-range-form">
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
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => navigate('/reports')}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleDateSubmit}>
                View Ledger
              </button>
            </div>
          </div>
        </Modal>
      )}

      {!showDateModal && (
        <>
          <div className="ledger-header">
            <button className="btn btn-secondary" onClick={() => setShowDateModal(true)}>
              Change Date Range
            </button>
            <div className="header-date">
              <h1>{ledgerData?.day}</h1>
              <p className="date-display">{currentDate && formatDate(currentDate)}</p>
            </div>
            <button className="btn btn-secondary" onClick={() => navigate('/reports')}>
              Back to Reports
            </button>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {loading ? (
            <div className="loading-container">
              <p>Loading ledger data...</p>
            </div>
          ) : ledgerData ? (
            <>
              <div className="print-report">
                <div className="report-columns">
                  {/* LEFT COLUMN - FARMER BILLS */}
                  <div className="report-column left-column">
                    <div className="bills-content">
                      {ledgerData.farmer_bills.length > 0 ? (
                        ledgerData.farmer_bills.map((bill, billIndex) => (
                          <div key={bill.id} className="bill-entry">
                            <div className="bill-name">{bill.customer_name}</div>
                            <div className="bill-number">{bill.bill_id}</div>
                            <div className="bill-items-list">
                              {bill.items.map((item, idx) => (
                                <div key={idx} className="item-line">
                                  <span className="item-name-col">{item.item}</span>
                                  <span className="item-qty-col">{item.weight} kg</span>
                                  <span className="item-rate-col">₹{item.price}</span>
                                  <span className="item-amt-col">₹{item.item_total}</span>
                                </div>
                              ))}
                            </div>
                            <div className="bill-total-line">
                              <span>Bill Total:</span>
                              <span className="total-value">₹{bill.final_total}</span>
                            </div>
                            {billIndex < ledgerData.farmer_bills.length - 1 && (
                              <div className="bill-separator"></div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="no-bills">No farmer bills</div>
                      )}
                    </div>
                    <div className="column-grand-total">
                      <span>Grand Total (Farmers):</span>
                      <span className="grand-total-value">₹{ledgerData.farmer_total}</span>
                    </div>
                  </div>

                  {/* CENTER DIVIDER */}
                  <div className="column-divider"></div>

                  {/* RIGHT COLUMN - DEALER BILLS */}
                  <div className="report-column right-column">
                    <div className="bills-content">
                      {ledgerData.dealer_bills.length > 0 ? (
                        ledgerData.dealer_bills.map((bill, billIndex) => (
                          <div key={bill.id} className="bill-entry">
                            <div className="bill-name">{bill.customer_name}</div>
                            <div className="bill-number">{bill.bill_id}</div>
                            <div className="bill-items-list">
                              {bill.items.map((item, idx) => (
                                <div key={idx} className="item-line">
                                  <span className="item-name-col">{item.item}</span>
                                  <span className="item-qty-col">{item.weight} kg</span>
                                  <span className="item-rate-col">₹{item.price}</span>
                                  <span className="item-amt-col">₹{item.item_total}</span>
                                </div>
                              ))}
                            </div>
                            <div className="bill-gst-info">
                              GST ({bill.gst_percentage}%): ₹{bill.gst_amount}
                            </div>
                            <div className="bill-total-line">
                              <span>Bill Total:</span>
                              <span className="total-value">₹{bill.grand_total}</span>
                            </div>
                            {billIndex < ledgerData.dealer_bills.length - 1 && (
                              <div className="bill-separator"></div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="no-bills">No dealer bills</div>
                      )}
                    </div>
                    <div className="column-grand-total">
                      <span>Grand Total (Dealers):</span>
                      <span className="grand-total-value">₹{ledgerData.dealer_total}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="navigation-buttons">
                <button
                  className="btn btn-nav"
                  onClick={handlePreviousDate}
                  disabled={availableDates.indexOf(currentDate) === 0}
                >
                  ← Previous Date
                </button>
                <span className="date-counter">
                  {availableDates.indexOf(currentDate) + 1} / {availableDates.length}
                </span>
                <button
                  className="btn btn-nav"
                  onClick={handleNextDate}
                  disabled={availableDates.indexOf(currentDate) === availableDates.length - 1}
                >
                  Next Date →
                </button>
              </div>
            </>
          ) : null}
        </>
      )}
    </div>
  )
}

export default DailyLedger
