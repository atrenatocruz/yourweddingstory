import { useEffect, useState, type FormEvent } from 'react'

interface ContactFormState {
  fullName: string
  partnerName: string
  email: string
  phone: string
  weddingDate: string
  venueName: string
  guestCount: string
  vision: string
  contentType: string
}

const emptyForm: ContactFormState = {
  fullName: '',
  partnerName: '',
  email: '',
  phone: '',
  weddingDate: '',
  venueName: '',
  guestCount: '',
  vision: '',
  contentType: '',
}

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error'

export function ContactFormModal() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<ContactFormState>(emptyForm)
  const [status, setStatus] = useState<SubmitStatus>('idle')

  useEffect(() => {
    function handleOpen() {
      setOpen(true)
    }
    window.addEventListener('open-contact-form', handleOpen)
    return () => window.removeEventListener('open-contact-form', handleOpen)
  }, [])

  useEffect(() => {
    if (!open) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        handleClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  function updateField<K extends keyof ContactFormState>(field: K, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleClose() {
    setOpen(false)
    if (status !== 'submitting') {
      setStatus('idle')
      setForm(emptyForm)
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setStatus('submitting')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        setStatus('error')
        return
      }

      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (!open) {
    return null
  }

  return (
    <div className="contact-modal-overlay" onClick={handleClose}>
      <div className="contact-modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="contact-modal-close" onClick={handleClose} aria-label="Close">
          &times;
        </button>

        {status === 'success' ? (
          <div className="contact-modal-success">
            <p className="body-text">Thank you! We&apos;ll be in touch soon.</p>
          </div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
            <p className="contact-form-intro body-text">
              Reach out with your details and we&apos;ll be in touch soon!
            </p>

            <div className="contact-field">
              <label htmlFor="fullName">Your Full Name *</label>
              <input
                id="fullName"
                required
                value={form.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
              />
            </div>

            <div className="contact-field">
              <label htmlFor="partnerName">Your Fiancé&apos;s Full Name *</label>
              <input
                id="partnerName"
                required
                value={form.partnerName}
                onChange={(e) => updateField('partnerName', e.target.value)}
              />
            </div>

            <div className="contact-field-row">
              <div className="contact-field">
                <label htmlFor="email">Email Address *</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                />
              </div>

              <div className="contact-field">
                <label htmlFor="phone">Mobile Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                />
              </div>
            </div>

            <div className="contact-field-row">
              <div className="contact-field">
                <label htmlFor="weddingDate">Wedding Date *</label>
                <input
                  id="weddingDate"
                  type="date"
                  required
                  value={form.weddingDate}
                  onChange={(e) => updateField('weddingDate', e.target.value)}
                />
              </div>

              <div className="contact-field">
                <label htmlFor="venueName">Venue Name *</label>
                <input
                  id="venueName"
                  required
                  value={form.venueName}
                  onChange={(e) => updateField('venueName', e.target.value)}
                />
              </div>
            </div>

            <div className="contact-field">
              <label htmlFor="guestCount">Estimate Guest Count</label>
              <input
                id="guestCount"
                type="number"
                min="0"
                value={form.guestCount}
                onChange={(e) => updateField('guestCount', e.target.value)}
              />
            </div>

            <div className="contact-field">
              <label htmlFor="vision">What is your vision for your wedding?</label>
              <textarea
                id="vision"
                placeholder="Please provide some details about your special day!"
                maxLength={5000}
                value={form.vision}
                onChange={(e) => updateField('vision', e.target.value)}
              />
            </div>

            <div className="contact-field">
              <label htmlFor="contentType">What type of content would you like me to create?</label>
              <textarea
                id="contentType"
                placeholder="Tell me everything you would like me to know!"
                maxLength={5000}
                value={form.contentType}
                onChange={(e) => updateField('contentType', e.target.value)}
              />
            </div>

            {status === 'error' && (
              <p className="contact-form-error body-text">
                Something went wrong sending your enquiry. Please try again, or email geral@melaniefernandes.com
                directly.
              </p>
            )}

            <button type="submit" className="cta-button contact-submit-button" disabled={status === 'submitting'}>
              {status === 'submitting' ? 'Sending...' : 'Send Enquiry'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
