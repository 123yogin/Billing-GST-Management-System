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
    { path: '/deal/create', label: 'Create Deal', icon: '💰' },
    { path: '/deals', label: 'View Deals', icon: '📈' },
    { path: '/dealers', label: 'Dealers', icon: '👥' },
    { path: '/reports', label: 'Reports', icon: '📊' },
  ]

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  // Get page title based on current route
  const getPageTitle = () => {
    const currentItem = menuItems.find(item => isActive(item.path))
    return currentItem ? currentItem.label : 'Billing System'
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
      <div className="main-content">
        {/* Top Header - Desktop */}
        <header className="top-header">
          <h1 className="header-title">{getPageTitle()}</h1>

          <div className="header-actions">
            <button className="header-icon-btn" title="Notifications">
              🔔
            </button>
            <button className="header-icon-btn" title="Settings">
              ⚙️
            </button>
            <div className="user-info">
              <div className="user-details">
                <p className="user-name">Admin</p>
                <p className="user-role">Administrator</p>
              </div>
              <div className="user-avatar">A</div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '24px 32px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
