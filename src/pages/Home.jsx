import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import HowToBook from "../components/HowToBook";
import OffersSection from "../components/OffersSection";
import PopularRoutes from "../components/PopularRoutes";
import WhyChooseUs from "../components/WhyChooseUs";
import Testimonials from "../components/Testimonials";
import FAQSection from "../components/FAQSection";
import AppDownloadBanner from "../components/AppDownloadBanner";
import Footer from "../components/Footer";

function Home() {
  return (
    <div className="home-page-container">
      {/* 1. Workable Header & Navigation Bar */}
      <Navbar />

      {/* 2. Hero Section with Search Card */}
      <Hero />

      {/* 3. How to Book Your Bus Ticket */}
      <HowToBook />

      {/* 4. Special Offers & Coupons */}
      <OffersSection />

      {/* 5. Popular Bus Routes with 1-Click Search */}
      <PopularRoutes />

      {/* 6. Why Choose Bus Vista Highlights */}
      <WhyChooseUs />

      {/* 7. Passenger Testimonials & Reviews */}
      <Testimonials />

      {/* 8. Frequently Asked Questions */}
      <FAQSection />

      {/* 9. Mobile App Promotion */}
      <AppDownloadBanner />

      {/* 10. Comprehensive Footer */}
      <Footer />
    </div>
  );
}

export default Home;
