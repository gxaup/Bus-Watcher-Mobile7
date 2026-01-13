import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ClipboardList, Folder, Play, LogOut, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, differenceInDays } from "date-fns";

interface DriverInfo {
  driverName: string;
  lastReportDate: string;
}

export default function Landing() {
  const [, setLocation] = useLocation();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [driversOpen, setDriversOpen] = useState(false);
  const { user, logout } = useAuth();

  const { data: drivers = [], isLoading: driversLoading } = useQuery<DriverInfo[]>({
    queryKey: ["/api/drivers"],
    enabled: driversOpen,
  });

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

  const handleLogout = async () => {
    await logout();
  };

  const getSuitabilityLabel = (lastReportDate: string) => {
    const date = new Date(lastReportDate);
    const daysDiff = differenceInDays(new Date(), date);
    if (daysDiff > 3) {
      return { label: "Suitable", variant: "default" as const };
    }
    return { label: "Unsuitable", variant: "destructive" as const };
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col p-4 safe-area-bottom safe-area-top">
      <div className="absolute top-4 right-4 flex items-center gap-3">
        {user && (
          <>
            <span className="text-sm text-muted-foreground hidden sm:inline" data-testid="text-user-name">
              {user.username}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
              data-testid="button-logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-lg">
          <div className="text-center mb-10 space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display text-foreground">
              Full Loop Report
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              {user ? `Welcome, ${user.username}` : "Bus Violation Logging"}
            </p>
          </div>
        
        <div className="flex flex-col gap-3">
          {activeSessionId && (
            <Button 
              onClick={handleResume}
              className="w-full h-14 sm:h-16 text-base sm:text-lg shadow-lg bg-white/20 hover:bg-white/30 border border-white/20"
              data-testid="button-resume-session"
            >
              <Play className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
              Resume Last Report
            </Button>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleStartNew}
              className="flex-1 h-14 sm:h-16 text-base sm:text-lg shadow-lg bg-white text-black hover:bg-white/90"
              data-testid="button-start-report"
            >
              <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
              Start Report
            </Button>
            
            <Link href="/reports" className="flex-1">
              <Button 
                variant="outline"
                className="w-full h-14 sm:h-16 text-base sm:text-lg border-white/20 hover:bg-white/10"
                data-testid="button-reports"
              >
                <Folder className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                Reports
              </Button>
            </Link>
          </div>

          <Dialog open={driversOpen} onOpenChange={setDriversOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline"
                className="w-full h-14 sm:h-16 text-base sm:text-lg border-white/20 hover:bg-white/10"
                data-testid="button-drivers"
              >
                <Users className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                Driver List
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Reported Drivers</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 mt-4">
                {driversLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : drivers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No drivers reported yet</p>
                ) : (
                  drivers.map((driver, index) => {
                    const { label, variant } = getSuitabilityLabel(driver.lastReportDate);
                    const date = new Date(driver.lastReportDate);
                    return (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 rounded-md bg-muted/50"
                        data-testid={`driver-item-${index}`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate" data-testid={`text-driver-name-${index}`}>
                            {driver.driverName}
                          </p>
                          <p className="text-sm text-muted-foreground" data-testid={`text-driver-date-${index}`}>
                            {formatDistanceToNow(date, { addSuffix: true })}
                          </p>
                        </div>
                        <Badge variant={variant} data-testid={`badge-suitability-${index}`}>
                          {label}
                        </Badge>
                      </div>
                    );
                  })
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
        </div>
      </div>
    </div>
  );
}
