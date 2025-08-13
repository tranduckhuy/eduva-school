import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';

import { GlobalModalService } from '../../../../../../shared/services/layout/global-modal/global-modal.service';
import { LoadingService } from '../../../../../../shared/services/core/loading/loading.service';
import { FolderManagementService } from '../../../../../../shared/services/api/folder/folder-management.service';
import {
  GenerateSettingsSelectionService,
  type VoiceOption,
  type LanguageOption,
} from '../../services/utils/generate-settings-selection.service';

import { VoiceConfigHelper, type LanguageCode } from './voice-config.helper';

import { EntityStatus } from '../../../../../../shared/models/enum/entity-status.enum';

import { VoicePreviewComponent } from './voice-preview/voice-preview.component';

import { type GetFoldersRequest } from '../../../../../../shared/models/api/request/query/get-folders-request.model';

@Component({
  selector: 'app-generate-settings-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    SelectModule,
    VoicePreviewComponent,
  ],
  templateUrl: './generate-settings-modal.component.html',
  styleUrl: './generate-settings-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerateSettingsModalComponent implements OnInit {
  // ? Dependency injections
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly globalModalService = inject(GlobalModalService);
  private readonly loadingService = inject(LoadingService);
  private readonly settingsSelectionService = inject(
    GenerateSettingsSelectionService
  );
  private readonly folderService = inject(FolderManagementService);

  // ? External data signals
  readonly folderList = this.folderService.folderList;
  readonly isFolderLoading = this.loadingService.is('get-folders');

  // ? Form values from service
  readonly speed = this.settingsSelectionService.selectedRate;
  readonly voice = this.settingsSelectionService.selectedVoice;
  readonly language = this.settingsSelectionService.selectedLanguage;
  readonly folderId = this.settingsSelectionService.selectedFolderId;

  // ? Language selection options - now using centralized config
  readonly languageOptions = signal<LanguageOption[]>(
    VoiceConfigHelper.getLanguageCodes().map(code => ({
      name: VoiceConfigHelper.getLanguageDisplayName(code),
      value: code,
    }))
  );

  // ? Voice options for the current language
  private readonly voiceOptionsSignal = signal<VoiceOption[]>([]);
  readonly voiceOptions = this.voiceOptionsSignal.asReadonly();

  // ? Form group for user inputs
  readonly form = this.fb.group({
    speed: this.speed() ?? '1',
    voice: this.voice() ?? 'vi-VN-Chirp3-HD-Enceladus',
    language: this.language() ?? 'vi-VN',
    folderId: this.folderId(),
  });

  constructor() {
    this.initializeVoiceOptions();
    this.setupLanguageChangeListener();
    this.setupVoiceChangeListener();
  }

  ngOnInit(): void {
    this.synchronizeFormWithService();
    this.loadFolders();
  }

  save(): void {
    const { speed, voice, language, folderId } = this.form.value;

    if (!speed || !voice || !language) return;

    this.settingsSelectionService.setSpeedRate(+speed);
    this.settingsSelectionService.setVoice(voice);
    this.settingsSelectionService.setLanguage(language);
    this.settingsSelectionService.setFolderId(folderId);

    this.closeModal();
  }

  closeModal(): void {
    this.globalModalService.close();
  }

  private initializeVoiceOptions(): void {
    const initialLanguage = (this.language() as LanguageCode) ?? 'vi-VN';
    this.updateVoiceOptions(initialLanguage);
  }

  private setupLanguageChangeListener(): void {
    this.form
      .get('language')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(newLanguage => {
        if (newLanguage) {
          this.handleLanguageChange(newLanguage as LanguageCode);
        }
      });
  }

  private setupVoiceChangeListener(): void {
    this.form
      .get('voice')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(newVoice => {
        if (newVoice) {
          this.handleVoiceChange();
        }
      });
  }

  private handleLanguageChange(newLanguage: LanguageCode): void {
    this.updateVoiceForLanguage(newLanguage);
    this.updateVoiceOptions(newLanguage);

    // ? Reset voice preview state when language changes
    this.settingsSelectionService.setVoicePreviewState('idle');
  }

  private handleVoiceChange(): void {
    // ? Reset voice preview state when voice changes
    this.settingsSelectionService.setVoicePreviewState('idle');
  }

  private updateVoiceOptions(language: LanguageCode): void {
    // ? Now using centralized helper
    const options = VoiceConfigHelper.getVoiceOptionsForLanguage(language);
    this.voiceOptionsSignal.set(options);
  }

  private updateVoiceForLanguage(newLanguage: LanguageCode): void {
    const currentVoice = this.form.get('voice')?.value;
    if (!currentVoice) return;

    // ? Find the current voice type using centralized helper
    const currentVoiceType = VoiceConfigHelper.findVoiceType(currentVoice);
    if (!currentVoiceType) return;

    // ? Update voice to the same type in the new language
    const newVoiceValue = VoiceConfigHelper.getVoiceValue(
      currentVoiceType,
      newLanguage
    );
    if (newVoiceValue) {
      this.form.patchValue({ voice: newVoiceValue }, { emitEvent: false });
    }
  }

  private synchronizeFormWithService(): void {
    const currentLanguage = (this.language() as LanguageCode) ?? 'vi-VN';
    const currentVoice = this.voice();

    // ? Update voice options to match current language
    this.updateVoiceOptions(currentLanguage);

    // ? Update voice if it doesn't match current language
    if (currentVoice && currentLanguage) {
      this.updateVoiceForLanguage(currentLanguage);
    }

    // ? Ensure form values are in sync
    this.form.patchValue(
      {
        language: currentLanguage,
        voice: this.form.get('voice')?.value ?? currentVoice,
      },
      { emitEvent: false }
    );
  }

  private loadFolders(): void {
    const request: GetFoldersRequest = {
      sortBy: 'createdAt',
      sortDirection: 'desc',
      isPagingEnabled: false,
      status: EntityStatus.Active,
    };

    this.folderService.getPersonalFolders(request).subscribe();
  }
}
