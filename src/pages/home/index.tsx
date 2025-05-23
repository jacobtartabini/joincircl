
import { ThreePanelLayout } from "@/components/layout/ThreePanelLayout";
import { Navbar } from "@/components/navigation/Navbar";
import HomeContent from "@/components/home-page/HomeContent";
import { useIsMobile } from "@/hooks/use-mobile";

const Home = () => {
  const isMobile = useIsMobile();
  
  return (
    <>
      {isMobile ? (
        <HomeContent />
      ) : (
        <div className="h-[calc(100vh-2rem)] animate-fade-in">
          <HomeContent />
        </div>
      )}
    </>
  );
};

export default Home;
