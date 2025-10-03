import React, { useState } from "react";
import { Smile } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { motion } from "motion/react";

const moodOptions = [
  { emoji: "😌", mood: "Relaxation", vibe: "Beach paradise" },
  { emoji: "🏔️", mood: "Adventure",  vibe: "Adrenaline rush" },
  { emoji: "🎨", mood: "Culture", vibe: "Art & history" },
  { emoji: "🍜", mood: "Foodie", vibe: "Street food heaven" },
];

interface MoodTravelProps {
  onMoodSelect?: (mood: string, destination: string) => void;
}

export function MoodTravel({ onMoodSelect }: MoodTravelProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const handleMoodClick = (mood: string, destination: string) => {
    setSelectedMood(mood);
    onMoodSelect?.(mood, destination);
  };

  return (
    <Card className="overflow-hidden bg-white/95 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg  bg-primary flex items-center justify-center">
            <Smile className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardDescription className="text-white/80">Where should you go based on how you feel?</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-white/80 mb-4">
          Select your current mood and let AI suggest the perfect destination:
        </p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {moodOptions.map((option) => (
            <motion.button
              key={option.mood}
              onClick={() => handleMoodClick(option.mood, option.destination)}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedMood === option.mood
                  ? "border-primary bg-primary/20"
                  : "border-white/30 hover:border-primary/50 bg-white/10"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-3xl mb-2">{option.emoji}</div>
              <div className="text-sm text-white font-medium">{option.mood}</div>
            </motion.button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
