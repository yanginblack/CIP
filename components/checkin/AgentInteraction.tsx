export function AgentInteraction() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-blue-900 mb-2">
          Agent Support
        </h2>
        <p className="text-gray-600">
          An agent will assist you shortly
        </p>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg">
        <p className="text-blue-800 mb-4">
          Your request for assistance has been sent to our front desk.
        </p>
        <p className="text-sm text-blue-600">
          Please wait, and someone will be with you momentarily.
        </p>
      </div>
    </div>
  );
}