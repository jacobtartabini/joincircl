
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import styles from "./glass.module.css";

export interface GlassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string; // e.g. "max-w-2xl"
}
export function GlassModal({ open, onOpenChange, title, children, maxWidth = "max-w-2xl" }: GlassModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${styles.glass} ${maxWidth} border-0 shadow-xl rounded-3xl p-0 !overflow-visible`}>
        <DialogHeader className="px-8 pt-8 pb-2">
          <DialogTitle className="font-bold text-xl">{title}</DialogTitle>
        </DialogHeader>
        <div className="px-8 py-6">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
