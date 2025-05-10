
import HomeContent from "@/components/home-page/HomeContent";
import { Helmet } from "react-helmet";

const Home = () => {
  return (
    <>
      <Helmet>
        <title>Home | Circl</title>
      </Helmet>
      <HomeContent />
    </>
  );
};

export default Home;
