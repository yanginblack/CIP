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
    <div className="fixed bottom-20 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-8 shadow-lg z-50">
      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        <button
          onClick={onReset}
          className="w-full flex items-center justify-center gap-3 px-8 py-6 text-2xl font-bold text-purple-700 dark:text-purple-300 bg-white dark:bg-gray-700 hover:bg-purple-50 dark:hover:bg-gray-600 border-2 border-purple-300 dark:border-purple-500 rounded-2xl hover:border-purple-400 transition-all duration-200 shadow-md hover:shadow-xl"
          aria-label="Go to home page"
        >
          <span className="text-3xl" role="img" aria-label="House">🏠</span>
          <span>Home Page</span>
        </button>
        <button
          onClick={onAgentRequest}
          className="w-full flex items-center justify-center gap-3 px-8 py-6 text-2xl font-bold text-purple-700 dark:text-purple-300 bg-white dark:bg-gray-700 hover:bg-purple-50 dark:hover:bg-gray-600 border-2 border-purple-300 dark:border-purple-500 rounded-2xl hover:border-purple-400 transition-all duration-200 shadow-md hover:shadow-xl"
          aria-label="Call for staff assistance"
        >
          <span className="text-3xl" role="img" aria-label="Phone">📞</span>
          <span>Call for Staff</span>
        </button>
      </div>
    </div>
  );
}