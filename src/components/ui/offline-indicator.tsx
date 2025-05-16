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

// Keep the function for backwards compatibility but don't render anything
export function ConnectionStatus({ className }: { className?: string }) {
  return null;
}
