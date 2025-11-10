"use client";

import { useSpeech } from "@/hooks/useSpeech";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useEffect, useState } from "react";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";
import { SupportedLanguage, SUPPORTED_LANGUAGES } from "@/lib/languageConfig";
import { getUITranslations } from "@/lib/uiTranslations";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AssistantSectionProps {
  language: SupportedLanguage;
}

export function AssistantSection({ language }: AssistantSectionProps) {
  const t = getUITranslations(language);
  const langConfig = SUPPORTED_LANGUAGES[language];

  async function sendToServer(
    messages: Message[],
    onChunk: (text: string) => void
  ) {
    const response = await fetch(
      "https://cil-backend-reference.onrender.com/chat/stream",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization: "default",
          messages,
        }),
      }
    );

    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullText = "";

    while (true) {
      const { value, done } = await reader!.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;
      onChunk(fullText); // progressively update assistant message
    }

    return fullText.trim();
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const [textInput, setTextInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const {
    isSupported: isVoiceSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceInput();

  const {
    speak,
    stop: stopSpeech,
    isSpeaking,
    isSupported: isSpeechSupported,
  } = useSpeech();
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (transcript) {
      setTextInput((prev) => {
        return prev ? `${prev} ${transcript}` : transcript;
      });
    }
  }, [transcript]);

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  const handleSendMessage = async () => {
    if (!textInput.trim()) return;

    const userMessage: Message = { role: "user", content: textInput.trim() };

    setMessages((prev) => [...prev, userMessage]);
    setTextInput("");
    setError(false);
    setIsLoading(true);

    try {
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const newMessages = [...messages, userMessage];
      let latestAssistantText = "";

      await sendToServer(newMessages, (partial) => {
        latestAssistantText = partial;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: partial };
          return updated;
        });
      });

      if (isSpeechSupported && latestAssistantText) {
        speak(latestAssistantText, langConfig.voiceLang);
      }
    } catch (err) {
      setError(true);
      console.error("Error sending message:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayMessage = (index: number, content: string) => {
    if (speakingMessageIndex === index && isSpeaking) {
      stopSpeech();
      setSpeakingMessageIndex(null);
    } else {
      stopSpeech();
      setSpeakingMessageIndex(index);
      speak(content, langConfig.voiceLang, () => {
        setSpeakingMessageIndex(null);
      });
    }
  };

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-700">
      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
        {t.onlineAssistant}
      </h3>
      <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
        {t.onlineAssistantDescription}
      </p>

      <MessageList
        messages={messages}
        isSpeechSupported={isSpeechSupported}
        speakingMessageIndex={speakingMessageIndex}
        isSpeaking={isSpeaking}
        onPlayMessage={handlePlayMessage}
        emptyStateText={t.assistantConversationPrompt}
        listenLabel={t.assistantListen}
        stopLabel={t.assistantStop}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {t.assistantError}
        </div>
      )}

      <ChatInput
        textInput={textInput}
        isLoading={isLoading}
        isListening={isListening}
        isVoiceSupported={isVoiceSupported}
        onTextChange={setTextInput}
        onSend={handleSendMessage}
        onVoiceToggle={handleVoiceToggle}
        placeholder={t.assistantPlaceholder}
        sendLabel={t.assistantSend}
        sendingLabel={t.assistantSending}
        voiceStartLabel={t.assistantVoiceStart}
        voiceStopLabel={t.assistantVoiceStop}
        recordingIndicator={t.assistantRecordingIndicator}
        helperText={t.assistantHelperText}
      />
    </div>
  );
}
