import { Hero } from "@/components/landing/Hero";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";
import { OnboardingFlow } from "@/components/landing/OnboardingFlow";
import { CallToAction } from "@/components/landing/CallToAction";
import { OutlineComponent } from "@/components/OutlineComponent/OutlineComponent";
import { SeparatorComponent } from "@/components/landing/SeparatorComponent";

export default async function Home() {
  return (
    <main className="min-h-screen flex flex-col relative">
      <OutlineComponent />
      <Hero />
      <SeparatorComponent />
      <FeatureShowcase />
      <OnboardingFlow />
      <CallToAction />
    </main>
  );
}
