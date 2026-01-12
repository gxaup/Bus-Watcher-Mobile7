import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, FileText, FolderOpen, Clock, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import type { Session } from "@shared/schema";

export default function Reports() {
  const { data: sessions, isLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });

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
                    <Link key={session.id} href={`/session/${session.id}`}>
                      <div className="flex items-center gap-3 p-3 bg-background rounded-lg border hover:border-primary/50 transition-colors cursor-pointer">
                        <FileText className="w-4 h-4 text-green-600" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            Bus {session.busNumber || "Unknown"} - {session.route || "No route"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Completed {new Date(session.endTime!).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
