"use client";

import { useState, useEffect } from "react";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useSpeech } from "@/hooks/useSpeech";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AssistantSection() {
  // State management
  const [messages, setMessages] = useState<Message[]>([]);
  const [textInput, setTextInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Voice input hook (continuous recording)
  const {
    isSupported: isVoiceSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceInput();

  // Speech synthesis hook for optional playback
  const { speak, stop: stopSpeech, isSpeaking, isSupported: isSpeechSupported } = useSpeech();
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState<number | null>(null);

  // Update text input when voice transcript changes
  useEffect(() => {
    if (transcript) {
      setTextInput((prev) => {
        // If there's existing text, add a space before appending
        return prev ? `${prev} ${transcript}` : transcript;
      });
    }
  }, [transcript]);

  // Handle voice recording toggle
  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!textInput.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: textInput.trim(),
    };

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);
    setTextInput("");
    setError(null);
    setIsLoading(true);

    try {
      // TODO: Send message to backend LLM API via existing dedicated endpoint
      // The message should be sent to the backend API for processing by an LLM chatbot
      // For now, we're storing messages locally as a placeholder

      // Mock assistant response (placeholder for testing)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const assistantMessage: Message = {
        role: "assistant",
        content: "Thank you for your message. An agent will review this and respond shortly.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError("Failed to send message. Please try again.");
      console.error("Error sending message:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle playing assistant message audio
  const handlePlayMessage = (index: number, content: string) => {
    if (speakingMessageIndex === index && isSpeaking) {
      stopSpeech();
      setSpeakingMessageIndex(null);
    } else {
      stopSpeech(); // Stop any currently playing audio
      setSpeakingMessageIndex(index);
      speak(content, "en-US", () => {
        setSpeakingMessageIndex(null);
      });
    }
  };

  return (
    <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
      <h3 className="text-lg font-semibold text-blue-900 mb-2">
        Online Assistant
      </h3>
      <p className="text-sm text-blue-700 mb-4">
        While you're waiting for assistance from our front desk, or if our front desk is currently occupied, you can also talk to our online assistant.
      </p>

      {/* Chat Messages Area */}
      <MessageList
        messages={messages}
        isSpeechSupported={isSpeechSupported}
        speakingMessageIndex={speakingMessageIndex}
        isSpeaking={isSpeaking}
        onPlayMessage={handlePlayMessage}
      />

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Input Section */}
      <ChatInput
        textInput={textInput}
        isLoading={isLoading}
        isListening={isListening}
        isVoiceSupported={isVoiceSupported}
        onTextChange={setTextInput}
        onSend={handleSendMessage}
        onVoiceToggle={handleVoiceToggle}
      />
    </div>
  );
}
