// Security configuration constants

// Rate limiting
export const SECURITY_CONFIG = {
  // Login rate limiting
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MS: 5 * 60 * 1000, // 5 minutes
  
  // File upload validation
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  MAX_FILE_SIZE_MB: 5,
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024,
  
  // Input validation
  MAX_TITLE_LENGTH: 200,
  MIN_PASSWORD_LENGTH: 6,
  
  // Session management
  SESSION_TIMEOUT_MS: 24 * 60 * 60 * 1000, // 24 hours
  IDLE_TIMEOUT_MS: 30 * 60 * 1000, // 30 minutes
};

// Input sanitization helper
export const sanitizeInput = (input: string, maxLength?: number): string => {
  let sanitized = input
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
  
  if (maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }
  
  return sanitized;
};

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Date validation (YYYY-MM-DD format)
export const validateDate = (date: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  
  const parsed = new Date(date);
  return !isNaN(parsed.getTime());
};

// File type validation
export const validateFileType = (file: File): boolean => {
  return SECURITY_CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type);
};

// File size validation
export const validateFileSize = (file: File): boolean => {
  return file.size <= SECURITY_CONFIG.MAX_FILE_SIZE_BYTES;
};

// Generate secure random filename
export const generateSecureFilename = (originalName: string, prefix?: string): string => {
  const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const prefixPart = prefix ? `${prefix}-` : '';
  
  return `${prefixPart}${timestamp}-${random}.${ext}`;
};

// Content Security Policy header (for reference)
export const CSP_HEADER = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https: blob:;
  connect-src 'self' https://*.supabase.co;
  frame-ancestors 'none';
`.replace(/\s+/g, ' ').trim();
