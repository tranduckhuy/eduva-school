import {
  ChangeDetectionStrategy,
  Component,
  LOCALE_ID,
  signal,
} from '@angular/core';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { BytesToReadablePipe } from '../../../shared/pipes/byte-to-readable.pipe';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { FileDurationFormatPipe } from '../../../shared/pipes/file-duration-format.pipe';
import { DatePipe, registerLocaleData } from '@angular/common';
import localeVi from '@angular/common/locales/vi';
import { TooltipModule } from 'primeng/tooltip';
import { RouterLink } from '@angular/router';

interface Owner {
  name: string;
  id: string;
}

interface LessonMaterial {
  id: number;
  schoolId: number;
  title: string;
  description: string;
  contentType: number; // e.g., 0=Video, 1=Audio, 2=Docx, 3=PDF
  tag: string;
  lessonStatus: number; // e.g., 0=Draft, 1=Pending, 2=Approved, 3=Rejected
  duration: number; // in seconds
  isAIContent: boolean;
  sourceUrl: string;
  visibility: number; // e.g., 0=Private, 1=School
  createdBy: string;
  createdAt: string; // ISO 8601 date string
  lastModifiedAt: string; // ISO 8601 date string
  status: number; // e.g., 0=Active, 1=Inactive
  fileSize: number; // in bytes
  owner: Owner;
}

registerLocaleData(localeVi);

