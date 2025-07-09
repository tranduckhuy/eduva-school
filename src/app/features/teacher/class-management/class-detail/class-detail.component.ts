import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  input,
  signal,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { forkJoin, map, of, switchMap, tap } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';

import { ClassManagementService } from '../services/class-management.service';
import { FolderManagementService } from '../../../../shared/services/api/folder/folder-management.service';
import { LessonMaterialsService } from '../../../../shared/services/api/lesson-materials/lesson-materials.service';

import { PAGE_SIZE } from '../../../../shared/constants/common.constant';

import { ClassInformationComponent } from './class-information/class-information.component';
import { ClassMemberComponent } from './class-member/class-member.component';

import { ClassFoldersComponent } from './class-folders/class-folders.component';

import { type Folder } from '../../../../shared/models/entities/folder.model';
import { type LessonMaterial } from '../../../../shared/models/entities/lesson-material.model';
import { type StudentClassResponse } from '../models/response/query/get-students-class-response.model';

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

  loadData(): void {
    this.classManagementService
      .getTeacherClassById(this.classId())
      .pipe(
        switchMap(classModel => {
          if (!classModel?.id) return this.handleEmptyClass();

          this.loadStudents(classModel.id);
          return this.loadFolderWithMaterials(classModel.id);
        }),
        tap(folderWithMaterials => this.updateFolderStats(folderWithMaterials))
      )
      .subscribe();
  }

  private handleEmptyClass() {
    this.folderMaterials.set([]);
    this.folderCount.set(0);
    this.materialCount.set(0);
    this.students.set([]);
    return of([]);
  }

  private loadStudents(classId: string): void {
    this.classManagementService
      .getStudentsClass(classId)
      .subscribe(students => this.students.set(students ?? []));
  }

  private loadFolderWithMaterials(classId: string) {
    return this.folderManagementService.getClassFolders(classId).pipe(
      switchMap(folders => {
        if (!folders || folders.length === 0) return of([]);
        const requests = folders.map(folder =>
          this.lessonMaterialsService.getLessonMaterials(folder.id).pipe(
            map(materials => ({
              folder,
              materials: materials ?? [],
            }))
          )
        );
        return forkJoin(requests);
      })
    );
  }

  private updateFolderStats(
    folderWithMaterials: {
      folder: any;
      materials: any[];
    }[]
  ): void {
    const totalFolders = folderWithMaterials.length;
    const totalMaterials = folderWithMaterials.reduce(
      (sum, item) => sum + (item.folder.countLessonMaterial ?? 0),
      0
    );

    this.folderMaterials.set([...folderWithMaterials]);
    this.folderCount.set(totalFolders);
    this.materialCount.set(totalMaterials);
  }
}
