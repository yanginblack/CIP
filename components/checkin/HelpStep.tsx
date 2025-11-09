import { AudioButton } from "@/components/AudioButton";
import { HelpStepProps } from "./types";

export function HelpStep({
  onAgentRequest,
  isSpeaking,
  onToggleAudio,
  isAudioSupported
}: HelpStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-900 dark:text-red-400 mb-2">
          Need Help?
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          We couldn&apos;t find your appointment
        </p>
      </div>

      {isSpeaking !== undefined && onToggleAudio && isAudioSupported !== undefined && (
        <div className="flex justify-end">
          <AudioButton
            isSpeaking={isSpeaking}
            onToggle={onToggleAudio}
            isSupported={isAudioSupported}
          />
        </div>
      )}

      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg space-y-4" role="alert">
        <p className="text-yellow-800 dark:text-yellow-200">
          Don&apos;t worry! Click the button below and our front desk will assist you.
        </p>
      </div>

      <button
        onClick={onAgentRequest}
        className="w-full bg-purple-600 text-white py-4 px-8 text-lg rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
        aria-label="Call for staff assistance"
      >
        Call for Staff
      </button>
    </div>
  );
}