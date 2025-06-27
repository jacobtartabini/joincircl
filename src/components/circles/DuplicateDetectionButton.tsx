
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
      className={`h-12 px-4 flex items-center gap-2 rounded-full transition-all duration-200 ${
        duplicateCount > 0 
          ? 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100' 
          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
      }`}
      disabled={isChecking}
    >
      {isChecking ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Checking...
        </>
      ) : duplicateCount > 0 ? (
        <>
          <AlertTriangle className="h-4 w-4" />
          <Users className="h-4 w-4" />
          {duplicateCount} Duplicate{duplicateCount !== 1 ? 's' : ''}
        </>
      ) : (
        <>
          <Users className="h-4 w-4" />
          Check Duplicates
        </>
      )}
    </Button>
  );
};
