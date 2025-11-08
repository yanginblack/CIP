"use client";

import { SpeakerIcon, PauseIcon } from "./icons";

interface AudioButtonProps {
  isSpeaking: boolean;
  onToggle: () => void;
  isSupported: boolean;
}

export function AudioButton({ isSpeaking, onToggle, isSupported }: AudioButtonProps) {
  if (!isSupported) {
    return null;
  }

  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      aria-label={isSpeaking ? "Stop reading results" : "Read results aloud"}
    >
      {isSpeaking ? (
        <>
          <PauseIcon />
          <span>Stop Reading</span>
        </>
      ) : (
        <>
          <SpeakerIcon />
          <span>Read Aloud</span>
        </>
      )}
    </button>
  );
}
