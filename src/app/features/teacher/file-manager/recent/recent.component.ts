import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';

type Material = {
  id: number;
  name: string;
  owner: string;
  lastModified: string;
  fileSize: string;
  fileType: '.mp4' | '.mp3' | '.docx' | '.pdf';
};

@Component({
  selector: 'app-recent',
  standalone: true,
  imports: [SearchInputComponent],
  templateUrl: './recent.component.html',
  styleUrl: './recent.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecentComponent {
  materials: Material[] = [
    {
      id: Date.now() + 1,
      name: 'Bài giảng Toán 10',
      owner: 'Nguyễn Văn A',
      lastModified: '13 tháng 6 2025',
      fileSize: '1.2MB',
      fileType: '.mp4',
    },
    {
      id: Date.now() + 2,
      name: 'Tài liệu Văn học',
      owner: 'Trần Thị B',
      lastModified: '13 tháng 6 2025',
      fileSize: '1.2MB',
      fileType: '.mp3',
    },
    {
      id: Date.now() + 3,
      name: 'Video Lý thuyết Vật lý',
      owner: 'Lê Văn C',
      lastModified: '12 tháng 6 2025',
      fileSize: '1.2MB',
      fileType: '.docx',
    },
    {
      id: Date.now() + 4,
      name: 'Audio Sinh học 11',
      owner: 'Phạm Thị D',
      lastModified: '12 tháng 6 2025',
      fileSize: '1.2MB',
      fileType: '.pdf',
    },
    {
      id: Date.now() + 5,
      name: 'Giáo án Hóa học',
      owner: 'Nguyễn Văn E',
      lastModified: '11 tháng 6 2025',
      fileSize: '1.2MB',
      fileType: '.mp4',
    },
    {
      id: Date.now() + 6,
      name: 'Tổng hợp đề thi Văn',
      owner: 'Trịnh Thị F',
      lastModified: '11 tháng 6 2025',
      fileSize: '1.2MB',
      fileType: '.mp4',
    },
    {
      id: Date.now() + 7,
      name: 'Bài giảng Vật lý cơ bản',
      owner: 'Hoàng Văn G',
      lastModified: '10 tháng 6 2025',
      fileSize: '1.2MB',
      fileType: '.mp4',
    },
    {
      id: Date.now() + 8,
      name: 'Audio luyện nghe tiếng Anh',
      owner: 'Nguyễn Thị H',
      lastModified: '10 tháng 6 2025',
      fileSize: '1.2MB',
      fileType: '.mp4',
    },
    {
      id: Date.now() + 9,
      name: 'Tài liệu lịch sử lớp 12',
      owner: 'Lê Văn I',
      lastModified: '09 tháng 6 2025',
      fileSize: '1.2MB',
      fileType: '.mp4',
    },
    {
      id: Date.now() + 10,
      name: 'Bài giảng Tin học',
      owner: 'Đỗ Thị J',
      lastModified: '09 tháng 6 2025',
      fileSize: '1.2MB',
      fileType: '.mp4',
    },
  ];

  onSearchTriggered() {}
}
