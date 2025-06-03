
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { googleService } from "@/services/googleService";

export const useGoogleIntegrationHandler = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogleIntegration = async (code: string, scope: string, onComplete: () => void) => {
    const isGmail = scope.includes('gmail');
    const serviceName = isGmail ? 'Gmail' : 'Google Calendar';
    
    try {
      const redirectUri = `${window.location.origin}/auth/callback`;
      const tokenData = await googleService.exchangeCodeForToken(code, redirectUri, scope);
      
      if (!tokenData) {
        throw new Error('Failed to exchange authorization code for tokens');
      }

      toast({
        title: "Success",
        description: `${serviceName} connected successfully`,
      });

      setTimeout(() => {
        navigate('/settings?tab=integrations');
      }, 2000);
    } catch (error) {
      console.error(`Failed to connect ${serviceName}:`, error);
      toast({
        title: "Connection Failed",
        description: `Failed to connect ${serviceName}. Please try again.`,
        variant: "destructive",
      });
      navigate("/settings?tab=integrations", { replace: true });
    } finally {
      onComplete();
    }
  };

  return { handleGoogleIntegration };
};
