
let lastApiCall = 0;
const MIN_API_CALL_INTERVAL = 500; // 500ms minimum between API calls

export async function applyRateLimiting(): Promise<void> {
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCall;
  
  if (timeSinceLastCall < MIN_API_CALL_INTERVAL) {
    // Wait for the remaining time to respect rate limiting
    const waitTime = MIN_API_CALL_INTERVAL - timeSinceLastCall;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  // Update last API call timestamp
  lastApiCall = Date.now();
}
