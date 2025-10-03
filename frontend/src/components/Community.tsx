import { Heart, MessageCircle, Share2, Star, MapPin, Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useLanguage } from "../contexts/LanguageContext";

const getCommunityPosts = (language: string) => {
  if (language === 'tr') {
    return [
      {
        id: 1,
        author: "Sarah Chen",
        avatar: "SC",
        location: "Bali, Endonezya",
        title: "7 Günlük Bali Gizli Hazineler Rehberi",
        description: "Turist kalabalığından uzak muhteşem yerler keşfettim. Dijital göçebeler için mükemmel!",
        image: "https://images.unsplash.com/photo-1713992852903-d8d78192e16e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGJlYWNoJTIwYWVyaWFsJTIwdmlld3xlbnwxfHx8fDE3NTkyNDI2MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
        likes: 342,
        comments: 45,
        rating: 4.9,
        budget: "$$",
        duration: "7 gün",
        tags: ["Plaj", "Kültür", "Yemek"],
      },
      {
        id: 2,
        author: "Marcus Rodriguez",
        avatar: "MR",
        location: "Patagonya, Şili",
        title: "Epik Yürüyüş Macerası",
        description: "Torres del Paine boyunca 3 haftalık trek. En iyi parkurlar, kamp alanları ve ekipman ipuçları.",
        image: "https://images.unsplash.com/photo-1595248588362-18a894e156d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZHZlbnR1cmUlMjBoaWtpbmclMjBtb3VudGFpbnxlbnwxfHx8fDE3NTkxODQxODZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
        likes: 567,
        comments: 89,
        rating: 5.0,
        budget: "$$$",
        duration: "21 gün",
        tags: ["Macera", "Doğa", "Yürüyüş"],
      },
      {
        id: 3,
        author: "Emma Thompson",
        avatar: "ET",
        location: "Tokyo, Japonya",
        title: "Bütçeli Tokyo",
        description: "Bankayı kırmadan Tokyo'nun en iyilerini deneyimleyin. Konaklama dahil günde 50$'ın altında!",
        image: "https://images.unsplash.com/photo-1706823871410-ed8b01faef7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBkZXN0aW5hdGlvbiUyMHdvcmxkJTIwbWFwfGVufDF8fHx8MTc1OTI0MjYxNnww&ixlib=rb-4.1.0&q=80&w=1080",
        likes: 891,
        comments: 123,
        rating: 4.8,
        budget: "$",
        duration: "5 gün",
        tags: ["Bütçe", "Şehir", "Yemek"],
      },
    ];
  }
  
  return [
    {
      id: 1,
      author: "Sarah Chen",
      avatar: "SC",
      location: "Bali, Indonesia",
      title: "7-Day Bali Hidden Gems Guide",
      description: "Discovered amazing spots away from tourist crowds. Perfect for digital nomads!",
      image: "https://images.unsplash.com/photo-1713992852903-d8d78192e16e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGJlYWNoJTIwYWVyaWFsJTIwdmlld3xlbnwxfHx8fDE3NTkyNDI2MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      likes: 342,
      comments: 45,
      rating: 4.9,
      budget: "$$",
      duration: "7 days",
      tags: ["Beach", "Culture", "Food"],
    },
    {
      id: 2,
      author: "Marcus Rodriguez",
      avatar: "MR",
      location: "Patagonia, Chile",
      title: "Epic Hiking Adventure",
      description: "3-week trek through Torres del Paine. Best trails, camping spots, and gear tips.",
      image: "https://images.unsplash.com/photo-1595248588362-18a894e156d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZHZlbnR1cmUlMjBoaWtpbmclMjBtb3VudGFpbnxlbnwxfHx8fDE3NTkxODQxODZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      likes: 567,
      comments: 89,
      rating: 5.0,
      budget: "$$$",
      duration: "21 days",
      tags: ["Adventure", "Nature", "Hiking"],
    },
    {
      id: 3,
      author: "Emma Thompson",
      avatar: "ET",
      location: "Tokyo, Japan",
      title: "Tokyo on a Budget",
      description: "Experience Tokyo's best without breaking the bank. Under $50/day including accommodation!",
      image: "https://images.unsplash.com/photo-1706823871410-ed8b01faef7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBkZXN0aW5hdGlvbiUyMHdvcmxkJTIwbWFwfGVufDF8fHx8MTc1OTI0MjYxNnww&ixlib=rb-4.1.0&q=80&w=1080",
      likes: 891,
      comments: 123,
      rating: 4.8,
      budget: "$",
      duration: "5 days",
      tags: ["Budget", "City", "Food"],
    },
  ];
};

const trendingDestinations = [
  { name: "Santorini", country: "Greece", trips: 1240, trend: "+15%" },
  { name: "Iceland", country: "Iceland", trips: 980, trend: "+23%" },
  { name: "Maldives", country: "Maldives", trips: 856, trend: "+8%" },
  { name: "New Zealand", country: "New Zealand", trips: 734, trend: "+12%" },
];

export function Community() {
  const { t, language } = useLanguage();
  const communityPosts = getCommunityPosts(language);
  
  return (
    <section id="community" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl mb-4 text-foreground">
            {t('community.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('community.description')}
          </p>
        </div>

        <Tabs defaultValue="guides" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="guides">{t('community.travelTips')}</TabsTrigger>
            <TabsTrigger value="trending">{t('community.popularDestinations')}</TabsTrigger>
          </TabsList>

          <TabsContent value="guides">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communityPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative h-48 overflow-hidden">
                    <ImageWithFallback
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm">{post.rating}</span>
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                          {post.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm">{post.author}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {post.location}
                        </div>
                      </div>
                    </div>

                    <h3 className="mb-2">{post.title}</h3>
                    <p className="text-sm text-muted-foreground">{post.description}</p>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {post.duration}
                      </div>
                      <div>{post.budget}</div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1 hover:text-primary transition-colors">
                          <Heart className="w-4 h-4" />
                          <span className="text-sm">{post.likes}</span>
                        </button>
                        <button className="flex items-center gap-1 hover:text-primary transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-sm">{post.comments}</span>
                        </button>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trending">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <h3>{t('community.trendingTitle')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('community.trendingDescription')}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trendingDestinations.map((destination, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 rounded-lg border border-border hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
                            {index + 1}
                          </div>
                          <div>
                            <h4>{destination.name}</h4>
                            <p className="text-sm text-muted-foreground">{destination.country}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-green-600 mb-1">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-sm">{destination.trend}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{destination.trips} {t('community.trips')}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button className="w-full mt-6 bg-gradient-to-r from-primary to-secondary">
                    {t('community.exploreAll')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}