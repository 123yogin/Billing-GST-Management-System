import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createDeal, getDealers } from '../services/api'
import SearchableDropdown from '../components/SearchableDropdown'
import '../styles/BillForm.css'

function CreateDeal() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    customer_name: '',
    total_amount: '',
    interest_percentage: '',
    deal_date: new Date().toISOString().split('T')[0],
    installments: []
  })
  const [dealersList, setDealersList] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [installmentCount, setInstallmentCount] = useState(0)
  const [installmentAmount, setInstallmentAmount] = useState('')
  const [installmentInterval, setInstallmentInterval] = useState(30) // days

  useEffect(() => {
    loadDealers()
  }, [])

  const loadDealers = async () => {
    try {
      const response = await getDealers()
      setDealersList(response.data)
    } catch (error) {
      console.error("Failed to load dealers", error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const generateInstallments = () => {
    if (!installmentCount || !installmentAmount || !formData.deal_date || !formData.total_amount) {
      setError('Please fill in deal date, total amount, installment count, and installment amount')
      return
    }

    const installments = []
    const startDate = new Date(formData.deal_date)
    const totalAmount = parseFloat(formData.total_amount)
    const perInstallment = parseFloat(installmentAmount)
    const totalInstallmentAmount = perInstallment * installmentCount

    if (totalInstallmentAmount > totalAmount) {
      setError('Total installment amount cannot exceed deal amount')
      return
    }

    for (let i = 0; i < installmentCount; i++) {
      const dueDate = new Date(startDate)
      dueDate.setDate(dueDate.getDate() + (i + 1) * installmentInterval)

      installments.push({
        due_date: dueDate.toISOString().split('T')[0],
        amount: perInstallment
      })
    }

    setFormData({ ...formData, installments })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!formData.customer_name || !formData.total_amount || !formData.deal_date) {
        throw new Error('Please fill in all required fields')
      }

      const response = await createDeal({
        customer_name: formData.customer_name,
        total_amount: parseFloat(formData.total_amount),
        interest_percentage: parseFloat(formData.interest_percentage) || 0,
        deal_date: formData.deal_date,
        installments: formData.installments
      })

      navigate(`/deal/${response.data.id}/details`)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to create deal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bill-form-page">
      <div className="page-header">
        <h1>Create New Deal</h1>
        <p>Create a new loan/deal with interest calculation</p>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Deal Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Customer Name *</label>
              <SearchableDropdown
                options={dealersList}
                label="name"
                id="customer_name"
                selectedVal={formData.customer_name}
                placeholder="Select or type dealer name..."
                handleChange={(val) => setFormData({ ...formData, customer_name: val })}
              />
            </div>
            <div className="form-group">
              <label>Total Amount *</label>
              <input
                type="number"
                name="total_amount"
                value={formData.total_amount}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                required
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Interest Percentage (Annual)</label>
              <input
                type="number"
                name="interest_percentage"
                value={formData.interest_percentage}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="form-control"
                placeholder="e.g., 12 for 12%"
              />
            </div>
            <div className="form-group">
              <label>Deal Date *</label>
              <input
                type="date"
                name="deal_date"
                value={formData.deal_date}
                onChange={handleInputChange}
                required
                className="form-control"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Installments Setup</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Number of Installments</label>
              <input
                type="number"
                value={installmentCount}
                onChange={(e) => setInstallmentCount(parseInt(e.target.value) || 0)}
                min="0"
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Amount per Installment</label>
              <input
                type="number"
                value={installmentAmount}
                onChange={(e) => setInstallmentAmount(e.target.value)}
                step="0.01"
                min="0"
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Interval (Days)</label>
              <input
                type="number"
                value={installmentInterval}
                onChange={(e) => setInstallmentInterval(parseInt(e.target.value) || 30)}
                min="1"
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>&nbsp;</label>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={generateInstallments}
              >
                Generate Installments
              </button>
            </div>
          </div>

          {formData.installments.length > 0 && (
            <div className="mt-3">
              <h4>Generated Installments ({formData.installments.length})</h4>
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Due Date</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.installments.map((inst, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{inst.due_date}</td>
                        <td>₹{parseFloat(inst.amount).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="action-buttons">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Deal'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/deals')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateDeal
