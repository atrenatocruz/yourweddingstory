import { useEffect, useState, type FormEvent } from 'react'
import { fetchContactFormFields } from '../lib/fetchContactFormFields'
import type { ContactFormField } from '../types/content'

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error'

export function ContactFormModal() {
  const [open, setOpen] = useState(false)
  const [fields, setFields] = useState<ContactFormField[] | null>(null)
  const [values, setValues] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<SubmitStatus>('idle')

  useEffect(() => {
    function handleOpen() {
      setOpen(true)
    }
    window.addEventListener('open-contact-form', handleOpen)
    return () => window.removeEventListener('open-contact-form', handleOpen)
  }, [])

  useEffect(() => {
    if (!open || fields) return
    fetchContactFormFields().then((loaded) => {
      setFields(loaded)
      setValues(Object.fromEntries(loaded.map((field) => [field.id, ''])))
    })
  }, [open, fields])

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

  function updateValue(id: string, value: string) {
    setValues((prev) => ({ ...prev, [id]: value }))
  }

  function handleClose() {
    setOpen(false)
    if (status !== 'submitting') {
      setStatus('idle')
      setFields(null)
      setValues({})
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!fields) return
    setStatus('submitting')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields, values }),
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
        ) : !fields ? (
          <div className="contact-modal-loading" />
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
            <p className="contact-form-intro body-text">
              Reach out with your details and we&apos;ll be in touch soon!
            </p>

            {fields.map((field) => (
              <div className="contact-field" key={field.id}>
                <label htmlFor={field.id}>
                  {field.label}
                  {field.required ? ' *' : ''}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    id={field.id}
                    required={field.required}
                    placeholder={field.placeholder ?? undefined}
                    maxLength={5000}
                    value={values[field.id] ?? ''}
                    onChange={(e) => updateValue(field.id, e.target.value)}
                  />
                ) : (
                  <input
                    id={field.id}
                    type={field.type}
                    required={field.required}
                    placeholder={field.placeholder ?? undefined}
                    min={field.type === 'number' ? 0 : undefined}
                    value={values[field.id] ?? ''}
                    onChange={(e) => updateValue(field.id, e.target.value)}
                  />
                )}
              </div>
            ))}

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
