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
    payment_date: new Date().toISOString().split('T')[0]
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
      setPaymentData({ amount: '', payment_date: new Date().toISOString().split('T')[0] })
      fetchDealDetails() // Refresh data
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add payment')
    } finally {
      setProcessingPayment(false)
    }
  }

  const calculateTotals = () => {
    if (!deal) return { total: 0, paid: 0, pending: 0, interest: 0 }
    
    const total = parseFloat(deal.total_amount)
    const paid = deal.payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
    const pendingInstallments = deal.installments
      .filter(inst => inst.status === 'unpaid' && inst.type === 'installment')
      .reduce((sum, inst) => sum + parseFloat(inst.pending_amount || 0), 0)
    const interestInstallment = deal.installments.find(inst => inst.type === 'interest')
    const interest = interestInstallment ? parseFloat(interestInstallment.pending_amount || 0) : 0
    
    return {
      total,
      paid,
      pending: pendingInstallments,
      interest,
      totalPending: pendingInstallments + interest
    }
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
            <h1>Deal Details: {deal.deal_number}</h1>
            <p>{deal.customer_name}</p>
          </div>
          <div>
            <button
              className="btn btn-secondary me-2"
              onClick={() => navigate('/deals')}
            >
              Back to List
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setShowPaymentForm(!showPaymentForm)}
            >
              {showPaymentForm ? 'Cancel' : '+ Add Payment'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {showPaymentForm && (
        <div className="card mb-4">
          <div className="card-header">
            <h5>Add Payment</h5>
          </div>
          <div className="card-body">
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
              <h6 className="card-subtitle mb-2 text-muted">Accrued Interest</h6>
              <h4 className="card-title text-danger">₹{totals.interest.toFixed(2)}</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h5>Installments</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Due Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Pending</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {deal.installments.map((inst) => (
                  <tr key={inst.id}>
                    <td>{inst.sequence_number}</td>
                    <td>{inst.due_date}</td>
                    <td>
                      <span className={`badge ${inst.type === 'interest' ? 'bg-danger' : 'bg-primary'}`}>
                        {inst.type}
                      </span>
                    </td>
                    <td>₹{parseFloat(inst.amount).toFixed(2)}</td>
                    <td>₹{parseFloat(inst.pending_amount).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${inst.status === 'paid' ? 'bg-success' : 'bg-warning'}`}>
                        {inst.status}
                      </span>
                    </td>
                  </tr>
                ))}
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
                  <th>Type</th>
                  <th>Remark</th>
                </tr>
              </thead>
              <tbody>
                {deal.payments.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center">No payments yet</td>
                  </tr>
                ) : (
                  deal.payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{payment.payment_date}</td>
                      <td>₹{parseFloat(payment.amount).toFixed(2)}</td>
                      <td>{payment.type}</td>
                      <td>{payment.remark || '-'}</td>
                    </tr>
                  ))
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
