
import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDuplicateDetection } from '@/hooks/useDuplicateDetection';

export const DuplicateDetectionButton = () => {
  const navigate = useNavigate();
  const { duplicateCount, isChecking } = useDuplicateDetection();

  if (duplicateCount === 0 && !isChecking) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => navigate('/duplicates')}
      className="flex items-center gap-2 bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
    >
      <AlertTriangle className="h-4 w-4" />
      {isChecking ? (
        "Checking..."
      ) : (
        <>
          <Users className="h-4 w-4" />
          {duplicateCount} Duplicate{duplicateCount !== 1 ? 's' : ''} Found
        </>
      )}
    </Button>
  );
};
