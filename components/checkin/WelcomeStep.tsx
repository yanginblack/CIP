import { MicrophoneIcon } from "@/components/icons";
import { useEffect, useState } from "react";
import { WelcomeStepProps } from "./types";
import { VoiceAssistant } from "./VoiceAssistant";

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
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
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
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-light-plum dark:text-lighter-plum">Welcome to Our Center</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          Experience accessible services designed for independent living. Our compassionate team is dedicated to helping you thrive and maintain your independence.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8 max-w-2xl mx-auto"
        autoComplete="off"
      >
        {/* Name Inputs */}
        <div className="space-y-4">
          <div>
            <input
              {...formRegister("firstName")}
              className="w-full px-6 py-4 text-xl bg-white dark:bg-purple-dark text-gray-900 dark:text-gray-100 border-2 border-gray-300 dark:border-lighter-plum/50 rounded-xl focus:ring-2 focus:ring-light-plum focus:border-transparent transition-all duration-200"
              placeholder="First Name"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="words"
              spellCheck="false"
            />
            {formErrors.firstName && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-2">{formErrors.firstName.message}</p>
            )}
          </div>

          <div>
            <input
              {...formRegister("lastName")}
              className="w-full px-6 py-4 text-xl bg-white dark:bg-purple-dark text-gray-900 dark:text-gray-100 border-2 border-gray-300 dark:border-lighter-plum/50 rounded-xl focus:ring-2 focus:ring-light-plum focus:border-transparent transition-all duration-200"
              placeholder="Last Name"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="words"
              spellCheck="false"
            />
            {formErrors.lastName && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-2">{formErrors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Service Selection */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 text-left">Select a Service:</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className="px-6 py-4 bg-light-plum hover:bg-purple-700 text-white rounded-xl transition-all duration-200 font-semibold text-lg shadow-md hover:shadow-lg"
            >
              Senior Services
            </button>
            <button
              type="button"
              className="px-6 py-4 bg-amber hover:bg-yellow-600 text-white rounded-xl transition-all duration-200 font-semibold text-lg shadow-md hover:shadow-lg"
            >
              Housing Assistance
            </button>
            <button
              type="button"
              className="px-6 py-4 bg-light-plum hover:bg-purple-700 text-white rounded-xl transition-all duration-200 font-semibold text-lg shadow-md hover:shadow-lg"
            >
              Youth Programs
            </button>
            <button
              type="button"
              className="px-6 py-4 bg-lighter-plum hover:bg-purple-500 text-white rounded-xl transition-all duration-200 font-semibold text-lg shadow-md hover:shadow-lg"
            >
              Travel Program
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-light-plum hover:bg-purple-700 text-white py-6 px-8 text-xl font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {isLoading ? "Searching..." : "Check In Now"}
          </button>

          {isVoiceSupported && (
            <button
              type="button"
              onClick={() => setShowVoiceAssistant(true)}
              className="flex items-center justify-center gap-3 px-8 py-6 rounded-xl transition-all duration-200 font-bold text-xl shadow-lg hover:shadow-xl bg-amber hover:bg-yellow-600 text-white"
            >
              <MicrophoneIcon />
              <span>AI Reference</span>
            </button>
          )}

          {/* Cancel Button - appears after delay */}
          {showCancelButton && cancelCheckIn && (
            <button
              type="button"
              onClick={cancelCheckIn}
              className="flex items-center justify-center gap-2 px-6 py-6 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl font-bold"
            >
              <span>✖</span>
              <span>Cancel</span>
            </button>
          )}
        </div>
      </form>

      {/* Voice Assistant Modal */}
      {showVoiceAssistant && (
        <VoiceAssistant onClose={() => setShowVoiceAssistant(false)} />
      )}
    </div>
  );
}
