import { HeroBanner } from "@/components/home/HeroBanner";
import { Categories } from "@/components/home/Categories";
import { Bestsellers } from "@/components/home/Bestsellers";
import { CTASection } from "@/components/home/CTASection";

const Index = () => {
  return (
    <>
      <HeroBanner />
      <Categories />
      <Bestsellers />
      <CTASection />
    </>
  );
};

export default Index;
