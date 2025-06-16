
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
}

export function GradientText({ children, className }: GradientTextProps) {
  const { profile } = useAuth();
  const firstName = profile?.full_name?.split(' ')[0] || 'User';

  return (
    <span className={cn("font-bold", className)}>
      <span className="text-black">Welcome back, </span>
      <span className="bg-gradient-to-r from-[#0daeec] to-[#0891b2] bg-clip-text text-transparent font-bold">
        {firstName}
      </span>
    </span>
  );
}
