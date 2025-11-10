import { AudioButton } from "@/components/AudioButton";
import { AppointmentsListProps } from "./types";
import { getUITranslations } from "@/lib/uiTranslations";

export function AppointmentsList({
  language,
  appointments,
  userInfo,
  onAppointmentSelect,
  onStepChange,
  formatDateTime,
  isSpeaking,
  onToggleAudio,
  isAudioSupported,
  onReset,
  onAgentRequest,
}: AppointmentsListProps) {
  const t = getUITranslations(language || 'en');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-purple-400 dark:text-purple-200 mb-2">
          {t.selectYourAppointment}
        </h2>
        <p className="text-gray-400 dark:text-gray-200">
          {userInfo && `${t.foundAppointmentsFor} ${userInfo.firstName} ${userInfo.lastName}`}
        </p>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {appointments.length > 0
            ? t.appointmentsFoundCount(appointments.length)
            : t.noAppointmentsFound}
        </h3>
        <AudioButton
          isSpeaking={isSpeaking}
          onToggle={onToggleAudio}
          isSupported={isAudioSupported}
          playLabel={t.audioPlay}
          stopLabel={t.audioStop}
        />
      </div>

      <div className="space-y-4" role="list" aria-label={t.availableAppointmentsLabel}>
        {appointments.map((appointment) => (
          <button
            key={appointment.id}
            onClick={() => onAppointmentSelect(appointment)}
            className="w-full p-6 bg-white dark:bg-gray-700 border-2 border-purple-200 dark:border-purple-500 rounded-lg hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-gray-600 transition-colors text-left"
            role="listitem"
            aria-label={t.appointmentAriaLabel(
              formatDateTime(appointment.startUtc),
              appointment.staff,
              appointment.notes || undefined
            )}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatDateTime(appointment.startUtc)}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  {t.appointmentWith(appointment.staff)}
                </p>
                {appointment.notes && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{appointment.notes}</p>
                )}
              </div>
              <div className="text-purple-600 dark:text-purple-400" aria-hidden="true">
                →
              </div>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={() => onStepChange('help')}
        className="w-full mt-4 text-purple-400 dark:text-purple-200 hover:text-purple-800 dark:hover:text-purple-300 font-medium py-2"
        aria-label={t.dontSeeAppointmentAria}
      >
        {t.dontSeeAppointment}
      </button>

      {/* Home Page and Call for Staff Buttons */}
      <div className="flex flex-row gap-4 mt-8">
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
