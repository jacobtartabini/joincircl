import HomeContent from "@/components/home-page/HomeContent";
import { useIsMobile } from "@/hooks/use-mobile";

const Home = () => {
  const isMobile = useIsMobile();

  return (
    <div className="h-[calc(100vh-2rem)] animate-fade-in">
      <HomeContent />
    </div>
  );
};

export default Home;
