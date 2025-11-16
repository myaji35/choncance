"use client";

import { Message, PropertyReference } from "./types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { OptimizedImage } from "@/components/ui/optimized-image";
import Link from "next/link";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 mb-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className={cn(
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}>
          {isUser ? "나" : "V"}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div className={cn("flex flex-col gap-2 max-w-[80%]", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          )}
        >
          {message.content}
        </div>

        {/* Property References */}
        {message.propertyReferences && message.propertyReferences.length > 0 && (
          <div className="flex flex-col gap-2 w-full">
            {message.propertyReferences.map((property) => (
              <Link
                key={property.id}
                href={`/property/${property.id}`}
                target="_blank"
                className="block"
              >
                <div className="bg-card border rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="flex gap-3">
                    {property.thumbnailUrl && (
                      <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden">
                        <OptimizedImage
                          src={property.thumbnailUrl}
                          alt={property.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {property.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {property.pricePerNight.toLocaleString()}원 / 박
                      </p>
                      {property.tags.length > 0 && (
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {property.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-muted px-2 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <span className="text-xs text-muted-foreground px-1">
          {new Date(message.timestamp).toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}
