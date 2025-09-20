

import { URL } from 'url';
export function extractDomain(fullUrl) {
  try {
    const { hostname } = new URL(fullUrl);
    return hostname; // "zayka-admin-kappa.vercel.app"
  } catch {
    return fullUrl;
  }
}