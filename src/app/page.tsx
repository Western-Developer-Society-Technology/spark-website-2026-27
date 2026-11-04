import Scene from "@/components/sections/Scene/Scene";
import Hero from "@/components/sections/Hero/Hero";
import About from "@/components/sections/About/About";
import LastYear from "@/components/sections/LastYear/LastYear";
import Faq from "@/components/sections/Faq/Faq";
import Closing from "@/components/sections/Closing/Closing";

export default function Home() {
  return (
    <>
      <Scene>
        <Hero />
        <About />
        <LastYear />
        <Faq />
      </Scene>
      <Closing />
    </>
  );
}
