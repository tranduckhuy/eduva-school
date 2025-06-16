import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';

import { PrimeNG } from 'primeng/config';
import {
  FileSelectEvent,
  FileUpload,
  FileUploadEvent,
} from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

import { GlobalModalService } from '../../../../shared/services/global-modal/global-modal.service';

@Component({
  selector: 'app-add-file-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TooltipModule,
    FileUpload,
    ButtonModule,
  ],
  templateUrl: './add-file-modal.component.html',
  styleUrl: './add-file-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddFileModalComponent {
  private readonly globalModalService = inject(GlobalModalService);
  private readonly fb = inject(FormBuilder);
  private readonly config = inject(PrimeNG);

  form: FormGroup;

  uploadedFiles: any[] = [];

  constructor() {
    this.form = this.fb.group({
      title: ['', Validators.required],
    });
  }

  get title() {
    return this.form.get('title')!;
  }

  onBlur(controlName: string) {
    const control = this.form.get(controlName);
    if (control && !control.touched) {
      control.markAsTouched();
    }
  }

  onSelectFile(event: FileSelectEvent) {}

  onUpload(event: FileUploadEvent) {
    console.log('Uploaded');
    for (let file of event.files) {
      this.uploadedFiles.push(file);
    }
  }

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
  }

  formatSize(bytes: number) {
    const k = 1024;
    const dm = 3;
    const sizes = this.config.translation.fileSizeTypes!;
    if (bytes === 0) {
      return `0 ${sizes[0]}`;
    }

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

    return `${formattedSize} ${sizes[i]}`;
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (control?.hasError('required')) {
      return 'Trường này không được để trống';
    }
    return '';
  }

  closeModal() {
    this.globalModalService.close();
  }
}
