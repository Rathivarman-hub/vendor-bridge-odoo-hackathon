const Spinner = ({ text = 'Loading...' }) => (
  <div className="loading-spinner flex-column gap-2">
    <div className="spinner-border text-primary" role="status"></div>
    <span className="text-muted" style={{fontSize:'0.875rem'}}>{text}</span>
  </div>
)
export default Spinner
