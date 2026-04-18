import { unsubscribeUrl } from './unsubscribe-token'

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
  // Fallback: insere antes de </body>
  if (html.includes('</body>')) {
    return html.replace('</body>', `${footer}</body>`)
  }
  // Último fallback: append
  return html + footer
}

/**
 * Gera headers RFC 8058 para one-click unsubscribe (Gmail/Apple Mail).
 * A URL retornada por unsubscribeUrl() já aponta para o endpoint API,
 * que aceita POST (one-click) e GET (browser).
 */
export function unsubscribeHeaders(recipientEmail: string): Record<string, string> {
  const apiUrl = unsubscribeUrl(recipientEmail)
  return {
    'List-Unsubscribe': `<mailto:marketing@zencaps.com.br?subject=unsubscribe&body=${encodeURIComponent(recipientEmail)}>, <${apiUrl}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  }
}
