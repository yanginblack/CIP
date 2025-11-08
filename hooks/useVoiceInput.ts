import { useState, useEffect, useCallback, useRef } from "react";

export function useVoiceInput() {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
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
      recognitionRef.current.lang = "en-US";

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
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) return;

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
        } catch (error) {
          console.error("Failed to start recognition:", error);
          setIsListening(false);
        }
      }, 100);
    } catch (error) {
      console.error("Failed to start recognition:", error);
      setIsListening(false);
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript: () => setTranscript(""),
  };
}
