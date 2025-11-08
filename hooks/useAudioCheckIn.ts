import { useState, useEffect, useCallback } from "react";
import { useSpeech } from "./useSpeech";
import { useVoiceInput } from "./useVoiceInput";
import {
  spellName,
  parseFullName,
  isPositiveConfirmation,
  isNegativeConfirmation,
} from "@/lib/audioUtils";

interface UseAudioCheckInOptions {
  onNameConfirmed: (name: { firstName: string; lastName: string }) => void;
  onReset?: () => void;
}

export function useAudioCheckIn({ onNameConfirmed, onReset }: UseAudioCheckInOptions) {
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
  const [capturedName, setCapturedName] = useState<{
    firstName: string;
    lastName: string;
  } | null>(null);

  const { speak, isSpeaking } = useSpeech();
  const {
    isListening,
    transcript,
    startListening,
    resetTranscript,
    isSupported: isVoiceSupported,
  } = useVoiceInput();

  // Start the audio check-in process
  const startCheckIn = useCallback(() => {
    if (isListening) return;

    resetTranscript();
    setCapturedName(null);
    setWaitingForConfirmation(false);

    if (onReset) {
      onReset();
    }

    speak("Please say your first name and last name.");
    setTimeout(() => {
      startListening();
    }, 2000);
  }, [isListening, speak, startListening, resetTranscript, onReset]);

  // Process voice transcript
  useEffect(() => {
    if (!transcript) return;

    const lowerTranscript = transcript.toLowerCase().trim();

    // Handle confirmation response
    if (waitingForConfirmation && capturedName) {
      if (isPositiveConfirmation(lowerTranscript)) {
        // User confirmed, proceed
        setWaitingForConfirmation(false);
        speak("Searching for your appointments. Please wait.");
        resetTranscript();
        setTimeout(() => {
          onNameConfirmed(capturedName);
        }, 1500);
      } else if (isNegativeConfirmation(lowerTranscript)) {
        // User said no, restart
        setCapturedName(null);
        setWaitingForConfirmation(false);
        resetTranscript();

        if (onReset) {
          onReset();
        }

        speak("Let's try again. Please say your first name and last name.");
        setTimeout(() => {
          startListening();
        }, 3000);
      } else {
        // Unclear response
        resetTranscript();
        speak("I didn't catch that. Please say yes or no.");
        setTimeout(() => {
          startListening();
        }, 2500);
      }
    } else if (!waitingForConfirmation && !capturedName) {
      // Extract name from transcript
      const parsedName = parseFullName(transcript);

      if (parsedName) {
        setCapturedName(parsedName);

        // Confirm with user - spell out the names
        const firstNameSpelled = spellName(parsedName.firstName);
        const lastNameSpelled = spellName(parsedName.lastName);
        const confirmationMessage = `I heard ${parsedName.firstName}, spelled ${firstNameSpelled}, ${parsedName.lastName}, spelled ${lastNameSpelled}. Is that correct? Please say yes or no.`;

        resetTranscript();
        speak(confirmationMessage);
        setWaitingForConfirmation(true);
        setTimeout(() => {
          startListening();
        }, confirmationMessage.length * 50);
      } else if (transcript.trim().split(/\s+/).length === 1) {
        resetTranscript();
        speak("I only heard one name. Please say both your first name and last name.");
        setTimeout(() => {
          startListening();
        }, 3500);
      }
    }
  }, [
    transcript,
    waitingForConfirmation,
    capturedName,
    speak,
    startListening,
    resetTranscript,
    onNameConfirmed,
    onReset,
  ]);

  return {
    startCheckIn,
    isListening,
    isSpeaking,
    isVoiceSupported,
    capturedName,
    waitingForConfirmation,
  };
}
