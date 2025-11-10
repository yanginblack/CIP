"use client";

import { useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface MessageListProps {
  messages: Message[];
  isSpeechSupported: boolean;
  speakingMessageIndex: number | null;
  isSpeaking: boolean;
  onPlayMessage: (index: number, content: string) => void;
  emptyStateText: string;
  listenLabel: string;
  stopLabel: string;
}

export function MessageList({
  messages,
  isSpeechSupported,
  speakingMessageIndex,
  isSpeaking,
  onPlayMessage,
  emptyStateText,
  listenLabel,
  stopLabel,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 h-64 overflow-y-auto space-y-3">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            {emptyStateText}
          </p>
        </div>
      ) : (
        messages.map((message, index) => (
          <ChatMessage
            key={index}
            role={message.role}
            content={message.content}
            index={index}
            isSpeechSupported={isSpeechSupported}
            isSpeaking={speakingMessageIndex === index && isSpeaking}
            onPlayMessage={onPlayMessage}
            listenLabel={listenLabel}
            stopLabel={stopLabel}
          />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
