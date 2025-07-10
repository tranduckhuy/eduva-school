import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';

import { LessonMaterialsService } from '../../../../shared/services/api/lesson-materials/lesson-materials.service';
import { LoadingService } from '../../../../shared/services/core/loading/loading.service';
import { GlobalModalService } from '../../../../shared/services/layout/global-modal/global-modal.service';
import { MODAL_DATA } from '../../../../shared/tokens/injection/modal-data.token';

import { FormControlComponent } from '../../../../shared/components/form-control/form-control.component';

import { LessonMaterialStatus } from '../../../../shared/models/enum/lesson-material.enum';
import { type ApproveRejectMaterialRequest } from '../models/approve-reject-material-request.model';

interface ModerateReasonModalData {
  materialId: string;
  isApproved: boolean;
}

@Component({
  selector: 'app-moderate-reason-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    FormControlComponent,
    FormsModule,
  ],
  templateUrl: './moderate-reason-modal.component.html',
  styleUrl: './moderate-reason-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModerateReasonModalComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly lessonMaterialService = inject(LessonMaterialsService);
  private readonly loadingService = inject(LoadingService);
  private readonly globalModalService = inject(GlobalModalService);
  readonly modalData = inject<ModerateReasonModalData>(MODAL_DATA);

  form: FormGroup;

  isLoading = this.loadingService.is('approve-reject-material');

  reason = signal<string>('');
  submitted = signal<boolean>(false);

  constructor() {
    this.form = this.fb.group({
      reason: '',
    });
  }

  ngOnInit(): void {
    if (!this.modalData.isApproved) {
      const control = this.form.get('reason');
      control?.addValidators(Validators.required);
      control?.updateValueAndValidity();
    }
  }

  onSubmit() {
    this.submitted.set(true);
    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    const request: ApproveRejectMaterialRequest = {
      status: this.modalData.isApproved
        ? LessonMaterialStatus.Approved
        : LessonMaterialStatus.Rejected,
      feedback: this.form.get('reason')?.value,
    };
    this.lessonMaterialService
      .approveRejectMaterial(request, this.modalData.materialId)
      .subscribe({
        next: () => {
          this.closeModal();
          this.router.navigateByUrl('/school-admin/moderate-lessons');
        },
      });
  }

  closeModal() {
    this.globalModalService.close();
  }
}
