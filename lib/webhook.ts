/**
 * Centralised webhook utilities.
 *
 * fireWebhook() validates the target URL for SSRF risks before sending,
 * then dispatches a non-blocking POST. Failures are always silent so they
 * never affect the caller's response.
 */

/** Private / link-local IP patterns that must never be targeted. */
const BLOCKED_HOSTNAMES = /^(localhost|127\.|0\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.|::1$|fc[0-9a-f]{2}:|fd[0-9a-f]{2}:)/i

/** Only https is allowed for production webhooks. http is blocked. */
function isSafeWebhookUrl(raw: string): boolean {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return false
  }

  // Must be https
  if (url.protocol !== 'https:') return false

  const host = url.hostname.toLowerCase()

  // Block private / loopback / link-local ranges
  if (BLOCKED_HOSTNAMES.test(host)) return false

  // Block bare IP addresses that look internal (any numeric IPv4)
  // This catches cases like 192.168.x.x that may slip through the regex above
  const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(host)
  if (ipv4) {
    const parts = host.split('.').map(Number)
    if (
      parts[0] === 10 ||
      parts[0] === 127 ||
      parts[0] === 169 && parts[1] === 254 ||
      parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31 ||
      parts[0] === 192 && parts[1] === 168 ||
      parts[0] === 0
    ) return false
  }

  return true
}

export function fireWebhook(url: string, payload: object): void {
  if (!isSafeWebhookUrl(url)) {
    console.warn('[webhook] blocked unsafe URL:', url)
    return
  }

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'DrawVault-Webhook/1.0',
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(8000),
  }).catch(() => { /* Webhook failures are always silent */ })
}
