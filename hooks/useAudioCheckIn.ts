import { useState, useEffect, useCallback } from "react";
import { useSpeech } from "./useSpeech";
import { useVoiceInput } from "./useVoiceInput";
import {
  spellName,
  parseFullName,
  isPositiveConfirmation,
  isNegativeConfirmation,
} from "@/lib/audioUtils";
import {
  SupportedLanguage,
  SUPPORTED_LANGUAGES,
  TRANSLATIONS,
  detectLanguageSelection,
} from "@/lib/languageConfig";

interface UseAudioCheckInOptions {
  onNameConfirmed: (name: { firstName: string; lastName: string }) => void;
  onReset?: () => void;
  onComplete?: () => void; // Called when audio check-in process completes
}

type CheckInState = "language_selection" | "name_input" | "name_confirmation";

export function useAudioCheckIn({ onNameConfirmed, onReset, onComplete }: UseAudioCheckInOptions) {
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>("en");
  const [checkInState, setCheckInState] = useState<CheckInState>("language_selection");
  const [capturedName, setCapturedName] = useState<{
    firstName: string;
    lastName: string;
  } | null>(null);

  const { speak, isSpeaking } = useSpeech();
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    changeLanguage,
    isSupported: isVoiceSupported,
  } = useVoiceInput();

  // Get current language config
  const langConfig = SUPPORTED_LANGUAGES[selectedLanguage];
  const t = TRANSLATIONS[selectedLanguage];

  // Start the audio check-in process
  const startCheckIn = useCallback(() => {
    if (isListening) return;

    resetTranscript();
    setCapturedName(null);
    setCheckInState("language_selection");
    setSelectedLanguage("en"); // Reset to English

    if (onReset) {
      onReset();
    }

    // Multi-language welcome prompt with short pauses
    // Speak "Welcome" in English first
    speak("Welcome!", "en-US");

    setTimeout(() => {
      speak("Please say:", "en-US");
    }, 1500);

    // Speak each language with 1.25 second gaps (1000ms speech + 250ms pause)
    setTimeout(() => {
      speak("English", "en-US");
    }, 2500);

    setTimeout(() => {
      speak("Español", "es-US");
    }, 3500); // 250ms pause after "English"

    setTimeout(() => {
      speak("中文", "zh-CN");
    }, 5000); // 250ms pause after "Español"

    setTimeout(() => {
      speak("to select your language", "en-US");
    }, 6250); // 250ms pause after "中文"

    setTimeout(() => {
      startListening();
    }, 8000);
  }, [isListening, speak, startListening, resetTranscript, onReset]);

  // Cancel the audio check-in process
  const cancelCheckIn = useCallback(() => {
    console.log("[AudioCheckIn] Canceling check-in process");

    // Stop any ongoing listening
    stopListening();

    // Reset all state
    resetTranscript();
    setCapturedName(null);
    setCheckInState("language_selection");
    setSelectedLanguage("en");

    // Reset form if provided
    if (onReset) {
      onReset();
    }
  }, [stopListening, resetTranscript, onReset]);

  // Process voice transcript
  useEffect(() => {
    if (!transcript) return;

    const lowerTranscript = transcript.toLowerCase().trim();
    console.log(`[AudioCheckIn] State: ${checkInState}, Transcript: "${transcript}", Lang: ${selectedLanguage}`);

    // STATE: Language Selection
    if (checkInState === "language_selection") {
      const detectedLang = detectLanguageSelection(transcript);

      if (detectedLang) {
        setSelectedLanguage(detectedLang);
        const newLangConfig = SUPPORTED_LANGUAGES[detectedLang];
        const newTranslations = TRANSLATIONS[detectedLang];

        // Special handling for Chinese - warn about limited support
        if (detectedLang === 'zh') {
          // Announce in Chinese
          resetTranscript();
          speak("中文支持有限。", "zh-CN");

          setTimeout(() => {
            speak("请说您的名字和姓氏。", "zh-CN");
          }, 2000);

          setTimeout(() => {
            speak("Or you can say your name in English.", "en-US");
          }, 4000);

          // Keep recognition in English as fallback due to poor Chinese support
          changeLanguage("en-US");
          setCheckInState("name_input");

          setTimeout(() => {
            startListening();
          }, 6000);
        } else {
          // Update voice recognition language for English/Spanish
          changeLanguage(newLangConfig.voiceLang);

          // Confirm language selection and ask for name
          resetTranscript();
          setCheckInState("name_input");

          speak(newTranslations.namePrompt, newLangConfig.voiceLang, () => {
            startListening();
          });
        }
      } else {
        // Language not understood
        resetTranscript();
        speak(t.languageNotUnderstood, langConfig.voiceLang);
        setTimeout(() => {
          startListening();
        }, 3000);
      }
    }
    // STATE: Name Confirmation
    else if (checkInState === "name_confirmation" && capturedName) {
      console.log(`[AudioCheckIn] Checking confirmation - Positive: ${isPositiveConfirmation(lowerTranscript, selectedLanguage)}, Negative: ${isNegativeConfirmation(lowerTranscript, selectedLanguage)}`);

      if (isPositiveConfirmation(lowerTranscript, selectedLanguage)) {
        // User confirmed, proceed
        console.log("[AudioCheckIn] ✅ User confirmed!");
        setCheckInState("name_input"); // Reset state
        speak(t.searching, langConfig.voiceLang);
        resetTranscript();
        setTimeout(() => {
          onNameConfirmed(capturedName);
          // Wait for search to complete before calling onComplete
          // The search will trigger announceResultsForCheckIn which takes ~3-4 seconds
          setTimeout(() => {
            if (onComplete) {
              onComplete();
            }
          }, 5000); // 5 seconds to allow for search + audio announcement
        }, 1500);
      } else if (isNegativeConfirmation(lowerTranscript, selectedLanguage)) {
        // User said no, restart name input
        setCapturedName(null);
        setCheckInState("name_input");
        resetTranscript();

        if (onReset) {
          onReset();
        }

        speak(t.tryAgain, langConfig.voiceLang, () => {
          startListening();
        });
      } else {
        // Unclear response
        resetTranscript();
        speak(t.didNotCatch, langConfig.voiceLang, () => {
          startListening();
        });
      }
    }
    // STATE: Name Input
    else if (checkInState === "name_input" && !capturedName) {
      // Extract name from transcript
      const parsedName = parseFullName(transcript);

      if (parsedName) {
        setCapturedName(parsedName);

        // Confirm with user - spell out the names
        const firstNameSpelled = spellName(parsedName.firstName);
        const lastNameSpelled = spellName(parsedName.lastName);
        const confirmationMessage = t.nameConfirmation(
          parsedName.firstName,
          firstNameSpelled,
          parsedName.lastName,
          lastNameSpelled
        );

        resetTranscript();
        setCheckInState("name_confirmation");
        // Use onComplete callback to start listening AFTER speech finishes
        speak(confirmationMessage, langConfig.voiceLang, () => {
          console.log("[AudioCheckIn] Confirmation message finished, starting to listen...");
          startListening();
        });
      } else if (transcript.trim().split(/\s+/).length === 1) {
        resetTranscript();
        speak(t.onlyOneName, langConfig.voiceLang, () => {
          startListening();
        });
      }
    }
  }, [
    transcript,
    checkInState,
    capturedName,
    selectedLanguage,
    speak,
    startListening,
    resetTranscript,
    changeLanguage,
    onNameConfirmed,
    onReset,
    t,
    langConfig,
  ]);

  return {
    startCheckIn,
    cancelCheckIn,
    isListening,
    isSpeaking,
    isVoiceSupported,
    capturedName,
    selectedLanguage,
    checkInState,
  };
}
