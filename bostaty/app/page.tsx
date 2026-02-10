import { Hero } from "@/components/landing/Hero";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";
import { OnboardingFlow } from "@/components/landing/OnboardingFlow";
import { CallToAction } from "@/components/landing/CallToAction";

export default async function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Hero />
      <FeatureShowcase />
      <OnboardingFlow />
      <CallToAction />
    </main>
  );
}
