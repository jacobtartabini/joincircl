
import { URLSearchParams } from "url";

export interface CallbackType {
  isMagicLink: boolean;
  isSupabaseAuth: boolean;
  isGoogleIntegration: boolean;
  isTwitterIntegration: boolean;
}

export const detectCallbackType = (searchParams: URLSearchParams): CallbackType => {
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const scope = searchParams.get('scope');
  const type = searchParams.get('type');

  const isMagicLink = type === 'magiclink' || searchParams.has('token_hash');
  const isSupabaseAuth = !!code && !scope && !state && !isMagicLink;
  const isGoogleIntegration = !!scope && (scope.includes('gmail') || scope.includes('calendar'));
  const isTwitterIntegration = !!state && localStorage.getItem('twitter_auth_state') === state;

  return {
    isMagicLink,
    isSupabaseAuth,
    isGoogleIntegration,
    isTwitterIntegration
  };
};
