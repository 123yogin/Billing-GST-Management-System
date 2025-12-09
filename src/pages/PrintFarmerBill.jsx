import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getFarmerBill, downloadFarmerBillPDF } from '../services/api'
import '../styles/PrintBill.css'

function PrintFarmerBill() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [bill, setBill] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBill()
  }, [id])

  const loadBill = async () => {
    try {
      const response = await getFarmerBill(id)
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
      const response = await downloadFarmerBillPDF(id)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `farmer_bill_${id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      alert('Error downloading PDF: ' + (error.response?.data?.error || error.message))
    }
  }

  if (loading) return <div className="text-center py-5">Loading...</div>
  if (!bill) return <div>Bill not found</div>

  const itemsTotal = bill.items.reduce((sum, item) => sum + item.item_total, 0)
  const subTotal = itemsTotal + (bill.other_expense || 0) - (bill.discount || 0)

  return (
    <div className="print-bill-page">
      <div className="no-print mb-3 text-center">
        <button className="btn btn-primary me-2" onClick={() => window.print()}>Print</button>
        <button className="btn btn-success me-2" onClick={handleDownloadPDF}>Download PDF</button>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/bills')}>Back</button>
      </div>

      <div className="invoice-container" style={{
        width: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
        padding: '10mm',
        backgroundColor: 'white',
        fontSize: '12px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ border: '2px solid black' }}>
          {/* Header */}
          <div className="text-center p-2" style={{ borderBottom: '1px solid black', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 5, right: 5, fontSize: '10px' }}>
              Original For Recipient<br />Duplicate For Transporter<br />Triplicate For Supplier
            </div>
            <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Tax Invoice</div>
            <div style={{ fontSize: '10px' }}>Subject to Patan Jurisdiction Only</div>
            <h1 style={{ color: '#d32f2f', margin: '5px 0', fontSize: '28px', fontWeight: 'bold' }}>KHUSHBU ENTERPRISE</h1>
            <p style={{ margin: 0 }}>Add: Kungher-Patan Road, At & Po. Kungher, Ta. & Dist. Patan (N.G.) 384265</p>
            <p style={{ margin: 0, fontWeight: 'bold' }}>(M.) 94284 59988</p>
          </div>

          {/* Top Section */}
          <div style={{ display: 'flex', borderBottom: '1px solid black' }}>
            <div style={{ flex: 1, borderRight: '1px solid black', padding: '5px' }}>
              <div style={{ marginBottom: '5px' }}><strong>GSTIN NO.:</strong> 24AAQFK3998K1ZI</div>
              <div style={{ display: 'flex', marginBottom: '5px' }}>
                <span style={{ width: '100px' }}>Invoice No.:</span>
                <span style={{ borderBottom: '1px dotted black', flex: 1 }}>{bill.bill_id.slice(0, 8)}</span>
              </div>
              <div style={{ display: 'flex', marginBottom: '5px' }}>
                <span style={{ width: '100px' }}>Invoice Date.:</span>
                <span style={{ borderBottom: '1px dotted black', flex: 1 }}>{bill.date}</span>
              </div>
              <div style={{ display: 'flex' }}>
                <span style={{ width: '100px' }}>State:</span>
                <span style={{ borderBottom: '1px dotted black', flex: 1 }}>Gujarat</span>
                <span style={{ width: '80px', textAlign: 'right' }}>Code No.:</span>
                <span style={{ borderBottom: '1px dotted black', width: '40px', marginLeft: '5px' }}>24</span>
              </div>
            </div>
            <div style={{ flex: 1, padding: '5px' }}>
              <div style={{ display: 'flex', marginBottom: '5px' }}>
                <span style={{ width: '140px' }}>Transportation Mode:</span>
                <span style={{ borderBottom: '1px dotted black', flex: 1 }}>{bill.transport_mode}</span>
              </div>
              <div style={{ display: 'flex', marginBottom: '5px' }}>
                <span style={{ width: '140px' }}>Vehicle Number:</span>
                <span style={{ borderBottom: '1px dotted black', flex: 1 }}>{bill.vehicle_number}</span>
              </div>
              <div style={{ display: 'flex', marginBottom: '5px' }}>
                <span style={{ width: '140px' }}>Date & Time of Supply:</span>
                <span style={{ borderBottom: '1px dotted black', flex: 1 }}>{bill.supply_date ? bill.supply_date.split('T')[0] : ''}</span>
              </div>
              <div style={{ display: 'flex' }}>
                <span style={{ width: '140px' }}>Place of Supply:</span>
                <span style={{ borderBottom: '1px dotted black', flex: 1 }}>{bill.place_of_supply}</span>
              </div>
            </div>
          </div>

          {/* Receiver Details */}
          <div style={{ borderBottom: '1px solid black', padding: '5px' }}>
            <div style={{ textAlign: 'center', borderBottom: '1px solid black', margin: '-5px -5px 5px -5px', padding: '2px', backgroundColor: '#f0f0f0' }}>
              <strong>Details of Receiver (Billed to)</strong>
            </div>
            <div style={{ display: 'flex', marginBottom: '5px' }}>
              <span style={{ width: '80px' }}>Name :</span>
              <span style={{ borderBottom: '1px dotted black', flex: 1 }}>{bill.customer_name}</span>
            </div>
            <div style={{ display: 'flex', marginBottom: '5px' }}>
              <span style={{ width: '80px' }}>Address :</span>
              <span style={{ borderBottom: '1px dotted black', flex: 1 }}>{bill.receiver_address}</span>
            </div>
            <div style={{ display: 'flex' }}>
              <span style={{ width: '80px' }}>State :</span>
              <span style={{ borderBottom: '1px dotted black', flex: 1 }}>{bill.receiver_state}</span>
              <span style={{ width: '100px', textAlign: 'right' }}>State Code :</span>
              <span style={{ borderBottom: '1px dotted black', width: '60px', marginLeft: '5px' }}>{bill.receiver_state_code}</span>
              <span style={{ width: '80px', textAlign: 'right' }}>GSTIN :</span>
              <span style={{ borderBottom: '1px dotted black', flex: 1, marginLeft: '5px' }}>{bill.receiver_gstin}</span>
            </div>
          </div>

          {/* Items Table */}
          <div style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid black' }}>
                  <th style={{ borderRight: '1px solid black', width: '40px', padding: '5px' }}>Sr.<br />No</th>
                  <th style={{ borderRight: '1px solid black', padding: '5px' }}>Name of<br />Goods / Service</th>
                  <th style={{ borderRight: '1px solid black', width: '80px', padding: '5px' }}>HSN<br />Code</th>
                  <th style={{ borderRight: '1px solid black', width: '60px', padding: '5px' }}>Quantity<br />In Bags</th>
                  <th style={{ borderRight: '1px solid black', width: '80px', padding: '5px' }}>Net. Kg.</th>
                  <th style={{ borderRight: '1px solid black', width: '80px', padding: '5px' }}>Rate per<br />20 Kg.</th>
                  <th style={{ width: '100px', padding: '5px', textAlign: 'right' }}>Amount<br />Rs. Ps.</th>
                </tr>
              </thead>
              <tbody>
                {bill.items.map((item, index) => (
                  <tr key={index}>
                    <td style={{ borderRight: '1px solid black', padding: '5px', textAlign: 'center' }}>{index + 1}</td>
                    <td style={{ borderRight: '1px solid black', padding: '5px' }}>{item.item}</td>
                    <td style={{ borderRight: '1px solid black', padding: '5px', textAlign: 'center' }}>{item.hsn_code}</td>
                    <td style={{ borderRight: '1px solid black', padding: '5px', textAlign: 'center' }}>{item.quantity_bags}</td>
                    <td style={{ borderRight: '1px solid black', padding: '5px', textAlign: 'right' }}>{item.weight.toFixed(2)}</td>
                    <td style={{ borderRight: '1px solid black', padding: '5px', textAlign: 'right' }}>{item.price.toFixed(2)}</td>
                    <td style={{ padding: '5px', textAlign: 'right' }}>{item.item_total.toFixed(2)}</td>
                  </tr>
                ))}
                {/* Fill empty rows to maintain height if needed */}
                {Array.from({ length: Math.max(0, 10 - bill.items.length) }).map((_, i) => (
                  <tr key={`empty-${i}`}>
                    <td style={{ borderRight: '1px solid black', padding: '5px' }}>&nbsp;</td>
                    <td style={{ borderRight: '1px solid black', padding: '5px' }}></td>
                    <td style={{ borderRight: '1px solid black', padding: '5px' }}></td>
                    <td style={{ borderRight: '1px solid black', padding: '5px' }}></td>
                    <td style={{ borderRight: '1px solid black', padding: '5px' }}></td>
                    <td style={{ borderRight: '1px solid black', padding: '5px' }}></td>
                    <td style={{ padding: '5px' }}></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Section */}
          <div style={{ borderTop: '1px solid black', display: 'flex' }}>
            {/* Bank Details */}
            <div style={{ flex: 1, borderRight: '1px solid black', padding: '5px' }}>
              <div style={{ textDecoration: 'underline', fontWeight: 'bold', marginBottom: '5px' }}>Bank Details :</div>
              <div>A/c. Name : <strong>KHUSHBU ENTERPRISE</strong></div>
              <div>Bank Name : THE SARDARGUNJ MERCANTILE CO-OP. BANK LTD.</div>
              <div>A/c Number : 00211101003889</div>
              <div>IFSC Code : GSCB0USMCB1</div>
              <div style={{ marginTop: '10px', fontSize: '10px' }}>Total Invoice Amount in Words :</div>
              <div style={{ fontWeight: 'bold' }}>{/* Add number to words logic here if needed */}</div>
            </div>

            {/* Totals */}
            <div style={{ width: '300px' }}>
              <div style={{ display: 'flex', borderBottom: '1px solid black' }}>
                <div style={{ flex: 1, padding: '5px', borderRight: '1px solid black' }}>Sub Total</div>
                <div style={{ width: '100px', padding: '5px', textAlign: 'right' }}>{subTotal.toFixed(2)}</div>
              </div>
              <div style={{ display: 'flex', borderBottom: '1px solid black' }}>
                <div style={{ flex: 1, padding: '5px', borderRight: '1px solid black' }}>CGST</div>
                <div style={{ width: '100px', padding: '5px', textAlign: 'right' }}>-</div>
              </div>
              <div style={{ display: 'flex', borderBottom: '1px solid black' }}>
                <div style={{ flex: 1, padding: '5px', borderRight: '1px solid black' }}>SGST</div>
                <div style={{ width: '100px', padding: '5px', textAlign: 'right' }}>-</div>
              </div>
              <div style={{ display: 'flex', borderBottom: '1px solid black' }}>
                <div style={{ flex: 1, padding: '5px', borderRight: '1px solid black' }}>IGST</div>
                <div style={{ width: '100px', padding: '5px', textAlign: 'right' }}>-</div>
              </div>
              <div style={{ display: 'flex', fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>
                <div style={{ flex: 1, padding: '5px', borderRight: '1px solid black' }}>Total</div>
                <div style={{ width: '100px', padding: '5px', textAlign: 'right' }}>{bill.final_total.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid black', padding: '5px', textAlign: 'right' }}>
            <div style={{ marginBottom: '30px', fontSize: '10px' }}>For, KHUSHBU ENTERPRISE</div>
            <div style={{ fontSize: '10px' }}>Authorized Signature</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrintFarmerBill
