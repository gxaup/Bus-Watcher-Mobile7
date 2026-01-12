import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, FileText, Clock, CheckCircle, Trash2, Download, X } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Session } from "@shared/schema";

export default function Reports() {
  const [viewingReport, setViewingReport] = useState<{ content: string; filename: string } | null>(null);
  const [loadingReportId, setLoadingReportId] = useState<number | null>(null);

  const { data: sessions, isLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });

  const deleteSession = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/sessions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
    },
  });

  const deleteAllSessions = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/sessions");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      localStorage.removeItem("activeSessionId");
    },
  });

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Delete this report?")) {
      deleteSession.mutate(id);
    }
  };

  const handleDeleteAll = () => {
    if (confirm("Delete ALL reports? This cannot be undone.")) {
      deleteAllSessions.mutate();
    }
  };

  const handleViewReport = async (sessionId: number) => {
    setLoadingReportId(sessionId);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/report`);
      const data = await res.json();
      setViewingReport({ content: data.content, filename: data.filename });
    } catch (err) {
      console.error("Failed to load report", err);
    } finally {
      setLoadingReportId(null);
    }
  };

  const handleDownload = () => {
    if (!viewingReport) return;
    const blob = new Blob([viewingReport.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = viewingReport.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const drafts = sessions?.filter(s => !s.endTime) || [];
  const completed = sessions?.filter(s => s.endTime) || [];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-background to-secondary/30 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Reports</h1>
          <div className="ml-auto">
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleDeleteAll}
              disabled={deleteAllSessions.isPending || !sessions?.length}
              data-testid="button-delete-all"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete All
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                  <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                Drafts
                <span className="ml-auto text-sm font-normal text-muted-foreground">
                  {isLoading ? "..." : drafts.length} reports
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : drafts.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No drafts</p>
              ) : (
                <div className="space-y-2">
                  {drafts.map((session) => (
                    <Link key={session.id} href={`/session/${session.id}`}>
                      <div className="flex items-center gap-3 p-3 bg-background rounded-lg border hover:border-primary/50 transition-colors cursor-pointer">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            Bus {session.busNumber || "Unknown"} - {session.route || "No route"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Started {new Date(session.startTime).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={(e) => handleDelete(e, session.id)}
                          data-testid={`button-delete-session-${session.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                Completed
                <span className="ml-auto text-sm font-normal text-muted-foreground">
                  {isLoading ? "..." : completed.length} reports
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : completed.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No completed reports</p>
              ) : (
                <div className="space-y-2">
                  {completed.map((session) => (
                    <div 
                      key={session.id} 
                      className="flex items-center gap-3 p-3 bg-background rounded-lg border hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => handleViewReport(session.id)}
                      data-testid={`card-completed-session-${session.id}`}
                    >
                      <FileText className="w-4 h-4 text-green-600" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          Bus {session.busNumber || "Unknown"} - {session.route || "No route"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Completed {new Date(session.endTime!).toLocaleDateString()}
                        </p>
                      </div>
                      {loadingReportId === session.id && (
                        <span className="text-xs text-muted-foreground">Loading...</span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={(e) => handleDelete(e, session.id)}
                        data-testid={`button-delete-session-${session.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!viewingReport} onOpenChange={(open) => !open && setViewingReport(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader className="flex flex-row items-center justify-between gap-4">
            <DialogTitle className="font-mono text-sm truncate">
              {viewingReport?.filename}
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              data-testid="button-download-report"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </DialogHeader>
          <ScrollArea className="flex-1 mt-4">
            <pre className="text-sm font-mono whitespace-pre-wrap bg-muted p-4 rounded-lg">
              {viewingReport?.content}
            </pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
