
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function ResumeReviewerTool({ onClose }: { onClose: () => void }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resume Reviewer (Arlo AI)</DialogTitle>
        </DialogHeader>
        <p>Coming soon: Upload your resume and get tailored AI feedback!</p>
      </DialogContent>
    </Dialog>
  );
}
