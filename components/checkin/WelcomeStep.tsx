import { MicrophoneIcon } from "@/components/icons";
import { useEffect, useState } from "react";
import { WelcomeStepProps } from "./types";

export function WelcomeStep({
  isLoading,
  onSubmit,
  startCheckIn,
  cancelCheckIn,
  isListening = false,
  isCheckInSpeaking = false,
  isVoiceSupported = false,
  formRegister,
  handleSubmit,
  formErrors,
}: WelcomeStepProps) {
  const [showCancelButton, setShowCancelButton] = useState(false);
  const [showListeningText, setShowListeningText] = useState(false);
  const [disableButton, setDisableButton] = useState(false);
  // Handle cancel button visibility with 2-second delay
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isListening || isCheckInSpeaking) {
      // Show cancel button after 2 seconds
      timeoutId = setTimeout(() => {
        setShowCancelButton(true);
      }, 2000);
    } else {
      // Hide cancel button immediately when audio stops
      setShowCancelButton(false);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isListening, isCheckInSpeaking]);

  // Handle "Listening..." text with delay
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isListening || isCheckInSpeaking) {
      // Show "Listening..." text after 4 seconds (longer delay for text)
      timeoutId = setTimeout(() => {
        setShowListeningText(true);
      }, 4000);
    } else {
      // Hide "Listening..." text immediately when audio stops
      setShowListeningText(false);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isListening, isCheckInSpeaking]);

  // Handle button disable state - disable immediately, re-enable with delay
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isListening || isCheckInSpeaking) {
      // Disable button immediately when audio starts
      setDisableButton(true);
    } else {
      // Re-enable button with 1-second delay after audio stops
      timeoutId = setTimeout(() => {
        setDisableButton(false);
      }, 1000);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isListening, isCheckInSpeaking]);

  // ESC key support for canceling audio
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "Escape" &&
        (isListening || isCheckInSpeaking) &&
        cancelCheckIn
      ) {
        e.preventDefault();
        cancelCheckIn();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isListening, isCheckInSpeaking, cancelCheckIn]);

  return (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-purple-900 dark:text-purple-300">Welcome</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Please enter your name to check in
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 max-w-md mx-auto"
        autoComplete="off"
      >
        <div className="space-y-4">
          <input
            {...formRegister("firstName")}
            className="w-full px-6 py-4 text-lg border-2 border-purple-300 dark:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="First Name"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          {formErrors.firstName && (
            <p className="text-red-600 text-sm">
              {formErrors.firstName.message}
            </p>
          )}

          <input
            {...formRegister("lastName")}
            className="w-full px-6 py-4 text-lg border-2 border-purple-300 dark:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Last Name"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          {formErrors.lastName && (
            <p className="text-red-600 text-sm">
              {formErrors.lastName.message}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          {isVoiceSupported && (
            <div className="flex gap-2">
              {/* Green Audio Check-in Button - always visible when voice supported */}
              {startCheckIn && (
                <button
                  type="button"
                  onClick={startCheckIn}
                  disabled={disableButton}
                  className={`flex items-center justify-center gap-2 px-6 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors text-white ${
                    disableButton
                      ? "bg-green-400 cursor-not-allowed opacity-75 animate-pulse"
                      : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                  }`}
                  aria-label="Start audio check-in"
                >
                  <MicrophoneIcon />
                  <span>{showListeningText ? "Listening..." : "Audio Check-in"}</span>
                </button>
              )}

              {/* Red Cancel Button - appears after 2-second delay when audio is active */}
              {showCancelButton && cancelCheckIn && (
                <button
                  type="button"
                  onClick={cancelCheckIn}
                  className="flex items-center justify-center gap-2 px-6 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white"
                  aria-label="Cancel audio check-in"
                >
                  <span>✖</span>
                  <span>Cancel</span>
                </button>
              )}
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-purple-600 text-white py-4 px-8 text-lg rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 transition-colors"
          >
            {isLoading ? "Searching..." : "Continue"}
          </button>
        </div>
      </form>
    </div>
  );
}
