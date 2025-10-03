import React from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { ItineraryBuilder } from "./components/ItineraryBuilder";
import { WowFeatures } from "./components/WowFeatures";
import { Community } from "./components/Community";
import { AIChatbot } from "./components/AIChatbot";
import { OpenAIChat } from "./components/OpenAIChat";
import { Footer } from "./components/Footer";
import { LanguageProvider } from "./contexts/LanguageContext";

export default function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen">
        <Header />
        <main>
          <Hero />
          <Community />
          <ItineraryBuilder />
          <WowFeatures />
        </main>
        <Footer />
        <AIChatbot />
      </div>
    </LanguageProvider>
  );
}