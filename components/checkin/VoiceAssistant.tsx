"use client";

import { useState, useEffect, useRef } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface VoiceAssistantProps {
  onClose: () => void;
}

export function VoiceAssistant({ onClose }: VoiceAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [currentBotMessage, setCurrentBotMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<Message[]>([]);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentBotMessage]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        console.log("User said:", text);

        // Add user message
        const userMessage: Message = { role: "user", content: text };
        setMessages((prev) => [...prev, userMessage]);
        messagesRef.current = [...messagesRef.current, userMessage];

        // Send to server
        sendToServer(text);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          setError(`Speech recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        console.log("Recognition ended");
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setError("Your browser does not support speech recognition. Please use Chrome, Edge, or Safari.");
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log("Recognition already stopped");
        }
      }
      // Stop any ongoing speech
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        setIsListening(true);
        setError(null);
        recognitionRef.current.start();
        console.log("Started listening");
      } catch (e) {
        console.error("Error starting recognition:", e);
        setIsListening(false);
      }
    }
  };

  const sendToServer = async (userText: string) => {
    setCurrentBotMessage("");
    let botMessage = "";

    // Update messages array for API call
    const updatedMessages = [...messagesRef.current];

    try {
      const response = await fetch("https://cil-backend-reference.onrender.com/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization: "default",
          messages: updatedMessages
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      if (reader) {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          botMessage += decoder.decode(value);
          setCurrentBotMessage(botMessage);
        }
      }

      // Add final bot message to messages
      const assistantMessage: Message = { role: "assistant", content: botMessage.trim() };
      setMessages((prev) => [...prev, assistantMessage]);
      messagesRef.current = [...messagesRef.current, assistantMessage];
      setCurrentBotMessage("");

      // Speak the response
      speak(botMessage.trim());

      // Auto-start listening for next input after speaking
      setTimeout(() => {
        startListening();
      }, 500);

    } catch (err: any) {
      console.error("API error:", err);
      setError(err.message || "Failed to send message to server");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">CIL Voice Assistant</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {isListening ? "🎙️ Listening..." : "Click the button to start speaking"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900 space-y-4 min-h-0">
          {messages.length === 0 && !currentBotMessage && (
            <div className="text-center text-gray-400 dark:text-gray-500 mt-12">
              <p className="text-lg">Welcome! Click the microphone button to start.</p>
              <p className="text-sm mt-2">I&apos;ll listen and respond to your questions.</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 rounded-xl ${
                  msg.role === "user"
                    ? "bg-blue-100 text-blue-900 rounded-br-sm"
                    : "bg-green-100 text-green-900 rounded-bl-sm"
                }`}
              >
                <p className="text-base leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}

          {/* Current streaming bot message */}
          {currentBotMessage && (
            <div className="flex justify-start">
              <div className="max-w-[85%] px-4 py-3 rounded-xl bg-green-100 text-green-900 rounded-bl-sm">
                <p className="text-base leading-relaxed">{currentBotMessage}</p>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Microphone Button */}
        <div className="p-6 border-t bg-white">
          <button
            onClick={startListening}
            disabled={isListening}
            className={`w-full py-4 px-6 text-lg font-semibold rounded-xl transition-all ${
              isListening
                ? "bg-red-500 text-white cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
            }`}
          >
            {isListening ? "🎙️ Listening..." : "🎤 Start Speaking"}
          </button>
        </div>
      </div>
    </div>
  );
}
