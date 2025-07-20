import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { LessonMaterialsService } from '../../../../shared/services/api/lesson-materials/lesson-materials.service';
import { LoadingService } from '../../../../shared/services/core/loading/loading.service';

import { FormControlComponent } from '../../../../shared/components/form-control/form-control.component';
import { UpdateMaterialRichTextComponent } from './update-material-rich-text/update-material-rich-text.component';

import { type UpdateLessonMaterialRequest } from '../../../../shared/models/api/request/command/update-lesson-material-request.model';

@Component({
  selector: 'app-update-material',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    ProgressSpinnerModule,
    FormControlComponent,
    UpdateMaterialRichTextComponent,
  ],
  templateUrl: './update-material.component.html',
  styleUrl: './update-material.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateMaterialComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly lessonMaterialService = inject(LessonMaterialsService);
  private readonly loadingService = inject(LoadingService);

  folderId = input.required<string>();
  materialId = input.required<string>();

  lessonMaterial = this.lessonMaterialService.lessonMaterial;
  isLoading = this.loadingService.isLoading;

  descriptionValue = signal<string>('');
  submitted = signal<boolean>(false);

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
    });
  }

  ngOnInit(): void {
    this.lessonMaterialService
      .getLessonMaterialById(this.materialId())
      .subscribe({
        next: () => {
          const lessonMaterial = this.lessonMaterial();
          const title = lessonMaterial?.title;
          const description = lessonMaterial?.description;

          if (lessonMaterial && (title || description)) {
            this.descriptionValue.set(description!);
            this.form.patchValue({
              title,
              description,
            });
          }
        },
        error: () => this.goBackToMaterialList(),
      });
  }

  get title() {
    return this.form.get('title');
  }

  get description() {
    return this.form.get('description');
  }

  getDescriptionValue(value: string) {
    this.description?.patchValue(value);
  }

  onSubmit() {
    this.submitted.set(true);
    this.form.markAllAsTouched();

    const lessonMaterial = this.lessonMaterial();

    if (this.form.invalid || !lessonMaterial) return;

    const materialId = lessonMaterial.id;
    const request: UpdateLessonMaterialRequest = {
      id: materialId,
      title: this.title?.value,
      description: this.description?.value,
    };
    this.lessonMaterialService
      .updateLessonMaterial(materialId, request)
      .subscribe({
        next: () => this.goBackToMaterialList(),
      });
  }

  goBackToMaterialList() {
    this.router.navigate(['/teacher/file-manager/my-drive', this.folderId()]);
  }
}
