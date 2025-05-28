
import { ReactNode } from "react";
import { MobileOptimizedLayout } from "./MobileOptimizedLayout";
import { SecureHeaders } from "@/components/security/SecureHeaders";
import { useEffect } from "react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useSyncManager } from "@/utils/syncManager";

interface ModernMainLayoutProps {
  children: ReactNode;
}

const ModernMainLayout = ({ children }: ModernMainLayoutProps) => {
  const isOnline = useOnlineStatus();
  const { handleOnlineStatusChange } = useSyncManager();

  useEffect(() => {
    handleOnlineStatusChange(isOnline);
  }, [isOnline]);

  return (
    <div className="min-h-screen-safe bg-gray-50/30">
      <SecureHeaders />
      <MobileOptimizedLayout>
        {children}
      </MobileOptimizedLayout>
    </div>
  );
};

export default ModernMainLayout;
