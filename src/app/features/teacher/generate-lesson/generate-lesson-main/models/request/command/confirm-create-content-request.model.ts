import { LessonGenerationType } from '../../../../../../../shared/models/enum/lesson-generation-type.enum';

export type VoiceConfig = {
  language_code: string;
  name: string;
  speaking_rate: number;
};

export interface ConfirmCreateContent {
  type: LessonGenerationType;
  voiceConfig: VoiceConfig;
}
