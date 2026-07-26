import { Hero } from "@/components/home/Hero";
import { WhyRen } from "@/components/home/WhyRen";
import { HealthGoals } from "@/components/home/HealthGoals";
import { BestSolutions } from "@/components/home/BestSolutions";
import { SwedishJournal } from "@/components/home/SwedishJournal";
import { TrustFooter } from "@/components/home/TrustFooter";

export default function HomePage() {
  return (
    <>
      <Hero />
      <WhyRen />
      <HealthGoals />
      <BestSolutions />
      <SwedishJournal />
      <TrustFooter />
    </>
  );
}
