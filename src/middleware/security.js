/**
 * Custom middleware to apply security-related headers to HTTP responses.
 * These headers help prevent clickjacking, MIME-type sniffing, and enforce HTTPS usage.
 */
export const securityHeaders = (req, res, next) => {
  // Set security headers to mitigate common web vulnerabilities
  res.set({
    // Prevent browsers from MIME-sniffing the response (helps prevent XSS)
    'X-Content-Type-Options': 'nosniff',
    
    // Prevent the page from being rendered in an iframe, frame, or object (helps prevent Clickjacking)
    'X-Frame-Options': 'DENY',
    
    // Enforce secure HTTPS connections for a duration of 1 year, including subdomains
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  });

  // Call the next middleware function in the stack
  next();
};
