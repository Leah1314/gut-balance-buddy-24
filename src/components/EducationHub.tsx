
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Play, 
  Clock, 
  Star,
  Heart,
  Leaf,
  Zap,
  Shield
} from "lucide-react";

const EducationHub = () => {
  const articles = [
    {
      title: "Understanding Your Gut Microbiome",
      category: "Science",
      readTime: "5 min read",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=200&fit=crop",
      description: "Learn how billions of bacteria in your gut affect your health and mood.",
      tags: ["Microbiome", "Health", "Science"]
    },
    {
      title: "Foods That Heal Your Gut",
      category: "Nutrition",
      readTime: "7 min read", 
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=400&h=200&fit=crop",
      description: "Discover powerful foods that promote digestive health and reduce inflammation.",
      tags: ["Nutrition", "Food", "Healing"]
    },
    {
      title: "The Gut-Brain Connection",
      category: "Research",
      readTime: "6 min read",
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1465379944081-7f47de8d74ac?w=400&h=200&fit=crop",
      description: "How your digestive system communicates with your brain and affects your mood.",
      tags: ["Brain", "Mental Health", "Connection"]
    }
  ];

  const videos = [
    {
      title: "5-Minute Digestive Breathing Exercise",
      duration: "5:23",
      category: "Exercise",
      instructor: "Dr. Sarah Chen"
    },
    {
      title: "Meal Prep for Gut Health",
      duration: "12:45", 
      category: "Cooking",
      instructor: "Chef Marcus"
    },
    {
      title: "Understanding Food Sensitivities",
      duration: "8:17",
      category: "Education",
      instructor: "Dr. Lisa Park"
    }
  ];

  const tips = [
    {
      icon: Heart,
      title: "Stay Hydrated",
      tip: "Drink 8-10 glasses of water daily to support healthy digestion",
      category: "Daily Habit"
    },
    {
      icon: Leaf,
      title: "Eat More Fiber",
      tip: "Include 25-35g of fiber daily from fruits, vegetables, and whole grains",
      category: "Nutrition"
    },
    {
      icon: Zap,
      title: "Move Regularly",
      tip: "Light exercise after meals can help with digestion and reduce bloating",
      category: "Exercise"
    },
    {
      icon: Shield,
      title: "Manage Stress",
      tip: "Practice deep breathing or meditation to reduce gut inflammation",
      category: "Wellness"
    }
  ];

  const getCategoryColor = (category: string) => {
    const colors = {
      "Science": "bg-blue-100 text-blue-800",
      "Nutrition": "bg-green-100 text-green-800", 
      "Research": "bg-purple-100 text-purple-800",
      "Exercise": "bg-orange-100 text-orange-800",
      "Cooking": "bg-yellow-100 text-yellow-800",
      "Education": "bg-indigo-100 text-indigo-800"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Featured Articles */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>Featured Articles</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {articles.map((article, index) => (
            <div key={index} className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <img 
                src={article.image} 
                alt={article.title}
                className="w-full md:w-32 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">{article.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{article.description}</p>
                  </div>
                  <Badge className={getCategoryColor(article.category)}>
                    {article.category}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{article.readTime}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span>{article.rating}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {article.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <Button variant="outline" className="w-full">
            View All Articles
          </Button>
        </CardContent>
      </Card>

      {/* Video Library */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Play className="w-5 h-5 text-green-600" />
            <span>Video Library</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {videos.map((video, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="w-16 h-12 bg-gradient-to-br from-green-400 to-teal-500 rounded-lg flex items-center justify-center">
                <Play className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">{video.title}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>by {video.instructor}</span>
                  <Badge variant="outline" className="text-xs">
                    {video.duration}
                  </Badge>
                  <Badge className={getCategoryColor(video.category)}>
                    {video.category}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
          
          <Button variant="outline" className="w-full">
            Browse Video Library
          </Button>
        </CardContent>
      </Card>

      {/* Daily Tips */}
      <Card className="bg-gradient-to-r from-teal-50 to-green-50 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-teal-600" />
            <span>Daily Gut Health Tips</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tips.map((tip, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 bg-white rounded-lg">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                <tip.icon className="w-5 h-5 text-teal-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">{tip.title}</h3>
                  <Badge variant="outline" className="text-xs">
                    {tip.category}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{tip.tip}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-medium text-gray-900 mb-2">Take Assessment</h3>
            <p className="text-sm text-gray-600 mb-4">
              Personalized gut health evaluation
            </p>
            <Button className="w-full">Start Assessment</Button>
          </CardContent>
        </Card>
        
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="font-medium text-gray-900 mb-2">Ask Expert</h3>
            <p className="text-sm text-gray-600 mb-4">
              Get answers from gut health specialists
            </p>
            <Button variant="outline" className="w-full">Ask Question</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EducationHub;
