
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function FollowUpGeneratorTool({ onClose }: { onClose: () => void }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Follow-Up & Thank You Generator</DialogTitle>
        </DialogHeader>
        <p>Coming soon: AI-crafted thank-you and follow-up notes!</p>
      </DialogContent>
    </Dialog>
  );
}
