import { useLayoutEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AnnouncementBar from "../components/AnnouncementBar/AnnouncementBar";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

export default function MainLayout() {
  const { pathname, hash } = useLocation();

  useLayoutEffect(() => {
    if (hash === "#home-faq") {
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash]);

  return (
    <>
      {/* <AnnouncementBar /> */}
      <Header />
      <main><Outlet /></main>
      <Footer />
    </>
  );
}