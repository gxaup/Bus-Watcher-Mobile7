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
    <div className="min-h-screen bg-secondary/20 pb-20">
      {/* Sticky Header with Session Info */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Exit
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">Live Session</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Bus className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Bus Number</p>
                <p className="font-bold text-foreground">{session.busNumber}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Driver</p>
                <p className="font-bold text-foreground truncate max-w-[120px]">{session.driverName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Route</p>
                <p className="font-bold text-foreground">{session.route}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Started At</p>
                <p className="font-bold text-foreground">{format(new Date(session.startTime), "h:mm a")}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        
        {/* Violation Selection Grid */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded-full"></span>
            Log Violation
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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

        {/* Activity Log */}
        <section className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card className="border-none shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold">Session Log</CardTitle>
                <span className="text-xs font-mono text-muted-foreground px-2 py-1 bg-secondary rounded">
                  {violations?.length || 0} Events
                </span>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  {isViolationsLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : violations && violations.length > 0 ? (
                    <div className="space-y-3">
                      {violations.map((violation) => (
                        <div
                          key={violation.id}
                          className="group flex items-center justify-between p-4 bg-background border border-border/50 rounded-xl hover:border-primary/30 hover:shadow-sm transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-secondary/50 text-foreground font-mono text-sm leading-tight">
                              <span className="font-bold">{format(new Date(violation.timestamp), "HH")}</span>
                              <span className="text-xs text-muted-foreground">{format(new Date(violation.timestamp), "mm")}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{violation.type}</p>
                              <p className="text-xs text-muted-foreground">Logged at {format(new Date(violation.timestamp), "h:mm a")}</p>
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => deleteViolation.mutate({ id: violation.id, sessionId })}
                          >
                            <X className="w-5 h-5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2 py-12 border-2 border-dashed border-border/50 rounded-xl">
                      <Trash2 className="w-8 h-8 opacity-20" />
                      <p>No violations logged yet.</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Actions Panel */}
          <div className="space-y-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full h-14 text-lg shadow-lg shadow-primary/20 hover-lift"
                  onClick={openEndDialog}
                  disabled={!!session.endTime}
                >
                  {session.endTime ? "Session Ended" : "End Session & Report"}
                </Button>
                
                {session.endTime && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => generateReport.mutate(sessionId)}
                    disabled={generateReport.isPending}
                  >
                    {generateReport.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="mr-2 h-4 w-4" />
                    )}
                    Download Report Again
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

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
