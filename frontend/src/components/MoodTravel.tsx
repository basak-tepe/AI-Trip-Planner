import React, { useState } from "react";
import { Smile } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { motion } from "motion/react";
import { useLanguage } from "../contexts/LanguageContext";

const moodOptions = [
  { image: "/images/zen.png", moodKey: "relaxation", vibe: "Beach paradise" },
  { image: "/images/explorer.png", moodKey: "adventure", vibe: "Adrenaline rush" },
  { image: "/images/artist.png", moodKey: "culture", vibe: "Art & history" },
  { image: "/images/foodie.png", moodKey: "foodie", vibe: "Street food heaven" },
];

interface MoodTravelProps {
  onMoodSelect?: (mood: string, destination: string) => void;
}

export function MoodTravel({ onMoodSelect }: MoodTravelProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const { t } = useLanguage();

  const handleMoodClick = (mood: string, destination: string) => {
    setSelectedMood(mood);
    onMoodSelect?.(mood, destination);
  };

  return (
    <Card className="overflow-hidden bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg  bg-primary flex items-center justify-center">
            <Smile className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardDescription className="text-white/80">{t('hero.moodTravel.description')}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-white/80 mb-4">
          {t('hero.moodTravel.selectMood')}
        </p>
        <div className="flex gap-3 mb-4 w-full">
          {moodOptions.map((option) => (
            <motion.button
              key={option.moodKey}
              onClick={() => handleMoodClick(option.moodKey, "")}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 flex-1 ${
                selectedMood === option.moodKey
                  ? "border-primary bg-primary/20"
                  : "border-white/30 hover:border-primary/50 bg-white/10"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-20 h-20 rounded-lg overflow-hidden flex items-center justify-center bg-transparent">
                <img 
                  src={option.image} 
                  alt={t(`hero.moodTravel.${option.moodKey}`)}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-xs text-white font-medium text-center">{t(`hero.moodTravel.${option.moodKey}`)}</div>
            </motion.button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
