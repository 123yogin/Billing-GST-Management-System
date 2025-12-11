import '../styles/Skeleton.css'

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-line skeleton-title"></div>
      <div className="skeleton-line skeleton-text"></div>
      <div className="skeleton-line skeleton-text short"></div>
    </div>
  )
}

export function SkeletonTable() {
  return (
    <div className="skeleton-table">
      <div className="skeleton-table-header">
        <div className="skeleton-line skeleton-header"></div>
        <div className="skeleton-line skeleton-header"></div>
        <div className="skeleton-line skeleton-header"></div>
        <div className="skeleton-line skeleton-header"></div>
        <div className="skeleton-line skeleton-header"></div>
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="skeleton-table-row">
          <div className="skeleton-line skeleton-cell"></div>
          <div className="skeleton-line skeleton-cell"></div>
          <div className="skeleton-line skeleton-cell"></div>
          <div className="skeleton-line skeleton-cell"></div>
          <div className="skeleton-line skeleton-cell short"></div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonForm() {
  return (
    <div className="skeleton-form">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="skeleton-form-group">
          <div className="skeleton-line skeleton-label"></div>
          <div className="skeleton-line skeleton-input"></div>
        </div>
      ))}
      <div className="skeleton-line skeleton-button"></div>
    </div>
  )
}

export function SkeletonDashboard() {
  return (
    <div className="skeleton-dashboard">
      <div className="skeleton-line skeleton-title-large"></div>
      <div className="skeleton-line skeleton-subtitle"></div>
      <div className="skeleton-cards-grid">
        {[...Array(4)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  )
}
