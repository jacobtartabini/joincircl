
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function SkillGapPlanTool({ onClose }: { onClose: () => void }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Skill Gap & Learning Plan</DialogTitle>
        </DialogHeader>
        <p>Coming soon: Get a personalized learning plan based on your goals.</p>
      </DialogContent>
    </Dialog>
  );
}
