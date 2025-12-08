import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Farmer Bills
export const createFarmerBill = (data) => api.post('/farmer-bills', data)
export const getFarmerBills = (params) => api.get('/farmer-bills', { params })
export const getFarmerBill = (billId) => api.get(`/farmer-bills/${billId}`)
export const downloadFarmerBillPDF = (billId) => 
  api.get(`/farmer-bills/${billId}/pdf`, { responseType: 'blob' })

// Dealer Bills
export const createDealerBill = (data) => api.post('/dealer-bills', data)
export const getDealerBills = (params) => api.get('/dealer-bills', { params })
export const getDealerBill = (billId) => api.get(`/dealer-bills/${billId}`)
export const downloadDealerBillPDF = (billId) => 
  api.get(`/dealer-bills/${billId}/pdf`, { responseType: 'blob' })

// Reports
export const downloadFarmerExcel = (params) => 
  api.get('/reports/farmer/excel', { params, responseType: 'blob' })
export const downloadDealerExcel = (params) => 
  api.get('/reports/dealer/excel', { params, responseType: 'blob' })

export default api

