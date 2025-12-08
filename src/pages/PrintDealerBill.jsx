import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getDealerBill, downloadDealerBillPDF } from '../services/api'
import '../styles/PrintBill.css'

function PrintDealerBill() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [bill, setBill] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBill()
  }, [id])

  const loadBill = async () => {
    try {
      const response = await getDealerBill(id)
      setBill(response.data)
    } catch (error) {
      alert('Error loading bill: ' + (error.response?.data?.error || error.message))
      navigate('/bills')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    try {
      const response = await downloadDealerBillPDF(id)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `dealer_bill_${id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      alert('Error downloading PDF: ' + (error.response?.data?.error || error.message))
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (!bill) {
    return <div>Bill not found</div>
  }

  const itemsTotal = bill.items.reduce((sum, item) => sum + item.item_total, 0)
  const subTotal = itemsTotal + bill.other_expense - bill.discount

  return (
    <div className="print-bill-container">
      <div className="no-print mb-3 text-center">
        <button className="btn btn-primary me-2" onClick={() => window.print()}>
          Print
        </button>
        <button className="btn btn-success me-2" onClick={handleDownloadPDF}>
          Download PDF
        </button>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/bills')}>
          Back to Bills
        </button>
      </div>

      <div className="print-container">
        <div className="bill-header text-center mb-4">
          <h1>DEALER BILL</h1>
        </div>

        <div className="bill-info mb-4">
          <table className="info-table">
            <tbody>
              <tr>
                <td><strong>Bill ID:</strong></td>
                <td>{bill.bill_id}</td>
              </tr>
              <tr>
                <td><strong>Date:</strong></td>
                <td>{bill.date}</td>
              </tr>
              <tr>
                <td><strong>Customer Name:</strong></td>
                <td>{bill.customer_name}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="items-table-container mb-4">
          <table className="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th className="text-end">Weight</th>
                <th className="text-end">Price</th>
                <th className="text-end">Total</th>
              </tr>
            </thead>
            <tbody>
              {bill.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.item}</td>
                  <td className="text-end">{item.weight.toFixed(2)}</td>
                  <td className="text-end">₹{item.price.toFixed(2)}</td>
                  <td className="text-end">₹{item.item_total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="totals-section">
          <table className="totals-table">
            <tbody>
              <tr>
                <td className="label">Items Total:</td>
                <td className="text-end">₹{itemsTotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="label">Other Expense:</td>
                <td className="text-end">₹{bill.other_expense.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="label">Discount:</td>
                <td className="text-end">₹{bill.discount.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="label">Sub Total:</td>
                <td className="text-end">₹{subTotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="label">GST ({bill.gst_percentage}%):</td>
                <td className="text-end">₹{bill.gst_amount.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="label">CGST:</td>
                <td className="text-end">₹{bill.cgst.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="label">SGST:</td>
                <td className="text-end">₹{bill.sgst.toFixed(2)}</td>
              </tr>
              <tr className="final-total">
                <td className="label"><strong>Grand Total:</strong></td>
                <td className="text-end"><strong>₹{bill.grand_total.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PrintDealerBill

