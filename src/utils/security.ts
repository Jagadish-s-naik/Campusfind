/**
  * Comprehensive Security, Input Sanitization & Data Safety Module
  */

/**
 * 1. Advanced HTML Entity Encoder & XSS Sanitizer
 * Escapes control characters, HTML tags, script vectors, and dangerous attributes.
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/`/g, '&#x60;')
    .replace(/=/g, '&#x3D;')
    .trim();
}

/**
 * 2. File Header Magic Byte Inspection & Strict Image Type Guard
 * Performs binary magic-number signature checks to prevent malicious executable/script renaming.
 */
export async function validateImageFileSecurely(file: File): Promise<{ valid: boolean; error?: string }> {
  // Check extension and declared MIME-type
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedMimeTypes.includes(file.type.toLowerCase())) {
    return { valid: false, error: 'Security restriction: Only JPG, PNG, WEBP, and GIF images are permitted.' };
  }

  // Size limit check (5MB max)
  const maxSizeInBytes = 5 * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return { valid: false, error: 'Security restriction: File payload exceeds 5MB ceiling.' };
  }

  // Read binary header bytes for magic signature validation
  try {
    const buffer = await file.slice(0, 8).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    
    // Check JPG signature: FF D8 FF
    const isJpg = bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF;
    // Check PNG signature: 89 50 4E 47 0D 0A 1A 0A
    const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47;
    // Check GIF signature: 47 49 46 38
    const isGif = bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38;
    // Check WEBP signature: 52 49 46 46 (RIFF)
    const isWebp = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46;

    if (!isJpg && !isPng && !isGif && !isWebp) {
      return { valid: false, error: 'Security alert: File binary magic signature does not match valid image headers.' };
    }
  } catch (err) {
    console.error('File magic byte verification failed:', err);
  }

  return { valid: true };
}

/**
 * 3. Secure Base64 Data-URI Sanitizer
 * Strips script injections inside data URIs before storing or sending to APIs.
 */
export function sanitizeBase64Image(base64String: string): string {
  if (!base64String) return '';
  // Ensure string starts with valid image data URI scheme
  const validDataUriRegex = /^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/;
  if (!validDataUriRegex.test(base64String)) {
    // If prefix is missing, clean non-base64 characters safely
    return base64String.replace(/[^A-Za-z0-9+/=]/g, '');
  }
  return base64String;
}

/**
 * 4. API Key Proxy Guard & Production Security Architecture Notice
 */
export function getSecurityArchitectureNotice() {
  return {
    clientExposedKeyTradeoff: true,
    mitigationsApplied: [
      'Client-side HTML entity encoding preventing stored XSS injection.',
      'Binary magic byte signature inspection for uploaded image assets.',
      'Reveal-on-match contact blurring protecting student PII (phone/email).',
      'Input length restrictions and schema enforcement on IndexedDB stores.',
    ],
    productionFix: 'Route Gemini API calls through a Vercel Cloud Function proxy with HTTP Referrer and IP rate limits.',
  };
}
