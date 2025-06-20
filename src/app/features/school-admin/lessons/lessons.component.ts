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
  ],
  templateUrl: './lessons.component.html',
  styleUrl: './lessons.component.css',
  providers: [DatePipe, { provide: LOCALE_ID, useValue: 'vi' }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonsComponent {
  lessonMaterials: LessonMaterial[] = [
    {
      id: 1,
      schoolId: 101,
      title: 'Giới thiệu Sinh học',
      description: 'Các khái niệm cơ bản về sinh học',
      contentType: 0,
      tag: 'Sinh học,Khoa học',
      lessonStatus: 2,
      duration: 2700,
      isAIContent: false,
      sourceUrl: 'https://example.com/gioi-thieu-sinh-hoc.mp4',
      visibility: 1,
      createdBy: 'nguoi1',
      createdAt: '2024-01-10T08:30:00Z',
      lastModifiedAt: '2024-02-15T10:00:00Z',
      status: 0,
      fileSize: 104857600,
      owner: {
        name: 'Nguyễn Văn An',
        id: 'chu-so-huu1',
      },
    },
    {
      id: 2,
      schoolId: 102,
      title: 'Ghi chú Hóa học nâng cao',
      description: 'Ghi chú chi tiết về hóa học dưới dạng PDF',
      contentType: 3,
      tag: 'Hóa học,Nâng cao',
      lessonStatus: 2,
      duration: 0,
      isAIContent: true,
      sourceUrl: 'https://example.com/ghi-chu-hoa-hoc.pdf',
      visibility: 0,
      createdBy: 'nguoi2',
      createdAt: '2024-03-05T09:15:00Z',
      lastModifiedAt: '2024-03-10T11:20:00Z',
      status: 0,
      fileSize: 5242880,
      owner: {
        name: 'Trần Thị Bình',
        id: 'chu-so-huu2',
      },
    },
    {
      id: 3,
      schoolId: 101,
      title: 'Bài giảng âm thanh Vật lý',
      description: 'Bài giảng âm thanh về định luật Newton',
      contentType: 1,
      tag: 'Vật lý',
      lessonStatus: 2,
      duration: 1800,
      isAIContent: false,
      sourceUrl: 'https://example.com/bai-giang-vat-ly.mp3',
      visibility: 1,
      createdBy: 'nguoi3',
      createdAt: '2024-02-20T07:45:00Z',
      lastModifiedAt: '2024-02-25T08:00:00Z',
      status: 0,
      fileSize: 15728640,
      owner: {
        name: 'Lê Minh Đức',
        id: 'chu-so-huu3',
      },
    },
    {
      id: 4,
      schoolId: 103,
      title: 'Bài tập Toán DOCX',
      description: 'Bài tập luyện tập đại số',
      contentType: 2,
      tag: 'Toán,Đại số',
      lessonStatus: 0,
      duration: 0,
      isAIContent: false,
      sourceUrl: 'https://example.com/bai-tap-dai-so.docx',
      visibility: 0,
      createdBy: 'nguoi4',
      createdAt: '2024-04-01T10:00:00Z',
      lastModifiedAt: '2024-04-02T12:00:00Z',
      status: 0,
      fileSize: 1048576,
      owner: {
        name: 'Phạm Thị Hoa',
        id: 'chu-so-huu4',
      },
    },
    {
      id: 5,
      schoolId: 101,
      title: 'Video Lịch sử',
      description: 'Tổng quan về Chiến tranh thế giới thứ hai',
      contentType: 0,
      tag: 'Lịch sử,Chiến tranh thế giới',
      lessonStatus: 3,
      duration: 3000,
      isAIContent: false,
      sourceUrl: 'https://example.com/video-lich-su.mp4',
      visibility: 1,
      createdBy: 'nguoi5',
      createdAt: '2024-01-15T13:00:00Z',
      lastModifiedAt: '2024-01-20T14:00:00Z',
      status: 1,
      fileSize: 209715200,
      owner: {
        name: 'Đặng Văn Quang',
        id: 'chu-so-huu5',
      },
    },
    {
      id: 6,
      schoolId: 104,
      title: 'Hướng dẫn Địa lý PDF',
      description: 'Hướng dẫn về địa lý thế giới',
      contentType: 3,
      tag: 'Địa lý',
      lessonStatus: 2,
      duration: 0,
      isAIContent: true,
      sourceUrl: 'https://example.com/huong-dan-dia-ly.pdf',
      visibility: 0,
      createdBy: 'nguoi6',
      createdAt: '2024-03-12T09:00:00Z',
      lastModifiedAt: '2024-03-15T10:30:00Z',
      status: 0,
      fileSize: 7340032,
      owner: {
        name: 'Hoàng Thị Lan',
        id: 'chu-so-huu6',
      },
    },
    {
      id: 7,
      schoolId: 102,
      title: 'Âm thanh Ngữ pháp Tiếng Anh',
      description: 'Bài học âm thanh về quy tắc ngữ pháp',
      contentType: 1,
      tag: 'Tiếng Anh,Ngữ pháp',
      lessonStatus: 2,
      duration: 1500,
      isAIContent: false,
      sourceUrl: 'https://example.com/ngu-phap-tieng-anh.mp3',
      visibility: 1,
      createdBy: 'nguoi7',
      createdAt: '2024-02-18T11:00:00Z',
      lastModifiedAt: '2024-02-20T11:30:00Z',
      status: 0,
      fileSize: 10485760,
      owner: {
        name: 'Vũ Thị Mai',
        id: 'chu-so-huu7',
      },
    },
    {
      id: 8,
      schoolId: 103,
      title: 'DOCX Khoa học Máy tính',
      description: 'Giới thiệu lập trình',
      contentType: 2,
      tag: 'CNTT,Lập trình',
      lessonStatus: 3,
      duration: 0,
      isAIContent: true,
      sourceUrl: 'https://example.com/gioi-thieu-lap-trinh.docx',
      visibility: 0,
      createdBy: 'nguoi8',
      createdAt: '2024-04-05T14:00:00Z',
      lastModifiedAt: '2024-04-06T15:00:00Z',
      status: 0,
      fileSize: 2097152,
      owner: {
        name: 'Ngô Văn Hưng',
        id: 'chu-so-huu8',
      },
    },
    {
      id: 9,
      schoolId: 101,
      title: 'Video Lịch sử Nghệ thuật',
      description: 'Tổng quan nghệ thuật Phục hưng',
      contentType: 0,
      tag: 'Nghệ thuật,Lịch sử',
      lessonStatus: 2,
      duration: 2400,
      isAIContent: false,
      sourceUrl: 'https://example.com/lich-su-nghe-thuat.mp4',
      visibility: 1,
      createdBy: 'nguoi9',
      createdAt: '2024-01-22T08:00:00Z',
      lastModifiedAt: '2024-01-25T09:00:00Z',
      status: 0,
      fileSize: 157286400,
      owner: {
        name: 'Phan Thị Hồng',
        id: 'chu-so-huu9',
      },
    },
    {
      id: 10,
      schoolId: 104,
      title: 'Âm thanh Lý thuyết Âm nhạc',
      description: 'Cơ bản về lý thuyết âm nhạc',
      contentType: 1,
      tag: 'Âm nhạc,Lý thuyết',
      lessonStatus: 0,
      duration: 2100,
      isAIContent: false,
      sourceUrl: 'https://example.com/ly-thuyet-am-nhac.mp3',
      visibility: 0,
      createdBy: 'nguoi10',
      createdAt: '2024-03-01T07:00:00Z',
      lastModifiedAt: '2024-03-02T08:00:00Z',
      status: 0,
      fileSize: 8388608,
      owner: {
        name: 'Trương Văn Nam',
        id: 'chu-so-huu10',
      },
    },
  ];

  totalRecords = signal<number>(this.lessonMaterials.length);
  loading = signal<boolean>(false);
  first = signal<number>(0);
  rows = signal<number>(10);

  get pagedLessonMaterials() {
    return this.lessonMaterials.slice(this.first(), this.first() + this.rows());
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
    return this.lessonMaterials
      ? this.first() + this.rows() >= this.lessonMaterials.length
      : true;
  }

  isFirstPage(): boolean {
    return this.lessonMaterials ? this.first() === 0 : true;
  }
}
