import HomeContent from "@/components/home-page/HomeContent";
import { useIsMobile } from "@/hooks/use-mobile";

const Home = () => {
  const isMobile = useIsMobile();

  return (
    <div className="w-full h-full min-h-screen">
      <HomeContent />
    </div>
  );
};

export default Home;
