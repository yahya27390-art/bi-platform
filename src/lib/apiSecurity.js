/**
 * Dorat Cars - API Security & Authentication Tokens
 * Ensures client requests to internal Hostinger API endpoints are authorized.
 */

export const DORA_API_KEY = 'dora_sec_k9827f39a04b12c8e547d23a1098ef71';

export function getSecureHeaders(extraHeaders = {}) {
  return {
    'Content-Type': 'application/json',
    'X-Dora-API-Key': DORA_API_KEY,
    ...extraHeaders
  };
}

