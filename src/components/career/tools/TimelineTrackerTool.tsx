
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function TimelineTrackerTool({ onClose }: { onClose: () => void }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Timeline & Deadline Tracker</DialogTitle>
        </DialogHeader>
        <p>Coming soon: Visualize application stages and set reminders!</p>
      </DialogContent>
    </Dialog>
  );
}
