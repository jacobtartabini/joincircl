
import { Wifi, WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { cn } from "@/lib/utils";

export function OfflineIndicator({ className }: { className?: string }) {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className={cn(
      "fixed bottom-4 right-4 bg-destructive text-destructive-foreground py-2 px-4 rounded-full flex items-center gap-2 shadow-lg z-50 animate-in fade-in slide-in-from-right-10 duration-300",
      className
    )}>
      <WifiOff size={18} />
      <span className="text-sm font-medium">Offline Mode</span>
    </div>
  );
}

export function ConnectionStatus({ className }: { className?: string }) {
  const isOnline = useOnlineStatus();

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {isOnline ? (
        <>
          <Wifi size={16} className="text-green-500" />
          <span className="text-xs text-muted-foreground">Online</span>
        </>
      ) : (
        <>
          <WifiOff size={16} className="text-destructive" />
          <span className="text-xs text-destructive">Offline</span>
        </>
      )}
    </div>
  );
}
