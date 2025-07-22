import { Injectable, signal } from '@angular/core';

export type VoiceOption = {
  name: string;
  value: string;
  language_code: string;
  gender: string;
  natural_sample_rate: number;
};

export type LanguageOption = {
  name: string;
  value: string;
};

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

  setSpeedRate(rate: number) {
    this.selectedRateSignal.set(rate);
  }

  setVoice(voice: string) {
    this.selectedVoiceSignal.set(voice);
  }

  setLanguage(code: string) {
    this.selectedLanguageSignal.set(code);
  }

  setFolderId(folderId: string) {
    this.selectedFolderIdSignal.set(folderId);
  }

  reset() {
    this.selectedRateSignal.set(null);
    this.selectedVoiceSignal.set(null);
    this.selectedLanguageSignal.set(null);
    this.selectedFolderIdSignal.set(null);
  }
}
