import { DepartmentRoutingProps } from "./types";
import { getUITranslations } from "@/lib/uiTranslations";

export function DepartmentRouting({
  language,
  selectedAppointment,
  isLoading,
  onCheckIn,
  formatDateTime,
  onReset,
  onAgentRequest,
}: DepartmentRoutingProps) {
  const t = getUITranslations(language || 'en');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-200 mb-2">
          {t.appointmentDetailsTitle}
        </h2>
        <p className="text-gray-600 dark:text-gray-200">
          {t.readyToCheckIn}
        </p>
      </div>

      <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg space-y-4" role="region" aria-label="Appointment information">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-semibold text-purple-900 dark:text-purple-200">{t.time}</p>
            <p className="text-gray-700 dark:text-gray-100">{formatDateTime(selectedAppointment.startUtc)}</p>
          </div>
          <div>
            <p className="font-semibold text-purple-900 dark:text-purple-200">{t.staff}</p>
            <p className="text-gray-700 dark:text-gray-100">{selectedAppointment.staff}</p>
          </div>
          <div>
            <p className="font-semibold text-purple-900 dark:text-purple-200">{t.department}</p>
            <p className="text-gray-700 dark:text-gray-100">{selectedAppointment.department || t.general}</p>
          </div>
          <div>
            <p className="font-semibold text-purple-900 dark:text-purple-200">{t.service}</p>
            <p className="text-gray-700 dark:text-gray-100">{selectedAppointment.serviceName || t.consultation}</p>
          </div>
        </div>
      </div>

      <button
        onClick={onCheckIn}
        disabled={isLoading}
        className="w-full bg-green-600 text-white py-4 px-8 text-lg rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-colors font-semibold"
        aria-label={
          isLoading
            ? t.checkingIn
            : t.checkInAria(formatDateTime(selectedAppointment.startUtc), selectedAppointment.staff)
        }
      >
        {isLoading ? t.checkingIn : t.checkIn}
      </button>

      {/* Divider */}
      <hr className="border-t-2 border-gray-300 dark:border-gray-600" />

      {/* Home Page and Call for Staff Buttons */}
      <div className="flex flex-row gap-4">
        <button
          onClick={onReset}
          className="flex-1 flex items-center justify-center gap-3 px-8 py-6 text-2xl font-bold text-light-plum dark:text-lighter-plum bg-white dark:bg-purple-dark border-2 border-light-plum dark:border-lighter-plum rounded-xl hover:bg-light-plum/10 dark:hover:bg-lighter-plum/10 transition-all duration-200 shadow-md hover:shadow-lg"
          aria-label={t.homePageAriaLabel}
        >
          <span className="text-3xl" role="img" aria-label="House">🏠</span>
          <span>{t.homePage}</span>
        </button>

        <button
          onClick={onAgentRequest}
          className="flex-1 flex items-center justify-center gap-3 px-8 py-6 text-2xl font-bold text-light-plum dark:text-lighter-plum bg-white dark:bg-purple-dark border-2 border-light-plum dark:border-lighter-plum rounded-xl hover:bg-light-plum/10 dark:hover:bg-lighter-plum/10 transition-all duration-200 shadow-md hover:shadow-lg"
          aria-label={t.callForStaffAriaLabel}
        >
          <span className="text-3xl" role="img" aria-label="Phone">📞</span>
          <span>{t.callForStaff}</span>
        </button>
      </div>
    </div>
  );
}
