import React from "react";
import HeroBanner from "../../Components/HeroBanner/HeroBanner";
import AboutSection from "../../Components/AboutSection/AboutSection";
import ProgramsSection from "../../Components/ProgramsSection/ProgramsSection";
import Features from "../../Components/Features/Features";
import IntroSection from "../../Components/IntroSection/IntroSection";
import TrainersSection from "../../Components/TrainersSection/TrainersSection";
import Testimonials from "../../Components/Testimonials/Testimonials";


const Home = () => {
  return (
    <div className="bg-white">
      <HeroBanner />
      <AboutSection />
      <ProgramsSection />
      <Features />
      <IntroSection />
      <TrainersSection />
      <Testimonials />
    </div>
  );
};

export default Home;
