import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { GlobalModalService } from '../../../../shared/services/layout/global-modal/global-modal.service';

import { PdfViewerComponent } from '../pdf-viewer/pdf-viewer.component';
import { DocViewerComponent } from '../doc-viewer/doc-viewer.component';
import { VideoViewerComponent } from '../video-viewer/video-viewer.component';
import { AudioViewerComponent } from '../audio-viewer/audio-viewer.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ModerateReasonModalComponent } from '../moderate-reason-modal/moderate-reason-modal.component';
import { GlobalModalService } from '../../../../shared/services/layout/global-modal/global-modal.service';

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

@Component({
  selector: 'app-preview-lesson',
  standalone: true,
  imports: [
    CommonModule,
    PdfViewerComponent,
    DocViewerComponent,
    VideoViewerComponent,
    AudioViewerComponent,
    ButtonComponent,
  ],
  templateUrl: './preview-lesson.component.html',
  styleUrl: './preview-lesson.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreviewLessonComponent implements OnInit {
  lessonMaterial: LessonMaterial = {
    id: 1,
    schoolId: 101,
    title: 'Giới thiệu về Trí tuệ nhân tạo',
    description:
      '<h2>Giới thiệu về Trí tuệ nhân tạo</h2> <p>Trí tuệ nhân tạo (AI) là lĩnh vực nghiên cứu và phát triển các hệ thống máy tính có khả năng thực hiện các nhiệm vụ thông minh.</p> <h3>Các khái niệm cơ bản</h3> <p>AI bao gồm nhiều kỹ thuật như học máy, xử lý ngôn ngữ tự nhiên, và thị giác máy tính.</p> <h3>Phân loại AI</h3> <p>AI có thể được phân loại thành AI yếu, AI mạnh và siêu AI dựa trên khả năng và phạm vi hoạt động.</p> <h2>Ứng dụng của AI</h2> <p>AI được ứng dụng rộng rãi trong nhiều lĩnh vực:</p> <ul> <li><strong>Y tế:</strong> Hỗ trợ chẩn đoán và điều trị bệnh.</li> <li><strong>Tài chính:</strong> Phân tích dữ liệu và dự báo thị trường.</li> <li><strong>Giao thông:</strong> Điều khiển xe tự động và quản lý giao thông thông minh.</li> </ul> <h2>Tương lai của AI</h2> <p>AI sẽ tiếp tục phát triển mạnh mẽ, mang lại nhiều cơ hội và thách thức trong xã hội.</p>',
    // contentType: 0, //1ideo
    contentType: 1, //audio
    // contentType: 3, //pdf
    // contentType: 2, //doc
    tag: 'AI, Cơ bản',
    lessonStatus: 2,
    duration: 900,
    isAIContent: true,
    sourceUrl: 'https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf', //pdf
    // sourceUrl:
    //   'https://eduva.blob.core.windows.net/eduva-storage/SU25QN15_AI%20System%20for%20Auto-generating%20Audio_Video%20Lessons%20from%20Text%20for%20Non-tech%20Teachers.docx?sp=r&st=2025-06-20T15:32:15Z&se=2025-06-20T23:32:15Z&spr=https&sv=2024-11-04&sr=c&sig=zfgnuDcsG2rH%2BKAo7%2FPXbQF3r6debdnuyJlBed2p7QI%3D', //doc
    visibility: 0,
    createdBy: 'user1',
    createdAt: '2024-05-01T10:00:00Z',
    lastModifiedAt: '2024-05-02T12:00:00Z',
    status: 0,
    fileSize: 50000000,
    owner: { name: 'Alice', id: 'owner1' },
  };

  // Injection
  private readonly sanitizer = inject(DomSanitizer);
  private readonly globalModalService = inject(GlobalModalService);

  desc = viewChild<ElementRef>('desc');
  preview = viewChild<ElementRef>('preview');

  safeDescription = signal<SafeHtml>('');
  isApprovedLesson = signal<boolean>(false);

  ngOnInit(): void {
    this.safeDescription.set(
      this.sanitizer.bypassSecurityTrustHtml(
        this.processHeaders(this.lessonMaterial.description)
      )
    );
  }

  formatUpdateDate(input: string | number): string {
    let date: Date;

    if (typeof input === 'string' || typeof input === 'number') {
      date = new Date(input);
    } else {
      return 'Định dạng ngày không hợp lệ';
    }

    if (isNaN(date.getTime())) {
      return 'Ngày không hợp lệ';
    }

    const month = date.getUTCMonth() + 1;
    const year = date.getUTCFullYear();

    return `Cập nhật tháng ${month} năm ${year}`;
  }

  processHeaders(html: string): string {
    return html.replace(/<(h[2-6])>(.*?)<\/\1>/g, (match, tag, content) => {
      const hashCount = parseInt(tag.charAt(1), 10) - 1; // Get the level of the header
      const hashes = '#'.repeat(hashCount); // Create the hashes
      return `<${tag}><span>${hashes}</span> ${content}</${tag}>`; // Return the new header with hashes
    });
  }

  openModerateReasonModal() {
    this.globalModalService.open(
      ModerateReasonModalComponent,
      {
        isApproved: this.isApprovedLesson(),
      },
      ''
    );
  }

  approveLesson() {
    this.isApprovedLesson.set(true);
    this.openModerateReasonModal();
  }

  refuseLesson() {
    this.isApprovedLesson.set(false);
    this.openModerateReasonModal();
  }
}
