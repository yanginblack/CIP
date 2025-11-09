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
      className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-700 text-purple-700 dark:text-purple-300 border-2 border-purple-300 dark:border-purple-500 rounded-lg hover:bg-purple-50 dark:hover:bg-gray-600 hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
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
          <span>Voice Assistance</span>
        </>
      )}
    </button>
  );
}
