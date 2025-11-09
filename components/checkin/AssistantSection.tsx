"use client";

import { useSpeech } from "@/hooks/useSpeech";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useEffect, useState } from "react";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AssistantSection() {
  async function sendToServer(
    messages: Message[],
    onChunk: (text: string) => void
  ) {
    const response = await fetch(
      "https://cil-backend-reference.onrender.com/chat/stream",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization: "default",
          messages,
        }),
      }
    );

    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullText = "";

    while (true) {
      const { value, done } = await reader!.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;
      onChunk(fullText); // progressively update assistant message
    }

    return fullText.trim();
  }
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
  const {
    speak,
    stop: stopSpeech,
    isSpeaking,
    isSupported: isSpeechSupported,
  } = useSpeech();
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState<
    number | null
  >(null);

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

  const handleSendMessage = async () => {
    if (!textInput.trim()) return;

    const userMessage: Message = { role: "user", content: textInput.trim() };

    setMessages((prev) => [...prev, userMessage]);
    setTextInput("");
    setError(null);
    setIsLoading(true);

    try {
      // Add a temporary assistant message to be updated live
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const newMessages = [...messages, userMessage];
      let latestAssistantText = "";

      const finalText = await sendToServer(newMessages, (partial) => {
        latestAssistantText = partial;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: partial };
          return updated;
        });
      });

      // Final speech synthesis
      if (isSpeechSupported) speak(finalText);
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
        While you&apos;re waiting for assistance from our front desk, or if our front
        desk is currently occupied, you can also talk to our online assistant.
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
