import { MicrophoneIcon } from "@/components/icons";
import { useEffect, useState } from "react";
import { WelcomeStepProps } from "./types";
import { VoiceAssistant } from "./VoiceAssistant";
import { getUITranslations } from "@/lib/uiTranslations";

export function WelcomeStep({
  language,
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
  onReset,
  onAgentRequest,
}: WelcomeStepProps) {
  const t = getUITranslations(language || 'en');
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
        <h1 className="text-4xl font-bold text-light-plum dark:text-lighter-plum">{t.welcomeTitle}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          {t.welcomeDescription}
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8 max-w-2xl mx-auto"
        autoComplete="off"
      >
        {/* Name Inputs Section */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 text-left">{t.inputYourName}</h3>
          <div className="space-y-4">
            {(language === "zh"
              ? (["lastName", "firstName"] as const)
              : (["firstName", "lastName"] as const)
            ).map((field) => (
              <div key={field}>
                <input
                  {...formRegister(field)}
                  className="w-full px-6 py-4 text-xl bg-white dark:bg-purple-dark text-gray-900 dark:text-gray-100 border-2 border-gray-300 dark:border-lighter-plum/50 rounded-xl focus:ring-2 focus:ring-light-plum focus:border-transparent transition-all duration-200"
                  placeholder={field === "firstName" ? t.firstNamePlaceholder : t.lastNamePlaceholder}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="words"
                  spellCheck="false"
                />
                {formErrors[field] && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-2">{formErrors[field]?.message}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Check In Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-light-plum hover:bg-purple-700 text-white py-6 px-8 text-xl font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {isLoading ? t.searching : t.checkInNow}
          </button>

          {/* Cancel Button - appears after delay */}
          {showCancelButton && cancelCheckIn && (
            <button
              type="button"
              onClick={cancelCheckIn}
              className="flex items-center justify-center gap-2 px-6 py-6 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl font-bold"
            >
              <span>✖</span>
              <span>{t.cancel}</span>
            </button>
          )}
        </div>

        {/* Reference to Services Section */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 text-left">{t.referenceToServices}</h3>

          {/* Primary Services Subsection */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 text-left">{t.primaryServices}</h4>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="px-6 py-4 bg-light-plum hover:bg-purple-700 text-white rounded-xl transition-all duration-200 font-semibold text-lg shadow-md hover:shadow-lg"
              >
                {t.seniorServices}
              </button>
              <button
                type="button"
                className="px-6 py-4 bg-amber hover:bg-yellow-600 text-white rounded-xl transition-all duration-200 font-semibold text-lg shadow-md hover:shadow-lg"
              >
                {t.housingAssistance}
              </button>
              <button
                type="button"
                className="px-6 py-4 bg-light-plum hover:bg-purple-700 text-white rounded-xl transition-all duration-200 font-semibold text-lg shadow-md hover:shadow-lg"
              >
                {t.youthPrograms}
              </button>
              <button
                type="button"
                className="px-6 py-4 bg-lighter-plum hover:bg-purple-500 text-white rounded-xl transition-all duration-200 font-semibold text-lg shadow-md hover:shadow-lg"
              >
                {t.travelProgram}
              </button>
            </div>
          </div>

          {/* Additional Services Subsection */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 text-left">{t.checkAdditionalServices}</h4>
            {isVoiceSupported && (
              <button
                type="button"
                onClick={() => setShowVoiceAssistant(true)}
                className="w-full flex items-center justify-center gap-3 px-8 py-6 rounded-xl transition-all duration-200 font-bold text-xl shadow-lg hover:shadow-xl bg-amber hover:bg-yellow-600 text-white"
              >
                <MicrophoneIcon />
                <span>{t.aiReference}</span>
              </button>
            )}
          </div>
        </div>

        {/* Divider */}
        <hr className="border-t-2 border-gray-300 dark:border-gray-600" />

        {/* Home Page and Call for Staff Buttons */}
        <div className="flex flex-row gap-4">
          <button
            type="button"
            onClick={onReset}
            className="flex-1 flex items-center justify-center gap-3 px-8 py-6 text-2xl font-bold text-light-plum dark:text-lighter-plum bg-white dark:bg-purple-dark border-2 border-light-plum dark:border-lighter-plum rounded-xl hover:bg-light-plum/10 dark:hover:bg-lighter-plum/10 transition-all duration-200 shadow-md hover:shadow-lg"
            aria-label={t.homePageAriaLabel}
          >
            <span className="text-3xl" role="img" aria-label="House">🏠</span>
            <span>{t.homePage}</span>
          </button>

          <button
            type="button"
            onClick={onAgentRequest}
            className="flex-1 flex items-center justify-center gap-3 px-8 py-6 text-2xl font-bold text-light-plum dark:text-lighter-plum bg-white dark:bg-purple-dark border-2 border-light-plum dark:border-lighter-plum rounded-xl hover:bg-light-plum/10 dark:hover:bg-lighter-plum/10 transition-all duration-200 shadow-md hover:shadow-lg"
            aria-label={t.callForStaffAriaLabel}
          >
            <span className="text-3xl" role="img" aria-label="Phone">📞</span>
            <span>{t.callForStaff}</span>
          </button>
        </div>
      </form>

      {/* Voice Assistant Modal */}
      {showVoiceAssistant && (
        <VoiceAssistant onClose={() => setShowVoiceAssistant(false)} />
      )}
    </div>
  );
}
