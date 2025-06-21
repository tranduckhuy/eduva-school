import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
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

import { ResourcesStateService } from '../services/resources-state.service';

import { ChatMessageComponent } from './chat-message/chat-message.component';

type ChatMessage = {
  content: string;
  sender: 'user' | 'system';
  isLoading?: boolean;
};

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
  buttons = [
    { title: 'Bài học tế bào sinh vật' },
    { title: 'Người lính trong Tây Tiến' },
    { title: 'Phương trình hai ẩn' },
  ];
  responsiveOptions = [
    {
      breakpoint: '1400px',
      numVisible: 2,
      numScroll: 1,
    },
    {
      breakpoint: '1199px',
      numVisible: 3,
      numScroll: 1,
    },
    {
      breakpoint: '767px',
      numVisible: 2,
      numScroll: 1,
    },
    {
      breakpoint: '575px',
      numVisible: 1,
      numScroll: 1,
    },
  ];

  private readonly resourcesStateService = inject(ResourcesStateService);
  private readonly scrollContainer = viewChild<ElementRef>('scrollContainer');

  form!: FormGroup;

  messages = signal<ChatMessage[]>([]);
  showScrollButton = signal(false);

  readonly totalUploaded = this.resourcesStateService.totalSources;
  readonly totalChecked = this.resourcesStateService.checkedSources;
  readonly isLoading = this.resourcesStateService.isLoading;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      query: ['', Validators.required],
    });
  }

  ngAfterViewInit(): void {
    const container = this.scrollContainer()?.nativeElement;
    if (!container) return;

    container.addEventListener('scroll', () => {
      const isAtBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        200;

      this.showScrollButton.set(!isAtBottom);
    });
  }

  submitMessage() {
    if (this.form.invalid || this.isLoading()) return;

    const content = this.form.value.query.trim();
    if (!content) return;

    this.resourcesStateService.updateHasInteracted(true);

    this.messages.update(prev => [...prev, { sender: 'user', content }]);
    this.form.reset();

    this.fakeSystemResponse();
  }

  handleChipClick(title: string) {
    if (this.isLoading()) return;

    this.resourcesStateService.updateHasInteracted(true);

    const content = `Tạo bài giảng về ${title}`;
    this.messages.update(prev => [...prev, { sender: 'user', content }]);

    this.fakeSystemResponse();
  }

  onEnterKey(event: Event) {
    const keyboardEvent = event as KeyboardEvent;

    if (keyboardEvent.shiftKey) return;
    event.preventDefault();
    this.submitMessage();
  }

  scrollToBottom() {
    // ? Two requestAnimationFrame for checking real DOM not just update event of signal
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const container = this.scrollContainer()?.nativeElement;
        container?.scrollTo({
          top: container.scrollHeight,
        });
      });
    });
  }

  private fakeSystemResponse() {
    this.resourcesStateService.updateIsLoading(true);

    this.messages.update(prev => [
      ...prev,
      { sender: 'system', content: 'Đang tạo bài giảng...', isLoading: true },
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
