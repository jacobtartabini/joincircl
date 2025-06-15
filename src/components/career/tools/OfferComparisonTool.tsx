
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function OfferComparisonTool({ onClose }: { onClose: () => void }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Offer Comparison & Negotiation Prep</DialogTitle>
        </DialogHeader>
        <p>Coming soon: Compare job offers and get negotiation scripts.</p>
      </DialogContent>
    </Dialog>
  );
}