@Component({
  selector: 'app-lessons',
  standalone: true,
  imports: [
    TableModule,
    TooltipModule,
    ButtonComponent,
    BytesToReadablePipe,
    BadgeComponent,
    FileDurationFormatPipe,
    DatePipe,
    RouterLink,
  ],
  templateUrl: './moderate-lessons.component.html',
  styleUrl: './moderate-lessons.component.css',
  providers: [DatePipe, { provide: LOCALE_ID, useValue: 'vi' }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModerateLessonsComponent {
  moderateMaterials: LessonMaterial[] = [
    {
      id: 1,
      schoolId: 101,
      title: 'Giới thiệu về Trí tuệ nhân tạo',
      description: 'Các khái niệm cơ bản về trí tuệ nhân tạo',
      contentType: 0,
      tag: 'AI, Cơ bản',
      lessonStatus: 2,
      duration: 900,
      isAIContent: true,
      sourceUrl: 'https://example.com/ai-intro-video',
      visibility: 0,
      createdBy: 'user1',
      createdAt: '2024-05-01T10:00:00Z',
      lastModifiedAt: '2024-05-02T12:00:00Z',
      status: 0,
      fileSize: 50000000,
      owner: { name: 'Alice', id: 'owner1' },
    },
    {
      id: 2,
      schoolId: 102,
      title: 'Kiến thức cơ bản về Học máy',
      description: 'Bài giảng âm thanh về các nguyên lý học máy',
      contentType: 1,
      tag: 'Học máy, Âm thanh',
      lessonStatus: 1,
      duration: 1200,
      isAIContent: true,
      sourceUrl: 'https://example.com/ml-basics-audio',
      visibility: 0,
      createdBy: 'user2',
      createdAt: '2024-05-03T08:30:00Z',
      lastModifiedAt: '2024-05-03T09:00:00Z',
      status: 0,
      fileSize: 30000000,
      owner: { name: 'Bob', id: 'owner2' },
    },
    {
      id: 3,
      schoolId: 103,
      title: 'Tổng quan về Học sâu',
      description: 'Khóa học video về kỹ thuật học sâu',
      contentType: 0,
      tag: 'Học sâu',
      lessonStatus: 0,
      duration: 1800,
      isAIContent: true,
      sourceUrl: 'https://example.com/deep-learning-video',
      visibility: 0,
      createdBy: 'user3',
      createdAt: '2024-04-25T14:00:00Z',
      lastModifiedAt: '2024-04-26T10:00:00Z',
      status: 0,
      fileSize: 75000000,
      owner: { name: 'Carol', id: 'owner3' },
    },
    {
      id: 4,
      schoolId: 104,
      title: 'Xử lý ngôn ngữ tự nhiên',
      description: 'Video giới thiệu về xử lý ngôn ngữ tự nhiên trong AI',
      contentType: 0,
      tag: 'NLP, AI',
      lessonStatus: 2,
      duration: 1500,
      isAIContent: true,
      sourceUrl: 'https://example.com/nlp-video',
      visibility: 0,
      createdBy: 'user4',
      createdAt: '2024-05-05T09:00:00Z',
      lastModifiedAt: '2024-05-06T11:00:00Z',
      status: 0,
      fileSize: 60000000,
      owner: { name: 'David', id: 'owner4' },
    },
    {
      id: 5,
      schoolId: 105,
      title: 'AI trong y học',
      description: 'Bài giảng âm thanh về ứng dụng AI trong y học',
      contentType: 1,
      tag: 'AI, Y học',
      lessonStatus: 2,
      duration: 1100,
      isAIContent: true,
      sourceUrl: 'https://example.com/ai-medicine-audio',
      visibility: 0,
      createdBy: 'user5',
      createdAt: '2024-05-07T13:00:00Z',
      lastModifiedAt: '2024-05-08T14:00:00Z',
      status: 0,
      fileSize: 32000000,
      owner: { name: 'Eva', id: 'owner5' },
    },
    {
      id: 6,
      schoolId: 106,
      title: 'AI và Robotics',
      description: 'Video về ứng dụng AI trong Robotics',
      contentType: 0,
      tag: 'AI, Robotics',
      lessonStatus: 1,
      duration: 1400,
      isAIContent: true,
      sourceUrl: 'https://example.com/ai-robotics-video',
      visibility: 0,
      createdBy: 'user6',
      createdAt: '2024-05-10T15:00:00Z',
      lastModifiedAt: '2024-05-11T16:00:00Z',
      status: 0,
      fileSize: 68000000,
      owner: { name: 'Frank', id: 'owner6' },
    },
    {
      id: 7,
      schoolId: 107,
      title: 'Học máy nâng cao',
      description: 'Bài giảng âm thanh về các thuật toán học máy nâng cao',
      contentType: 1,
      tag: 'Học máy, Nâng cao',
      lessonStatus: 0,
      duration: 1300,
      isAIContent: true,
      sourceUrl: 'https://example.com/advanced-ml-audio',
      visibility: 0,
      createdBy: 'user7',
      createdAt: '2024-05-12T10:30:00Z',
      lastModifiedAt: '2024-05-13T11:00:00Z',
      status: 0,
      fileSize: 29000000,
      owner: { name: 'Grace', id: 'owner7' },
    },
    {
      id: 8,
      schoolId: 108,
      title: 'Thị giác máy tính',
      description: 'Video về các ứng dụng của thị giác máy tính',
      contentType: 0,
      tag: 'Computer Vision',
      lessonStatus: 2,
      duration: 1600,
      isAIContent: true,
      sourceUrl: 'https://example.com/computer-vision-video',
      visibility: 0,
      createdBy: 'user8',
      createdAt: '2024-05-14T09:45:00Z',
      lastModifiedAt: '2024-05-15T10:00:00Z',
      status: 0,
      fileSize: 70000000,
      owner: { name: 'Hank', id: 'owner8' },
    },
    {
      id: 9,
      schoolId: 109,
      title: 'AI trong tự động hóa',
      description: 'Bài giảng âm thanh về AI và tự động hóa công nghiệp',
      contentType: 1,
      tag: 'AI, Tự động hóa',
      lessonStatus: 1,
      duration: 1250,
      isAIContent: true,
      sourceUrl: 'https://example.com/ai-automation-audio',
      visibility: 0,
      createdBy: 'user9',
      createdAt: '2024-05-16T14:20:00Z',
      lastModifiedAt: '2024-05-17T15:00:00Z',
      status: 0,
      fileSize: 31000000,
      owner: { name: 'Ivy', id: 'owner9' },
    },
    {
      id: 10,
      schoolId: 110,
      title: 'Học sâu nâng cao',
      description: 'Video chuyên sâu về học sâu',
      contentType: 0,
      tag: 'Học sâu, Nâng cao',
      lessonStatus: 2,
      duration: 1900,
      isAIContent: true,
      sourceUrl: 'https://example.com/advanced-deep-learning-video',
      visibility: 0,
      createdBy: 'user10',
      createdAt: '2024-05-18T08:00:00Z',
      lastModifiedAt: '2024-05-19T09:00:00Z',
      status: 0,
      fileSize: 80000000,
      owner: { name: 'Jack', id: 'owner10' },
    },
  ];

  totalRecords = signal<number>(this.moderateMaterials.length);
  loading = signal<boolean>(false);
  first = signal<number>(0);
  rows = signal<number>(10);

  get pagedmoderateMaterials() {
    return this.moderateMaterials.slice(
      this.first(),
      this.first() + this.rows()
    );
  }

  loadDataLazy(event: TableLazyLoadEvent) {}

  onSearchTriggered(term: string) {}

  next() {
    this.first.set(this.first() + this.rows());
  }

  prev() {
    this.first.set(this.first() - this.rows());
  }

  reset() {
    this.first.set(0);
  }

  pageChange(event: any) {
    this.first.set(event.first);
    this.rows.set(event.rows);
  }

  isLastPage(): boolean {
    return this.moderateMaterials
      ? this.first() + this.rows() >= this.moderateMaterials.length
      : true;
  }

  isFirstPage(): boolean {
    return this.moderateMaterials ? this.first() === 0 : true;
  }
}
