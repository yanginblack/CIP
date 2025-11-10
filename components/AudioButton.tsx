"use client";

import { SpeakerIcon, PauseIcon } from "./icons";

interface AudioButtonProps {
  isSpeaking: boolean;
  onToggle: () => void;
  isSupported: boolean;
  playLabel: string;
  stopLabel: string;
}

export function AudioButton({
  isSpeaking,
  onToggle,
  isSupported,
  playLabel,
  stopLabel,
}: AudioButtonProps) {
  if (!isSupported) {
    return null;
  }

  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-purple-dark text-light-plum dark:text-lighter-plum border-2 border-light-plum dark:border-lighter-plum rounded-lg hover:bg-purple-50 dark:hover:bg-navy-dark hover:border-lighter-plum focus:outline-none focus:ring-2 focus:ring-light-plum focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
      aria-label={isSpeaking ? stopLabel : playLabel}
    >
      {isSpeaking ? (
        <>
          <PauseIcon />
          <span>{stopLabel}</span>
        </>
      ) : (
        <>
          <SpeakerIcon />
          <span>{playLabel}</span>
        </>
      )}
    </button>
  );
}
