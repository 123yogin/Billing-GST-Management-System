import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { downloadDealerExcel, downloadFarmerExcel } from '../services/api'
import '../styles/Reports.css'

function Reports() {
  const navigate = useNavigate()
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState({ farmer: false, dealer: false })

  const handleDownloadFarmerExcel = async () => {
    setLoading({ ...loading, farmer: true })
    try {
      const response = await downloadFarmerExcel({ month, year })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `farmer_bills_${month}_${year}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      alert('Excel file downloaded successfully!')
    } catch (error) {
      alert('Error downloading Excel: ' + (error.response?.data?.error || error.message))
    } finally {
      setLoading({ ...loading, farmer: false })
    }
  }

  const handleDownloadDealerExcel = async () => {
    setLoading({ ...loading, dealer: true })
    try {
      const response = await downloadDealerExcel({ month, year })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `dealer_bills_${month}_${year}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      alert('Excel file downloaded successfully!')
    } catch (error) {
      alert('Error downloading Excel: ' + (error.response?.data?.error || error.message))
    } finally {
      setLoading({ ...loading, dealer: false })
    }
  }

  return (
    <div className="reports-page">
      <div className="page-header">
        <h1>Reports</h1>
        <p>Download monthly reports in Excel format</p>
      </div>

      <div className="reports-grid">
        <div className="card">
          <div className="card-header">
            <h3>Monthly Reports</h3>
          </div>
          <div className="card-body">
            <div className="date-selectors">
              <div className="form-group">
                <label className="form-label">Month</label>
                <select
                  className="form-control"
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Year</label>
                <input
                  type="number"
                  className="form-control"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  min="2000"
                  max="2100"
                />
              </div>
            </div>

            <div className="download-buttons">
              <button
                className="btn btn-primary"
                onClick={handleDownloadFarmerExcel}
                disabled={loading.farmer}
              >
                {loading.farmer ? 'Downloading...' : 'Download Farmer Bills Excel'}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleDownloadDealerExcel}
                disabled={loading.dealer}
              >
                {loading.dealer ? 'Downloading...' : 'Download Dealer Bills Excel (GST)'}
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Report Information</h3>
          </div>
          <div className="card-body">
            <p>
              Select a month and year to download the corresponding bills in Excel format.
            </p>
            <ul className="info-list">
              <li>
                <strong>Farmer Bills:</strong> Contains all farmer bills with item details, expenses, and totals.
              </li>
              <li>
                <strong>Dealer Bills:</strong> Contains all dealer bills with GST calculations, CGST, SGST, and grand totals.
              </li>
            </ul>
            <div className="info-box">
              <p>
                The Excel files include all bills from the selected month and year, with detailed item-wise breakdown.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports

