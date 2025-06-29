import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  input,
  signal,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { forkJoin, map, of, switchMap } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';

import { ClassManagementService } from '../services/class-management.service';
import { FolderManagementService } from '../../../../shared/services/api/folder/folder-management.service';
import { LessonMaterialsService } from '../../../../shared/services/api/lesson-materials/lesson-materials.service';

import { PAGE_SIZE } from '../../../../shared/constants/common.constant';

import { ClassInformationComponent } from './class-information/class-information.component';
import { ClassMemberComponent } from './class-member/class-member.component';

import { FolderOwnerType } from '../../../../shared/models/enum/folder-owner-type.enum';

import { type Folder } from '../../../../shared/models/entities/folder.model';
import { type LessonMaterial } from '../../../../shared/models/entities/lesson-material.model';
import { type GetFoldersRequest } from '../../../../shared/models/api/request/query/get-folders-request.model';
import { type GetLessonMaterialsRequest } from '../../../../shared/models/api/request/query/get-lesson-materials-request.model';
import { type StudentClassResponse } from '../models/response/query/get-studentss-class-response.model';

export interface FolderWithMaterials {
  folder: Folder;
  materials: LessonMaterial[];
}

@Component({
  selector: 'app-class-detail',
  standalone: true,
  imports: [
    ButtonModule,
    TabsModule,
    ClassInformationComponent,
    ClassMemberComponent,
  ],
  templateUrl: './class-detail.component.html',
  styleUrl: './class-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassDetailComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly classManagementService = inject(ClassManagementService);
  private readonly folderManagementService = inject(FolderManagementService);
  private readonly lessonMaterialsService = inject(LessonMaterialsService);

  classId = input<string>('');

  classModel = this.classManagementService.classModel;

  folderMaterials = signal<FolderWithMaterials[]>([]);
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

  private loadData() {
    this.classManagementService
      .getTeacherClassById(this.classId())
      .pipe(
        switchMap(classModel => {
          if (!classModel?.id) {
            this.folderMaterials.set([]);
            this.folderCount.set(0);
            this.materialCount.set(0);
            this.students.set([]);
            return of([]);
          }

          // ? Load Students
          this.classManagementService
            .getStudentsClass(classModel.id)
            .subscribe(students => {
              this.students.set(students ?? []);
            });

          const folderReq: GetFoldersRequest = {
            classId: classModel.id,
            ownerType: FolderOwnerType.Class,
          };

          // ? Load Folders
          return this.folderManagementService
            .getClassFolders(folderReq, classModel.id)
            .pipe(
              switchMap(folderRes => {
                const folders = folderRes?.data ?? [];

                if (folders.length === 0) return of([]);

                const requests = folders.map(folder => {
                  const req: GetLessonMaterialsRequest = {
                    folderId: folder.id,
                    classId: classModel.id,
                  };

                  // ? Get Materials of each Folders
                  return this.lessonMaterialsService
                    .getLessonMaterials(req)
                    .pipe(
                      map(materialRes => ({
                        folder,
                        materials: materialRes?.data ?? [],
                      }))
                    );
                });

                // ? Use forkJoin to fetch materials for all folders in parallel and combine results to an array
                return forkJoin(requests);
              })
            );
        })
      )
      .subscribe(folderWithMaterials => {
        this.folderMaterials.set(folderWithMaterials);

        const totalFolders = folderWithMaterials.length;
        const totalMaterials = folderWithMaterials.reduce(
          (acc, curr) => acc + curr.materials.length,
          0
        );

        this.folderCount.set(totalFolders);
        this.materialCount.set(totalMaterials);
      });
  }
}
