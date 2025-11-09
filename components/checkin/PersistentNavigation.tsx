import { PersistentNavigationProps } from "./types";

export function PersistentNavigation({
  currentStep,
  onReset,
  onAgentRequest,
}: PersistentNavigationProps) {
  // Don't show on welcome or confirmation screens
  if (currentStep === 'welcome' || currentStep === 'confirmation') {
    return null;
  }

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg flex justify-center space-x-4">
      <button
        onClick={onReset}
        className="px-6 py-3 text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors font-medium"
      >
        🏠 Home
      </button>
      <button
        onClick={onAgentRequest}
        className="px-6 py-3 text-blue-700 bg-white hover:bg-blue-50 border border-blue-300 rounded-lg hover:border-blue-400 transition-colors font-medium"
      >
        💬 Talk to Agent
      </button>
    </div>
  );
}