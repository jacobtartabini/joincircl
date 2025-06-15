
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function CompanyResearchTool({ onClose }: { onClose: () => void }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Company Research & Questions</DialogTitle>
        </DialogHeader>
        <p>Coming soon: Company info and AI-generated interview questions!</p>
      </DialogContent>
    </Dialog>
  );
}
