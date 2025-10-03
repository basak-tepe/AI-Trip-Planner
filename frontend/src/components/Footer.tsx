import { Plane, Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-white to-primary/5 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl text-primary">travai</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              AI-powered travel planning that turns your dream trips into perfectly crafted itineraries. 
              Explore the world smarter, not harder.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="hover:bg-primary hover:text-white transition-colors">
                <Facebook className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="hover:bg-primary hover:text-white transition-colors">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="hover:bg-primary hover:text-white transition-colors">
                <Instagram className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="hover:bg-primary hover:text-white transition-colors">
                <Linkedin className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#features" className="hover:text-primary transition-colors">Features</a>
              </li>
              <li>
                <a href="#itinerary" className="hover:text-primary transition-colors">Itinerary Builder</a>
              </li>
              <li>
                <a href="#community" className="hover:text-primary transition-colors">Community</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">Pricing</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">Mobile App</a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#about" className="hover:text-primary transition-colors">About Us</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">Careers</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">Press</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">Blog</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">Partners</a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="mb-4">Stay Updated</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Get travel tips, destination guides, and exclusive deals.
            </p>
            <div className="flex gap-2">
              <Input placeholder="Your email" type="email" className="h-9" />
              <Button size="sm" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 travai. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}