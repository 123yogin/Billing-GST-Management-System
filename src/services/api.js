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
export const getDailyLedger = (params) =>
  api.get('/reports/daily-ledger', { params })
export const getAvailableDates = (params) =>
  api.get('/reports/date-range', { params })
export const getBillsReport = (params) =>
  api.get('/reports/bills', { params })

// Deals (Interest Calculation)
export const createDeal = (data) => api.post('/deals', data)
export const getDeals = (params) => api.get('/deals', { params })
export const getDeal = (dealId) => api.get(`/deals/${dealId}`)
export const updateDeal = (dealId, data) => api.put(`/deals/${dealId}`, data)
export const createInstallments = (dealId, data) => api.post(`/deals/${dealId}/installments`, data)
export const addPayment = (dealId, data) => api.post(`/deals/${dealId}/payments`, data)
export const getDealLedger = (dealId) => api.get(`/deals/${dealId}/ledger`)

// Dealers
export const getDealers = () => api.get('/dealers')
export const createDealer = (data) => api.post('/dealers', data)
export const getDealer = (dealerId) => api.get(`/dealers/${dealerId}`)
export const updateDealer = (dealerId, data) => api.put(`/dealers/${dealerId}`, data)
export const deleteDealer = (dealerId) => api.delete(`/dealers/${dealerId}`)

// Items
export const getItems = () => api.get('/items')
export const createItem = (data) => api.post('/items', data)
export const updateItem = (itemId, data) => api.put(`/items/${itemId}`, data)
export const deleteItem = (itemId) => api.delete(`/items/${itemId}`)

export default api


