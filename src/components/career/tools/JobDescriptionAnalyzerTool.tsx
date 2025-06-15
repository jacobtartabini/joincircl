
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function JobDescriptionAnalyzerTool({ onClose }: { onClose: () => void }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Job Description Analyzer</DialogTitle>
        </DialogHeader>
        <p>Coming soon: Analyze and extract skills from any job description!</p>
      </DialogContent>
    </Dialog>
  );
}
