/**
 * Upgrades an `http://` URL to `https://`.
 *
 * Some NASA endpoints (e.g. the asset manifest) return `http://` links even
 * though the same files are served over HTTPS. Loading them as-is from an
 * HTTPS page would be blocked or flagged as mixed content.
 */
export function toHttps(url: string): string {
  return url.replace(/^http:\/\//i, 'https://')
}
