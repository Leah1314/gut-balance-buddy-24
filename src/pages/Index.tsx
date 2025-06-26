import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { BarChart3 } from "lucide-react";

const Index = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header Section */}
      <header className="bg-white/80 backdrop-blur-sm py-4 shadow-md">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            Gut Health Tracker
          </h1>
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, {user.email || "User"}!
              </span>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </header>
      
      {/* Navigation */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button
            onClick={() => navigate("/analytics")}
            className="bg-green-600 hover:bg-green-700 text-white font-medium h-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            Analytics
          </Button>
          <Button
            variant="outline"
            className="border-2 border-green-600 text-green-600 hover:bg-green-50 font-medium h-12 rounded-xl"
          >
            <Calendar className="w-5 h-5 mr-2" />
            History
          </Button>
        </div>
        
        {/* Main Content */}
        <section className="space-y-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Today's Overview
            </h2>
            <p className="text-gray-700">
              Track your daily food intake, stool health, and overall gut
              wellness.
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium h-12 rounded-xl">
                Add Food Log
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white font-medium h-12 rounded-xl">
                Record Stool Sample
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
