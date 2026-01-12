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
import { Slider } from "@/components/ui/slider";
import { Loader2, BusFront, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { format, subMinutes, startOfMinute } from "date-fns";

export function CreateSessionForm() {
  const [, setLocation] = useLocation();
  const createSession = useCreateSession();
  const [minutesOffset, setMinutesOffset] = useState(0);

  const form = useForm<InsertSession>({
    resolver: zodResolver(insertSessionSchema),
    defaultValues: {
      busNumber: "",
      driverName: "",
      stopBoarded: "",
      route: "",
      startTime: new Date(),
    },
  });

  // Update startTime when slider changes
  useEffect(() => {
    // minutesOffset: negative means future (right side), positive means past (left side)
    // Actually, user wants "Future on Right" and "Past on Left".
    // Slider min -60 (past), max 30 (future). 
    // If value is -60, it's 60m ago. If value is 30, it's 30m in future.
    // So subMinutes(now, -value) => subMinutes(now, 60) if value is -60.
    const newTime = subMinutes(startOfMinute(new Date()), -minutesOffset);
    form.setValue("startTime", newTime);
  }, [minutesOffset, form]);

  const onSubmit = (data: InsertSession) => {
    createSession.mutate(data, {
      onSuccess: (session) => {
        setLocation(`/session/${session.id}`);
      },
    });
  };

  const selectedTime = subMinutes(startOfMinute(new Date()), -minutesOffset);

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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="busNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground font-medium">Bus Number</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 359" className="h-12 bg-background" {...field} />
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
                  <Input placeholder="downtown, uptown" className="h-12 bg-background" {...field} />
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
                  <Input placeholder="1,2,3…" className="h-12 bg-background" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <FormLabel className="text-foreground font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Time On (Boarding Time)
              </FormLabel>
              <span className="text-sm font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
                {format(selectedTime, "h:mm a")}
              </span>
            </div>
            
            <div className="px-2 pt-2 pb-6">
              <Slider
                min={-60}
                max={30}
                step={1}
                value={[minutesOffset]}
                onValueChange={(vals) => setMinutesOffset(vals[0])}
                className="py-4"
              />
              <div className="flex justify-between mt-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                <span>-60m (Past)</span>
                <span>Now</span>
                <span>+30m (Future)</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
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
