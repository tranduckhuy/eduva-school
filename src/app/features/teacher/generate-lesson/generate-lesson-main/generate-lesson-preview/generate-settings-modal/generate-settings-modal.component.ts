import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';

import { GlobalModalService } from '../../../../../../shared/services/layout/global-modal/global-modal.service';

@Component({
  selector: 'app-generate-settings-modal',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, SelectModule],
  templateUrl: './generate-settings-modal.component.html',
  styleUrl: './generate-settings-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerateSettingsModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly globalModalService = inject(GlobalModalService);

  form: FormGroup;
  options = signal<string[]>([]);

  constructor() {
    this.options.set([
      'Nam trầm',
      'Nữ trầm',
      'Nữ miền nam',
      'Nam miền bắc',
      'Gay miền trung',
    ]);

    this.form = this.fb.group({
      length: '',
      voice: null,
      folderId: null,
    });
  }

  closeModal() {
    this.globalModalService.close();
  }
}
