
import { useIsMobile } from "@/hooks/use-mobile";
import MobileOptimizedCircles from "./MobileOptimizedCircles";
import RedesignedCircles from "./RedesignedCircles";

const Circles = () => {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return <MobileOptimizedCircles />;
  }
  
  return <RedesignedCircles />;
};

export default Circles;
