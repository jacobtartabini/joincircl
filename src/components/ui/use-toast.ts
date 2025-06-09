
import { useToast, toast as radixToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";

// Export both toast systems for backward compatibility
export { useToast, radixToast as toast, sonnerToast };
