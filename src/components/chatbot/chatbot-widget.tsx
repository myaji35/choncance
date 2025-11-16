"use client";

import { useState } from "react";
import { Message } from "./types";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, X, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call chatbot API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: content,
          history: messages,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      // Add assistant message
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
        propertyReferences: data.propertyReferences || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);

      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size="lg"
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
        aria-label="챗봇 열기"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card
      className={cn(
        "fixed shadow-2xl z-50 flex flex-col overflow-hidden transition-all",
        // 모바일: 전체 화면, 데스크톱: 우측 하단
        "bottom-0 right-0 md:bottom-6 md:right-6",
        isMinimized
          ? "w-full md:w-80 h-16"
          : "w-full h-[100vh] md:w-96 md:h-[600px] md:max-h-[80vh] md:rounded-lg"
      )}
    >
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-primary-foreground/20 rounded-full p-2">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">VINTEE 상담</h3>
            <p className="text-xs opacity-90">
              {isLoading ? "답변 생성 중..." : "온라인"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleMinimize}
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <>
          {/* Messages */}
          <MessageList messages={messages} />

          {/* Input */}
          <ChatInput onSend={handleSendMessage} disabled={isLoading} />
        </>
      )}
    </Card>
  );
}
