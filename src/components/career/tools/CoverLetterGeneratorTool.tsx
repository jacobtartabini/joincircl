
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function CoverLetterGeneratorTool({ onClose }: { onClose: () => void }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cover Letter Generator</DialogTitle>
        </DialogHeader>
        <p>Coming soon: AI cover letter writing and suggestions!</p>
      </DialogContent>
    </Dialog>
  );
}
