import crypto from 'crypto'

const SECRET = import.meta.env.CRON_SECRET || ''

/**
 * Gera token HMAC-SHA256 para unsubscribe.
 * Token é determinístico — mesmo email gera mesmo token (facilita re-assinatura).
 */
export function generateToken(email: string): string {
  return crypto
    .createHmac('sha256', SECRET)
    .update(email.toLowerCase().trim())
    .digest('base64url')
    .slice(0, 22) // 22 chars = 132 bits, suficiente
}

export function verifyToken(email: string, token: string): boolean {
  const expected = generateToken(email)
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token))
  } catch {
    return false
  }
}

export function unsubscribeUrl(email: string, baseUrl = 'https://zencaps.com.br/blog'): string {
  const token = generateToken(email)
  const e = encodeURIComponent(email)
  return `${baseUrl}/descadastrar/?e=${e}&t=${token}`
}
