
import React from 'react';
import { ExternalLink } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const handleWaitlistClick = () => {
    // Analytics for demo mode
    console.log('demo_completed_action', { action: 'waitlist_click', timestamp: new Date().toISOString() });
    window.open('https://www.joincircl.com/waitlist', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 shadow-lg">
      <div className="flex items-center justify-center gap-2 text-sm font-medium">
        <span>🎉</span>
        <span>You're experiencing Circl in sandbox mode. Nothing is saved.</span>
        <button
          onClick={handleWaitlistClick}
          className="inline-flex items-center gap-1 ml-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full transition-colors duration-200"
        >
          <span>👉 Join the waitlist to get the real thing</span>
          <ExternalLink className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};
