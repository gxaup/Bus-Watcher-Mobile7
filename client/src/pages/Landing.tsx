import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ClipboardList, Folder, Play } from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

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
    <div className="min-h-screen w-full bg-gradient-to-b from-background to-secondary/30 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-12 space-y-2">
          <h1 className="text-4xl md:text-5xl font-extrabold font-display bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            TopView Report
          </h1>
          <p className="text-lg text-muted-foreground">
            Official Bus Violation Logging System
          </p>
        </div>
        
        <div className="space-y-6">
          {activeSessionId && (
            <Button 
              onClick={handleResume}
              className="w-full h-16 text-lg shadow-lg bg-green-600 hover:bg-green-700"
              data-testid="button-resume-session"
            >
              <Play className="w-6 h-6 mr-3" />
              Resume Draft
            </Button>
          )}
          
          <Button 
            onClick={handleStartNew}
            className="w-full h-16 text-lg shadow-lg"
            data-testid="button-start-report"
          >
            <ClipboardList className="w-6 h-6 mr-3" />
            Start Report
          </Button>
          
          <Link href="/reports">
            <Button 
              variant="outline"
              className="w-full h-16 text-lg"
              data-testid="button-reports"
            >
              <Folder className="w-6 h-6 mr-3" />
              Reports
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
