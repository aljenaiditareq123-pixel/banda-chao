/**
 * Geo-IP Detection Utility
 * Works in Node.js runtime (not Edge Runtime)
 * 
 * This file contains the Geo-IP detection logic that can be used
 * in API routes or server-side code.
 */

import geoip from 'geoip-lite';

/**
 * Get country code from IP address
 * @param ip - IP address string
 * @returns Country code (e.g., 'CN', 'AE', 'SA') or null if not found
 */
export function getCountryFromIP(ip: string): string | null {
  try {
    // Clean IP address (remove port if present, handle IPv6)
    const cleanIP = ip.split(':')[0].replace(/^::ffff:/, '');
    
    // Lookup IP in geoip-lite database
    const geo = geoip.lookup(cleanIP);
    
    if (geo && geo.country) {
      return geo.country;
    }
    
    return null;
  } catch (error) {
    console.error('[GeoIP] Error looking up IP:', error);
    return null;
  }
}

/**
 * Extract IP address from request headers
 * Handles X-Forwarded-For (proxy chain) and X-Real-IP
 */
export function extractIPFromHeaders(headers: Headers): string | null {
  // Try X-Forwarded-For first (contains client IP in proxy chain)
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs: "client, proxy1, proxy2"
    // The first one is usually the client IP
    const firstIP = forwardedFor.split(',')[0].trim();
    if (firstIP) {
      return firstIP;
    }
  }
  
  // Try X-Real-IP (set by some proxies)
  const realIP = headers.get('x-real-ip');
  if (realIP) {
    return realIP.trim();
  }
  
  // Try CF-Connecting-IP (Cloudflare)
  const cfIP = headers.get('cf-connecting-ip');
  if (cfIP) {
    return cfIP.trim();
  }
  
  return null;
}
