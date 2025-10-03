import { Plane, Menu, User } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl text-primary">travai</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-foreground hover:text-primary transition-colors">
              Features
            </a>
            <a href="#itinerary" className="text-foreground hover:text-primary transition-colors">
              Plan Trip
            </a>
            <a href="#community" className="text-foreground hover:text-primary transition-colors">
              Community
            </a>
            <a href="#about" className="text-foreground hover:text-primary transition-colors">
              About
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <User className="w-5 h-5" />
            </Button>
            <Button className="hidden md:flex bg-gradient-to-r from-primary to-secondary hover:opacity-90">
              Get Started
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 flex flex-col gap-3">
            <a href="#features" className="text-foreground hover:text-primary transition-colors py-2">
              Features
            </a>
            <a href="#itinerary" className="text-foreground hover:text-primary transition-colors py-2">
              Plan Trip
            </a>
            <a href="#community" className="text-foreground hover:text-primary transition-colors py-2">
              Community
            </a>
            <a href="#about" className="text-foreground hover:text-primary transition-colors py-2">
              About
            </a>
            <Button className="mt-2 bg-gradient-to-r from-primary to-secondary">
              Get Started
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
}