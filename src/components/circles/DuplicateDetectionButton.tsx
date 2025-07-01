
import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, AlertTriangle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDuplicateDetection } from '@/hooks/useDuplicateDetection';
import { cn } from '@/lib/utils';

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
      className={cn(
        "h-10 px-4 rounded-xl transition-all duration-200 flex items-center gap-2",
        duplicateCount > 0 
          ? 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 dark:bg-orange-950 dark:border-orange-800 dark:text-orange-400' 
          : ''
      )}
      disabled={isChecking}
    >
      {isChecking ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm font-medium">Checking...</span>
        </>
      ) : duplicateCount > 0 ? (
        <>
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">{duplicateCount} Duplicate{duplicateCount !== 1 ? 's' : ''}</span>
        </>
      ) : (
        <>
          <Users className="h-4 w-4" />
          <span className="text-sm font-medium">Check Duplicates</span>
        </>
      )}
    </Button>
  );
};
