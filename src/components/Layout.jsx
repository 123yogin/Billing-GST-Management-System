import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import '../styles/Layout.css'

function Layout({ children }) {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/farmer-bill/create', label: 'Create Farmer Bill', icon: '📄' },
    { path: '/dealer-bill/create', label: 'Create Dealer Bill', icon: '📋' },
    { path: '/bills', label: 'View Bills', icon: '📑' },
    { path: '/reports', label: 'Reports', icon: '📈' },
  ]

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="layout-container">
      {/* Mobile Header */}
      <header className="mobile-header">
        <button 
          className="menu-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
        >
          <span className="hamburger"></span>
          <span className="hamburger"></span>
          <span className="hamburger"></span>
        </button>
        <h1 className="mobile-title">Billing System</h1>
      </header>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-logo">Billing System</h2>
          <p className="sidebar-subtitle">GST Management</p>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

export default Layout
