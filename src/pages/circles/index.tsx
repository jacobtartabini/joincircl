
import { useIsMobile } from "@/hooks/use-mobile";
import MobileOptimizedCircles from "./MobileOptimizedCircles";
import RedesignedCircles from "./RedesignedCircles";

const Circles = () => {
  const isMobile = useIsMobile();
  
  // Always render MobileOptimizedCircles on mobile devices
  // Add fallback for when isMobile hook might not work correctly
  if (isMobile || window.innerWidth <= 768) {
    return <MobileOptimizedCircles />;
  }
  
  return <RedesignedCircles />;
};

export default Circles;
