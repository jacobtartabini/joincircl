
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function ApplicationInfoIntakeTool({ onClose }: { onClose: () => void }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Application Info Intake</DialogTitle>
        </DialogHeader>
        <p>Coming soon: Intake all your application info!</p>
      </DialogContent>
    </Dialog>
  );
}
