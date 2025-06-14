// components/LandingPage.jsx - Clean, modern, full-width version
"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Logo from "@/components/Logo";
import { 
  MessageSquare, 
  Heart, 
  Users, 
  Search, 
  ArrowRight
} from "lucide-react";

export default function LandingPage() {
  const [currentFeature, setCurrentFeature] = useState(0);
  
  const features = useMemo(() => [
    {
      icon: MessageSquare,
      title: "Share Your Thoughts",
      description: "Express yourself with posts, comments, and real-time conversations"
    },
    {
      icon: Users,
      title: "Connect with Others",
      description: "Follow friends, discover new voices, and build your community"
    },
    {
      icon: Heart,
      title: "Engage & Interact",
      description: "Like, comment, and share content that matters to you"
    },
    {
      icon: Search,
      title: "Discover Content",
      description: "Find trending topics, interesting people, and relevant discussions"
    }
  ], []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Logo height={32} width={32} className="text-foreground" />
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="font-medium" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button className="font-medium" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-24 max-w-[1200px] mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8 max-w-2xl">
            <div className="space-y-6">
              <h1 className="text-6xl lg:text-7xl font-bold leading-tight">
                Share Your Voice
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Connect with friends, share your thoughts, and discover what's happening in your world. 
                Join the conversation that matters to you.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="px-8 py-3 text-lg font-medium" asChild>
                <Link href="/signup">
                  Join Y Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-3 text-lg font-medium" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-8 pt-12">
              <div className="text-center">
                <div className="text-3xl font-bold">10K+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">50K+</div>
                <div className="text-sm text-muted-foreground">Posts Shared</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">100K+</div>
                <div className="text-sm text-muted-foreground">Conversations</div>
              </div>
            </div>
          </div>

          {/* Right Column - Feature Showcase */}
          <div className="relative lg:ml-16">
            <Card className="bg-card border shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-muted rounded-full">
                    {(() => {
                      const IconComponent = features[currentFeature]?.icon;
                      return IconComponent ? <IconComponent className="h-6 w-6" /> : null;
                    })()}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {features[currentFeature]?.title}
                    </h3>
                  </div>
                </div>
                
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {features[currentFeature]?.description}
                </p>

                {/* Feature indicators */}
                <div className="flex gap-2 mt-6">
                  {features.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentFeature ? 'bg-foreground' : 'bg-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-20 bg-muted/20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Everything You Need to Stay Connected
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Y provides all the tools you need to share, discover, and connect in a safe, 
            user-friendly environment.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow bg-card">
              <CardContent className="p-8">
                <div className="p-4 bg-muted rounded-full w-fit mx-auto mb-6">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t bg-background">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Logo height={24} width={24} className="text-foreground" />
          </div>
          
          <div className="text-sm text-muted-foreground">
            © 2025 Y. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}