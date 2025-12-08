import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BillItemRow from '../components/BillItemRow'
import { createFarmerBill } from '../services/api'
import '../styles/BillForm.css'

function CreateFarmerBill() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    customer_name: '',
    other_expense: 0,
    discount: 0,
    items: [{ item: '', weight: 0, price: 0, item_total: 0 }]
  })
  const [finalTotal, setFinalTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  // Auto-calculate totals
  useEffect(() => {
    let itemsTotal = 0
    formData.items.forEach(item => {
      const itemTotal = (item.weight || 0) * (item.price || 0)
      itemsTotal += itemTotal
    })
    
    const total = itemsTotal + (parseFloat(formData.other_expense) || 0) - (parseFloat(formData.discount) || 0)
    setFinalTotal(total)
  }, [formData])

  const handleItemUpdate = (index, updatedItem) => {
    const itemTotal = (updatedItem.weight || 0) * (updatedItem.price || 0)
    updatedItem.item_total = itemTotal
    
    const newItems = [...formData.items]
    newItems[index] = updatedItem
    setFormData({ ...formData, items: newItems })
  }

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { item: '', weight: 0, price: 0, item_total: 0 }]
    })
  }

  const handleDeleteItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index)
    if (newItems.length === 0) {
      newItems.push({ item: '', weight: 0, price: 0, item_total: 0 })
    }
    setFormData({ ...formData, items: newItems })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await createFarmerBill(formData)
      alert('Bill created successfully!')
      navigate(`/bill/farmer/${response.data.bill_id}/print`)
    } catch (error) {
      alert('Error creating bill: ' + (error.response?.data?.error || error.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bill-form-page">
      <div className="page-header">
        <h1>Create Farmer Bill</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card form-section">
          <div className="card-header">
            <h3>Bill Information</h3>
          </div>
          <div className="card-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Customer Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card form-section">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Items</h3>
            <button type="button" className="btn btn-sm btn-primary" onClick={handleAddItem}>
              Add Item
            </button>
          </div>
          <div className="card-body">
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Weight</th>
                    <th>Price</th>
                    <th className="text-end">Item Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => (
                    <BillItemRow
                      key={index}
                      item={item}
                      index={index}
                      onUpdate={handleItemUpdate}
                      onDelete={handleDeleteItem}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card form-section">
          <div className="card-header">
            <h3>Totals</h3>
          </div>
          <div className="card-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Other Expense</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.other_expense}
                  onChange={(e) => setFormData({ ...formData, other_expense: parseFloat(e.target.value) || 0 })}
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Discount</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Final Total</label>
                <input
                  type="text"
                  className="form-control"
                  value={`₹${finalTotal.toFixed(2)}`}
                  readOnly
                  style={{ fontWeight: 'bold', fontSize: '1.2rem', backgroundColor: 'var(--color-bg-tertiary)' }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Bill'}
          </button>
          <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateFarmerBill

