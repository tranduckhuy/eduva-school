// ? Voice configuration constants for easy extension
export const VOICE_CONFIG = {
  // ? Voice types with Vietnamese display names
  TYPES: {
    'male-one': 'Phú',
    'female-one': 'Nga',
    'male-two': 'Minh',
    'female-two': 'Hoa',
    'male-three': 'Nam',
    'female-three': 'Trinh',
  } as const,

  // ? Supported languages
  LANGUAGES: {
    'vi-VN': 'Tiếng Việt',
    'en-US': 'Tiếng Anh',
  } as const,

  // ? Voice mapping for different languages
  MAPPING: {
    'vi-VN': {
      'male-one': 'vi-VN-Chirp3-HD-Enceladus',
      'female-one': 'vi-VN-Chirp3-HD-Despina',
      'male-two': 'vi-VN-Chirp3-HD-Zubenelgenubi',
      'female-two': 'vi-VN-Chirp3-HD-Gacrux',
      'male-three': 'vi-VN-Chirp3-HD-Algieba',
      'female-three': 'vi-VN-Chirp3-HD-Zephyr',
    },
    'en-US': {
      'male-one': 'en-US-Chirp3-HD-Enceladus',
      'female-one': 'en-US-Chirp3-HD-Despina',
      'male-two': 'en-US-Chirp3-HD-Zubenelgenubi',
      'female-two': 'en-US-Chirp3-HD-Gacrux',
      'male-three': 'en-US-Chirp3-HD-Algieba',
      'female-three': 'en-US-Chirp3-HD-Zephyr',
    },
  } as const,
} as const;

// ? Type definitions derived from constants
export type VoiceType = keyof typeof VOICE_CONFIG.TYPES;
export type LanguageCode = keyof typeof VOICE_CONFIG.LANGUAGES;
export type VoiceMapping = Record<LanguageCode, Record<VoiceType, string>>;

// ? Helper functions for voice config
export class VoiceConfigHelper {
  /**
   * Get all voice types
   */
  static getVoiceTypes(): VoiceType[] {
    return Object.keys(VOICE_CONFIG.TYPES) as VoiceType[];
  }

  /**
   * Get all language codes
   */
  static getLanguageCodes(): LanguageCode[] {
    return Object.keys(VOICE_CONFIG.LANGUAGES) as LanguageCode[];
  }

  /**
   * Get voice display name by type
   */
  static getVoiceDisplayName(type: VoiceType): string {
    return VOICE_CONFIG.TYPES[type];
  }

  /**
   * Get language display name by code
   */
  static getLanguageDisplayName(code: LanguageCode): string {
    return VOICE_CONFIG.LANGUAGES[code];
  }

  /**
   * Get voice value by type and language
   */
  static getVoiceValue(type: VoiceType, language: LanguageCode): string {
    return VOICE_CONFIG.MAPPING[language]?.[type] ?? '';
  }

  /**
   * Find voice type by voice value
   */
  static findVoiceType(voiceValue: string): VoiceType | undefined {
    for (const language of this.getLanguageCodes()) {
      for (const [type, value] of Object.entries(
        VOICE_CONFIG.MAPPING[language]
      )) {
        if (value === voiceValue) {
          return type as VoiceType;
        }
      }
    }
    return undefined;
  }

  /**
   * Get voice options for a specific language
   */
  static getVoiceOptionsForLanguage(language: LanguageCode) {
    return this.getVoiceTypes().map(type => ({
      name: this.getVoiceDisplayName(type),
      value: this.getVoiceValue(type, language),
      language_code: language,
      type: type,
    }));
  }
}
