
import UnifiedAuthCallbackHandler from "./UnifiedAuthCallbackHandler";

// Redirect to unified handler for backward compatibility
export default function AuthCallbackHandler() {
  return <UnifiedAuthCallbackHandler />;
}
