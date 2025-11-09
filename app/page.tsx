"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { nameSearchSchema, type NameSearchInput } from "@/lib/validations";
import { useSpeech } from "@/hooks/useSpeech";
import { useAudioCheckIn } from "@/hooks/useAudioCheckIn";

// Component imports
import { WelcomeStep } from "@/components/checkin/WelcomeStep";
import { AppointmentsList } from "@/components/checkin/AppointmentsList";
import { DepartmentRouting } from "@/components/checkin/DepartmentRouting";
import { AgentInteraction } from "@/components/checkin/AgentInteraction";
import { ConfirmationStep } from "@/components/checkin/ConfirmationStep";
import { HelpStep } from "@/components/checkin/HelpStep";
import { PersistentNavigation } from "@/components/checkin/PersistentNavigation";
import { ErrorMessage } from "@/components/shared/ErrorMessage";

// Types
import { Appointment, CheckInStep } from "@/components/checkin/types";

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState<CheckInStep>('welcome');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<{ firstName: string; lastName: string } | null>(null);
  const [isSearched, setIsSearched] = useState(false);

  const { speak, stop, isSpeaking, isSupported } = useSpeech();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<NameSearchInput>({
    resolver: zodResolver(nameSearchSchema),
  });

  // Audio check-in hook
  const {
    startCheckIn,
    isListening,
    isSpeaking: isCheckInSpeaking,
    isVoiceSupported,
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
    setUserInfo(data);
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
      setCurrentStep(results.length > 0 ? 'appointments' : 'help');

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
        setTimeout(() => {
          speak(`Sorry, there was an error searching for appointments. Please try again or contact the front desk.`);
        }, 500);
      }
      setCurrentStep('help');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppointmentSelect = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setCurrentStep('department-routing');
  };

  const handleCheckIn = async () => {
    if (!selectedAppointment) return;

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCurrentStep('confirmation');
    } catch (err: any) {
      setError("Check-in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetFlow = () => {
    setCurrentStep('welcome');
    setAppointments([]);
    setSelectedAppointment(null);
    setError(null);
    setUserInfo(null);
    setIsSearched(false);
    reset();
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
    if (results.length === 0) {
      speak("No upcoming appointments found. Please check with the front desk.");
    } else {
      const appointmentText = results.map((apt, idx) => {
        const dateStr = formatDateTime(apt.startUtc);
        return `Appointment ${idx + 1}: ${dateStr} with ${apt.staff}. ${apt.notes ? `Notes: ${apt.notes}. ` : ""}`;
      }).join(". ");

      const message = `Found ${results.length} appointment${results.length === 1 ? "" : "s"}. ${appointmentText}. You are now checked in. Thank you!`;
      speak(message);
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
  }, [isSearched, isSpeaking, appointments, speak, stop]);

  const getCurrentStepContent = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <WelcomeStep
            isLoading={isLoading}
            onSubmit={performSearch}
            startCheckIn={startCheckIn}
            isListening={isListening}
            isCheckInSpeaking={isCheckInSpeaking}
            isVoiceSupported={isVoiceSupported}
            formRegister={register}
            handleSubmit={handleSubmit}
            formErrors={errors}
            onStepChange={setCurrentStep}
            onReset={resetFlow}
          />
        );
      case 'appointments':
        return (
          <AppointmentsList
            appointments={appointments}
            userInfo={userInfo}
            onAppointmentSelect={handleAppointmentSelect}
            onStepChange={setCurrentStep}
            formatDateTime={formatDateTime}
            isSpeaking={isSpeaking}
            onToggleAudio={isSpeaking ? stop : announceResults}
            isAudioSupported={isSupported}
            onReset={resetFlow}
          />
        );
      case 'department-routing':
        return selectedAppointment ? (
          <DepartmentRouting
            selectedAppointment={selectedAppointment}
            isLoading={isLoading}
            onCheckIn={handleCheckIn}
            formatDateTime={formatDateTime}
            onStepChange={setCurrentStep}
            onReset={resetFlow}
          />
        ) : null;
      case 'agent-interaction':
        return <AgentInteraction />;
      case 'confirmation':
        return (
          <ConfirmationStep
            selectedAppointment={selectedAppointment}
            onReset={resetFlow}
            formatDateTime={formatDateTime}
            onStepChange={setCurrentStep}
          />
        );
      case 'help':
        return (
          <HelpStep
            onAgentRequest={() => setCurrentStep('agent-interaction')}
            onStepChange={setCurrentStep}
            onReset={resetFlow}
          />
        );
      default:
        return (
          <WelcomeStep
            isLoading={isLoading}
            onSubmit={performSearch}
            startCheckIn={startCheckIn}
            isListening={isListening}
            isCheckInSpeaking={isCheckInSpeaking}
            isVoiceSupported={isVoiceSupported}
            formRegister={register}
            handleSubmit={handleSubmit}
            formErrors={errors}
            onStepChange={setCurrentStep}
            onReset={resetFlow}
          />
        );
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-blue-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 min-h-[600px] flex flex-col justify-center">
          {error && (
            <ErrorMessage
              error={error}
              onDismiss={() => setError(null)}
            />
          )}

          {getCurrentStepContent()}
        </div>

        <PersistentNavigation
          currentStep={currentStep}
          onReset={resetFlow}
          onAgentRequest={() => setCurrentStep('agent-interaction')}
        />
      </div>
    </main>
  );
}