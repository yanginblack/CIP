import { ConfirmationStepProps } from "./types";

export function ConfirmationStep({
  selectedAppointment,
  onReset,
  formatDateTime,
}: ConfirmationStepProps) {
  return (
    <div className="space-y-6 text-center">
      <div className="text-6xl mb-4">✓</div>
      <h2 className="text-3xl font-bold text-green-900 mb-2">
        Check-in Complete!
      </h2>
      <p className="text-lg text-gray-600">
        You have successfully checked in for your appointment
      </p>

      {selectedAppointment && (
        <div className="bg-green-50 p-6 rounded-lg">
          <p className="text-green-800">
            Your appointment with {selectedAppointment.staff} at {formatDateTime(selectedAppointment.startUtc)} is confirmed.
          </p>
          <p className="text-sm text-green-600 mt-2">
            A notification has been sent to the front desk.
          </p>
        </div>
      )}

      <button
        onClick={onReset}
        className="bg-purple-600 text-white py-4 px-8 text-lg rounded-lg hover:bg-purple-700 transition-colors"
      >
        Done
      </button>
    </div>
  );
}