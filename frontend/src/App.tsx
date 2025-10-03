import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { ItineraryBuilder } from "./components/ItineraryBuilder";
import { WowFeatures } from "./components/WowFeatures";
import { Community } from "./components/Community";
import { AIChatbot } from "./components/AIChatbot";
import { Footer } from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <ItineraryBuilder />
        <WowFeatures />
        <Community />
      </main>
      <Footer />
      <AIChatbot />
    </div>
  );
}