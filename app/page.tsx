"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { nameSearchSchema, type NameSearchInput } from "@/lib/validations";
import { useSpeech } from "@/hooks/useSpeech";
import { useAudioCheckIn } from "@/hooks/useAudioCheckIn";
import { SUPPORTED_LANGUAGES, TRANSLATIONS, SupportedLanguage } from "@/lib/languageConfig";
import { ThemeToggle } from "@/components/ThemeToggle";

// Component imports
import { LanguageSelection } from "@/components/checkin/LanguageSelection";
import { ContactInfoStep } from "@/components/checkin/ContactInfoStep";
import { VisitorAssistance } from "@/components/checkin/VisitorAssistance";
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
  const [currentStep, setCurrentStep] = useState<CheckInStep>('language-selection');
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('en');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<{
    firstName: string;
    lastName: string;
  } | null>(null);
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
    onComplete: () => {
      // After audio check-in completes, reset to language selection screen
      console.log("[HomePage] Audio check-in completed, resetting to language selection");
      resetFlow();
    },
  });

  const handleLanguageSelected = (language: SupportedLanguage) => {
    setSelectedLanguage(language);
    if (language === 'en' && currentStep === 'language-selection') {
      // Check if this was clicked from Visitor button
      setCurrentStep('contact-info');
    } else {
      setCurrentStep('contact-info');
    }
  };

  const handleVisitorClick = () => {
    setCurrentStep('visitor-assistance');
  };

  const performSearch = async (data: NameSearchInput, isVoiceCheckIn: boolean = false) => {
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
      setCurrentStep(results.length > 0 ? "appointments" : "help");

      // Auto-announce results for voice check-in ONLY
      if (isVoiceCheckIn === true) {
        setTimeout(() => {
          announceResultsForCheckIn(results);
        }, 500);
      }
    } catch (err: any) {
      console.error("Search error:", err);
      const errorMessage = err.message || "An error occurred";
      setError(errorMessage);
      if (isVoiceCheckIn === true) {
        const langConfig = SUPPORTED_LANGUAGES[selectedLanguage];
        setTimeout(() => {
          speak(
            `Sorry, there was an error searching for appointments. Please try again or contact the front desk.`,
            langConfig.voiceLang
          );
        }, 500);
      }
      setCurrentStep("help");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppointmentSelect = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setCurrentStep("department-routing");
  };

  const handleCheckIn = async () => {
    if (!selectedAppointment) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setCurrentStep("confirmation");
    } catch (err: any) {
      setError("Check-in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetFlow = () => {
    setCurrentStep('language-selection');
    setSelectedLanguage('en');
    setAppointments([]);
    setSelectedAppointment(null);
    setError(null);
    setUserInfo(null);
    setIsSearched(false);
    reset();
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(selectedLanguage === 'en' ? "en-US" : selectedLanguage === 'es' ? "es-ES" : "zh-CN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const announceResults = () => {
    if (appointments.length === 0) {
      speak(
        "No upcoming appointments found. Please check the spelling and try again."
      );
    } else {
      const resultText =
        `Found ${appointments.length} appointment${
          appointments.length === 1 ? "" : "s"
        }. ` +
        appointments
          .map(
            (apt, idx) =>
              `Appointment ${idx + 1}: ${formatDateTime(apt.startUtc)} with ${
                apt.staff
              }. ${apt.notes ? `Notes: ${apt.notes}` : ""}`
          )
          .join(". ");
      speak(resultText);
    }
  };

  const announceResultsForCheckIn = (results: Appointment[]) => {
    const langConfig = SUPPORTED_LANGUAGES[selectedLanguage];
    const t = TRANSLATIONS[selectedLanguage];

    if (results.length === 0) {
      speak(t.noAppointments, langConfig.voiceLang);
    } else {
      const appointmentText = results
        .map((apt, idx) => {
          const dateStr = formatDateTime(apt.startUtc);
          return t.appointmentDetails(idx, dateStr, apt.staff, apt.notes);
        })
        .join(" ");

      const message = `${t.foundAppointments(
        results.length
      )} ${appointmentText} ${t.checkedIn}`;
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
  }, [isSearched, isSpeaking, speak, stop, announceResults]);

  const getCurrentStepContent = () => {
    switch (currentStep) {
      case 'language-selection':
        return (
          <LanguageSelection
            onLanguageSelected={handleLanguageSelected}
            onVisitorClick={handleVisitorClick}
            startCheckIn={startCheckIn}
            isListening={isListening}
            isCheckInSpeaking={isCheckInSpeaking}
            isVoiceSupported={isVoiceSupported}
          />
        );

      case 'contact-info':
        return (
          <ContactInfoStep
            language={selectedLanguage}
            isLoading={isLoading}
            onSubmit={performSearch}
            formRegister={register}
            handleSubmit={handleSubmit}
            formErrors={errors}
            onBack={() => setCurrentStep('language-selection')}
            startCheckIn={startCheckIn}
            isListening={isListening}
            isCheckInSpeaking={isCheckInSpeaking}
            isVoiceSupported={isVoiceSupported}
          />
        );

      case 'visitor-assistance':
        return (
          <VisitorAssistance
            language={selectedLanguage}
            onBack={() => setCurrentStep('language-selection')}
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
            onAgentRequest={() => setCurrentStep("agent-interaction")}
            onStepChange={setCurrentStep}
            onReset={resetFlow}
            isSpeaking={isSpeaking}
            onToggleAudio={isSpeaking ? stop : announceResults}
            isAudioSupported={isSupported}
          />
        );

      default:
        return (
          <LanguageSelection
            onLanguageSelected={handleLanguageSelected}
            onVisitorClick={handleVisitorClick}
            startCheckIn={startCheckIn}
            isListening={isListening}
            isCheckInSpeaking={isCheckInSpeaking}
            isVoiceSupported={isVoiceSupported}
          />
        );
    }
  };

  return (
    <main className="min-h-screen py-8 px-4">
      <ThemeToggle />

      <div className="max-w-4xl mx-auto">
        <div
          className="rounded-2xl shadow-xl p-8 min-h-[600px] flex flex-col justify-center"
          style={{
            background: "var(--container-bg)",
            boxShadow: "0 8px 32px var(--shadow-medium)"
          }}
        >
          {error && (
            <ErrorMessage error={error} onDismiss={() => setError(null)} />
          )}

          {getCurrentStepContent()}
        </div>

        {currentStep !== 'language-selection' && currentStep !== 'visitor-assistance' && (
          <PersistentNavigation
            currentStep={currentStep}
            onReset={resetFlow}
            onAgentRequest={() => setCurrentStep('agent-interaction')}
          />
        )}
      </div>

    </main>
  );
}
