import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  computed,
} from '@angular/core';

import { ButtonModule } from 'primeng/button';

import { UploadFileService } from '../../../../../../../shared/services/api/file/upload-file.service';
import { GenerateSettingsSelectionService } from '../../../services/utils/generate-settings-selection.service';

@Component({
  selector: 'voice-preview',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './voice-preview.component.html',
  styleUrl: './voice-preview.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoicePreviewComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly uploadFileService = inject(UploadFileService);
  private readonly settingsSelectionService = inject(
    GenerateSettingsSelectionService
  );

  // ? Input signals for voice and language
  readonly voice = input.required<string>();
  readonly language = input.required<string>();

  // ? Voice preview state
  readonly voicePreviewState = this.settingsSelectionService.voicePreviewState;

  // ? Computed button properties based on state
  readonly previewButtonLabel = computed(() => {
    const state = this.voicePreviewState();
    switch (state) {
      case 'loading':
        return 'Đang tải...';
      case 'playing':
        return 'Tạm dừng';
      case 'paused':
        return 'Tiếp tục';
      case 'replay':
        return 'Nghe lại';
      default:
        return 'Nghe thử';
    }
  });

  readonly previewButtonIcon = computed(() => {
    const state = this.voicePreviewState();
    switch (state) {
      case 'loading':
        return 'pi pi-spinner';
      case 'playing':
        return 'pi pi-pause';
      case 'paused':
        return 'pi pi-play';
      case 'replay':
        return 'pi pi-replay';
      default:
        return 'pi pi-play';
    }
  });

  readonly previewButtonSeverity = computed(() => {
    const state = this.voicePreviewState();
    return state === 'replay' ? 'secondary' : undefined;
  });

  // ? Audio element for voice preview
  private audioElement: HTMLAudioElement | null = null;

  constructor() {
    this.setupCleanup();
  }

  async handleButtonClick(): Promise<void> {
    const currentVoice = this.voice();
    const currentLanguage = this.language();

    if (!currentVoice || !currentLanguage) {
      return;
    }

    // ? Check current state to handle different actions
    const currentState = this.voicePreviewState();

    if (currentState === 'playing') {
      this.pauseAudio();
      return;
    }

    if (currentState === 'paused') {
      this.resumeAudio();
      return;
    }

    if (currentState === 'replay') {
      this.replayAudio();
      return;
    }

    // ? Start loading state
    this.settingsSelectionService.setVoicePreviewState('loading');

    try {
      // ? Get the public URL for the voice file from the specific folder
      const audioUrl = await this.uploadFileService.getPublicUrlFromFolder(
        'voices-demo',
        currentLanguage,
        `${currentVoice}.wav`
      );

      if (!audioUrl) {
        this.settingsSelectionService.setVoicePreviewState('idle');
        return;
      }

      // ? Create or update audio element
      this.createAudioElement(audioUrl);
      await this.audioElement!.play();

      // ? Set to playing state
      this.settingsSelectionService.setVoicePreviewState('playing');
    } catch {
      this.settingsSelectionService.setVoicePreviewState('idle');
    }
  }

  // ? Method to handle voice/language changes from parent
  async handleVoiceChange(): Promise<void> {
    // ? Reset audio element and state when voice changes
    this.resetAudioState();

    const currentVoice = this.voice();
    const currentLanguage = this.language();

    if (!currentVoice || !currentLanguage) {
      return;
    }

    try {
      // ? Pre-load the new audio URL
      const audioUrl = await this.uploadFileService.getPublicUrlFromFolder(
        'voices-demo',
        currentLanguage,
        `${currentVoice}.wav`
      );

      if (audioUrl) {
        // ? Create new audio element with the new URL
        this.createAudioElement(audioUrl);
        // ? Preload the audio (optional, for better performance)
        this.audioElement!.load();
      }
    } catch {
      // ? If failed to get URL, keep audioElement as null
      // ? User will see error when trying to play
    }
  }

  private pauseAudio(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.settingsSelectionService.setVoicePreviewState('paused');
    }
  }

  private resumeAudio(): void {
    if (this.audioElement) {
      this.audioElement
        .play()
        .then(() => {
          this.settingsSelectionService.setVoicePreviewState('playing');
        })
        .catch(() => {
          this.settingsSelectionService.setVoicePreviewState('idle');
        });
    }
  }

  private replayAudio(): void {
    if (this.audioElement) {
      this.audioElement.currentTime = 0;
      this.audioElement
        .play()
        .then(() => {
          this.settingsSelectionService.setVoicePreviewState('playing');
        })
        .catch(() => {
          this.settingsSelectionService.setVoicePreviewState('idle');
        });
    }
  }

  private createAudioElement(audioUrl: string): void {
    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.addEventListener('ended', this.handleAudioEnded);
      this.audioElement.addEventListener('error', this.handleAudioError);
    }
    this.audioElement.src = audioUrl;
  }

  private resetAudioState(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
      this.audioElement = null;
    }
    this.settingsSelectionService.setVoicePreviewState('idle');
  }

  private setupCleanup(): void {
    // ? Setup cleanup for both audio element and state when component is destroyed
    this.destroyRef.onDestroy(() => {
      // ? Cleanup audio element
      if (this.audioElement) {
        this.audioElement.removeEventListener('ended', this.handleAudioEnded);
        this.audioElement.removeEventListener('error', this.handleAudioError);
      }

      // ? Reset audio state
      this.resetAudioState();
    });
  }

  private readonly handleAudioEnded = (): void => {
    this.settingsSelectionService.setVoicePreviewState('replay');
  };

  private readonly handleAudioError = (): void => {
    this.settingsSelectionService.setVoicePreviewState('idle');
  };
}
