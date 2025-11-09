import { MicrophoneIcon } from "@/components/icons";
import { WelcomeStepProps } from "./types";

export function WelcomeStep({
  isLoading,
  onSubmit,
  startCheckIn,
  isListening = false,
  isCheckInSpeaking = false,
  isVoiceSupported = false,
  formRegister,
  handleSubmit,
  formErrors,
}: WelcomeStepProps) {
  return (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-purple-900">
          Welcome
        </h1>
        <p className="text-lg text-gray-600">
          Please enter your name to check in
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md mx-auto">
        <div className="space-y-4">
          <input
            {...formRegister("firstName")}
            className="w-full px-6 py-4 text-lg border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="First Name"
          />
          {formErrors.firstName && (
            <p className="text-red-600 text-sm">{formErrors.firstName.message}</p>
          )}

          <input
            {...formRegister("lastName")}
            className="w-full px-6 py-4 text-lg border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Last Name"
          />
          {formErrors.lastName && (
            <p className="text-red-600 text-sm">{formErrors.lastName.message}</p>
          )}
        </div>

        <div className="flex gap-3">
          {isVoiceSupported && startCheckIn && (
            <button
              type="button"
              onClick={startCheckIn}
              disabled={isListening || isCheckInSpeaking}
              className={`flex items-center justify-center gap-2 px-6 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                isListening
                  ? "bg-red-600 hover:bg-red-700 focus:ring-red-500 animate-pulse"
                  : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
              } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label="Audio check-in"
            >
              <MicrophoneIcon />
              <span>{isListening ? "Listening..." : "Audio Check-in"}</span>
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-purple-600 text-white py-4 px-8 text-lg rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 transition-colors"
          >
            {isLoading ? "Searching..." : "Continue"}
          </button>
        </div>
      </form>
    </div>
  );
}