"use client";

import Link from "next/link";
import {
  Star,
  Calendar,
  Home,
  Search,
  Inbox,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ICONS = {
  star: Star,
  calendar: Calendar,
  home: Home,
  search: Search,
  inbox: Inbox,
  heart: Heart,
} as const;

interface EmptyStateProps {
  icon?: keyof typeof ICONS;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
    variant?: "default" | "outline";
  };
  className?: string;
}

export function EmptyState({
  icon = "inbox",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const Icon = ICONS[icon];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className
      )}
    >
      <div className="mb-4 rounded-full bg-gray-100 p-4">
        <Icon className="h-10 w-10 text-gray-400" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-700">{title}</h3>
      {description && (
        <p className="mb-6 max-w-sm text-sm text-gray-500">{description}</p>
      )}
      {action && (
        <>
          {action.href ? (
            <Link href={action.href}>
              <Button variant={action.variant ?? "default"} size="sm">
                {action.label}
              </Button>
            </Link>
          ) : (
            <Button
              variant={action.variant ?? "default"}
              size="sm"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
