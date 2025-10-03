import React, { useState } from "react";
import { Plane, Menu, User, Trophy } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-primary">travai</span>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <nav className="hidden md:flex justify-between gap-6">
              <a href="#community" className="text-foreground hover:text-primary transition-colors">
                Community
              </a>
            </nav>
             | TRY
            {/* User + CTA */}
            <Button className="hidden md:flex  bg-primary hover:opacity-90">
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

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 flex flex-col gap-3">
            <a href="#itinerary" className="text-foreground hover:text-primary transition-colors py-2">
              Plan Trip
            </a>
            <a href="#community" className="text-foreground hover:text-primary transition-colors py-2">
              Community
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
