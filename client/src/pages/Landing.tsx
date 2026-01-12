import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ClipboardList, Folder } from "lucide-react";

export default function Landing() {
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
        
        <div className="space-y-4">
          <Link href="/start">
            <Button 
              className="w-full h-16 text-lg shadow-lg"
              data-testid="button-start-report"
            >
              <ClipboardList className="w-6 h-6 mr-3" />
              Start Report
            </Button>
          </Link>
          
          <Button 
            variant="outline"
            className="w-full h-16 text-lg"
            disabled
            data-testid="button-placeholder"
          >
            <Folder className="w-6 h-6 mr-3" />
            Coming Soon
          </Button>
        </div>
      </div>
    </div>
  );
}
