import { unsubscribeUrl } from './unsubscribe-token'

const TRACK_BASE = 'https://zencaps.com.br/blog/api/track'
const REDIRECT_BASE = 'https://zencaps.com.br/blog/api/track/go'

/**
 * Injeta footer de compliance (unsubscribe + endereço) no HTML do email.
 * Substitui o placeholder {{compliance_footer}} ou adiciona antes de </body>.
 */
export function injectComplianceFooter(html: string, recipientEmail: string): string {
  const unsubUrl = unsubscribeUrl(recipientEmail)
  const footer = `
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f8fc;padding:20px 16px;font-family:Arial,Helvetica,sans-serif;">
  <tr><td align="center">
    <p style="margin:0 0 8px;font-size:11px;color:#6B7A9A;line-height:1.6;">
      Você está recebendo este email porque se cadastrou ou comprou Zen Caps.
    </p>
    <p style="margin:0 0 8px;font-size:11px;color:#6B7A9A;line-height:1.6;">
      <a href="${unsubUrl}" style="color:#1DB8E8;text-decoration:underline;">Descadastrar / Não receber mais emails</a>
    </p>
    <p style="margin:0;font-size:11px;color:rgba(107,122,154,0.7);line-height:1.5;">
      Zen Caps · marketing@zencaps.com.br · <a href="https://zencaps.com.br" style="color:inherit;">zencaps.com.br</a>
    </p>
  </td></tr>
</table>`

  if (html.includes('{{compliance_footer}}')) {
    return html.replace('{{compliance_footer}}', footer)
  }
  if (html.includes('</body>')) {
    return html.replace('</body>', `${footer}</body>`)
  }
  return html + footer
}

/**
 * Injeta pixel de tracking de abertura (1x1 transparente).
 * Posição: antes do </body> pra ser carregado por último (não bloqueia render).
 */
export function injectOpenPixel(html: string, trackingId: string): string {
  if (!trackingId) return html
  const pixel = `<img src="${TRACK_BASE}/open/?id=${encodeURIComponent(trackingId)}" width="1" height="1" border="0" alt="" style="display:none;width:1px;height:1px;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;">`
  if (html.includes('</body>')) {
    return html.replace('</body>', `${pixel}</body>`)
  }
  return html + pixel
}

/**
 * Substitui links externos por URL de tracking (302 redirect).
 * NÃO substitui:
 *  - Links de unsubscribe (regex matches /api/unsubscribe)
 *  - Links mailto:, tel:, anchors (#)
 *  - Links já trackeados (/api/track/click)
 */
export function rewriteLinksForTracking(html: string, trackingId: string): string {
  if (!trackingId) return html
  const tid = encodeURIComponent(trackingId)
  return html.replace(/href=(["'])([^"']+)\1/gi, (match, quote, url) => {
    // Skip URLs we shouldn't track
    if (
      url.startsWith('#') ||
      url.startsWith('mailto:') ||
      url.startsWith('tel:') ||
      url.includes('/api/unsubscribe') ||
      url.includes('/api/track/') ||
      url.includes('/blog/descadastrar')
    ) {
      return match
    }
    // Only track http/https
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return match
    }
    const encoded = Buffer.from(url, 'utf-8').toString('base64url')
    return `href=${quote}${REDIRECT_BASE}/?id=${tid}&t=${encoded}${quote}`
  })
}

/**
 * Gera headers RFC 8058 para one-click unsubscribe (Gmail/Apple Mail).
 */
export function unsubscribeHeaders(recipientEmail: string): Record<string, string> {
  const apiUrl = unsubscribeUrl(recipientEmail)
  return {
    'List-Unsubscribe': `<mailto:marketing@zencaps.com.br?subject=unsubscribe&body=${encodeURIComponent(recipientEmail)}>, <${apiUrl}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  }
}
