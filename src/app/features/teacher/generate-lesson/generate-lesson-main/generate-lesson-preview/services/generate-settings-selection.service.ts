import { Injectable, signal } from '@angular/core';

export type VoiceOption = {
  name: string;
  value: string;
  language_code: string;
  gender: string;
  natural_sample_rate: number;
};

@Injectable({
  providedIn: 'root',
})
export class GenerateSettingsSelectionService {
  private readonly selectedRateSignal = signal<number | null>(null);
  selectedRate = this.selectedRateSignal.asReadonly();

  private readonly selectedVoiceSignal = signal<string | null>(null);
  selectedVoice = this.selectedVoiceSignal.asReadonly();

  private readonly selectedLanguageSignal = signal<string>('vi-VN');
  selectedLanguage = this.selectedLanguageSignal.asReadonly();

  private readonly selectedFolderSignal = signal<string | null>(null);
  selectedFolder = this.selectedVoiceSignal.asReadonly();

  setSpeedRate(rate: number) {
    this.selectedRateSignal.set(rate);
  }

  setVoice(voice: string) {
    this.selectedVoiceSignal.set(voice);
  }

  setLanguage(code: string) {
    this.selectedLanguageSignal.set(code);
  }

  setFolder(folderId: string) {
    this.selectedFolderSignal.set(folderId);
  }

  reset() {
    this.selectedRateSignal.set(null);
    this.selectedVoiceSignal.set(null);
    this.selectedLanguageSignal.set('vi-VN');
    this.selectedFolderSignal.set(null);
  }
}
