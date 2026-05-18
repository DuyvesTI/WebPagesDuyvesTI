import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Process from "@/components/Process";
import Portfolio from "@/components/Portfolio";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <Services />
      <Process />
      <Portfolio />
      <Pricing />
      <FAQ />
    </div>
  );
}
