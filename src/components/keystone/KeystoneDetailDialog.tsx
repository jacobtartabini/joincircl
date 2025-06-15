
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, User, FileText } from "lucide-react";
import type { Keystone } from "@/types/keystone";

interface KeystoneDetailDialogProps {
  keystone: Keystone | null;
  isOpen: boolean;
  onClose: () => void;
}

export function KeystoneDetailDialog({ keystone, isOpen, onClose }: KeystoneDetailDialogProps) {
  if (!keystone) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {keystone.title}
          </DialogTitle>
          <DialogDescription>
            Event details and information
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {/* Date and Time */}
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">{formatDate(keystone.date)}</div>
              <div className="text-sm text-muted-foreground">{formatTime(keystone.date)}</div>
            </div>
          </div>

          {/* Category */}
          {keystone.category && (
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="px-3 py-1">
                {keystone.category}
              </Badge>
            </div>
          )}

          {/* Recurring */}
          {keystone.is_recurring && (
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="px-3 py-1">
                Recurring {keystone.recurrence_frequency && `• ${keystone.recurrence_frequency}`}
              </Badge>
            </div>
          )}

          {/* Notes */}
          {keystone.notes && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">Notes</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 text-sm">
                {keystone.notes}
              </div>
            </div>
          )}

          {/* Created Date */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
            <div className="text-xs text-muted-foreground">
              Created: {keystone.created_at ? new Date(keystone.created_at).toLocaleDateString() : 'Unknown'}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
