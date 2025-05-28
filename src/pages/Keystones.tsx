
import { useIsMobile } from "@/hooks/use-mobile";
import ModernKeystones from "./ModernKeystones";
import MobileKeystones from "./MobileKeystones";

const Keystones = () => {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return <MobileKeystones />;
  }
  
  return <ModernKeystones />;
};

export default Keystones;
