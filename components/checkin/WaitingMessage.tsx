import { SupportedLanguage } from "@/lib/languageConfig";
import { getUITranslations } from "@/lib/uiTranslations";

interface WaitingMessageProps {
  language: SupportedLanguage;
}

export function WaitingMessage({ language }: WaitingMessageProps) {
  const t = getUITranslations(language);

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
      <p className="text-blue-800 dark:text-blue-200 mb-4">
        {t.waitingMessagePrimary}
      </p>
      <p className="text-sm text-blue-600 dark:text-blue-300">
        {t.waitingMessageSecondary}
      </p>
    </div>
  );
}
