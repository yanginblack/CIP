import { useState, useEffect, useCallback, useRef } from "react";

export function useVoiceInput(initialLang: string = "en-US") {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [language, setLanguage] = useState(initialLang);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language;

      recognitionRef.current.onresult = (event: any) => {
        const result = event.results[0][0].transcript;
        setTranscript(result);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language]);

  // Update recognition language when language changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
    }
  }, [language]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) return;

    console.log(`[VoiceInput] Starting to listen with language: ${recognitionRef.current.lang}`);

    try {
      setTranscript("");
      // Stop any existing recognition before starting new one
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore errors if already stopped
      }

      // Small delay to ensure previous recognition has stopped
      setTimeout(() => {
        try {
          recognitionRef.current.start();
          setIsListening(true);
          console.log("[VoiceInput] ✅ Recognition started successfully");
        } catch (error) {
          console.error("[VoiceInput] ❌ Failed to start recognition:", error);
          setIsListening(false);
        }
      }, 100);
    } catch (error) {
      console.error("[VoiceInput] ❌ Failed to start recognition:", error);
      setIsListening(false);
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const changeLanguage = useCallback((newLang: string) => {
    setLanguage(newLang);
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    language,
    startListening,
    stopListening,
    changeLanguage,
    resetTranscript: () => setTranscript(""),
  };
}
