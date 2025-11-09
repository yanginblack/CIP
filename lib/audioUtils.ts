import { TRANSLATIONS, SupportedLanguage } from "./languageConfig";

/**
 * Spell out a name letter by letter with periods
 * Example: "John" becomes "J. o. h. n."
 */
export function spellName(name: string): string {
  return name.split('').join('. ') + '.';
}

/**
 * Parse a full name string into firstName and lastName
 */
export function parseFullName(transcript: string): {
  firstName: string;
  lastName: string;
} | null {
  const words = transcript.trim().split(/\s+/);

  if (words.length >= 2) {
    return {
      firstName: words[0],
      lastName: words.slice(1).join(" "),
    };
  }

  return null;
}

/**
 * Check if a transcript contains a positive confirmation
 */
export function isPositiveConfirmation(
  transcript: string,
  language: SupportedLanguage = "en"
): boolean {
  const lowerTranscript = transcript.toLowerCase().trim();
  const positiveWords = TRANSLATIONS[language].positiveWords;

  return positiveWords.some((word) => lowerTranscript.includes(word));
}

/**
 * Check if a transcript contains a negative confirmation
 */
export function isNegativeConfirmation(
  transcript: string,
  language: SupportedLanguage = "en"
): boolean {
  const lowerTranscript = transcript.toLowerCase().trim();
  const negativeWords = TRANSLATIONS[language].negativeWords;

  return negativeWords.some((word) => lowerTranscript.includes(word));
}
