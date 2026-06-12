const CONFIG = {
  pending  : { icon: 'bi-hourglass-split', label: 'Pending'  },
  approved : { icon: 'bi-check-circle',    label: 'Approved' },
  rejected : { icon: 'bi-x-circle',        label: 'Rejected' },
  admin    : { icon: 'bi-shield-fill',     label: 'Admin'    },
  manager  : { icon: 'bi-person-badge',    label: 'Manager'  },
  employee : { icon: 'bi-person',          label: 'Employee' },
}

export default function StatusBadge({ status }) {
  const cfg = CONFIG[status] || { icon: 'bi-circle', label: status }
  return (
    <span className={`rf-badge ${status}`}>
      <i className={`bi ${cfg.icon}`} />
      {cfg.label}
    </span>
  )
}
