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
    `💌 New wedding enquiry from yourweddingstory.pt`,
    '',
    `👰🤵 Couple: ${fullName} & ${partnerName}`,
    `📧 Email: ${email}`,
    `📱 Phone: ${phone || '-'}`,
    `📅 Wedding date: ${weddingDate}`,
    `📍 Venue: ${venueName}`,
    `👥 Estimated guests: ${guestCount || '-'}`,
    '',
    '💭 Their vision for the wedding:',
    vision || '-',
    '',
    '🎥 Type of content requested:',
    contentType || '-',
  ].join('\n')

  const row = (emoji: string, label: string, value: string) => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #e8ded0; font-size: 15px; color: #6b6459; white-space: nowrap; vertical-align: top;">
        ${emoji}&nbsp; ${label}
      </td>
      <td style="padding: 10px 0 10px 16px; border-bottom: 1px solid #e8ded0; font-size: 15px; color: #222222; vertical-align: top;">
        ${value || '<em>-</em>'}
      </td>
    </tr>
  `

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
            ${row('👰🤵', 'Couple', `${escapeHtml(fullName)} &amp; ${escapeHtml(partnerName)}`)}
            ${row('📧', 'Email', `<a href="mailto:${escapeHtml(email)}" style="color:#5c7482;">${escapeHtml(email)}</a>`)}
            ${row('📱', 'Phone', escapeHtml(phone))}
            ${row('📅', 'Wedding date', escapeHtml(weddingDate))}
            ${row('📍', 'Venue', escapeHtml(venueName))}
            ${row('👥', 'Guests', escapeHtml(guestCount))}
          </table>
          <div style="margin-top: 20px;">
            <p style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #6b6459; margin: 0 0 6px;">💭 Their vision for the wedding</p>
            <p style="font-size: 15px; color: #222222; margin: 0 0 20px; white-space: pre-wrap;">${escapeHtml(vision) || '<em>-</em>'}</p>
            <p style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #6b6459; margin: 0 0 6px;">🎥 Content they'd love</p>
            <p style="font-size: 15px; color: #222222; margin: 0; white-space: pre-wrap;">${escapeHtml(contentType) || '<em>-</em>'}</p>
          </div>
        </div>
        <div style="background: #f1ece6; padding: 16px 28px; text-align: center;">
          <p style="font-size: 12px; color: #6b6459; margin: 0;">Just hit reply to write back to ${escapeHtml(fullName)} directly 💕</p>
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
        reply_to: email,
        subject: `💍 New wedding enquiry from ${fullName} & ${partnerName}`,
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
