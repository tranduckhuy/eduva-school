import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

interface ActiveSchool {
  id: number;
  name: string;
  teacherCount: number;
  studentCount: number;
  lessonCount: number;
}

@Component({
  selector: 'app-top-active-schools',
  standalone: true,
  imports: [CommonModule, TableModule, RouterLink, TooltipModule],
  templateUrl: './top-active-schools.component.html',
  styleUrls: ['./top-active-schools.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopActiveSchoolsComponent {
  loading = signal(false);
  activeSchools = signal<ActiveSchool[]>([
    {
      id: 1,
      name: 'Trường THPT Chuyên Hà Nội - Amsterdam',
      teacherCount: 85,
      studentCount: 1200,
      lessonCount: 1245,
    },
    {
      id: 2,
      name: 'Trường THPT Chu Văn An',
      teacherCount: 72,
      studentCount: 980,
      lessonCount: 876,
    },
    {
      id: 3,
      name: 'Trường THPT Kim Liên',
      teacherCount: 68,
      studentCount: 850,
      lessonCount: 765,
    },
    {
      id: 4,
      name: 'Trường THPT Nguyễn Thị Minh Khai',
      teacherCount: 62,
      studentCount: 790,
      lessonCount: 654,
    },
    {
      id: 5,
      name: 'Trường THPT Phan Đình Phùng',
      teacherCount: 58,
      studentCount: 720,
      lessonCount: 543,
    },
    {
      id: 6,
      name: 'Trường THPT Nguyễn Thái Học',
      teacherCount: 57,
      studentCount: 710,
      lessonCount: 522,
    },
    {
      id: 7,
      name: 'Trường THPT Nguyễn Thái Học',
      teacherCount: 57,
      studentCount: 710,
      lessonCount: 522,
    },
  ]);

  ngOnInit(): void {
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
    }, 500);
  }
}
