"use client";

import { MicrophoneIcon } from "@/components/icons";

interface ChatInputProps {
  textInput: string;
  isLoading: boolean;
  isListening: boolean;
  isVoiceSupported: boolean;
  onTextChange: (value: string) => void;
  onSend: () => void;
  onVoiceToggle: () => void;
  placeholder: string;
  sendLabel: string;
  sendingLabel: string;
  voiceStartLabel: string;
  voiceStopLabel: string;
  recordingIndicator: string;
  helperText: string;
}

export function ChatInput({
  textInput,
  isLoading,
  isListening,
  isVoiceSupported,
  onTextChange,
  onSend,
  onVoiceToggle,
  placeholder,
  sendLabel,
  sendingLabel,
  voiceStartLabel,
  voiceStopLabel,
  recordingIndicator,
  helperText,
}: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {/* Text Input Field */}
        <input
          type="text"
          value={textInput}
          onChange={(e) => onTextChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          className="flex-1 px-4 py-3 text-base border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />

        {/* Voice Input Button */}
        {isVoiceSupported && (
          <button
            onClick={onVoiceToggle}
            disabled={isLoading}
            className={`px-4 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
              isListening
                ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
            aria-label={isListening ? voiceStopLabel : voiceStartLabel}
          >
            <MicrophoneIcon className="w-5 h-5" />
          </button>
        )}

        {/* Send Button */}
        <button
          onClick={onSend}
          disabled={!textInput.trim() || isLoading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isLoading ? sendingLabel : sendLabel}
        </button>
      </div>

      {/* Voice Recording Indicator */}
      {isListening && (
        <p className="text-sm text-blue-600 dark:text-blue-300 flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
          {recordingIndicator}
        </p>
      )}

      {/* Helper Text */}
      <p className="text-xs text-blue-600 dark:text-blue-300">
        {/* TODO: Inputs from either text field or voice input will be sent to backend API and passed to an LLM chatbot */}
        {helperText}
      </p>
    </div>
  );
}
