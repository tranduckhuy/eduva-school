import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  DestroyRef,
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

import { EntityStatus } from '../../../../../../shared/models/enum/entity-status.enum';
import { type GetFoldersRequest } from '../../../../../../shared/models/api/request/query/get-folders-request.model';

// ? Type definitions for voice and language management
type VoiceType = 'female-deep' | 'male-deep' | 'female-north' | 'female-south';
type LanguageCode = 'vi-VN' | 'en-US';
type VoiceMapping = Record<LanguageCode, Record<VoiceType, string>>;

@Component({
  selector: 'app-generate-settings-modal',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, SelectModule],
  templateUrl: './generate-settings-modal.component.html',
  styleUrl: './generate-settings-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerateSettingsModalComponent implements OnInit {
  // ? Dependency injections
  private readonly fb = inject(FormBuilder);
  private readonly globalModalService = inject(GlobalModalService);
  private readonly loadingService = inject(LoadingService);
  private readonly settingsSelectionService = inject(
    GenerateSettingsSelectionService
  );
  private readonly folderService = inject(FolderManagementService);
  private readonly destroyRef = inject(DestroyRef);

  // ? External data signals
  readonly folderList = this.folderService.folderList;
  readonly isFolderLoading = this.loadingService.is('get-folders');

  // ? Form values from service
  readonly speed = this.settingsSelectionService.selectedRate;
  readonly voice = this.settingsSelectionService.selectedVoice;
  readonly language = this.settingsSelectionService.selectedLanguage;
  readonly folderId = this.settingsSelectionService.selectedFolderId;

  // ? Language selection options
  readonly languageOptions = signal<LanguageOption[]>([
    { name: 'Tiếng Việt', value: 'vi-VN' },
    { name: 'Tiếng Anh', value: 'en-US' },
  ]);

  // ? Voice configuration with Vietnamese display names
  private readonly voiceConfigs = signal<
    Array<{ name: string; type: VoiceType }>
  >([
    { name: 'Nữ trầm', type: 'female-deep' },
    { name: 'Nam trầm', type: 'male-deep' },
    { name: 'Nữ miền bắc', type: 'female-north' },
    { name: 'Nữ miền nam', type: 'female-south' },
  ]);

  // ? Voice mapping for different languages
  private readonly voiceMapping = signal<VoiceMapping>({
    'vi-VN': {
      'female-deep': 'vi-VN-Chirp3-HD-Despina',
      'male-deep': 'vi-VN-Chirp3-HD-Enceladus',
      'female-north': 'vi-VN-Chirp3-HD-Gacrux',
      'female-south': 'vi-VN-Chirp3-HD-Zephyr',
    },
    'en-US': {
      'female-deep': 'en-US-Chirp3-HD-Despina',
      'male-deep': 'en-US-Chirp3-HD-Enceladus',
      'female-north': 'en-US-Chirp3-HD-Gacrux',
      'female-south': 'en-US-Chirp3-HD-Zephyr',
    },
  });

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
    const initialLanguage = (this.language() as LanguageCode) || 'vi-VN';
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

  private handleLanguageChange(newLanguage: LanguageCode): void {
    this.updateVoiceForLanguage(newLanguage);
    this.updateVoiceOptions(newLanguage);
  }

  private updateVoiceOptions(language: LanguageCode): void {
    const configs = this.voiceConfigs();
    const mapping = this.voiceMapping();

    const options = configs.map(config => ({
      name: config.name,
      value: mapping[language]?.[config.type] || '',
      language_code: language,
      type: config.type,
    }));

    this.voiceOptionsSignal.set(options);
  }

  private updateVoiceForLanguage(newLanguage: LanguageCode): void {
    const currentVoice = this.form.get('voice')?.value;
    if (!currentVoice) return;

    const mapping = this.voiceMapping();
    const newLanguageMapping = mapping[newLanguage];
    if (!newLanguageMapping) return;

    // ? Find the current voice type by matching with any language mapping
    const currentVoiceType = this.findVoiceType(currentVoice, mapping);
    if (!currentVoiceType) return;

    // ? Update voice to the same type in the new language
    const newVoiceValue = newLanguageMapping[currentVoiceType];
    if (newVoiceValue) {
      this.form.patchValue({ voice: newVoiceValue }, { emitEvent: false });
    }
  }

  private findVoiceType(
    voiceValue: string,
    mapping: VoiceMapping
  ): VoiceType | undefined {
    for (const langMapping of Object.values(mapping)) {
      for (const [type, value] of Object.entries(langMapping)) {
        if (value === voiceValue) {
          return type as VoiceType;
        }
      }
    }
    return undefined;
  }

  private synchronizeFormWithService(): void {
    const currentLanguage = (this.language() as LanguageCode) || 'vi-VN';
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
        voice: this.form.get('voice')?.value || currentVoice,
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
