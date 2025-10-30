"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReviewForm } from "./review-form";
import { Star } from "lucide-react";

interface ReviewDialogProps {
  bookingId: string;
  propertyId: string;
  propertyName: string;
  trigger?: React.ReactNode;
}

export function ReviewDialog({
  bookingId,
  propertyId,
  propertyName,
  trigger,
}: ReviewDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Star className="w-4 h-4 mr-2" />
            ¬ð ‘1X0
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>¬ð ‘1</DialogTitle>
          <DialogDescription>
             ½ØD õ Xà äx Œ¤¸äÐŒ ÄÀD ü8”
          </DialogDescription>
        </DialogHeader>
        <ReviewForm
          bookingId={bookingId}
          propertyId={propertyId}
          propertyName={propertyName}
          onSuccess={handleSuccess}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
