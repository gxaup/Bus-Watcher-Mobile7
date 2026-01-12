import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ClipboardList, Folder, Play } from "lucide-react";

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
    <div className="min-h-screen w-full bg-gradient-to-b from-background to-secondary/30 flex items-center justify-center p-4 safe-area-bottom safe-area-top">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10 space-y-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            TopView Report
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Bus Violation Logging
          </p>
        </div>
        
        <div className="flex flex-col gap-3">
          {activeSessionId && (
            <Button 
              onClick={handleResume}
              className="w-full h-14 sm:h-16 text-base sm:text-lg shadow-lg bg-green-600 hover:bg-green-700"
              data-testid="button-resume-session"
            >
              <Play className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
              Resume Last Report
            </Button>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleStartNew}
              className="flex-1 h-14 sm:h-16 text-base sm:text-lg shadow-lg"
              data-testid="button-start-report"
            >
              <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
              Start Report
            </Button>
            
            <Link href="/reports" className="flex-1">
              <Button 
                variant="outline"
                className="w-full h-14 sm:h-16 text-base sm:text-lg"
                data-testid="button-reports"
              >
                <Folder className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                Reports
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
