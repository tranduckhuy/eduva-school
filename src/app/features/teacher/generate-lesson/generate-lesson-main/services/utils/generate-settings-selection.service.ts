import { Injectable, signal } from '@angular/core';

export type LanguageOption = {
  name: string;
  value: string;
};

export type VoiceOption = {
  name: string;
  value: string;
  language_code: string;
  type: string;
};

export type VoicePreviewState =
  | 'idle'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'replay';

@Injectable({
  providedIn: 'root',
})
export class GenerateSettingsSelectionService {
  private readonly selectedRateSignal = signal<number | null>(null);
  selectedRate = this.selectedRateSignal.asReadonly();

  private readonly selectedVoiceSignal = signal<string | null>(null);
  selectedVoice = this.selectedVoiceSignal.asReadonly();

  private readonly selectedLanguageSignal = signal<string | null>(null);
  selectedLanguage = this.selectedLanguageSignal.asReadonly();

  private readonly selectedFolderIdSignal = signal<string | null>(null);
  selectedFolderId = this.selectedFolderIdSignal.asReadonly();

  // ? Voice preview state management
  private readonly voicePreviewStateSignal = signal<VoicePreviewState>('idle');
  voicePreviewState = this.voicePreviewStateSignal.asReadonly();

  setSpeedRate(rate: number) {
    this.selectedRateSignal.set(rate);
  }

  setVoice(voice: string) {
    this.selectedVoiceSignal.set(voice);
  }

  setLanguage(code: string) {
    this.selectedLanguageSignal.set(code);
  }

  setFolderId(folderId?: string | null) {
    this.selectedFolderIdSignal.set(folderId ?? null);
  }

  // ? Voice preview state methods
  setVoicePreviewState(state: VoicePreviewState) {
    this.voicePreviewStateSignal.set(state);
  }

  reset() {
    this.selectedRateSignal.set(null);
    this.selectedVoiceSignal.set(null);
    this.selectedLanguageSignal.set(null);
    this.selectedFolderIdSignal.set(null);
    this.voicePreviewStateSignal.set('idle');
  }
}
