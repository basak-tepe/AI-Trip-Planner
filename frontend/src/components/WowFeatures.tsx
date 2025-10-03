import React, { useState } from "react";
import { Clock, Leaf, Package } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { motion } from "motion/react";

const packingList = {
  "Beach Trip": ["Sunscreen", "Swimsuit", "Sunglasses", "Beach towel", "Flip-flops", "Hat"],
  "Mountain Hike": ["Hiking boots", "Backpack", "Water bottle", "First aid kit", "Jacket", "Trail snacks"],
  "City Tour": ["Comfortable shoes", "Day bag", "Camera", "Power bank", "City map", "Umbrella"],
};


export function WowFeatures() {
  const [selectedPackingCategory, setSelectedPackingCategory] = useState<keyof typeof packingList>("Beach Trip");

  return (
    <section className="py-20 bg-gradient-to-b from-white to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl mb-4 text-foreground">
            The Magic That Makes Us
            <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Different
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Innovative features that turn travel planning into an adventure
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Layover Planner */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg  bg-primary  flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle>Layover Optimizer</CardTitle>
                  <CardDescription>Make the most of your connection time</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Layover in Rome</span>
                    <Badge>6 hours</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Enough time to see the city center!
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span>30 min: Airport to city (train)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span>2 hrs: Colosseum & Roman Forum</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span>1 hr: Lunch near Trevi Fountain</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span>1 hr: Quick Pantheon visit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span>1.5 hrs: Return to airport</span>
                    </div>
                  </div>
                </div>
                <Button className="w-full  bg-primary ">
                  Create My Layover Plan
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Smart Packing */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle>Smart Packing Assistant</CardTitle>
                  <CardDescription>Never forget the essentials</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  {Object.keys(packingList).map((category) => (
                    <Button
                      key={category}
                      variant={selectedPackingCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPackingCategory(category as keyof typeof packingList)}
                      className={selectedPackingCategory === category ? "bg-gradient-to-r from-accent to-primary" : ""}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
                <div className="space-y-2">
                  {packingList[selectedPackingCategory].map((item, index) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                    >
                      <input type="checkbox" className="w-4 h-4 accent-primary" />
                      <span className="text-sm">{item}</span>
                    </motion.div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  ✨ List auto-generated based on destination weather, activities & airline rules
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sustainability Score */}
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>Your Trip's Sustainability Score</CardTitle>
                <CardDescription>Make eco-friendly choices for a better planet</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="text-center mb-3">
                  <div className="text-5xl mb-2">🌍</div>
                  <div className="text-3xl mb-1 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    B+
                  </div>
                  <p className="text-sm text-muted-foreground">Overall Score</p>
                </div>
              </div>
              <div className="md:col-span-2 space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Transport (Train vs Plane)</span>
                    <span className="text-green-600">Excellent</span>
                  </div>
                  <Progress value={90} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Accommodation (Eco Hotels)</span>
                    <span className="text-yellow-600">Good</span>
                  </div>
                  <Progress value={70} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Activities (Local & Sustainable)</span>
                    <span className="text-green-600">Great</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    💡 <strong>Tip:</strong> Switch to eco-certified hotels to improve your score to A-
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}