
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function InterviewDebriefJournalTool({ onClose }: { onClose: () => void }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Interview Debrief Journal</DialogTitle>
        </DialogHeader>
        <p>Coming soon: Private place to reflect and track lessons.</p>
      </DialogContent>
    </Dialog>
  );
}
