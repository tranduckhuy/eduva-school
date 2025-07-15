import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';

import { ResourcesStateService } from '../services/utils/resources-state.service';
import { AiJobsService } from '../services/api/ai-jobs.service';
import { AiSocketService } from '../services/api/ai-socket.service';

import { ChatMessageComponent } from './chat-message/chat-message.component';

import { type CreateAiJobsRequest } from '../models/request/command/create-ai-jobs-request.model';

interface ChatMessage {
  sender: 'user' | 'system';
  content: string;
  isLoading?: boolean;
}

interface AiResponseMessage {
  previewContent?: string;
  audioCost?: number;
  videoCost?: number;
  failureReason?: string | null;
}

@Component({
  selector: 'generate-lesson-chat',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TextareaModule,
    ButtonModule,
    CarouselModule,
    ChatMessageComponent,
  ],
  templateUrl: './generate-lesson-chat.component.html',
  styleUrl: './generate-lesson-chat.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerateLessonChatComponent implements AfterViewInit {
  private readonly scrollContainer = viewChild<ElementRef>('scrollContainer');

  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly resourcesStateService = inject(ResourcesStateService);
  private readonly aiJobService = inject(AiJobsService);
  private readonly aiSocketService = inject(AiSocketService);

  readonly jobUpdateProgress = this.aiSocketService.jobUpdateProgress;
  readonly checkedFiles = this.resourcesStateService.checkedFiles;
  readonly hasGeneratedSuccessfully =
    this.resourcesStateService.hasGeneratedSuccessfully;
  readonly totalUploaded = this.resourcesStateService.totalSources;
  readonly totalChecked = this.resourcesStateService.totalCheckedSources;
  readonly isLoading = this.resourcesStateService.isLoading;

  messages = signal<ChatMessage[]>([]);
  showScrollButton = signal(false);

  disabledSendButton = computed(() => {
    return (
      this.totalChecked() === 0 ||
      this.isLoading() ||
      this.hasGeneratedSuccessfully()
    );
  });

  form: FormGroup = this.fb.group({
    topic: ['', Validators.required],
  });

  readonly buttons = [
    { title: 'Bài học tế bào sinh vật' },
    { title: 'Người lính trong Tây Tiến' },
    { title: 'Phương trình hai ẩn' },
  ];

  readonly responsiveOptions = [
    { breakpoint: '1400px', numVisible: 2, numScroll: 1 },
    { breakpoint: '1199px', numVisible: 3, numScroll: 1 },
    { breakpoint: '767px', numVisible: 2, numScroll: 1 },
    { breakpoint: '575px', numVisible: 1, numScroll: 1 },
  ];

  constructor() {
    effect(
      () => {
        const payload = this.jobUpdateProgress();
        if (!payload) return;

        const { previewContent, failureReason } = payload;
        if (previewContent || failureReason) {
          this.scrollToBottom();
          this.displaySystemAiMessage(payload);
          this.resourcesStateService.updateIsLoading(false);
        }
      },
      { allowSignalWrites: true }
    );

    this.destroyRef.onDestroy(() => this.aiSocketService.disconnect());
  }

  ngAfterViewInit(): void {
    this.scrollContainer()?.nativeElement.addEventListener('scroll', () => {
      const container = this.scrollContainer()?.nativeElement;
      if (!container) return;
      const nearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        200;
      this.showScrollButton.set(!nearBottom);
    });
  }

  get topic() {
    return this.form.get('topic');
  }

  submitMessage(): void {
    if (this.form.invalid || this.isLoading()) return;

    const content = this.topic?.value.trim();
    if (!content) return;

    this.resourcesStateService.updateHasInteracted(true);
    this.messages.update(prev => [...prev, { sender: 'user', content }]);

    this.createAiJob();
    this.form.reset();
  }

  handleChipClick(title: string): void {
    if (this.isLoading()) return;

    const content = `Tạo bài giảng về ${title}`;
    this.resourcesStateService.updateHasInteracted(true);
    this.messages.update(prev => [...prev, { sender: 'user', content }]);

    this.form.patchValue({ topic: content });

    this.createAiJob();
    this.form.reset();
  }

  onEnterKey(event: Event): void {
    event.preventDefault();
    const keyboardEvent = event as KeyboardEvent;
    if (
      keyboardEvent.shiftKey ||
      this.form.invalid ||
      this.totalChecked() === 0 ||
      this.isLoading()
    )
      return;
    this.submitMessage();
  }

  scrollToBottom(): void {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const container = this.scrollContainer()?.nativeElement;
        container?.scrollTo({ top: container.scrollHeight });
      });
    });
  }

  private createAiJob(): void {
    this.scrollToBottom();
    this.resourcesStateService.updateIsLoading(true);
    this.resourcesStateService.resetGeneratedStatus();

    this.messages.update(prev => [
      ...prev,
      { sender: 'system', content: '', isLoading: true },
    ]);

    const topic = this.topic?.value.trim();
    if (!topic) {
      this.resourcesStateService.updateIsLoading(false);
      return;
    }

    const request: CreateAiJobsRequest = {
      file: this.checkedFiles(),
      topic,
    };

    this.aiJobService.createAiJobs(request).subscribe({
      next: res => {
        if (!res?.jobId) {
          this.resourcesStateService.updateIsLoading(false);
          return;
        }

        this.aiSocketService.resetSignal();
        this.aiSocketService.connect(res.jobId);
      },
      error: () => {
        this.scrollToBottom();
        this.resourcesStateService.updateIsLoading(false);
      },
    });
  }

  private displaySystemAiMessage({
    previewContent,
    audioCost,
    videoCost,
    failureReason,
  }: AiResponseMessage): void {
    const content = failureReason
      ? `
        <div class="text-red-500 font-medium">
          <p>😢 <strong>Rất tiếc!</strong> Quá trình tạo nội dung không thành công.</p>
          <p>Lý do: <em>${failureReason}</em></p>
          <p>Vui lòng kiểm tra lại dữ liệu và thử lại sau.</p>
        </div>
      `
      : `
        <div class="mb-3">
          <h4 class="font-semibold text-lg mb-2 text-gray-800 dark:text-gray-100">
            🎓 Nội dung bài giảng đã sẵn sàng!
          </h4>

          <p class="mb-2 text-gray-700 dark:text-gray-300">
            Đây là bản nháp gợi ý. Bạn có thể chỉnh sửa, bổ sung hoặc phát triển thêm để tạo nên một bài giảng hấp dẫn và truyền cảm hứng cho người học.
          </p>

          <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 text-sm leading-relaxed text-gray-700 dark:text-gray-300 mb-3">
            ${previewContent}...
          </div>

          <div class="mb-2 text-sm text-gray-600 dark:text-gray-400 italic">
            <p>🎧 Tạo bản ghi âm (audio): <strong>${audioCost}</strong> Ecoin</p>
            <p>🎞️ Tạo video minh hoạ (có giọng đọc + hình ảnh): <strong>${videoCost}</strong> Ecoin</p>
          </div>

          <p class="mb-2 text-gray-700 dark:text-gray-300">
            Nếu bạn đồng ý với chi phí hiển thị ở trên, hãy tiếp tục bằng cách nhấn nút <strong>"Tạo nội dung"</strong> ở phần bên phải để bắt đầu tạo sản phẩm chính thức.
          </p>

          <p class="mb-2 text-gray-700 dark:text-gray-300">
            <strong>EDUVA</strong> xin chân thành cảm ơn bạn đã tin tưởng sử dụng hệ thống!
          </p>

          <p class="mt-3 text-xs text-primary">
            * Lưu ý: Chi phí chỉ được tính khi bạn thực hiện tạo sản phẩm chính thức.
          </p>
        </div>
      `;

    this.messages.update(prev => {
      const updated = [...prev];
      const idx = updated.findIndex(m => m.sender === 'system' && m.isLoading);
      const newMessage: ChatMessage = {
        sender: 'system',
        content,
        isLoading: false,
      };

      if (idx !== -1) updated[idx] = newMessage;
      else updated.push(newMessage);

      return updated;
    });

    if (!failureReason) {
      this.resourcesStateService.markGeneratedSuccess();
    }
  }

  private fakeSystemResponse() {
    this.resourcesStateService.updateIsLoading(true);

    this.messages.update(prev => [
      ...prev,
      { sender: 'system', content: '', isLoading: true },
    ]);

    this.scrollToBottom();

    const delay = 2000 + Math.floor(Math.random() * 1000);

    setTimeout(() => {
      this.messages.update(prev => {
        const updated = [...prev];
        const idx = updated.findIndex(
          m => m.sender === 'system' && m.isLoading
        );
        if (idx !== -1) {
          updated[idx] = {
            sender: 'system',
            content: `Slide bài giảng sẽ được hiển thị tại đây trong các phiên bản sắp tới.
              Hiện tại, tính năng này vẫn đang trong quá trình hoàn thiện để mang đến
              trải nghiệm tốt nhất cho bạn. Cảm ơn bạn đã kiên nhẫn và đồng hành 
              cùng <strong>EDUVA</strong> trong quá trình phát triển hệ thống!`,
          };
        }
        return updated;
      });

      this.resourcesStateService.updateIsLoading(false);
      this.scrollToBottom();
    }, delay);
  }
}
