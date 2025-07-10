import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';

import { LoadingService } from '../../../../../../shared/services/core/loading/loading.service';
import { GlobalModalService } from '../../../../../../shared/services/layout/global-modal/global-modal.service';

@Component({
  selector: 'app-add-class-materials-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, SelectModule],
  templateUrl: './add-class-materials-modal.component.html',
  styleUrl: './add-class-materials-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddClassMaterialsModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly loadingService = inject(LoadingService);
  private readonly globalModalService = inject(GlobalModalService);

  readonly isLoading = this.loadingService.is('create-folder');
  readonly form: FormGroup = this.fb.group({
    name: ['', Validators.required],
  });

  get name() {
    return this.form.get('name')!;
  }

  onBlur(controlName: string) {
    const control = this.form.get(controlName);
    control?.markAsTouched();
  }

  onSubmit() {
    this.form.markAllAsTouched();

    if (this.form.invalid) return;
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (control?.hasError('required')) return 'Trường này không được để trống';
    return '';
  }

  closeModal() {
    this.globalModalService.close();
  }

  private resetForm() {
    this.form.reset();
    this.form.markAsUntouched();
  }
}
