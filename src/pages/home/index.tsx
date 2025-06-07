
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileHomeContent from '@/components/home-page/MobileHomeContent';
import ModernHomeContent from '@/components/home-page/ModernHomeContent';

export default function HomePage() {
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background dark:bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background dark:bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground dark:text-foreground mb-4">Welcome to Circl</h1>
          <p className="text-muted-foreground dark:text-muted-foreground">Please sign in to continue</p>
        </div>
      </div>
    );
  }

  // Use mobile-optimized version on mobile devices
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background dark:bg-background">
        <MobileHomeContent />
      </div>
    );
  }

  // Use modern layout for desktop
  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <ModernHomeContent />
    </div>
  );
}
