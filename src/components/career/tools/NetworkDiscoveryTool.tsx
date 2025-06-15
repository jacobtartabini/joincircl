
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function NetworkDiscoveryTool({ onClose }: { onClose: () => void }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Network Discovery</DialogTitle>
        </DialogHeader>
        <p>Coming soon: Surface contacts at target companies or industries!</p>
      </DialogContent>
    </Dialog>
  );
}
