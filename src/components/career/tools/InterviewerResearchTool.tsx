
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function InterviewerResearchTool({ onClose }: { onClose: () => void }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Interviewer Research</DialogTitle>
        </DialogHeader>
        <p>Coming soon: Research public info on interviewers!</p>
      </DialogContent>
    </Dialog>
  );
}
