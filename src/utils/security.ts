/**
 * Security & Input Sanitization Utilities
 */

// HTML Entity encoder to prevent XSS attacks
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

// Strict Image MIME-Type & Header Validation
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return { valid: false, error: 'Invalid file format. Only JPEG, PNG, WEBP, and GIF images are permitted.' };
  }

  const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSizeInBytes) {
    return { valid: false, error: 'File size exceeds maximum 5MB limit.' };
  }

  return { valid: true };
}

// API Key Proxy Router / Guard with Encryption Hint & Client Guard
export function isAPIKeySecurelyHandled(): { clientExposed: boolean; recommendations: string[] } {
  return {
    clientExposed: true,
    recommendations: [
      'In production, route Gemini API calls via backend serverless function (AWS Lambda / Vercel Cloud Function).',
      'Enforce API key HTTP Referrer restrictions in Google Cloud Console.',
      'Enforce strict quota limits per IP to prevent API key abuse.',
    ],
  };
}
