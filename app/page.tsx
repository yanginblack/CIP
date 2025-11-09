"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { nameSearchSchema, type NameSearchInput } from "@/lib/validations";
import { useSpeech } from "@/hooks/useSpeech";
import { useAudioCheckIn } from "@/hooks/useAudioCheckIn";
import { AudioButton } from "@/components/AudioButton";
import { MicrophoneIcon } from "@/components/icons";
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from "@/lib/languageConfig";

type Appointment = {
  id: string;
  startUtc: string;
  staff: string;
  notes: string | null;
};

export default function HomePage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isSearched, setIsSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { speak, stop, isSpeaking, isSupported } = useSpeech();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<NameSearchInput>({
    resolver: zodResolver(nameSearchSchema),
  });

  // Audio check-in hook
  const {
    startCheckIn,
    isListening,
    isSpeaking: isCheckInSpeaking,
    isVoiceSupported,
    selectedLanguage,
  } = useAudioCheckIn({
    onNameConfirmed: (name) => {
      setValue("firstName", name.firstName);
      setValue("lastName", name.lastName);
      performSearch(name, true);
    },
    onReset: () => {
      setValue("firstName", "");
      setValue("lastName", "");
    },
  });

  const performSearch = async (data: NameSearchInput, isVoiceCheckIn = false) => {
    setIsLoading(true);
    setError(null);
    setIsSearched(false);

    try {
      console.log("Searching for:", data);
      const response = await fetch("/api/appointments/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || "Failed to search appointments";
        console.error("Search failed:", errorMessage, errorData);
        throw new Error(errorMessage);
      }

      const results = await response.json();
      console.log("Search results:", results);
      setAppointments(results);
      setIsSearched(true);

      // Auto-announce results for voice check-in
      if (isVoiceCheckIn) {
        setTimeout(() => {
          announceResultsForCheckIn(results);
        }, 500);
      }
    } catch (err: any) {
      console.error("Search error:", err);
      const errorMessage = err.message || "An error occurred";
      setError(errorMessage);
      if (isVoiceCheckIn) {
        const langConfig = SUPPORTED_LANGUAGES[selectedLanguage];
        setTimeout(() => {
          speak(`Sorry, there was an error searching for appointments. Please try again or contact the front desk.`, langConfig.voiceLang);
        }, 500);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: NameSearchInput) => {
    await performSearch(data, false);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const announceResults = () => {
    if (appointments.length === 0) {
      speak("No upcoming appointments found. Please check the spelling and try again.");
    } else {
      const resultText = `Found ${appointments.length} appointment${appointments.length === 1 ? "" : "s"}. ` +
        appointments.map((apt, idx) =>
          `Appointment ${idx + 1}: ${formatDateTime(apt.startUtc)} with ${apt.staff}. ${apt.notes ? `Notes: ${apt.notes}` : ""}`
        ).join(". ");
      speak(resultText);
    }
  };

  const announceResultsForCheckIn = (results: Appointment[]) => {
    const langConfig = SUPPORTED_LANGUAGES[selectedLanguage];
    const t = TRANSLATIONS[selectedLanguage];

    if (results.length === 0) {
      speak(t.noAppointments, langConfig.voiceLang);
    } else {
      const appointmentText = results.map((apt, idx) => {
        const dateStr = formatDateTime(apt.startUtc);
        return t.appointmentDetails(idx, dateStr, apt.staff, apt.notes);
      }).join(" ");

      const message = `${t.foundAppointments(results.length)} ${appointmentText} ${t.checkedIn}`;
      speak(message, langConfig.voiceLang);
    }
  };

  // Keyboard shortcut: Ctrl+R or Cmd+R to read results
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "r" && isSearched) {
        e.preventDefault();
        if (isSpeaking) {
          stop();
        } else {
          announceResults();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearched, isSpeaking, appointments]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Find Your Appointments
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  {...register("firstName")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  {...register("lastName")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              {isVoiceSupported && (
                <button
                  type="button"
                  onClick={startCheckIn}
                  disabled={isListening || isSpeaking}
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
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "Searching..." : "Search Appointments"}
              </button>
            </div>
          </form>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {isSearched && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {appointments.length > 0
                    ? `Found ${appointments.length} appointment${
                        appointments.length === 1 ? "" : "s"
                      }`
                    : "No upcoming appointments found"}
                </h2>
                <AudioButton
                  isSpeaking={isSpeaking}
                  onToggle={isSpeaking ? stop : announceResults}
                  isSupported={isSupported}
                />
              </div>

              {appointments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Staff
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {appointments.map((appointment) => (
                        <tr key={appointment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDateTime(appointment.startUtc)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {appointment.staff}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {appointment.notes || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No appointments found for this name.</p>
                  <p className="text-sm mt-2">
                    Please check the spelling and try again.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
