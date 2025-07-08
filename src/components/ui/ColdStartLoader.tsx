import React, { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { CirclLogo } from "./CirclLogo";

interface ColdStartLoaderProps {
  show: boolean;
  onLoadingComplete: () => void;
}

export function ColdStartLoader({ show, onLoadingComplete }: ColdStartLoaderProps) {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!show && mounted) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(onLoadingComplete, 150);
      return () => clearTimeout(timer);
    }
  }, [show, mounted, onLoadingComplete]);

  if (!mounted || !show) return null;

  // Only show on mobile or when explicitly requested
  if (!isMobile) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      {/* Branded background with subtle gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted)/0.5) 100%)',
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* Logo with brand-consistent glass effect */}
        <div className="relative">
          {/* Subtle glow effect using brand colors */}
          <div 
            className="absolute inset-0 rounded-full opacity-30 animate-pulse"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, #38bbe1 100%)',
              filter: 'blur(24px)',
              transform: 'scale(1.8)',
            }}
          />
          <div className="relative glass-card p-8 rounded-3xl border border-border/20">
            <CirclLogo size={56} className="text-primary" />
          </div>
        </div>

        {/* Brand-consistent app name */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold gradient-text">Circl</h1>
          <p className="text-sm text-muted-foreground font-medium">Connecting your circles</p>
        </div>

        {/* Enhanced spinner using brand colors */}
        <div className="relative">
          {/* Outer ring */}
          <div className="w-10 h-10 rounded-full border-2 border-border/20 animate-spin">
            <div 
              className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin"
              style={{
                animationDuration: '1.5s',
              }}
            />
          </div>
          {/* Inner dot */}
          <div 
            className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full transform -translate-x-1/2 -translate-y-1/2"
            style={{
              background: 'hsl(var(--primary))',
              boxShadow: '0 0 12px hsl(var(--primary)/0.4)',
            }}
          />
        </div>
      </div>
    </div>
  );
}