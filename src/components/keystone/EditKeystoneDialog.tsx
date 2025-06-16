
import { GlassModal } from "@/components/ui/GlassModal";
import KeystoneForm from "./KeystoneForm";
import { Keystone } from "@/types/keystone";
import { Contact } from "@/types/contact";

interface EditKeystoneDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  keystone: Keystone | null;
  onSuccess: (keystone?: Keystone) => void;
}

export function EditKeystoneDialog({
  isOpen,
  onOpenChange,
  keystone,
  onSuccess
}: EditKeystoneDialogProps) {
  if (!keystone) return null;

  const handleSuccess = (updatedKeystone?: Keystone) => {
    onSuccess(updatedKeystone);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <GlassModal
      open={isOpen}
      onOpenChange={onOpenChange}
      title=""
      maxWidth="max-w-lg"
    >
      <KeystoneForm
        keystone={keystone}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </GlassModal>
  );
}
