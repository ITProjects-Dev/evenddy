import "./Home.css";
import HeroSection from "../../components/Home/HeroSection";
import ServicesSection from "../../components/Home/ServicesSection";
import ProcessSection from "../../components/Home/ProcessSection";
import PlannerSection from "../../components/Home/PlannerSection";
import GallerySection from "../../components/Home/GallerySection";
import TestimonialsSection from "../../components/Home/TestimonialsSection";
import VendorSection from "../../components/Home/VendorSection";
import AppSection from "../../components/Home/AppSection";
import StoriesSection from "../../components/Home/StoriesSection";
import FAQSection from "../../components/Home/FAQSection";
import FinalCTASection from "../../components/Home/FinalCTASection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <ProcessSection />
      <PlannerSection />
      <GallerySection />
      <TestimonialsSection />
      <VendorSection />
      <AppSection />
      <StoriesSection />
      <FAQSection />
      <FinalCTASection />
    </>
  );
}
