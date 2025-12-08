import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SkeletonDashboard } from '../components/Skeleton'
import '../styles/Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading for better UX demonstration
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const cards = [
    {
      id: 1,
      icon: '📄',
      title: 'Create Farmer Bill',
      description: 'Create a new bill without GST',
      path: '/farmer-bill/create'
    },
    {
      id: 2,
      icon: '📋',
      title: 'Create Dealer Bill',
      description: 'Create a bill with GST calculation',
      path: '/dealer-bill/create'
    },
    {
      id: 3,
      icon: '📑',
      title: 'View Bills',
      description: 'View and manage all bills',
      path: '/bills'
    },
    {
      id: 4,
      icon: '💰',
      title: 'Create Deal',
      description: 'Create a new loan/deal with interest',
      path: '/deal/create'
    },
    {
      id: 5,
      icon: '📊',
      title: 'View Deals',
      description: 'Manage deals and payments',
      path: '/deals'
    },
    {
      id: 6,
      icon: '📈',
      title: 'Reports',
      description: 'Download monthly reports',
      path: '/reports'
    }
  ]

  if (loading) {
    return <SkeletonDashboard />
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Billing & GST Management System</h1>
        <p>Manage your bills, deals, and interest calculations</p>
      </div>

      <div className="dashboard-cards">
        {cards.map((card) => (
          <div
            key={card.id}
            className="dashboard-card"
            onClick={() => navigate(card.path)}
          >
            <div className="card-icon">{card.icon}</div>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard

