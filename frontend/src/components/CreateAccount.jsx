import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerVoter } from '../api/auth.js'

const STEPS = [
  { key: 'student', label: 'Student ID', placeholder: 'e.g. 2026CS1042' },
  { key: 'name', label: 'Full name', placeholder: 'e.g. Ayush Sharma' },
  { key: 'department', label: 'Department', placeholder: 'e.g. Computer Science' },
  { key: 'confirm', label: 'Confirm', placeholder: '' },
]

export default function CreateAccount() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [form, setForm] = useState({
    student: '',
    name: '',
    department: '',
    aadhar: '',
    biometric: 'biometric-template-demo',
  })
  const [status, setStatus] = useState(null)
  const [createdId, setCreatedId] = useState(null)

  const canProceed = useMemo(() => {
    if (currentStep === 0) return form.student.trim().length > 3
    if (currentStep === 1) return form.name.trim().length > 2
    if (currentStep === 2) return form.department.trim().length > 2
    return true
  }, [currentStep, form])

  async function handleFinish() {
    if (!/^\d{12}$/.test(form.aadhar)) {
      setStatus({ error: 'Aadhar number must be exactly 12 digits before final confirmation.' })
      return
    }

    setStatus('loading')
    try {
      await registerVoter({
        aadharNumber: form.aadhar,
        fullName: form.name.trim(),
        biometricTemplate: form.biometric,
        districtId: form.department.trim() || 'General',
      })
      const generatedId = `A-${Math.floor(1000 + Math.random() * 9000)}`
      setCreatedId(generatedId)
      setStatus('success')
    } catch (err) {
      setStatus({ error: err.message || 'Registration failed.' })
    }
  }

  return (
    <section className="portal-page portal-page--narrow">
      <div className="section-heading">
        <p className="section-kicker">Voter onboarding</p>
        <h1>Register with your student details in four quick steps.</h1>
      </div>

      <div className="surface-card step-shell">
        <div className="step-progress">
          {STEPS.map((step, index) => (
            <span key={step.key} className={`step-dot${index <= currentStep ? ' is-active' : ''}`} />
          ))}
        </div>

        {status === 'success' ? (
          <div className="step-success">
            <div className="step-success__mark">OK</div>
            <h2>You are registered.</h2>
            <p>Your voter ID is <strong>{createdId}</strong>.</p>
            <div className="form-actions">
              <button type="button" className="button button--ghost" onClick={() => navigate('/')}>
                Back to home
              </button>
              <button type="button" className="button button--primary" onClick={() => navigate('/voter')}>
                Open voter terminal
              </button>
            </div>
          </div>
        ) : (
          <div className="step-card" style={{ transform: `translateX(-${currentStep * 100}%)` }}>
            <div className="step-slide">
              <label className="field-label">Student ID</label>
              <input
                className="field-input"
                value={form.student}
                onChange={(event) => setForm((current) => ({ ...current, student: event.target.value }))}
                placeholder={STEPS[0].placeholder}
              />
            </div>

            <div className="step-slide">
              <label className="field-label">Full name</label>
              <input
                className="field-input"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder={STEPS[1].placeholder}
              />
            </div>

            <div className="step-slide">
              <label className="field-label">Department</label>
              <input
                className="field-input"
                value={form.department}
                onChange={(event) => setForm((current) => ({ ...current, department: event.target.value }))}
                placeholder={STEPS[2].placeholder}
              />
            </div>

            <div className="step-slide">
              <label className="field-label">Aadhar number (12 digits)</label>
              <input
                className="field-input"
                value={form.aadhar}
                onChange={(event) => setForm((current) => ({ ...current, aadhar: event.target.value }))}
                placeholder="e.g. 123456789012"
              />
              <label className="field-label">Biometric template</label>
              <input
                className="field-input"
                value={form.biometric}
                onChange={(event) => setForm((current) => ({ ...current, biometric: event.target.value }))}
              />
            </div>
          </div>
        )}

        {status?.error ? <div className="surface-note surface-note--warning">{status.error}</div> : null}

        {status !== 'success' ? (
          <div className="form-actions">
            <button
              type="button"
              className="button button--ghost"
              onClick={() => (currentStep === 0 ? navigate('/') : setCurrentStep((value) => value - 1))}
            >
              {currentStep === 0 ? 'Cancel' : 'Back'}
            </button>

            {currentStep < STEPS.length - 1 ? (
              <button
                type="button"
                className="button button--primary"
                disabled={!canProceed}
                onClick={() => setCurrentStep((value) => Math.min(value + 1, STEPS.length - 1))}
              >
                Next
              </button>
            ) : (
              <button type="button" className="button button--primary" disabled={status === 'loading'} onClick={handleFinish}>
                {status === 'loading' ? 'Creating account' : 'Confirm registration'}
              </button>
            )}
          </div>
        ) : null}
      </div>
    </section>
  )
}
