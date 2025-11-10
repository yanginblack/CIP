"use client";

import { WaitingMessage } from "./WaitingMessage";
import { AssistantSection } from "./AssistantSection";
import { SupportedLanguage } from "@/lib/languageConfig";
import { getUITranslations } from "@/lib/uiTranslations";

interface AgentInteractionProps {
  language?: SupportedLanguage;
  onReset: () => void;
}

export function AgentInteraction({ language = "en", onReset }: AgentInteractionProps) {
  const t = getUITranslations(language);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-200 mb-2">
          {t.agentSupport}
        </h2>
        <p className="text-gray-600 dark:text-gray-200">
          {t.agentWillAssist}
        </p>
      </div>

      {/* Waiting Message */}
      <WaitingMessage language={language} />

      {/* Online Assistant Section */}
      <AssistantSection language={language} />

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
