import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import BillsList from './pages/BillsList'
import CreateDealerBill from './pages/CreateDealerBill'
import CreateFarmerBill from './pages/CreateFarmerBill'
import Dashboard from './pages/Dashboard'
import PrintDealerBill from './pages/PrintDealerBill'
import PrintFarmerBill from './pages/PrintFarmerBill'
import Reports from './pages/Reports'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/farmer-bill/create" element={<CreateFarmerBill />} />
          <Route path="/dealer-bill/create" element={<CreateDealerBill />} />
          <Route path="/bills" element={<BillsList />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/bill/farmer/:id/print" element={<PrintFarmerBill />} />
          <Route path="/bill/dealer/:id/print" element={<PrintDealerBill />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App

