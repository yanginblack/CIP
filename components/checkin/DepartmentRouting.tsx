import { DepartmentRoutingProps } from "./types";

export function DepartmentRouting({
  selectedAppointment,
  isLoading,
  onCheckIn,
  formatDateTime,
}: DepartmentRoutingProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-300 mb-2">
          Appointment Details
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Ready to check in for your appointment?
        </p>
      </div>

      <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg space-y-4" role="region" aria-label="Appointment information">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-semibold text-purple-900 dark:text-purple-300">Time</p>
            <p className="text-gray-700 dark:text-gray-200">{formatDateTime(selectedAppointment.startUtc)}</p>
          </div>
          <div>
            <p className="font-semibold text-purple-900 dark:text-purple-300">Staff</p>
            <p className="text-gray-700 dark:text-gray-200">{selectedAppointment.staff}</p>
          </div>
          <div>
            <p className="font-semibold text-purple-900 dark:text-purple-300">Department</p>
            <p className="text-gray-700 dark:text-gray-200">{selectedAppointment.department || "General"}</p>
          </div>
          <div>
            <p className="font-semibold text-purple-900 dark:text-purple-300">Service</p>
            <p className="text-gray-700 dark:text-gray-200">{selectedAppointment.serviceName || "Consultation"}</p>
          </div>
        </div>
      </div>

      <button
        onClick={onCheckIn}
        disabled={isLoading}
        className="w-full bg-green-600 text-white py-4 px-8 text-lg rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-colors font-semibold"
        aria-label={isLoading ? "Checking in, please wait" : `Check in for appointment on ${formatDateTime(selectedAppointment.startUtc)} with ${selectedAppointment.staff}`}
      >
        {isLoading ? "Checking In..." : "Check In"}
      </button>
    </div>
  );
}