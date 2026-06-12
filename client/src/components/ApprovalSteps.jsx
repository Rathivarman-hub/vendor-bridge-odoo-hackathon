export default function ApprovalSteps({ steps = [], currentStep = 0 }) {
  if (!steps.length) return null

  return (
    <div className="approval-steps">
      {steps.map((step, i) => {
        const status =
          step.status === 'approved' ? 'completed' :
          step.status === 'rejected' ? 'rejected'  :
          i === currentStep          ? 'active'     : ''

        return (
          <>
            {i > 0 && (
              <div
                key={`conn-${i}`}
                className={`step-connector ${steps[i-1]?.status === 'approved' ? 'completed' : ''}`}
              />
            )}
            <div key={step._id || i} className={`approval-step ${status}`}>
              <div className="step-circle">
                {step.status === 'approved' ? <i className="bi bi-check" /> :
                 step.status === 'rejected' ? <i className="bi bi-x"   /> : i + 1}
              </div>
              <div className="step-label">{step.approverName || `Step ${i+1}`}</div>
              {step.comment && (
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', maxWidth: 80, textAlign: 'center', marginTop: 2 }}>
                  "{step.comment}"
                </div>
              )}
            </div>
          </>
        )
      })}
    </div>
  )
}
