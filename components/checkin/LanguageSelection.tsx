"use client";

import { useState } from "react";
import { MicrophoneIcon } from "@/components/icons";
import { SupportedLanguage } from "@/lib/languageConfig";

interface LanguageSelectionProps {
  onLanguageSelected: (language: SupportedLanguage) => void;
  onVisitorClick?: () => void;
  startCheckIn?: () => void;
  isListening?: boolean;
  isCheckInSpeaking?: boolean;
  isVoiceSupported?: boolean;
}

export function LanguageSelection({
  onLanguageSelected,
  onVisitorClick,
  startCheckIn,
  isListening = false,
  isCheckInSpeaking = false,
  isVoiceSupported = false,
}: LanguageSelectionProps) {
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage | null>(null);

  const handleLanguageSelect = (lang: SupportedLanguage) => {
    setSelectedLang(lang);
    // Wait a moment for visual feedback, then proceed
    setTimeout(() => {
      onLanguageSelected(lang);
    }, 300);
  };

  return (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <h1 className="text-5xl font-bold" style={{ color: "var(--text-primary)" }}>
          Welcome to CIP
        </h1>
        <p className="text-xl" style={{ color: "var(--text-secondary)" }}>
          Please select your language
        </p>
      </div>

      {/* Voice Assistance Button */}
      {isVoiceSupported && startCheckIn && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={startCheckIn}
            disabled={isListening || isCheckInSpeaking}
            className="px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center gap-3 disabled:opacity-50"
            style={{
              background: isListening
                ? "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)"
                : "var(--submit-btn-bg)",
              color: "#ffffff",
              boxShadow: "0 4px 12px var(--shadow-medium)"
            }}
          >
            <MicrophoneIcon />
            <span>{isListening ? "Listening..." : "Voice Assistance"}</span>
          </button>
        </div>
      )}

      {/* Language Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        <button
          onClick={() => handleLanguageSelect("en")}
          className="p-8 rounded-xl transition-all duration-300 hover:scale-105 transform"
          style={{
            background: selectedLang === "en" ? "var(--submit-btn-bg)" : "var(--lang-bg)",
            border: `2px solid ${selectedLang === "en" ? "var(--primary-light)" : "var(--lang-border)"}`,
            color: selectedLang === "en" ? "#ffffff" : "var(--text-primary)",
            boxShadow: selectedLang === "en" ? "0 8px 20px var(--shadow-medium)" : "0 4px 12px var(--shadow-light)"
          }}
        >
          <div className="text-4xl mb-2">🇺🇸</div>
          <div className="text-2xl font-semibold">English</div>
        </button>

        <button
          onClick={() => handleLanguageSelect("es")}
          className="p-8 rounded-xl transition-all duration-300 hover:scale-105 transform"
          style={{
            background: selectedLang === "es" ? "var(--submit-btn-bg)" : "var(--lang-bg)",
            border: `2px solid ${selectedLang === "es" ? "var(--primary-light)" : "var(--lang-border)"}`,
            color: selectedLang === "es" ? "#ffffff" : "var(--text-primary)",
            boxShadow: selectedLang === "es" ? "0 8px 20px var(--shadow-medium)" : "0 4px 12px var(--shadow-light)"
          }}
        >
          <div className="text-4xl mb-2">🇪🇸</div>
          <div className="text-2xl font-semibold">Español</div>
        </button>

        <button
          onClick={() => handleLanguageSelect("zh")}
          className="p-8 rounded-xl transition-all duration-300 hover:scale-105 transform"
          style={{
            background: selectedLang === "zh" ? "var(--submit-btn-bg)" : "var(--lang-bg)",
            border: `2px solid ${selectedLang === "zh" ? "var(--primary-light)" : "var(--lang-border)"}`,
            color: selectedLang === "zh" ? "#ffffff" : "var(--text-primary)",
            boxShadow: selectedLang === "zh" ? "0 8px 20px var(--shadow-medium)" : "0 4px 12px var(--shadow-light)"
          }}
        >
          <div className="text-4xl mb-2">🇨🇳</div>
          <div className="text-2xl font-semibold">中文</div>
        </button>
      </div>

      {/* Visitor Button */}
      <div className="pt-4">
        <button
          onClick={() => {
            if (onVisitorClick) {
              onVisitorClick();
            } else {
              handleLanguageSelect("en"); // Fallback to English
            }
          }}
          className="px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105"
          style={{
            background: "var(--submit-btn-bg)",
            color: "#ffffff",
            boxShadow: "0 4px 12px var(--shadow-medium)"
          }}
        >
          Visitor
        </button>
        <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
          Not checking in for an appointment? Click here
        </p>
      </div>
    </div>
  );
}
