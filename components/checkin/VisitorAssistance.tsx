"use client";

import { useState } from "react";
import { SupportedLanguage } from "@/lib/languageConfig";

interface VisitorAssistanceProps {
  language: SupportedLanguage;
  onBack: () => void;
}

export function VisitorAssistance({ language, onBack }: VisitorAssistanceProps) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);

    try {
      // TODO: Backend team - Replace this with actual LLM API call
      // POST /api/visitor-assistance
      // Body: { query: string, language: SupportedLanguage }
      // Response: { suggestion: string, resources: Array<{name: string, contact?: string, url?: string}> }

      const mockResponse = await fetch("/api/visitor-assistance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, language }),
      });

      if (mockResponse.ok) {
        const data = await mockResponse.json();
        setResponse(data.suggestion);
      } else {
        // Fallback for development
        setResponse(getMockResponse(language));
      }
    } catch (error) {
      // Show mock response if API not implemented yet
      setResponse(getMockResponse(language));
    } finally {
      setIsLoading(false);
    }
  };

  const getMockResponse = (lang: SupportedLanguage) => {
    const mockResponses = {
      en: "Thank you for your inquiry. Our staff will assist you shortly. Please wait at the front desk.",
      es: "Gracias por su consulta. Nuestro personal le ayudará en breve. Por favor espere en la recepción.",
      zh: "感谢您的咨询。我们的工作人员将很快为您提供帮助。请在前台等候。"
    };
    return mockResponses[lang];
  };

  const labels = {
    en: {
      title: "How can we help you?",
      placeholder: "Describe what you need help with...",
      submit: "Get Assistance",
      back: "Back",
      loading: "Processing..."
    },
    es: {
      title: "¿Cómo podemos ayudarle?",
      placeholder: "Describa en qué necesita ayuda...",
      submit: "Obtener Asistencia",
      back: "Atrás",
      loading: "Procesando..."
    },
    zh: {
      title: "我们能帮您什么？",
      placeholder: "描述您需要什么帮助...",
      submit: "获取帮助",
      back: "返回",
      loading: "处理中..."
    }
  }[language];

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
          {labels.title}
        </h2>
        <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
          {language === "en" && "Tell us what you need and we'll help you find the right resources."}
          {language === "es" && "Díganos lo que necesita y le ayudaremos a encontrar los recursos adecuados."}
          {language === "zh" && "告诉我们您需要什么，我们会帮您找到合适的资源。"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={6}
            className="w-full px-6 py-4 text-lg rounded-lg focus:outline-none focus:ring-2 transition-all resize-none"
            style={{
              background: "var(--input-bg)",
              border: "2px solid var(--input-border)",
              color: "var(--text-primary)"
            }}
            placeholder={labels.placeholder}
            disabled={isLoading}
          />
        </div>

        {response && (
          <div
            className="p-6 rounded-lg"
            style={{
              background: "var(--success-bg)",
              border: "2px solid var(--success-border)"
            }}
          >
            <h3 className="font-semibold text-lg mb-2" style={{ color: "var(--success-text)" }}>
              {language === "en" && "Suggestion:"}
              {language === "es" && "Sugerencia:"}
              {language === "zh" && "建议："}
            </h3>
            <p style={{ color: "var(--text-primary)" }}>{response}</p>

            {/* TODO: Backend team - Display resources here when API returns them */}
            <div className="mt-4 text-sm" style={{ color: "var(--text-muted)" }}>
              {language === "en" && "Our staff will be with you shortly to provide further assistance."}
              {language === "es" && "Nuestro personal estará con usted en breve para brindarle más ayuda."}
              {language === "zh" && "我们的工作人员将很快为您提供进一步的帮助。"}
            </div>
          </div>
        )}

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
            {labels.back}
          </button>

          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="flex-1 px-6 py-4 text-lg rounded-lg font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50"
            style={{
              background: "var(--submit-btn-bg)",
              color: "#ffffff",
              boxShadow: "0 4px 12px var(--shadow-medium)"
            }}
          >
            {isLoading ? labels.loading : labels.submit}
          </button>
        </div>
      </form>

      {/* Instructions for backend team */}
      <div className="mt-8 p-4 rounded border-2 border-dashed" style={{ borderColor: "var(--text-muted)", display: "none" }}>
        <p className="text-sm font-mono" style={{ color: "var(--text-muted)" }}>
          {`/* BACKEND TODO:
           * Create POST /api/visitor-assistance endpoint
           * Accept: { query: string, language: 'en'|'es'|'zh' }
           * Return: {
           *   suggestion: string,
           *   resources?: Array<{ name: string, contact?: string, url?: string, description?: string }>
           * }
           */`}
        </p>
      </div>
    </div>
  );
}
