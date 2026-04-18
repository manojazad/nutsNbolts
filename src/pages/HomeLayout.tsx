import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";
import TopBar from "../components/TopBar";

const HomeLayout = () => {
  return (
    <>
      <ScrollToTop />
      <TopBar />
      <Header />
      <Outlet />
      <Footer />
    </>
  );
};

export default HomeLayout;
