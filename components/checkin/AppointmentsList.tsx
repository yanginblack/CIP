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
        <h2 className="text-2xl font-bold text-purple-900 mb-2">
          Select Your Appointment
        </h2>
        <p className="text-gray-600">
          {userInfo && `Welcome, ${userInfo.firstName} ${userInfo.lastName}`}
        </p>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900">
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

      <div className="space-y-4">
        {appointments.map((appointment) => (
          <button
            key={appointment.id}
            onClick={() => onAppointmentSelect(appointment)}
            className="w-full p-6 bg-white border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors text-left"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-900">
                  {formatDateTime(appointment.startUtc)}
                </p>
                <p className="text-gray-600">with {appointment.staff}</p>
                {appointment.notes && (
                  <p className="text-sm text-gray-500 mt-2">{appointment.notes}</p>
                )}
              </div>
              <div className="text-purple-600">
                →
              </div>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={() => onStepChange('help')}
        className="w-full mt-4 text-purple-600 hover:text-purple-800"
      >
        Don&apos;t see your appointment?
      </button>
    </div>
  );
}