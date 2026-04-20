import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Process from "@/components/Process";
import Pricing from "@/components/Pricing";

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <Services />
      <Process />
      <Pricing />
    </div>
  );
}
