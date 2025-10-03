import React from "react";
import { Plane, Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useLanguage } from "../contexts/LanguageContext";

export function Footer() {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-gradient-to-b from-white to-primary/5 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl text-primary">{t('footer.company')}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              {t('footer.description')}
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
            <h4 className="mb-4">{t('footer.product')}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#features" className="hover:text-primary transition-colors">{t('footer.features')}</a>
              </li>
              <li>
                <a href="#itinerary" className="hover:text-primary transition-colors">{t('footer.itineraryBuilder')}</a>
              </li>
              <li>
                <a href="#community" className="hover:text-primary transition-colors">{t('footer.community')}</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">{t('footer.pricing')}</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">{t('footer.mobileApp')}</a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-4">{t('footer.company')}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#about" className="hover:text-primary transition-colors">{t('footer.aboutUs')}</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">{t('footer.careers')}</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">{t('footer.press')}</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">{t('footer.blog')}</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">{t('footer.partners')}</a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="mb-4">{t('footer.newsletter')}</h4>
            <p className="text-sm text-muted-foreground mb-3">
              {t('footer.newsletterDescription')}
            </p>
            <div className="flex gap-2">
              <Input placeholder={t('footer.newsletterPlaceholder')} type="email" className="h-9" />
              <Button size="sm" className=" bg-primary hover:opacity-90">
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 {t('footer.company')}. {t('footer.rights')}
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">{t('footer.privacy')}</a>
              <a href="#" className="hover:text-primary transition-colors">{t('footer.terms')}</a>
              <a href="#" className="hover:text-primary transition-colors">{t('footer.cookies')}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}