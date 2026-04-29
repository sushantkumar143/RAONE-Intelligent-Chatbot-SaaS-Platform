import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import AIPipeline from '../components/landing/AIPipeline';
import HowItWorks from '../components/landing/HowItWorks';
import DataPrivacy from '../components/landing/DataPrivacy';
import Architecture from '../components/landing/Architecture';
import DemoSection from '../components/landing/DemoSection';
import PricingSection from '../components/landing/PricingSection';
import FooterSection from '../components/landing/FooterSection';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-950 overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <AIPipeline />
      <HowItWorks />
      <DataPrivacy />
      <Architecture />
      <DemoSection />
      <PricingSection />
      <FooterSection />
    </div>
  );
}
