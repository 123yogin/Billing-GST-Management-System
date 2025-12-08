import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getDealer, updateDealer } from '../services/api'
import '../styles/BillsList.css'

function EditDealer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    khata_no: '',
    gstin: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetchDealer()
  }, [id])

  const fetchDealer = async () => {
    setFetching(true)
    try {
      const response = await getDealer(id)
      const dealer = response.data
      setFormData({
        name: dealer.name || '',
        phone: dealer.phone || '',
        address: dealer.address || '',
        khata_no: dealer.khata_no || '',
        gstin: dealer.gstin || ''
      })
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dealer')
    } finally {
      setFetching(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await updateDealer(id, formData)
      navigate('/dealers')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update dealer')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/dealers')
  }

  if (fetching) {
    return <div className="text-center p-5">Loading dealer information...</div>
  }

  return (
    <div className="bills-list-page">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1>Edit Dealer</h1>
            <p>Update dealer information</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <div className="form-group mb-3">
                  <label>Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group mb-3">
                  <label>Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="form-group mb-3">
                  <label>Address</label>
                  <textarea
                    className="form-control"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <div className="form-group mb-3">
                  <label>Khata Number</label>
                  <input
                    type="text"
                    className="form-control"
                    name="khata_no"
                    value={formData.khata_no}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group mb-3">
                  <label>GSTIN</label>
                  <input
                    type="text"
                    className="form-control"
                    name="gstin"
                    value={formData.gstin}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            <div className="d-flex gap-2">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Dealer'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditDealer
