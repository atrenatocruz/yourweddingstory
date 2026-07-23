import type { VercelRequest, VercelResponse } from '@vercel/node'

interface ContactPayload {
  fullName?: string
  partnerName?: string
  email?: string
  phone?: string
  weddingDate?: string
  venueName?: string
  guestCount?: string
  vision?: string
  contentType?: string
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

  const fullName = (body.fullName ?? '').trim()
  const partnerName = (body.partnerName ?? '').trim()
  const email = (body.email ?? '').trim()
  const phone = (body.phone ?? '').trim()
  const weddingDate = (body.weddingDate ?? '').trim()
  const venueName = (body.venueName ?? '').trim()
  const guestCount = (body.guestCount ?? '').trim()
  const vision = (body.vision ?? '').trim()
  const contentType = (body.contentType ?? '').trim()

  if (!fullName || !partnerName || !email || !weddingDate || !venueName) {
    res.status(400).json({ error: 'Missing required fields' })
    return
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'Email service is not configured' })
    return
  }

  const toEmail = process.env.CONTACT_TO_EMAIL || 'geral@melaniefernandes.com'
  const fromEmail = process.env.CONTACT_FROM_EMAIL || 'onboarding@resend.dev'

  const textBody = [
    'New wedding enquiry from yourweddingstory.pt',
    '',
    `Full name: ${fullName}`,
    `Fiancé's full name: ${partnerName}`,
    `Email: ${email}`,
    `Mobile phone: ${phone || '-'}`,
    `Wedding date: ${weddingDate}`,
    `Venue name: ${venueName}`,
    `Estimated guest count: ${guestCount || '-'}`,
    '',
    'Vision for the wedding:',
    vision || '-',
    '',
    'Type of content requested:',
    contentType || '-',
  ].join('\n')

  const htmlBody = `
    <h2>New wedding enquiry from yourweddingstory.pt</h2>
    <p><strong>Full name:</strong> ${escapeHtml(fullName)}</p>
    <p><strong>Fiancé's full name:</strong> ${escapeHtml(partnerName)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Mobile phone:</strong> ${escapeHtml(phone) || '-'}</p>
    <p><strong>Wedding date:</strong> ${escapeHtml(weddingDate)}</p>
    <p><strong>Venue name:</strong> ${escapeHtml(venueName)}</p>
    <p><strong>Estimated guest count:</strong> ${escapeHtml(guestCount) || '-'}</p>
    <p><strong>Vision for the wedding:</strong><br>${escapeHtml(vision).replace(/\n/g, '<br>') || '-'}</p>
    <p><strong>Type of content requested:</strong><br>${escapeHtml(contentType).replace(/\n/g, '<br>') || '-'}</p>
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
        reply_to: email,
        subject: `New wedding enquiry from ${fullName}`,
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
