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
      {/* Glass effect background */}
      <div 
        className="absolute inset-0 glass-card"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted)/0.3) 50%, hsl(var(--background)) 100%)',
          backdropFilter: 'blur(30px)',
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* Logo with subtle animation */}
        <div className="relative">
          <div 
            className="absolute inset-0 rounded-full opacity-20 animate-pulse"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--chart-1)) 100%)',
              filter: 'blur(20px)',
              transform: 'scale(1.5)',
            }}
          />
          <div className="relative glass-card p-6 rounded-3xl">
            <CirclLogo size={48} className="animate-pulse" />
          </div>
        </div>

        {/* App name with gradient */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold gradient-text">Circl</h1>
          <p className="text-sm text-muted-foreground">Connecting your circles</p>
        </div>

        {/* Elegant spinner */}
        <div className="relative">
          <div 
            className="w-8 h-8 rounded-full border-2 border-transparent animate-spin"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--chart-1)) 100%)',
              borderImage: 'linear-gradient(45deg, hsl(var(--primary)), transparent, hsl(var(--primary))) 1',
            }}
          >
            <div 
              className="absolute inset-1 rounded-full"
              style={{
                background: 'hsl(var(--background))',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}