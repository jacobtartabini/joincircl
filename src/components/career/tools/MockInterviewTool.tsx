
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function MockInterviewTool({ onClose }: { onClose: () => void }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mock Interview (AI)</DialogTitle>
        </DialogHeader>
        <p>Coming soon: AI interview simulation and feedback!</p>
      </DialogContent>
    </Dialog>
  );
}
