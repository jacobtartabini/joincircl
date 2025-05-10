
/**
 * A utility to perform basic client-side security checks
 * This is mainly educational and for development; it won't catch all security issues
 */

export function runSecurityAudit(): { passed: string[], warnings: string[], errors: string[] } {
  const results = {
    passed: [] as string[],
    warnings: [] as string[],
    errors: [] as string[]
  };

  // Check if running on HTTPS
  if (window.location.protocol === 'https:') {
    results.passed.push('Application is using HTTPS');
  } else {
    results.warnings.push('Application is not using HTTPS. Always use HTTPS in production.');
  }

  // Check for CSP headers (via meta tag)
  const cspMetaTag = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (cspMetaTag) {
    results.passed.push('Content Security Policy is set via meta tag');
  } else {
    results.warnings.push('No Content Security Policy meta tag found. CSP is recommended.');
  }

  // Check localStorage for sensitive data
  const sensitiveKeys = ['password', 'token', 'key', 'secret', 'credential', 'auth'];
  const localStorageKeys = Object.keys(localStorage);
  
  const potentiallySensitive = localStorageKeys.filter(key => 
    sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))
  );
  
  if (potentiallySensitive.length > 0) {
    results.warnings.push(
      `Found potentially sensitive data in localStorage: ${potentiallySensitive.join(', ')}`
    );
  } else {
    results.passed.push('No obvious sensitive data found in localStorage');
  }

  // Check for iframe protection
  const xFrameOptions = document.querySelector('meta[http-equiv="X-Frame-Options"]');
  if (xFrameOptions) {
    results.passed.push('X-Frame-Options is set via meta tag');
  } else {
    results.warnings.push('No X-Frame-Options meta tag found. This can lead to clickjacking vulnerabilities.');
  }

  // Check for Supabase configuration
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    const supabaseKey = localStorage.getItem('supabase.auth.token');
    if (supabaseKey) {
      results.passed.push('Supabase authentication token found');
    }
  }

  // Check for exposed API keys in client code (not foolproof)
  const scripts = document.getElementsByTagName('script');
  const scriptContent = Array.from(scripts)
    .filter(script => !script.src) // Only inline scripts
    .map(script => script.textContent || '')
    .join(' ');

  const apiKeyPattern = /['"]?[a-zA-Z0-9_-]{20,}['"]?/g;
  const potentialApiKeys = scriptContent.match(apiKeyPattern);
  
  if (potentialApiKeys && potentialApiKeys.length > 0) {
    results.warnings.push('Potential API keys found in client-side scripts');
  }

  // Add recommendations
  results.warnings.push(
    'Recommendation: Implement regular security audits using automated tools'
  );
  
  results.warnings.push(
    'Recommendation: Enable HTTP security headers server-side when deploying to production'
  );

  return results;
}

// Function to display the security audit in a more user-friendly way
export function displaySecurityAuditResults() {
  const results = runSecurityAudit();
  
  console.group('🔒 SECURITY AUDIT RESULTS');
  
  console.group('✅ PASSED CHECKS');
  results.passed.forEach(pass => console.log(pass));
  console.groupEnd();
  
  console.group('⚠️ WARNINGS');
  results.warnings.forEach(warning => console.warn(warning));
  console.groupEnd();
  
  console.group('❌ ERRORS');
  results.errors.forEach(error => console.error(error));
  console.groupEnd();
  
  console.groupEnd();
  
  return {
    passed: results.passed.length,
    warnings: results.warnings.length,
    errors: results.errors.length,
    total: results.passed.length + results.warnings.length + results.errors.length
  };
}
