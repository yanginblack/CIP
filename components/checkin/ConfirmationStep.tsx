import { ConfirmationStepProps } from "./types";

export function ConfirmationStep({
  selectedAppointment,
  onReset,
  formatDateTime,
}: ConfirmationStepProps) {
  return (
    <div className="space-y-6 text-center">
      <div className="text-6xl mb-4" role="img" aria-label="Success checkmark">✓</div>
      <h2 className="text-3xl font-bold text-green-900 dark:text-green-400 mb-2">
        Check-in Complete!
      </h2>
      <p className="text-lg text-gray-600 dark:text-gray-300">
        You have successfully checked in for your appointment
      </p>

      {selectedAppointment && (
        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg" role="status" aria-live="polite">
          <p className="text-green-800 dark:text-green-200">
            Your appointment with {selectedAppointment.staff} at {formatDateTime(selectedAppointment.startUtc)} is confirmed.
          </p>
          <p className="text-sm text-green-600 dark:text-green-300 mt-2">
            A notification has been sent to the front desk.
          </p>
        </div>
      )}

      <button
        onClick={onReset}
        className="bg-purple-600 text-white py-4 px-8 text-lg rounded-lg hover:bg-purple-700 transition-colors font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
        aria-label="Finish check-in and return to home"
      >
        Done
      </button>
    </div>
  );
}