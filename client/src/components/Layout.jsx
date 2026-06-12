import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function Layout({ children, title }) {
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="main-content w-100">
        <Topbar title={title} />
        <div className="page-inner">{children}</div>
      </div>
    </div>
  )
}
