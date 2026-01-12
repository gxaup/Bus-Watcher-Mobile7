import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ClipboardList, Folder, Play, CheckCircle2, Shield, Zap, BarChart3 } from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const savedId = localStorage.getItem("activeSessionId");
    if (savedId) {
      setActiveSessionId(savedId);
    }
  }, []);

  const handleResume = () => {
    if (activeSessionId) {
      setLocation(`/session/${activeSessionId}`);
    }
  };

  const handleStartNew = () => {
    localStorage.removeItem("activeSessionId");
    setLocation("/start");
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col safe-area-bottom overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 md:pt-32 md:pb-24">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Shield className="w-3.5 h-3.5 text-primary" />
            Trusted by transit inspectors nationwide
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold font-display text-foreground tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
            Field Logistics <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/60">
              Redefined.
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            The next generation of real-time bus violation logging. Built for speed, accuracy, and field-ready performance.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
            {activeSessionId ? (
              <Button 
                onClick={handleResume}
                size="lg"
                className="w-full sm:w-auto h-14 px-8 text-lg font-semibold shadow-2xl shadow-primary/10 hover-lift"
              >
                <Play className="w-5 h-5 mr-2" />
                Resume Report
              </Button>
            ) : (
              <Button 
                onClick={handleStartNew}
                size="lg"
                className="w-full sm:w-auto h-14 px-8 text-lg font-semibold shadow-2xl shadow-primary/10 hover-lift"
              >
                <ClipboardList className="w-5 h-5 mr-2" />
                Start New Report
              </Button>
            )}
            
            <Link href="/reports" className="w-full sm:w-auto">
              <Button 
                variant="outline"
                size="lg"
                className="w-full h-14 px-8 text-lg font-medium border-white/10 hover:bg-white/5 hover-lift"
              >
                <Folder className="w-5 h-5 mr-2" />
                View Archive
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3 p-6 rounded-2xl bg-white/5 border border-white/10 touch-card">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Real-time Logging</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Capture infractions with single-tap precision. Instant timestamps ensure 100% data integrity in the field.
            </p>
          </div>

          <div className="space-y-3 p-6 rounded-2xl bg-white/5 border border-white/10 touch-card">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Smart Analytics</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Generate comprehensive PDF reports instantly. Group violations by type and frequency for deeper insights.
            </p>
          </div>

          <div className="space-y-3 p-6 rounded-2xl bg-white/5 border border-white/10 touch-card">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Field Ready</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Optimized for high-glare environments and one-handed mobile use. Always ready when you are.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 px-4 text-center">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex items-center justify-center gap-6 text-muted-foreground">
            <span className="text-xs font-semibold tracking-widest uppercase opacity-40">Full Loop v2.0</span>
          </div>
          <p className="text-xs text-muted-foreground/40">
            &copy; {new Date().getFullYear()} Full Loop Transit Systems. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
