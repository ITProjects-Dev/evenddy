import { Outlet } from "react-router-dom";
import AnnouncementBar from "../components/AnnouncementBar/AnnouncementBar";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

export default function MainLayout() {
  return (
    <>
      {/* <AnnouncementBar /> */}
      <Header />
      <main><Outlet /></main>
      <Footer />
    </>
  );
}