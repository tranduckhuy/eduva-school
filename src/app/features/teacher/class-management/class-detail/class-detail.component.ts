import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  input,
  signal,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { tap } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';

import { ClassManagementService } from '../services/class-management.service';
import { ClassMaterialsManagementService } from '../services/class-materials-management.service';

import { PAGE_SIZE } from '../../../../shared/constants/common.constant';
import { EntityStatus } from '../../../../shared/models/enum/entity-status.enum';
import { LessonMaterialStatus } from '../../../../shared/models/enum/lesson-material.enum';

import { ClassInformationComponent } from './class-information/class-information.component';
import { ClassMemberComponent } from './class-member/class-member.component';
import { ClassFoldersComponent } from './class-folders/class-folders.component';

import { type GetLessonMaterialsRequest } from '../../../../shared/models/api/request/query/get-lesson-materials-request.model';
import { type StudentClassResponse } from '../models/response/query/get-students-class-response.model';

@Component({
  selector: 'app-class-detail',
  standalone: true,
  imports: [
    ButtonModule,
    TabsModule,
    ClassInformationComponent,
    ClassMemberComponent,
    ClassFoldersComponent,
  ],
  templateUrl: './class-detail.component.html',
  styleUrl: './class-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassDetailComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly classManagementService = inject(ClassManagementService);
  private readonly classMaterialsService = inject(
    ClassMaterialsManagementService
  );

  classId = input<string>('');

  classModel = this.classManagementService.classModel;

  folderCount = signal<number>(0);
  materialCount = signal<number>(0);
  students = signal<StudentClassResponse[]>([]);

  pageIndex = signal<number>(0);
  pageSize = signal<number>(PAGE_SIZE);

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe(params => {
      const page = Number(params.get('page'));
      const size = Number(params.get('pageSize'));

      this.pageIndex.set(!isNaN(page) && page > 0 ? page : 1);
      this.pageSize.set(!isNaN(size) && size > 0 ? size : PAGE_SIZE);
    });

    this.loadData();
  }

  goBackToClassList() {
    this.router.navigate(['/teacher/class-management'], {
      queryParams: {
        page: this.pageIndex(),
        pageSize: this.pageSize(),
      },
    });
  }

  loadData(): void {
    this.classManagementService
      .getClassById(this.classId())
      .pipe(
        tap(classModel => {
          if (!classModel?.id) {
            this.handleEmptyClass();
            return;
          }

          this.loadStudents(classModel.id);
          this.loadFolderWithMaterials(classModel.id);
        })
      )
      .subscribe();
  }

  private handleEmptyClass(): void {
    this.folderCount.set(0);
    this.materialCount.set(0);
    this.students.set([]);
  }

  private loadStudents(classId: string): void {
    this.classManagementService
      .getStudentsClass(classId)
      .subscribe(students => this.students.set(students ?? []));
  }

  private loadFolderWithMaterials(classId: string) {
    const request: GetLessonMaterialsRequest = {
      status: EntityStatus.Active,
      lessonStatus: LessonMaterialStatus.Approved,
    };
    this.classMaterialsService
      .getClassLessonMaterials(classId, request)
      .subscribe({
        next: res => {
          if (!res) return;

          const folderCount = res.length ?? 0;
          const totalLessonMaterials = res.reduce(
            (total, folder) => total + (folder.lessonMaterials?.length ?? 0),
            0
          );

          this.folderCount.set(folderCount);
          this.materialCount.set(totalLessonMaterials);
        },
      });
  }
}
