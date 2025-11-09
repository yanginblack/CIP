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
        <h2 className="text-2xl font-bold text-purple-900 mb-2">
          Appointment Details
        </h2>
        <p className="text-gray-600">
          Ready to check in for your appointment?
        </p>
      </div>

      <div className="bg-purple-50 p-6 rounded-lg space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-semibold text-purple-900">Time</p>
            <p className="text-gray-700">{formatDateTime(selectedAppointment.startUtc)}</p>
          </div>
          <div>
            <p className="font-semibold text-purple-900">Staff</p>
            <p className="text-gray-700">{selectedAppointment.staff}</p>
          </div>
          <div>
            <p className="font-semibold text-purple-900">Department</p>
            <p className="text-gray-700">{selectedAppointment.department || "General"}</p>
          </div>
          <div>
            <p className="font-semibold text-purple-900">Service</p>
            <p className="text-gray-700">{selectedAppointment.serviceName || "Consultation"}</p>
          </div>
        </div>
      </div>

      <button
        onClick={onCheckIn}
        disabled={isLoading}
        className="w-full bg-green-600 text-white py-4 px-8 text-lg rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
      >
        {isLoading ? "Checking In..." : "Check In"}
      </button>
    </div>
  );
}