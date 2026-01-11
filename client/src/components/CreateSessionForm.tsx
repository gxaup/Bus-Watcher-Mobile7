import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSessionSchema, type InsertSession } from "@shared/schema";
import { useCreateSession } from "@/hooks/use-bus-ops";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, BusFront } from "lucide-react";

export function CreateSessionForm() {
  const [, setLocation] = useLocation();
  const createSession = useCreateSession();

  const form = useForm<InsertSession>({
    resolver: zodResolver(insertSessionSchema),
    defaultValues: {
      busNumber: "",
      driverName: "",
      stopBoarded: "",
      route: "",
      startTime: new Date(), // Initial value, though backend sets defaultNow()
    },
  });

  const onSubmit = (data: InsertSession) => {
    createSession.mutate(data, {
      onSuccess: (session) => {
        setLocation(`/session/${session.id}`);
      },
    });
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-card rounded-2xl shadow-lg border border-border/50">
      <div className="mb-8 text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
          <BusFront className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold font-display text-foreground">Start Observation</h1>
        <p className="text-muted-foreground mt-2">Enter trip details to begin logging.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="busNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground font-medium">Bus Number</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 4022" className="h-12 bg-background" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="route"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground font-medium">Route</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 55 Westbound" className="h-12 bg-background" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="driverName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground font-medium">Driver Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. John Doe" className="h-12 bg-background" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stopBoarded"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground font-medium">Stop Boarded</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Main & 5th" className="h-12 bg-background" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full h-14 text-lg font-semibold shadow-lg shadow-primary/20 hover-lift"
              disabled={createSession.isPending}
            >
              {createSession.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Starting...
                </>
              ) : (
                "Start Session"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
