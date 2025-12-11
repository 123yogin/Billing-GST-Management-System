import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getDeal, getDealLedger, addPayment } from '../services/api'
import '../styles/BillsList.css'

function DealDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [deal, setDeal] = useState(null)
  const [ledger, setLedger] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentData, setPaymentData] = useState({
    amount: '',
    payment_date: (() => {
      const istDate = new Date()
      const istOffset = 5.5 * 60 * 60 * 1000
      const utcTime = istDate.getTime() + (istDate.getTimezoneOffset() * 60 * 1000)
      const istTime = new Date(utcTime + istOffset)
      return istTime.toISOString().split('T')[0]
    })()
  })
  const [processingPayment, setProcessingPayment] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDealDetails()
  }, [id])

  const fetchDealDetails = async () => {
    setLoading(true)
    try {
      const [dealResponse, ledgerResponse] = await Promise.all([
        getDeal(id),
        getDealLedger(id)
      ])
      setDeal(dealResponse.data)
      setLedger(ledgerResponse.data.ledger)
    } catch (err) {
      console.error('Error fetching deal details:', err)
      setError(err.response?.data?.error || 'Failed to load deal details')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    setProcessingPayment(true)
    setError('')

    try {
      await addPayment(id, paymentData)
      setShowPaymentForm(false)
      setPaymentData({ 
        amount: '', 
        payment_date: (() => {
          const istDate = new Date()
          const istOffset = 5.5 * 60 * 60 * 1000
          const utcTime = istDate.getTime() + (istDate.getTimezoneOffset() * 60 * 1000)
          const istTime = new Date(utcTime + istOffset)
          return istTime.toISOString().split('T')[0]
        })()
      })
      fetchDealDetails() // Refresh data
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add payment')
    } finally {
      setProcessingPayment(false)
    }
  }

  const calculateTotals = () => {
    if (!deal) return { total: 0, paid: 0, pending: 0, interestEarned: 0, accruedInterest: 0 }
    
    const total = parseFloat(deal.total_amount)
    const paid = deal.payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
    const pendingInstallments = deal.installments
      .filter(inst => parseFloat(inst.pending_amount || 0) > 0)
      .reduce((sum, inst) => sum + parseFloat(inst.pending_amount || 0), 0)
    
    // Calculate total interest earned from all payment allocations (realized interest)
    const interestEarned = deal.payments.reduce((sum, payment) => {
      if (payment.allocations && payment.allocations.length > 0) {
        const paymentInterest = payment.allocations.reduce((allocSum, alloc) => {
          return allocSum + parseFloat(alloc.interest_amount || 0)
        }, 0)
        return sum + paymentInterest
      }
      return sum
    }, 0)
    
    // Get accrued interest on unpaid installments (from backend)
    const accruedInterest = parseFloat(deal.accrued_interest || 0)
    
    return {
      total,
      paid,
      pending: pendingInstallments,
      totalPending: pendingInstallments,
      interestEarned,
      accruedInterest
    }
  }

  const getPaymentInterest = (payment) => {
    if (!payment.allocations || payment.allocations.length === 0) return 0
    return payment.allocations.reduce((sum, alloc) => {
      return sum + parseFloat(alloc.interest_amount || 0)
    }, 0)
  }

  const getISTDate = () => {
    // Get current date in IST (Indian Standard Time)
    const now = new Date()
    const istOffset = 5.5 * 60 * 60 * 1000 // IST is UTC+5:30
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60 * 1000)
    const istTime = new Date(utcTime + istOffset)
    istTime.setHours(0, 0, 0, 0)
    return istTime
  }

  const getBufferPeriodInfo = (dueDate) => {
    if (!dueDate) return null
    const due = new Date(dueDate)
    const bufferStart = new Date(due)
    const bufferEnd = new Date(due)
    bufferEnd.setDate(bufferEnd.getDate() + 10)
    const today = getISTDate()
    
    return {
      start: bufferStart,
      end: bufferEnd,
      isInBuffer: today >= bufferStart && today <= bufferEnd,
      isAfterBuffer: today > bufferEnd
    }
  }

  const formatDate = (dateString) => {
    // Format date in IST timezone
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })
  }

  if (loading) {
    return <div className="text-center p-5">Loading deal details...</div>
  }

  if (!deal) {
    return <div className="text-center p-5">Deal not found</div>
  }

  const totals = calculateTotals()

  return (
    <div className="bills-list-page">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <div className="d-flex align-items-center gap-3">
              <h1>Deal Details: #{deal.deal_id}</h1>
              <span className={`badge ${deal.status === 'closed' ? 'bg-success' : 'bg-primary'}`} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                {deal.status === 'closed' ? 'Closed' : 'Active'}
              </span>
            </div>
            <p className="mb-0">{deal.customer_name}</p>
            <p className="text-muted small mb-0">
              Deal Date: {formatDate(deal.deal_date)} | 
              Interest Rate: {parseFloat(deal.interest_percentage || 0).toFixed(2)}% | 
              Buffer Period: 10 days after due date
            </p>
          </div>
          <div>
            <button
              className="btn btn-secondary me-2"
              onClick={() => navigate('/deals')}
            >
              Back to List
            </button>
            {deal.status !== 'closed' && (
              <button
                className="btn btn-primary"
                onClick={() => setShowPaymentForm(!showPaymentForm)}
              >
                {showPaymentForm ? 'Cancel' : '+ Add Payment'}
              </button>
            )}
          </div>
        </div>
      </div>

      {deal.status === 'closed' && (
        <div className="alert alert-success" role="alert">
          <strong>Deal Closed:</strong> This deal has been fully paid and is now closed. No further payments or interest accrual.
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="alert alert-info" role="alert">
        <strong>Interest Calculation Rules:</strong>
        <ul className="mb-0 mt-2">
          <li>Interest accrues normally from deal date (or last payment date) until the due date</li>
          <li>10-day buffer period after due date: No interest charged during this period</li>
          <li>After buffer period: Interest resumes and the 10 buffer days are added to the interest calculation</li>
          <li>When payment is made, interest is calculated only up to the payment date</li>
          <li>After payment, interest on remaining balance is calculated from the payment date (not deal date)</li>
          <li>Deal automatically closes when all installments are fully paid</li>
        </ul>
      </div>

      {showPaymentForm && (
        <div className="card mb-4">
          <div className="card-header">
            <h5>Add Payment</h5>
          </div>
          <div className="card-body">
            <div className="alert alert-info mb-3">
              <small>
                <strong>Note:</strong> Interest will be calculated from the last payment date (or deal date) up to the payment date. 
                If payment is made after the due date, buffer period rules apply.
              </small>
            </div>
            <form onSubmit={handlePaymentSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group mb-3">
                    <label>Payment Amount *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group mb-3">
                    <label>Payment Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={paymentData.payment_date}
                      onChange={(e) => setPaymentData({ ...paymentData, payment_date: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={processingPayment}
              >
                {processingPayment ? 'Processing...' : 'Add Payment'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted">Total Amount</h6>
              <h4 className="card-title">₹{totals.total.toFixed(2)}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted">Total Paid</h6>
              <h4 className="card-title text-success">₹{totals.paid.toFixed(2)}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted">Pending Installments</h6>
              <h4 className="card-title text-warning">₹{totals.pending.toFixed(2)}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted">Interest Earned</h6>
              <h4 className="card-title text-info">₹{totals.interestEarned.toFixed(2)}</h4>
              <small className="text-muted">From payments</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted">Accrued Interest</h6>
              <h4 className="card-title text-danger">₹{totals.accruedInterest.toFixed(2)}</h4>
              <small className="text-muted">On pending amount</small>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h5>Installments</h5>
          <small className="text-muted">Note: 10-day buffer period (no interest) applies after each due date</small>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Due Date</th>
                  <th>Buffer Period</th>
                  <th>Days</th>
                  <th>Percentage (%)</th>
                  <th>Amount</th>
                  <th>Pending Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {deal.installments.map((inst, idx) => {
                  const bufferInfo = getBufferPeriodInfo(inst.due_date)
                  const isPaid = parseFloat(inst.pending_amount || 0) === 0
                  return (
                    <tr key={inst.id}>
                      <td>{idx + 1}</td>
                      <td>{formatDate(inst.due_date)}</td>
                      <td>
                        {bufferInfo && !isPaid ? (
                          <div>
                            <small className="text-muted">
                              {formatDate(bufferInfo.start.toISOString().split('T')[0])} - {formatDate(bufferInfo.end.toISOString().split('T')[0])}
                            </small>
                            {bufferInfo.isInBuffer && (
                              <span className="badge bg-info ms-2">In Buffer</span>
                            )}
                            {bufferInfo.isAfterBuffer && (
                              <span className="badge bg-warning ms-2">Interest Resumed</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>{inst.days || 0}</td>
                      <td>{parseFloat(inst.percentage || 0).toFixed(2)}%</td>
                      <td>₹{parseFloat(inst.amount).toFixed(2)}</td>
                      <td>
                        <span className={`badge ${isPaid ? 'bg-success' : 'bg-warning'}`}>
                          ₹{parseFloat(inst.pending_amount).toFixed(2)}
                        </span>
                      </td>
                      <td>
                        {isPaid ? (
                          <span className="badge bg-success">Paid</span>
                        ) : (
                          <span className="badge bg-warning">Pending</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-header">
          <h5>Payment History</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Interest Earned</th>
                  <th>Type</th>
                  <th>Remark</th>
                </tr>
              </thead>
              <tbody>
                {deal.payments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center">No payments yet</td>
                  </tr>
                ) : (
                  deal.payments.map((payment) => {
                    const interest = getPaymentInterest(payment)
                    return (
                      <tr key={payment.id}>
                        <td>{payment.payment_date}</td>
                        <td>₹{parseFloat(payment.amount).toFixed(2)}</td>
                        <td>
                          {interest > 0 ? (
                            <span className="badge bg-info">₹{interest.toFixed(2)}</span>
                          ) : (
                            <span className="text-muted">₹0.00</span>
                          )}
                        </td>
                        <td>{payment.type}</td>
                        <td>{payment.remark || '-'}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {ledger.length > 0 && (
        <div className="card mt-4">
          <div className="card-header">
            <h5>Daily Ledger</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((entry, idx) => (
                    <tr key={idx}>
                      <td>{entry.date}</td>
                      <td>
                        <span className={`badge ${entry.type === 'payment' ? 'bg-success' : 'bg-primary'}`}>
                          {entry.type}
                        </span>
                      </td>
                      <td>{entry.description}</td>
                      <td className={entry.type === 'payment' ? 'text-success' : ''}>
                        {entry.type === 'payment' ? '-' : ''}₹{Math.abs(entry.amount).toFixed(2)}
                      </td>
                      <td>₹{entry.balance?.toFixed(2) || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DealDetails

