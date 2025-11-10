"use client";

import { MicrophoneIcon } from "@/components/icons";
import { SupportedLanguage, TRANSLATIONS } from "@/lib/languageConfig";
import { getUITranslations } from "@/lib/uiTranslations";
import { BaseStepProps } from "./types";

interface ContactInfoStepProps extends BaseStepProps {
  language: SupportedLanguage;
  isLoading: boolean;
  onSubmit: (data: { firstName: string; lastName: string }) => void;
  formRegister: any;
  handleSubmit: any;
  formErrors: any;
  onBack: () => void;
  startCheckIn?: () => void;
  isListening?: boolean;
  isCheckInSpeaking?: boolean;
  isVoiceSupported?: boolean;
}

export function ContactInfoStep({
  language,
  isLoading,
  onSubmit,
  formRegister,
  handleSubmit,
  formErrors,
  onBack,
  startCheckIn,
  isListening = false,
  isCheckInSpeaking = false,
  isVoiceSupported = false,
  onReset,
  onAgentRequest,
}: ContactInfoStepProps) {
  const t = TRANSLATIONS[language];
  const ui = getUITranslations(language);

  // Get welcome text based on language
  const welcomeText = {
    en: "Please enter your name",
    es: "Por favor ingrese su nombre",
    zh: "请输入您的姓名"
  }[language];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
          {welcomeText}
        </h2>
      </div>

      {/* Voice Assistance Button */}
      {isVoiceSupported && startCheckIn && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={startCheckIn}
            disabled={isListening || isCheckInSpeaking}
            className="px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center gap-3 disabled:opacity-50"
            style={{
              background: isListening
                ? "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)"
                : "var(--submit-btn-bg)",
              color: "#ffffff",
              boxShadow: "0 4px 12px var(--shadow-medium)"
            }}
          >
            <MicrophoneIcon />
            <span>{isListening ? (language === "en" ? "Listening..." : language === "es" ? "Escuchando..." : "听...") : (language === "en" ? "Voice Assistance" : language === "es" ? "Asistencia de Voz" : "语音助手")}</span>
          </button>
        </div>
      )}

      {/* Manual Entry Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md mx-auto">
        <div className="space-y-4">
          <div>
            <input
              {...formRegister("firstName")}
              className="w-full px-6 py-4 text-lg rounded-lg focus:outline-none focus:ring-2 transition-all"
              style={{
                background: "var(--input-bg)",
                border: `2px solid var(--input-border)`,
                color: "var(--text-primary)"
              }}
              placeholder={language === "en" ? "First Name" : language === "es" ? "Nombre" : "名"}
            />
            {formErrors.firstName && (
              <p className="text-red-600 text-sm mt-1">{formErrors.firstName.message}</p>
            )}
          </div>

          <div>
            <input
              {...formRegister("lastName")}
              className="w-full px-6 py-4 text-lg rounded-lg focus:outline-none focus:ring-2 transition-all"
              style={{
                background: "var(--input-bg)",
                border: `2px solid var(--input-border)`,
                color: "var(--text-primary)"
              }}
              placeholder={language === "en" ? "Last Name" : language === "es" ? "Apellido" : "姓"}
            />
            {formErrors.lastName && (
              <p className="text-red-600 text-sm mt-1">{formErrors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 px-6 py-4 text-lg rounded-lg font-semibold transition-all duration-300 hover:scale-105"
            style={{
              background: "transparent",
              border: "2px solid var(--primary-light)",
              color: "var(--primary-light)"
            }}
          >
            {language === "en" ? "Back" : language === "es" ? "Atrás" : "返回"}
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-6 py-4 text-lg rounded-lg font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50"
            style={{
              background: "var(--submit-btn-bg)",
              color: "#ffffff",
              boxShadow: "0 4px 12px var(--shadow-medium)"
            }}
          >
            {isLoading
              ? (language === "en" ? "Searching..." : language === "es" ? "Buscando..." : "搜索中...")
              : (language === "en" ? "Search Appointments" : language === "es" ? "Buscar Citas" : "搜索预约")}
          </button>
        </div>

        {/* Divider */}
        <hr className="border-t-2 border-gray-300 dark:border-gray-600" />

        {/* Home Page and Call for Staff Buttons */}
        <div className="flex flex-row gap-4">
          <button
            type="button"
            onClick={onReset}
            className="flex-1 flex items-center justify-center gap-3 px-8 py-6 text-2xl font-bold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
            style={{
              color: "var(--primary-light)",
              background: "var(--input-bg)",
              border: "2px solid var(--primary-light)"
            }}
            aria-label={ui.homePageAriaLabel}
          >
            <span className="text-3xl" role="img" aria-label="House">🏠</span>
            <span>{ui.homePage}</span>
          </button>

          <button
            type="button"
            onClick={onAgentRequest}
            className="flex-1 flex items-center justify-center gap-3 px-8 py-6 text-2xl font-bold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
            style={{
              color: "var(--primary-light)",
              background: "var(--input-bg)",
              border: "2px solid var(--primary-light)"
            }}
            aria-label={ui.callForStaffAriaLabel}
          >
            <span className="text-3xl" role="img" aria-label="Phone">📞</span>
            <span>{ui.callForStaff}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
