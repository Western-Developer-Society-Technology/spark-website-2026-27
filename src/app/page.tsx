import Scene from "@/components/sections/Scene/Scene";
import Hero from "@/components/sections/Hero/Hero";
import About from "@/components/sections/About/About";
import LastYear from "@/components/sections/LastYear/LastYear";
import Faq from "@/components/sections/Faq/Faq";
import Sponsors from "@/components/sections/Sponsors/Sponsors";
import Footer from "@/components/sections/Footer/Footer";

export default function Home() {
  return (
    <Scene>
      <Hero />
      <About />
      <LastYear />
      <Faq />
      <Sponsors />
      <Footer />
    </Scene>
  );
}
