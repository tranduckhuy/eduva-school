import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';

import { GlobalModalService } from '../../../../../../shared/services/layout/global-modal/global-modal.service';
import { LoadingService } from '../../../../../../shared/services/core/loading/loading.service';
import { FolderManagementService } from '../../../../../../shared/services/api/folder/folder-management.service';

import {
  GenerateSettingsSelectionService,
  type VoiceOption,
} from '../services/generate-settings-selection.service';
import { type GetFoldersRequest } from '../../../../../../shared/models/api/request/query/get-folders-request.model';
import { EntityStatus } from '../../../../../../shared/models/enum/entity-status.enum';

@Component({
  selector: 'app-generate-settings-modal',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, SelectModule],
  templateUrl: './generate-settings-modal.component.html',
  styleUrl: './generate-settings-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerateSettingsModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly globalModalService = inject(GlobalModalService);
  private readonly loadingService = inject(LoadingService);
  private readonly settingsSelectionService = inject(
    GenerateSettingsSelectionService
  );
  private readonly folderService = inject(FolderManagementService);

  folderList = this.folderService.folderList;
  isFolderLoading = this.loadingService.is('get-folders');

  languageOptions = signal<string[]>(['vi-VN']);
  voiceOptions = signal<VoiceOption[]>([
    {
      name: 'Nữ trầm',
      value: 'vi-VN-Chirp3-HD-Despina',
      language_code: 'vi-VN',
      gender: 'FEMALE',
      natural_sample_rate: 24000,
    },
    {
      name: 'Nam trầm',
      value: 'vi-VN-Chirp3-HD-Enceladus',
      language_code: 'vi-VN',
      gender: 'MALE',
      natural_sample_rate: 24000,
    },
    {
      name: 'Nữ miền bắc',
      value: 'vi-VN-Chirp3-HD-Gacrux',
      language_code: 'vi-VN',
      gender: 'FEMALE',
      natural_sample_rate: 24000,
    },
    {
      name: 'Nữ miền nam',
      value: 'vi-VN-Chirp3-HD-Zephyr',
      language_code: 'vi-VN',
      gender: 'FEMALE',
      natural_sample_rate: 24000,
    },
  ]);

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      speed: '1',
      voice: null,
      language: 'vi-VN',
      folder: null,
    });
  }

  ngOnInit(): void {
    const request: GetFoldersRequest = {
      sortBy: 'createdBy',
      sortDirection: 'desc',
      isPaging: true,
      status: EntityStatus.Active,
    };
    this.folderService.getPersonalFolders(request).subscribe();
  }

  save(): void {
    const { speed, voice, language, folder } = this.form.value;

    this.settingsSelectionService.setSpeedRate(speed);
    this.settingsSelectionService.setVoice(voice);
    this.settingsSelectionService.setLanguage(language);
    this.settingsSelectionService.setFolder(folder);

    this.closeModal();
  }

  closeModal() {
    this.globalModalService.close();
  }
}
