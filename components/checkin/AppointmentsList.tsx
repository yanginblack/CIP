import { AudioButton } from "@/components/AudioButton";
import { AppointmentsListProps } from "./types";

export function AppointmentsList({
  appointments,
  userInfo,
  onAppointmentSelect,
  onStepChange,
  formatDateTime,
  isSpeaking,
  onToggleAudio,
  isAudioSupported,
}: AppointmentsListProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-300 mb-2">
          Select Your Appointment
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          {userInfo && `Welcome, ${userInfo.firstName} ${userInfo.lastName}`}
        </p>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {appointments.length > 0
            ? `Found ${appointments.length} appointment${
                appointments.length === 1 ? "" : "s"
              }`
            : "No upcoming appointments found"}
        </h3>
        <AudioButton
          isSpeaking={isSpeaking}
          onToggle={onToggleAudio}
          isSupported={isAudioSupported}
        />
      </div>

      <div className="space-y-4" role="list" aria-label="Available appointments">
        {appointments.map((appointment) => (
          <button
            key={appointment.id}
            onClick={() => onAppointmentSelect(appointment)}
            className="w-full p-6 bg-white dark:bg-gray-700 border-2 border-purple-200 dark:border-purple-500 rounded-lg hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-gray-600 transition-colors text-left"
            role="listitem"
            aria-label={`Select appointment on ${formatDateTime(appointment.startUtc)} with ${appointment.staff}${appointment.notes ? `. ${appointment.notes}` : ''}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatDateTime(appointment.startUtc)}
                </p>
                <p className="text-gray-600 dark:text-gray-300">with {appointment.staff}</p>
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
        className="w-full mt-4 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium py-2"
        aria-label="Don't see your appointment? Get help"
      >
        Don&apos;t see your appointment?
      </button>
    </div>
  );
}