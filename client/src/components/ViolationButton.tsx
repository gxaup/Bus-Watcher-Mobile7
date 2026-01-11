import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { useCreateViolation } from "@/hooks/use-bus-ops";
import { Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface ViolationButtonProps {
  sessionId: number;
  type: string;
  count: number;
}

export function ViolationButton({ sessionId, type, count }: ViolationButtonProps) {
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const createViolation = useCreateViolation();

  const handleOpen = () => {
    // Set default time to now in HH:mm format for input
    const now = new Date();
    setTime(format(now, "HH:mm"));
    setNotes("");
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!time) return;

    // Construct timestamp from current date + selected time
    const [hours, minutes] = time.split(":").map(Number);
    const timestamp = new Date();
    timestamp.setHours(hours, minutes, 0, 0);

    createViolation.mutate(
      {
        sessionId,
        type,
        timestamp,
        notes: notes || null,
      },
      {
        onSuccess: () => setOpen(false),
      }
    );
  };

  return (
    <>
      <div className="relative group">
        <Button
          variant="outline"
          className="w-full h-24 md:h-32 flex flex-col items-center justify-center gap-2 border-2 border-border/50 hover:border-primary/50 hover:bg-primary/5 text-wrap text-center rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
          onClick={handleOpen}
        >
          <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-primary mb-1" />
          <span className="font-semibold text-sm md:text-base leading-tight">{type}</span>
        </Button>
        {count > 0 && (
          <Badge className="absolute -top-2 -right-2 w-8 h-8 flex items-center justify-center rounded-full bg-accent text-white shadow-lg border-2 border-background animate-in zoom-in">
            {count}
          </Badge>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Log Violation</DialogTitle>
            <DialogDescription>
              Confirm the time for <span className="font-semibold text-foreground">{type}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">
                Time
              </Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="notes" className="text-right pt-2">
                Notes
              </Label>
              <Input
                id="notes"
                placeholder="Optional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={createViolation.isPending}>
              {createViolation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
