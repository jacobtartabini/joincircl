
import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, AlertTriangle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDuplicateDetection } from '@/hooks/useDuplicateDetection';

export const DuplicateDetectionButton = () => {
  const navigate = useNavigate();
  const { duplicateCount, isChecking } = useDuplicateDetection();

  console.log('[DuplicateDetectionButton] duplicateCount:', duplicateCount, 'isChecking:', isChecking);

  // Always show the button but with different states
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => navigate('/duplicates')}
      className={`h-12 px-4 transition-all duration-200 rounded-full hover:scale-[1.01] flex items-center gap-2 ${
        duplicateCount > 0 
          ? 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100' 
          : 'hover:bg-gray-50'
      }`}
      disabled={isChecking}
    >
      {isChecking ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium">Checking...</span>
        </>
      ) : duplicateCount > 0 ? (
        <>
          <AlertTriangle className="h-5 w-5" />
          <Users className="h-5 w-5" />
          <span className="text-sm font-medium">{duplicateCount} Duplicate{duplicateCount !== 1 ? 's' : ''}</span>
        </>
      ) : (
        <>
          <Users className="h-5 w-5" />
          <span className="text-sm font-medium">Check Duplicates</span>
        </>
      )}
    </Button>
  );
};
