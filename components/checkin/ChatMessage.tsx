"use client";

import { SpeakerIcon, PauseIcon } from "@/components/icons";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  index: number;
  isSpeechSupported: boolean;
  isSpeaking: boolean;
  onPlayMessage: (index: number, content: string) => void;
  listenLabel: string;
  stopLabel: string;
}

export function ChatMessage({
  role,
  content,
  index,
  isSpeechSupported,
  isSpeaking,
  onPlayMessage,
  listenLabel,
  stopLabel,
}: ChatMessageProps) {
  return (
    <div
      className={`flex ${
        role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          role === "user"
            ? "bg-gray-100 text-gray-800"
            : "bg-blue-100 text-blue-900"
        }`}
      >
        <p className="text-sm">{content}</p>

        {/* Optional audio playback for assistant messages */}
        {role === "assistant" && isSpeechSupported && (
          <button
            onClick={() => onPlayMessage(index, content)}
            className="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
            aria-label={isSpeaking ? stopLabel : listenLabel}
          >
            {isSpeaking ? (
              <>
                <PauseIcon className="w-4 h-4" />
                <span>{stopLabel}</span>
              </>
            ) : (
              <>
                <SpeakerIcon className="w-4 h-4" />
                <span>{listenLabel}</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
