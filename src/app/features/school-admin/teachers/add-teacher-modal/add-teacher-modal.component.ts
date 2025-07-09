import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { GlobalModalService } from '../../../../shared/services/layout/global-modal/global-modal.service';
import { FormControlComponent } from '../../../../shared/components/form-control/form-control.component';

@Component({
  selector: 'app-add-teacher-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    FormControlComponent,
  ],
  templateUrl: './add-teacher-modal.component.html',
  styleUrl: './add-teacher-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddTeacherModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly globalModalService = inject(GlobalModalService);

  form: FormGroup;

  // signal
  submitted = signal<boolean>(false);
  name = signal<string>('');
  email = signal<string>('');
  password = signal<string>('');
  confirmPassword = signal<string>('');
  isContentModerator = signal<boolean>(false);

  constructor() {
    this.form = this.fb.group({});
  }

  // function
  onSubmit() {
    this.submitted.set(true);
    this.form.markAllAsTouched;

    if (this.form.invalid) return;
  }

  closeModal() {
    this.globalModalService.close();
  }
}
