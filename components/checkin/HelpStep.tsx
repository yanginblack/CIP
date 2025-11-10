import { AudioButton } from "@/components/AudioButton";
import { getUITranslations } from "@/lib/uiTranslations";
import { HelpStepProps } from "./types";

export function HelpStep({
  language = "en",
  onAgentRequest,
  isSpeaking,
  onToggleAudio,
  isAudioSupported,
  onReset,
}: HelpStepProps) {
  const t = getUITranslations(language);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-900 dark:text-red-200 mb-2">
          {t.needHelp}
        </h2>
        <p className="text-gray-600 dark:text-gray-200">
          {t.couldNotFind}
        </p>
      </div>

      {isSpeaking !== undefined && onToggleAudio && isAudioSupported !== undefined && (
        <div className="flex justify-end">
          <AudioButton
            isSpeaking={isSpeaking}
            onToggle={onToggleAudio}
            isSupported={isAudioSupported}
            playLabel={t.audioPlay}
            stopLabel={t.audioStop}
          />
        </div>
      )}

      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg space-y-4" role="alert">
        <p className="text-yellow-800 dark:text-yellow-200">
          {t.dontWorry}
        </p>
      </div>

      <button
        onClick={onAgentRequest}
        className="w-full bg-purple-600 text-white py-4 px-8 text-lg rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
        aria-label={t.callForStaffAriaLabel}
      >
        {t.callForStaff}
      </button>

      {/* Home Page Button */}
      <button
        onClick={onReset}
        className="w-full flex items-center justify-center gap-3 px-8 py-6 text-2xl font-bold text-light-plum dark:text-lighter-plum bg-white dark:bg-purple-dark border-2 border-light-plum dark:border-lighter-plum rounded-xl hover:bg-light-plum/10 dark:hover:bg-lighter-plum/10 transition-all duration-200 shadow-md hover:shadow-lg"
        aria-label={t.homePageAriaLabel}
      >
        <span className="text-3xl" role="img" aria-label="House">🏠</span>
        <span>{t.homePage}</span>
      </button>
    </div>
  );
}
