import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { ItineraryBuilder } from "./components/ItineraryBuilder";
import { WowFeatures } from "./components/WowFeatures";
import { Community } from "./components/Community";
import { AIChatbot } from "./components/AIChatbot";
import { OpenAIChat } from "./components/OpenAIChat";
import { Footer } from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <ItineraryBuilder />
        <div className="py-20 bg-gradient-to-b from-background to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl mb-4 text-foreground">
                Chat with Your
                <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Travel Agent
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Get personalized travel advice powered by AI and real-time travel data
              </p>
            </div>
            <OpenAIChat />
          </div>
        </div>
        <WowFeatures />
        <Community />
      </main>
      <Footer />
      <AIChatbot />
    </div>
  );
}