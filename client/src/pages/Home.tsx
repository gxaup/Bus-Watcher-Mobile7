import { CreateSessionForm } from "@/components/CreateSessionForm";
import { useLocation } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-background to-secondary/30 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Decorative Header */}
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-4xl md:text-5xl font-extrabold font-display bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            TopView Report
          </h1>
          <p className="text-lg text-muted-foreground">
            Official Bus Violation Logging System
          </p>
        </div>
        
        <CreateSessionForm />
      </div>
    </div>
  );
}
