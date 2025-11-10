import { ConfirmationStepProps } from "./types";
import { getUITranslations } from "@/lib/uiTranslations";

export function ConfirmationStep({
  language,
  selectedAppointment,
  onReset,
  formatDateTime,
}: ConfirmationStepProps) {
  const t = getUITranslations(language || 'en');

  return (
    <div className="space-y-6 text-center">
      <div className="text-6xl mb-4" role="img" aria-label="Success checkmark">✓</div>
      <h2 className="text-3xl font-bold text-green-900 dark:text-green-300 mb-2">
        {t.checkInComplete}
      </h2>
      <p className="text-lg text-gray-600 dark:text-gray-200">
        {t.checkInSuccess}
      </p>

      {selectedAppointment && (
        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg" role="status" aria-live="polite">
          <p className="text-green-800 dark:text-green-200">
            {t.appointmentConfirmedDetails(
              selectedAppointment.staff,
              formatDateTime(selectedAppointment.startUtc)
            )}
          </p>
          <p className="text-sm text-green-600 dark:text-green-300 mt-2">
            {t.notificationSent}
          </p>
        </div>
      )}

      <button
        onClick={onReset}
        className="bg-purple-600 text-white py-4 px-8 text-lg rounded-lg hover:bg-purple-700 transition-colors font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
        aria-label={t.homePageAriaLabel}
      >
        {t.done}
      </button>
    </div>
  );
}
