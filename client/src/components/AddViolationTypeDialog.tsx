import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateViolationType } from "@/hooks/use-bus-ops";
import { Plus, Loader2 } from "lucide-react";

export function AddViolationTypeDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const createType = useCreateViolationType();

  const handleSubmit = () => {
    if (!name.trim()) return;

    createType.mutate(
      {
        name,
        isDefault: false,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setName("");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="h-24 md:h-32 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 rounded-2xl">
          <Plus className="w-8 h-8 text-muted-foreground" />
          <span className="text-muted-foreground font-medium">Add Type</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Violation Type</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Violation Name</Label>
            <Input
              id="name"
              placeholder="e.g. Speeding, Early Arrival"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createType.isPending || !name.trim()}>
            {createType.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Type
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
