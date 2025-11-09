export type SupportedLanguage = 'en' | 'es' | 'zh';

export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  voiceLang: string; // BCP 47 language tag for speech synthesis
}

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, LanguageConfig> = {
  en: {
    code: 'en',
    name: 'English',
    voiceLang: 'en-US',
  },
  es: {
    code: 'es',
    name: 'Spanish',
    voiceLang: 'es-US',
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    voiceLang: 'zh-CN', // Try zh-CN, but browser support is limited
  },
};

export const TRANSLATIONS = {
  en: {
    languagePrompt: "Welcome! Please say English, Spanish, or Chinese to select your language.",
    namePrompt: "Please say your first name and last name.",
    nameConfirmation: (firstName: string, firstSpelled: string, lastName: string, lastSpelled: string) =>
      `I heard ${firstName}, spelled ${firstSpelled}, ${lastName}, spelled ${lastSpelled}. Is that correct? Please say yes or no.`,
    searching: "Searching for your appointments. Please wait.",
    tryAgain: "Let's try again. Please say your first name and last name.",
    didNotCatch: "I didn't catch that. Please say yes or no.",
    onlyOneName: "I only heard one name. Please say both your first name and last name.",
    noAppointments: "No upcoming appointments found. Please check with the front desk.",
    foundAppointments: (count: number) => `Found ${count} appointment${count === 1 ? "" : "s"}.`,
    appointmentDetails: (idx: number, dateStr: string, staff: string, notes: string | null) =>
      `Appointment ${idx + 1}: ${dateStr} with ${staff}. ${notes ? `Notes: ${notes}. ` : ""}`,
    checkedIn: "You are now checked in. Thank you!",
    languageNotUnderstood: "I didn't understand. Please say English, Spanish, or Chinese.",
    // Confirmation keywords
    positiveWords: ["yes", "yeah", "correct", "right", "yep"],
    negativeWords: ["no", "nope"],
    // Language selection keywords
    languageKeywords: ["english", "inglés", "inglés"],
  },
  es: {
    languagePrompt: "¡Bienvenido! Por favor diga inglés, español o chino para seleccionar su idioma.",
    namePrompt: "Por favor diga su nombre y apellido.",
    nameConfirmation: (firstName: string, firstSpelled: string, lastName: string, lastSpelled: string) =>
      `Escuché ${firstName}, deletreado ${firstSpelled}, ${lastName}, deletreado ${lastSpelled}. ¿Es correcto? Por favor diga sí o no.`,
    searching: "Buscando sus citas. Por favor espere.",
    tryAgain: "Intentemos de nuevo. Por favor diga su nombre y apellido.",
    didNotCatch: "No entendí eso. Por favor diga sí o no.",
    onlyOneName: "Solo escuché un nombre. Por favor diga su nombre y apellido.",
    noAppointments: "No se encontraron citas próximas. Por favor consulte con la recepción.",
    foundAppointments: (count: number) => `Se encontró${count === 1 ? "" : "ron"} ${count} cita${count === 1 ? "" : "s"}.`,
    appointmentDetails: (idx: number, dateStr: string, staff: string, notes: string | null) =>
      `Cita ${idx + 1}: ${dateStr} con ${staff}. ${notes ? `Notas: ${notes}. ` : ""}`,
    checkedIn: "Ya está registrado. ¡Gracias!",
    languageNotUnderstood: "No entendí. Por favor diga inglés, español o chino.",
    positiveWords: ["sí", "si", "correcto", "exacto", "yes", "yeah", "afirmativo"],
    negativeWords: ["no"],
    languageKeywords: ["español", "espanol", "spanish"],
  },
  zh: {
    languagePrompt: "欢迎！请说英语、西班牙语或中文来选择您的语言。",
    namePrompt: "请说您的名字和姓氏。",
    nameConfirmation: (firstName: string, firstSpelled: string, lastName: string, lastSpelled: string) =>
      `我听到的是${firstName}，拼写为${firstSpelled}，${lastName}，拼写为${lastSpelled}。这是正确的吗？请说是或不是。`,
    searching: "正在搜索您的预约。请稍候。",
    tryAgain: "让我们再试一次。请说您的名字和姓氏。",
    didNotCatch: "我没听清楚。请说是或不是。",
    onlyOneName: "我只听到一个名字。请说您的名字和姓氏。",
    noAppointments: "未找到即将到来的预约。请咨询前台。",
    foundAppointments: (count: number) => `找到了${count}个预约。`,
    appointmentDetails: (idx: number, dateStr: string, staff: string, notes: string | null) =>
      `预约${idx + 1}：${dateStr}，与${staff}。${notes ? `备注：${notes}。` : ""}`,
    checkedIn: "您现在已登记入住。谢谢！",
    languageNotUnderstood: "我没听懂。请说英语、西班牙语或中文。",
    positiveWords: ["是", "对", "正确"],
    negativeWords: ["不是", "不", "否"],
    languageKeywords: ["中文", "chinese", "mandarin"],
  },
};

/**
 * Detect which language was selected from the transcript
 */
export function detectLanguageSelection(transcript: string): SupportedLanguage | null {
  const lower = transcript.toLowerCase().trim();

  // English
  if (lower.includes("english") || lower.includes("inglés") || lower.includes("ingles")) {
    return 'en';
  }

  // Spanish
  if (lower.includes("spanish") || lower.includes("español") || lower.includes("espanol")) {
    return 'es';
  }

  // Chinese - Check for multiple variations
  // Note: English speech recognizer may transcribe "中文" as various phonetic spellings
  if (
    lower.includes("chinese") ||
    lower.includes("中文") ||
    lower.includes("mandarin") ||
    lower.includes("zhongwen") ||
    lower.includes("zhong wen") ||
    lower.includes("jong wen") ||
    lower.includes("jung wen") ||
    lower.includes("chung wen")
  ) {
    return 'zh';
  }

  return null;
}
