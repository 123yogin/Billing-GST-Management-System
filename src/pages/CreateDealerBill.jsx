import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BillItemRow from '../components/BillItemRow'
import SearchableDropdown from '../components/SearchableDropdown'
import { createDealerBill, getDealer, getDealers } from '../services/api'
import '../styles/BillForm.css'

function CreateDealerBill() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    customer_name: '',
    receiver_address: '',
    receiver_state: 'Gujarat',
    receiver_state_code: '24',
    receiver_gstin: '',
    transport_mode: '',
    vehicle_number: '',
    supply_date: new Date().toISOString().split('T')[0],
    place_of_supply: '',
    other_expense: 0,
    discount: 0,
    gst_percentage: 18,
    items: [{ item: '', hsn_code: '', quantity_bags: 0, weight: 0, price: 0, item_total: 0 }]
  })
  const [calculations, setCalculations] = useState({
    subTotal: 0,
    gstAmount: 0,
    cgst: 0,
    sgst: 0,
    grandTotal: 0
  })
  const [loading, setLoading] = useState(false)
  const [fetchDealerId, setFetchDealerId] = useState('')
  const [dealersList, setDealersList] = useState([])

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

  const handleFetchDealer = async () => {
    if (!fetchDealerId) {
      alert('Please enter a Dealer ID')
      return
    }

    try {
      setLoading(true)
      const response = await getDealer(fetchDealerId)
      const dealer = response.data

      setFormData(prev => ({
        ...prev,
        customer_name: dealer.name || '',
        receiver_address: dealer.address || '',
        receiver_gstin: dealer.gstin || ''
      }))
      // Removed alert per request
    } catch (error) {
      console.error(error)
      alert('Error fetching dealer: ' + (error.response?.data?.error || 'Dealer not found'))
    } finally {
      setLoading(false)
    }
  }

  // Auto-calculate totals
  useEffect(() => {
    let itemsTotal = 0
    formData.items.forEach(item => {
      const itemTotal = (item.weight || 0) * (item.price || 0)
      itemsTotal += itemTotal
    })

    const subTotal = itemsTotal + (parseFloat(formData.other_expense) || 0) - (parseFloat(formData.discount) || 0)
    const gstPercentage = parseFloat(formData.gst_percentage) || 18
    const gstAmount = (subTotal * gstPercentage) / 100
    const cgst = gstAmount / 2
    const sgst = gstAmount / 2
    const grandTotal = subTotal + gstAmount

    setCalculations({
      subTotal,
      gstAmount,
      cgst,
      sgst,
      grandTotal
    })
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
      items: [...formData.items, { item: '', hsn_code: '', quantity_bags: 0, weight: 0, price: 0, item_total: 0 }]
    })
  }

  const handleDeleteItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index)
    if (newItems.length === 0) {
      newItems.push({ item: '', hsn_code: '', quantity_bags: 0, weight: 0, price: 0, item_total: 0 })
    }
    setFormData({ ...formData, items: newItems })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await createDealerBill(formData)
      alert('Bill created successfully!')
      navigate(`/bill/dealer/${response.data.bill_id}/print`)
    } catch (error) {
      alert('Error creating bill: ' + (error.response?.data?.error || error.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bill-form-page">
      <div className="page-header">
        <h1>Create Tax Invoice</h1>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Invoice Header Section */}
        <div className="card form-section">
          <div className="card-header bg-warning text-dark">
            <h3 className="mb-0 text-center">KHUSHBU ENTERPRISE</h3>
            <p className="text-center mb-0 small">Add: Kungher-Patan Road, At & Po. Kungher, Ta. & Dist. Patan (N.G.) 384265</p>
          </div>
          <div className="card-body p-0">
            <div className="row g-0">
              {/* Left Column */}
              <div className="col-md-6 border-end p-3">
                <div className="mb-2"><strong>GSTIN NO.:</strong> 24AAQFK3998K1ZI</div>
                <div className="row mb-2">
                  <label className="col-sm-4 col-form-label">Invoice No.:</label>
                  <div className="col-sm-8">
                    <input type="text" className="form-control form-control-sm" placeholder="Auto Generated" disabled />
                  </div>
                </div>
                <div className="row mb-2">
                  <label className="col-sm-4 col-form-label">Invoice Date:</label>
                  <div className="col-sm-8">
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="row mb-2">
                  <label className="col-sm-4 col-form-label">State:</label>
                  <div className="col-sm-8 d-flex gap-2">
                    <input type="text" className="form-control form-control-sm" value="Gujarat" readOnly />
                    <input type="text" className="form-control form-control-sm" placeholder="Code No." value="24" readOnly />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="col-md-6 p-3">
                <div className="row mb-2">
                  <label className="col-sm-5 col-form-label">Transportation Mode:</label>
                  <div className="col-sm-7">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={formData.transport_mode}
                      onChange={(e) => setFormData({ ...formData, transport_mode: e.target.value })}
                    />
                  </div>
                </div>
                <div className="row mb-2">
                  <label className="col-sm-5 col-form-label">Vehicle Number:</label>
                  <div className="col-sm-7">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={formData.vehicle_number}
                      onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
                    />
                  </div>
                </div>
                <div className="row mb-2">
                  <label className="col-sm-5 col-form-label">Date of Supply:</label>
                  <div className="col-sm-7">
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={formData.supply_date}
                      onChange={(e) => setFormData({ ...formData, supply_date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="row mb-2">
                  <label className="col-sm-5 col-form-label">Place of Supply:</label>
                  <div className="col-sm-7">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={formData.place_of_supply}
                      onChange={(e) => setFormData({ ...formData, place_of_supply: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Receiver Details */}
            <div className="border-top p-3">
              <h6 className="text-decoration-underline mb-3">Details of Receiver (Billed to)</h6>

              {/* Dealer Fetch Row */}
              <div className="row mb-3 align-items-center">
                <label className="col-sm-2 col-form-label">Search Dealer ID:</label>
                <div className="col-sm-4">
                  <div className="input-group input-group-sm">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Dealer ID"
                      value={fetchDealerId}
                      onChange={(e) => setFetchDealerId(e.target.value)}
                    />
                    <button
                      className="btn btn-outline-primary"
                      type="button"
                      onClick={handleFetchDealer}
                      disabled={loading}
                    >
                      Fetch
                    </button>
                  </div>
                </div>
                <div className="col-sm-6">
                  <small className="text-muted">Enter ID to auto-fill details</small>
                </div>
              </div>

              <div className="row mb-2">
                <label className="col-sm-2 col-form-label">Name:</label>
                <div className="col-sm-10">
                  <SearchableDropdown
                    options={dealersList}
                    label="name"
                    id="customer_name"
                    selectedVal={formData.customer_name}
                    placeholder="Select or type dealer name..."
                    handleChange={(val) => {
                      const dealer = dealersList.find(d => d.name === val)
                      setFormData(prev => ({
                        ...prev,
                        customer_name: val,
                        ...(dealer && {
                          receiver_address: dealer.address || '',
                          receiver_gstin: dealer.gstin || '',
                        })
                      }))

                      // Auto-populate Dealer ID field
                      if (dealer && dealer.dealer_id) {
                        setFetchDealerId(dealer.dealer_id)
                      }
                    }}
                  />
                </div>
              </div>
              <div className="row mb-2">
                <label className="col-sm-2 col-form-label">Address:</label>
                <div className="col-sm-10">
                  <textarea
                    className="form-control form-control-sm"
                    rows="2"
                    value={formData.receiver_address}
                    onChange={(e) => setFormData({ ...formData, receiver_address: e.target.value })}
                  ></textarea>
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-md-6 d-flex align-items-center">
                  <label className="col-sm-4 col-form-label">State:</label>
                  <div className="col-sm-8">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={formData.receiver_state}
                      onChange={(e) => setFormData({ ...formData, receiver_state: e.target.value })}
                    />
                  </div>
                </div>
                <div className="col-md-6 d-flex align-items-center">
                  <label className="col-sm-4 col-form-label">State Code:</label>
                  <div className="col-sm-8">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={formData.receiver_state_code}
                      onChange={(e) => setFormData({ ...formData, receiver_state_code: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="row mb-2">
                <label className="col-sm-2 col-form-label">GSTIN:</label>
                <div className="col-sm-10">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={formData.receiver_gstin}
                    onChange={(e) => setFormData({ ...formData, receiver_gstin: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="card form-section mt-3">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h3>Items</h3>
            <button type="button" className="btn btn-sm btn-primary" onClick={handleAddItem}>
              Add Item
            </button>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-bordered mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Name of Goods / Service</th>
                    <th style={{ width: '100px' }}>HSN Code</th>
                    <th style={{ width: '80px' }}>Bags</th>
                    <th style={{ width: '100px' }}>Net Kg.</th>
                    <th style={{ width: '100px' }}>Rate</th>
                    <th className="text-end" style={{ width: '120px' }}>Amount</th>
                    <th style={{ width: '50px' }}></th>
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

        {/* Bottom Section */}
        <div className="card form-section mt-3">
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <h6>Bank Details:</h6>
                <p className="mb-1"><strong>A/c Name:</strong> KHUSHBU ENTERPRISE</p>
                <p className="mb-1"><strong>Bank Name:</strong> THE SARDARGUNJ MERCANTILE CO-OP. BANK LTD.</p>
                <p className="mb-1"><strong>A/c Number:</strong> 00211101003889</p>
                <p className="mb-0"><strong>IFSC Code:</strong> GSCB0USMCB1</p>
              </div>
              <div className="col-md-6">
                <div className="row mb-2">
                  <label className="col-sm-6 col-form-label">Sub Total</label>
                  <div className="col-sm-6">
                    <input type="text" className="form-control form-control-sm text-end" value={calculations.subTotal.toFixed(2)} readOnly />
                  </div>
                </div>
                <div className="row mb-2">
                  <label className="col-sm-6 col-form-label">CGST ({formData.gst_percentage / 2}%)</label>
                  <div className="col-sm-6">
                    <input type="text" className="form-control form-control-sm text-end" value={calculations.cgst.toFixed(2)} readOnly />
                  </div>
                </div>
                <div className="row mb-2">
                  <label className="col-sm-6 col-form-label">SGST ({formData.gst_percentage / 2}%)</label>
                  <div className="col-sm-6">
                    <input type="text" className="form-control form-control-sm text-end" value={calculations.sgst.toFixed(2)} readOnly />
                  </div>
                </div>
                <div className="row mb-2">
                  <label className="col-sm-6 col-form-label fw-bold">Total</label>
                  <div className="col-sm-6">
                    <input type="text" className="form-control form-control-sm text-end fw-bold" value={calculations.grandTotal.toFixed(2)} readOnly />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="action-buttons mt-4 mb-5">
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Saving...' : 'Save & Print Invoice'}
          </button>
          <button type="button" className="btn btn-outline-secondary btn-lg" onClick={() => navigate('/')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateDealerBill
