import { useEffect, useMemo, useState } from "react";
import { useRoute } from "wouter";
import { format } from "date-fns";
import {
  useSession,
  useViolations,
  useViolationTypes,
  useDeleteViolation,
  useEndSession,
  useGenerateReport
} from "@/hooks/use-bus-ops";
import { ViolationButton } from "@/components/ViolationButton";
import { AddViolationTypeDialog } from "@/components/AddViolationTypeDialog";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bus, User, MapPin, Clock, X, FileText, Loader2, ArrowLeft, Trash2 } from "lucide-react";
import { Link } from "wouter";

export default function SessionDashboard() {
  const [, params] = useRoute("/session/:id");
  const sessionId = params ? parseInt(params.id) : 0;
  
  const { data: session, isLoading: isSessionLoading } = useSession(sessionId);
  const { data: violations, isLoading: isViolationsLoading } = useViolations(sessionId);
  const { data: types, isLoading: isTypesLoading } = useViolationTypes();
  const deleteViolation = useDeleteViolation();
  const endSession = useEndSession();
  const generateReport = useGenerateReport();

  // Dialog states for ending session
  const [endDialogOpen, setEndDialogOpen] = useState(false);
  const [endTime, setEndTime] = useState("");

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Save current session ID to localStorage for recovery
  useEffect(() => {
    if (sessionId && session && !session.endTime) {
      localStorage.setItem("activeSessionId", sessionId.toString());
    }
    
    // Clear on session end
    return () => {
      // Don't clear if navigating away - only clear when session is ended
    };
  }, [sessionId, session]);

  // Calculate counts for badges
  const violationCounts = useMemo(() => {
    if (!violations) return {};
    return violations.reduce((acc, v) => {
      acc[v.type] = (acc[v.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [violations]);

  if (isSessionLoading || isTypesLoading) {
    return <LoadingState />;
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h2 className="text-2xl font-bold">Session not found</h2>
        <Link href="/" className="text-primary hover:underline">Return Home</Link>
      </div>
    );
  }

  const handleEndSession = () => {
    if (!endTime) return;
    
    // Parse time
    const [hours, minutes] = endTime.split(":").map(Number);
    const timestamp = new Date();
    timestamp.setHours(hours, minutes, 0, 0);

    endSession.mutate(
      { id: sessionId, endTime: timestamp.toISOString() },
      {
        onSuccess: () => {
          setEndDialogOpen(false);
          // Clear active session from localStorage since it's now completed
          localStorage.removeItem("activeSessionId");
          // Generate report immediately after ending
          generateReport.mutate(sessionId);
        }
      }
    );
  };

  const openEndDialog = () => {
    setEndTime(format(new Date(), "HH:mm"));
    setEndDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Sticky Header with Session Info - Optimized for Mobile */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border shadow-sm safe-area-top">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <Link href="/" className="flex items-center gap-2 h-10 px-2 -ml-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="sr-only md:not-sr-only">Exit</span>
            </Link>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">Live</span>
            </div>
          </div>
          
          {/* Mobile-optimized session info - horizontal scroll on small screens */}
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 shrink-0">
              <Bus className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground font-medium uppercase">Bus</p>
                <p className="font-bold text-foreground text-sm">{session.busNumber}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 shrink-0">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground font-medium uppercase">Driver</p>
                <p className="font-bold text-foreground text-sm truncate max-w-[100px]">{session.driverName}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 shrink-0">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground font-medium uppercase">Route</p>
                <p className="font-bold text-foreground text-sm">{session.route}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 shrink-0">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground font-medium uppercase">Started</p>
                <p className="font-bold text-foreground text-sm">{format(new Date(session.startTime), "h:mm a")}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        
        {/* Violation Selection Grid - Large touch targets */}
        <section>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-primary rounded-full"></span>
            Tap to Log Violation
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {types?.map((type) => (
              <ViolationButton
                key={type.id}
                sessionId={sessionId}
                type={type.name}
                count={violationCounts[type.name] || 0}
              />
            ))}
            <AddViolationTypeDialog />
          </div>
        </section>

        {/* Activity Log - Full width on mobile */}
        <section>
          <Card className="border-none shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2 px-4">
              <CardTitle className="text-base font-bold">Session Log</CardTitle>
              <span className="text-xs font-mono text-muted-foreground px-2 py-1 bg-secondary rounded">
                {violations?.length || 0} logged
              </span>
            </CardHeader>
            <CardContent className="px-3 md:px-6">
              <ScrollArea className="h-[50vh] md:h-[400px]">
                {isViolationsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                  </div>
                ) : violations && violations.length > 0 ? (
                  <div className="space-y-2">
                    {violations.map((violation) => (
                      <div
                        key={violation.id}
                        className="touch-card flex items-center justify-between p-3 bg-background border border-border/50 rounded-xl"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="flex flex-col items-center justify-center w-11 h-11 rounded-lg bg-secondary/50 text-foreground font-mono text-sm leading-tight shrink-0">
                            <span className="font-bold text-xs">{new Intl.DateTimeFormat('en-US', { hour: '2-digit', hour12: false, timeZone: 'America/New_York' }).format(new Date(violation.timestamp))}</span>
                            <span className="text-[10px] text-muted-foreground">{new Intl.DateTimeFormat('en-US', { minute: '2-digit', timeZone: 'America/New_York' }).format(new Date(violation.timestamp))}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-foreground text-sm truncate">{violation.type}</p>
                            <p className="text-[11px] text-muted-foreground">{new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/New_York' }).format(new Date(violation.timestamp))}</p>
                            {violation.notes && (
                              <p className="text-xs text-foreground mt-1 bg-secondary/30 p-1.5 rounded-md italic truncate">
                                {violation.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 h-10 w-10"
                          onClick={() => deleteViolation.mutate({ id: violation.id, sessionId })}
                          data-testid={`button-delete-violation-${violation.id}`}
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground space-y-2 py-10 border-2 border-dashed border-border/50 rounded-xl">
                    <Trash2 className="w-6 h-6 opacity-20" />
                    <p className="text-sm">No violations logged yet</p>
                    <p className="text-xs">Tap a violation type above to start</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Fixed Bottom Action Bar for Mobile */}
      <div className="mobile-bottom-bar px-4">
        <div className="max-w-5xl mx-auto flex gap-3">
          {session.endTime ? (
            <Button 
              variant="outline" 
              className="flex-1 h-12 text-base"
              onClick={() => generateReport.mutate(sessionId)}
              disabled={generateReport.isPending}
              data-testid="button-download-report"
            >
              {generateReport.isPending ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <FileText className="mr-2 h-5 w-5" />
              )}
              Download Report
            </Button>
          ) : (
            <Button 
              className="flex-1 h-12 text-base font-semibold"
              onClick={openEndDialog}
              disabled={endSession.isPending || generateReport.isPending}
              data-testid="button-end-session"
            >
              {(endSession.isPending || generateReport.isPending) ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <FileText className="mr-2 h-5 w-5" />
              )}
              End Session & Report
            </Button>
          )}
        </div>
      </div>

      {/* End Session Dialog */}
      <Dialog open={endDialogOpen} onOpenChange={setEndDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End Session</DialogTitle>
            <DialogDescription>
              Enter the time you got off the bus to complete the report.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="endTime">Time Off</Label>
            <Input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="mt-2 text-lg h-12"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEndDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEndSession}
              disabled={endSession.isPending || generateReport.isPending}
            >
              {(endSession.isPending || generateReport.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Generate Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-background p-4 space-y-8 max-w-5xl mx-auto">
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="grid grid-cols-4 gap-4">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  );
}
