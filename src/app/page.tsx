import Hero from "@/components/Hero";
import Services from "@/components/Services";

export default function Home() {
  return (
    <div className="flex flex-col gap-10">
      <Hero />
      <Services />
    </div>
  );
}
