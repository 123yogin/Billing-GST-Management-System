import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import AddDealer from './pages/AddDealer'
import BillsList from './pages/BillsList'
import CreateDeal from './pages/CreateDeal'
import CreateDealerBill from './pages/CreateDealerBill'
import CreateFarmerBill from './pages/CreateFarmerBill'
import Dashboard from './pages/Dashboard'
import DealDetails from './pages/DealDetails'
import Dealers from './pages/Dealers'
import DealsList from './pages/DealsList'
import EditDealer from './pages/EditDealer'
import PrintDealerBill from './pages/PrintDealerBill'
import PrintFarmerBill from './pages/PrintFarmerBill'
import Reports from './pages/Reports'

import Items from './pages/Items'


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
          <Route path="/deal/create" element={<CreateDeal />} />
          <Route path="/deals" element={<DealsList />} />
          <Route path="/deal/:id/details" element={<DealDetails />} />
          <Route path="/dealers" element={<Dealers />} />
          <Route path="/dealers/add" element={<AddDealer />} />
          <Route path="/items" element={<Items />} />
          <Route path="/dealers/:id/edit" element={<EditDealer />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App

