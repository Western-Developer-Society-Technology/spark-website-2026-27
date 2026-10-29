import Scene from "@/components/sections/Scene/Scene";
import SceneArtwork from "@/components/sections/SceneArtwork/SceneArtwork";
import SceneContent, { LastYearHeading } from "@/components/sections/Scene/SceneContent";
import Hero, { Wordmark } from "@/components/sections/Hero/Hero";
import HeroAscii from "@/components/sections/Hero/HeroAscii";
import About from "@/components/sections/About/About";
import Faq from "@/components/sections/Faq/Faq";
import AsciiArt from "@/components/ui/AsciiArt";

const SHOOTING_TRAILS = {
  "116:185": "116:186",
  "116:202": "116:203",
  "116:209": "116:210",
  "116:232": "116:233",
};
const SPARKLERS = { "116:160": "116:161", "116:164": "116:165" };
const CAMPFIRE = {
  "121:54": "121:55",
  "121:57": "121:58",
  "121:61": "121:62",
  "121:74": "121:75",
};

function asciiSlots(nodes: Record<string, string>) {
  return Object.fromEntries(Object.entries(nodes).map(([frame, text]) => [
    frame,
    <AsciiArt nodeId={text} key={text} />,
  ]));
}

export default function Home() {
  return (
    <Scene>
      <SceneArtwork
        wordmark={<Wordmark />}
        heroAscii={<HeroAscii />}
        heroContent={<Hero />}
        aboutContent={<About />}
        lastYearHeading={<LastYearHeading />}
        sectionContent={<SceneContent />}
        faqPanel={<Faq />}
        shootingTrails={asciiSlots(SHOOTING_TRAILS)}
        sparklers={asciiSlots(SPARKLERS)}
        campfire={asciiSlots(CAMPFIRE)}
      />
    </Scene>
  );
}
