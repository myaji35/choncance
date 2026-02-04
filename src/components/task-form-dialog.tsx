"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TaskFormDialogProps {
  children: React.ReactNode;
  title: string;
  description: string;
  initialData?: { name: string; description: string; dueDate?: string; status?: string };
  onSubmit: (data: { name: string; description: string; dueDate?: string; status?: string }) => void;
}

export function TaskFormDialog({
  children,
  title,
  description,
  initialData,
  onSubmit,
}: TaskFormDialogProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [taskDescription, setTaskDescription] = useState(initialData?.description || "");

  const handleSubmit = () => {
    onSubmit({ name, description: taskDescription });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              작업 이름
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              설명
            </Label>
            <Textarea
              id="description"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
          {/* Add fields for dueDate and status later if needed */}
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}