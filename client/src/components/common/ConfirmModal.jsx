import { createPortal } from 'react-dom'

const ConfirmModal = ({ show, title, message, onConfirm, onCancel }) => {
  if (!show) return null
  return createPortal(
    <div className="modal show d-block" style={{background:'rgba(0,0,0,0.5)'}}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title || 'Confirm'}</h5>
            <button className="btn-close" onClick={onCancel}></button>
          </div>
          <div className="modal-body"><p>{message}</p></div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
            <button className="btn btn-danger" onClick={onConfirm}>Confirm</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
export default ConfirmModal
