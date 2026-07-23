import type { VercelRequest, VercelResponse } from '@vercel/node'

interface SubmittedField {
  id: string
  label: string
  type: string
  required: boolean
}

interface ContactPayload {
  fields?: SubmittedField[]
  values?: Record<string, string>
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const body = req.body as ContactPayload
  const fields = body.fields ?? []
  const values = body.values ?? {}

  if (fields.length === 0) {
    res.status(400).json({ error: 'No fields submitted' })
    return
  }

  for (const field of fields) {
    if (field.required && !(values[field.id] ?? '').trim()) {
      res.status(400).json({ error: 'Missing required fields' })
      return
    }
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'Email service is not configured' })
    return
  }

  const toEmail = process.env.CONTACT_TO_EMAIL || 'geral@melaniefernandes.com'
  const fromEmail = process.env.CONTACT_FROM_EMAIL || 'onboarding@resend.dev'

  const emailField = fields.find((field) => field.type === 'email')
  const replyToEmail = emailField ? (values[emailField.id] ?? '').trim() : undefined

  const nameField = fields.find((field) => field.type === 'text')
  const enquirerName = nameField ? (values[nameField.id] ?? '').trim() : 'a couple'

  const textBody = [
    '💌 New wedding enquiry from yourweddingstory.pt',
    '',
    ...fields.map((field) => `${field.label}: ${(values[field.id] ?? '').trim() || '-'}`),
  ].join('\n')

  const rows = fields
    .map((field) => {
      const value = (values[field.id] ?? '').trim()
      const displayValue =
        field.type === 'email' && value
          ? `<a href="mailto:${escapeHtml(value)}" style="color:#5c7482;">${escapeHtml(value)}</a>`
          : escapeHtml(value).replace(/\n/g, '<br>') || '<em>-</em>'

      return `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e8ded0; font-size: 14px; color: #6b6459; white-space: nowrap; vertical-align: top;">
            ${escapeHtml(field.label)}
          </td>
          <td style="padding: 10px 0 10px 16px; border-bottom: 1px solid #e8ded0; font-size: 15px; color: #222222; vertical-align: top;">
            ${displayValue}
          </td>
        </tr>
      `
    })
    .join('')

  const htmlBody = `
    <div style="background:#f1ece6; padding: 32px 16px; font-family: Georgia, 'Times New Roman', serif;">
      <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 24px rgba(34,34,34,0.12);">
        <div style="padding: 32px 28px 8px; text-align: center;">
          <div style="font-size: 32px; line-height: 1;">💍💌</div>
          <h1 style="font-size: 22px; color: #222222; margin: 12px 0 4px; font-weight: 400;">A new wedding enquiry just arrived!</h1>
          <p style="color: #6b6459; font-size: 14px; margin: 0 0 20px;">from yourweddingstory.pt</p>
        </div>
        <div style="padding: 0 28px 28px;">
          <table style="width: 100%; border-collapse: collapse;">
            ${rows}
          </table>
        </div>
        <div style="background: #f1ece6; padding: 16px 28px; text-align: center;">
          <p style="font-size: 12px; color: #6b6459; margin: 0;">Just hit reply to write back to ${escapeHtml(enquirerName)} directly 💕</p>
        </div>
      </div>
    </div>
  `

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Your Wedding Story <${fromEmail}>`,
        to: [toEmail],
        reply_to: replyToEmail || undefined,
        subject: `💍 New wedding enquiry from ${enquirerName}`,
        text: textBody,
        html: htmlBody,
      }),
    })

    if (!resendRes.ok) {
      res.status(502).json({ error: 'Failed to send email' })
      return
    }

    res.status(200).json({ ok: true })
  } catch {
    res.status(502).json({ error: 'Failed to send email' })
  }
}
